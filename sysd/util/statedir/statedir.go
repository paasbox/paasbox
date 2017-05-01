package statedir

import (
	"errors"
	"os"
	"os/user"
	"path/filepath"

	"github.com/ONSdigital/go-ns/log"
)

var stateDir string

func init() {
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
}

// Get returns the current state directory
func Get() string {
	return stateDir
}
