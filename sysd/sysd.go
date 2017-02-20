package sysd

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"os"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/config"
	"github.com/paasbox/paasbox/state"
	"github.com/paasbox/paasbox/sysd/server"
	"github.com/paasbox/paasbox/sysd/workspace"
)

// Sysd ...
type Sysd interface {
	Start() error
}

type sysd struct {
	workspaceConfigs []workspace.Config
	workspaces       map[string]workspace.Workspace
	exitCh           chan struct{}

	storage state.Storage
	server  server.Server
}

var _ Sysd = &sysd{}

var (
	errMissingFilenameArgument   = errors.New("missing filename argument")
	errReadFileError             = errors.New("error reading file")
	errInvalidWorkspaceJSON      = errors.New("invalid workspace json")
	errWorkspaceValidationFailed = errors.New("workspace validation failed")
	errLoadingStateFailed        = errors.New("failed loading state")
	errStartingWorkspaceFailed   = errors.New("starting workspace failed")
	errOpenBoltDBFailed          = errors.New("error opening bolt database")
	errOpenBoltWorkspacesFailed  = errors.New("error opening bolt workspaces")
	errOpenBoltWorkspaceFailed   = errors.New("error opening bolt workspace")
	errCreateWorkspaceFailed     = errors.New("error creating workspace")
)

// New ...
func New(exitCh chan struct{}) Sysd {
	log.Debug("starting sysd", nil)

	if len(os.Args) < 2 {
		log.Error(errMissingFilenameArgument, nil)
		os.Exit(1)
		return nil
	}

	b, err := ioutil.ReadFile(os.Args[1])
	if err != nil {
		log.Error(errReadFileError, log.Data{"reason": err})
		os.Exit(2)
		return nil
	}

	var conf workspace.Config
	err = json.Unmarshal(b, &conf)
	if err != nil {
		log.Error(errInvalidWorkspaceJSON, log.Data{"reason": err})
		os.Exit(3)
		return nil
	}

	boltDB, err := state.NewBoltDB("state.db")
	if err != nil {
		log.Error(errOpenBoltDBFailed, log.Data{"reason": err})
		os.Exit(4)
	}

	workspaces := make(map[string]workspace.Workspace)

	workspacesState, err := boltDB.Wrap("workspaces")
	if err != nil {
		log.Error(errOpenBoltWorkspacesFailed, log.Data{"reason": err})
		os.Exit(5)
	}

	state, err := workspacesState.Wrap(conf.ID)
	if err != nil {
		log.Error(errOpenBoltWorkspaceFailed, log.Data{"reason": err, "workspace_id": conf.ID})
		os.Exit(6)
	}
	ws, err := workspace.New(state, conf)
	if err != nil {
		log.Error(errCreateWorkspaceFailed, log.Data{"reason": err, "workspace_id": conf.ID})
		os.Exit(6)
	}
	workspaces[conf.ID] = ws

	s := &sysd{[]workspace.Config{conf}, workspaces, exitCh, boltDB, nil}

	srv := server.New(s)
	s.server = srv

	return s
}

// Start ...
func Start(exitCh chan struct{}) {
	err := New(exitCh).Start()
	if err != nil {
		log.Error(err, nil)
		os.Exit(4)
	}
	os.Exit(0)
}

func (s *sysd) Start() error {
	log.Debug("starting workspaces", nil)
	for _, ws := range s.workspaceConfigs {
		err := s.workspaces[ws.ID].Start()
		if err != nil {
			log.Error(err, log.Data{"workspace_id": ws.ID})
		}
	}

	log.Debug("starting server", nil)
	err := s.server.Start(config.BindAddr)
	if err != nil {
		log.Error(err, nil)
	}

	log.Debug("sysd started", nil)

	var exit bool
	for {
		select {
		case <-s.exitCh:
			exit = true
		}
		if exit {
			break
		}
	}

	s.stop(false)
	return nil
}

func (s *sysd) stop(stopTasks bool) {
	log.Debug("stopping sysd", nil)
	for _, ws := range s.workspaces {
		err := ws.Stop()
		if err != nil {
			log.Error(err, nil)
		}
	}
	err := s.storage.Close()
	if err != nil {
		log.Error(err, nil)
	}
	err = s.server.Stop()
	if err != nil {
		log.Error(err, nil)
	}
	log.Debug("sysd stopped", nil)
}

func (s *sysd) Workspaces() (ws []workspace.Workspace) {
	for _, v := range s.workspaces {
		ws = append(ws, v)
	}
	return
}

func (s *sysd) Workspace(id string) (ws workspace.Workspace, ok bool) {
	ws, ok = s.workspaces[id]
	return
}
