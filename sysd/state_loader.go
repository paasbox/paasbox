package sysd

import (
	"errors"
	"fmt"
	"os"
	"os/user"
	"path/filepath"
	"strings"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/state"
)

type State interface {
	Load(stackID string) (state.Store, error)
	Close()
}

var _ State = &stateLoader{}

type stateLoader struct {
	stateDir string
	storage  []state.Storage
}

func NewState() State {
	return &stateLoader{getStateDir(), nil}
}

func getStateDir() string {
	var stateDir string
	if s := os.Getenv("PB_STATE_DIR"); len(s) > 0 {
		stateDir = s
	} else {
		usr, err := user.Current()
		if err != nil {
			log.Error(errors.New("error fetching current user"), log.Data{"reason": err})
			os.Exit(15)
		}

		dir := usr.HomeDir
		if _, err = os.Stat(dir); err != nil {
			log.Error(errors.New("user home directory doesn't exist"), log.Data{"reason": err})
			os.Exit(16)
		}

		stateDir = filepath.Join(dir, ".paasbox")
	}
	if _, err := os.Stat(stateDir); err != nil {
		err = os.MkdirAll(stateDir, 0770)
		if err != nil {
			log.Error(errors.New("error creating state directory"), log.Data{"reason": err, "dir": stateDir})
			os.Exit(16)
		}
	}
	return stateDir
}

func (s *stateLoader) Load(stackID string) (state.Store, error) {
	stackID = strings.TrimPrefix(stackID, "@")

	stateFile := filepath.Join(s.stateDir, fmt.Sprintf("%s.db", stackID))
	dir := filepath.Dir(stateFile)
	if _, err := os.Stat(dir); err != nil {
		err = os.MkdirAll(dir, os.FileMode(0755))
		if err != nil {
			log.Error(errOpenBoltDBFailed, log.Data{"reason": err})
			log.Debug("error creating state directory for stack", log.Data{"dir": dir})
			os.Exit(4)
		}
	}

	boltDB, err := state.NewBoltDB(stateFile)
	if err != nil {
		log.Error(errOpenBoltDBFailed, log.Data{"reason": err})
		log.Debug("Check if other copies of paasbox are running", nil)
		os.Exit(4)
	}

	s.storage = append(s.storage, boltDB)

	state, err := boltDB.Wrap(stackID)
	if err != nil {
		log.Error(errOpenBoltStackFailed, log.Data{"reason": err, "stack_id": stackID})
		os.Exit(6)
	}

	return state, nil
}

func (s *stateLoader) Close() {
	for _, db := range s.storage {
		if err := db.Close(); err != nil {
			log.Error(errors.New("error closing boltdb"), log.Data{"reason": err})
		}
	}
}
