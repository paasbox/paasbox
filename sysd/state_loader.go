package sysd

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/state"
	"github.com/paasbox/paasbox/sysd/util/statedir"
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

// NewState ...
func NewState() State {
	return &stateLoader{statedir.Get(), nil}
}

func (s *stateLoader) Load(stackID string) (state.Store, error) {
	stackID = strings.Replace(strings.TrimPrefix(stackID, "@"), "/", "_", -1)

	stateFile := filepath.Join(s.stateDir, "state/"+fmt.Sprintf("%s.db", stackID))
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
