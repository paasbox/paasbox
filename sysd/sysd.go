package sysd

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/assets"
	"github.com/paasbox/paasbox/config"
	"github.com/paasbox/paasbox/sysd/loadbalancer"
	"github.com/paasbox/paasbox/sysd/logger"
	"github.com/paasbox/paasbox/sysd/server"
	"github.com/paasbox/paasbox/sysd/workspace"
)

// Sysd ...
type Sysd interface {
	Start() error
	LoadBalancer() loadbalancer.LB
	LogDriver() logger.Driver
}

type sysd struct {
	workspaceConfigs []workspace.Config
	workspaces       map[string]workspace.Workspace
	exitCh           chan struct{}

	stateLoader  State
	server       server.Server
	loadBalancer loadbalancer.LB
	logDriver    logger.Driver
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
	errCreateLoadbalancerFailed  = errors.New("error creating load balancer")
)

var cli = &http.Client{Timeout: time.Second * 5}

// New ...
func New(exitCh chan struct{}) Sysd {
	log.Debug("starting sysd", nil)

	var logDriver logger.Driver
	if ld := os.Getenv("PAASBOX_LOG"); len(ld) > 0 {
		driver, err := logger.NewDriver(ld)
		if err != nil {
			log.Error(errors.New("error creating log driver"), log.Data{"reason": err})
			os.Exit(1)
		}
		logDriver = driver
	}

	lb, err := loadbalancer.New()
	if err != nil {
		log.Error(errCreateLoadbalancerFailed, log.Data{"reason": err})
		os.Exit(7)
	}

	s := &sysd{
		workspaceConfigs: []workspace.Config{},
		workspaces:       make(map[string]workspace.Workspace),
		exitCh:           exitCh,
		stateLoader:      NewState(),
		loadBalancer:     lb,
		logDriver:        logDriver,
	}
	srv := server.New(s)
	s.server = srv

	workspaceFiles := os.Args[1:]
	var loadFiles []string
	var internalFiles []string

	for _, f := range workspaceFiles {
		if strings.HasPrefix(f, "@") {
			internalFiles = append(internalFiles, strings.TrimPrefix(f, "@"))
			continue
		}
		loadFiles = append(loadFiles, f)
	}

	if len(loadFiles) == 0 {
		loadFiles = append(loadFiles, "workspace.json")
	}

	for _, internalFile := range internalFiles {
		b, e := loadInternal(internalFile)
		if e != nil {
			log.Error(errReadFileError, log.Data{"reason": e})
			os.Exit(2)
			return nil
		}

		s.loadWorkspaces(b)
	}

	for _, workspaceFile := range loadFiles {
		var b []byte

		if strings.HasPrefix(strings.ToLower(workspaceFile), "http://") ||
			strings.HasPrefix(strings.ToLower(workspaceFile), "https://") {
			res, e := cli.Get(workspaceFile)
			if e != nil {
				log.Error(errReadFileError, log.Data{"reason": e})
				os.Exit(2)
				return nil
			}
			b, err = ioutil.ReadAll(res.Body)
			res.Body.Close()
			if err != nil {
				log.Error(errReadFileError, log.Data{"reason": err})
				os.Exit(2)
				return nil
			}
		} else {
			b, err = ioutil.ReadFile(workspaceFile)
			if err != nil {
				log.Error(errReadFileError, log.Data{"reason": err})
				os.Exit(2)
				return nil
			}
		}

		s.loadWorkspaces(b)
	}

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
	s.logDriver.Start()

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
	s.stateLoader.Close()
	if err := s.logDriver.Stop(); err != nil {
		log.Error(err, nil)
	}
	if err := s.server.Stop(); err != nil {
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

func (s *sysd) LoadBalancer() loadbalancer.LB {
	return s.loadBalancer
}

func (s *sysd) LogDriver() logger.Driver {
	return s.logDriver
}

func (s *sysd) loadWorkspaces(b []byte) {
	var m map[string]interface{}
	err := json.Unmarshal(b, &m)
	if err != nil {
		log.Error(errInvalidWorkspaceJSON, log.Data{"reason": err})
		os.Exit(3)
	}

	if _, ok := m["workspaces"]; ok {
		if wsDefs, ok := m["workspaces"].([]interface{}); ok {
			for _, wsDef := range wsDefs {
				b2, err := json.Marshal(&wsDef)
				if err != nil {
					log.Error(errInvalidWorkspaceJSON, log.Data{"reason": err})
					os.Exit(3)
				}
				s.loadWorkspace(b2)
			}
		}
	} else {
		s.loadWorkspace(b)
	}

}

func (s *sysd) loadWorkspace(b []byte) {
	var conf workspace.Config
	err := json.Unmarshal(b, &conf)
	if err != nil {
		log.Error(errInvalidWorkspaceJSON, log.Data{"reason": err})
		os.Exit(3)
	}

	state, err := s.stateLoader.Load(conf.ID)
	if err != nil {
		log.Error(errOpenBoltDBFailed, log.Data{"reason": err})
		log.Debug("Check if other copies of paasbox are running", nil)
		os.Exit(4)
	}

	ws, err := workspace.New(s.logDriver, state, s.loadBalancer, conf)
	if err != nil {
		log.Error(errCreateWorkspaceFailed, log.Data{"reason": err, "workspace_id": conf.ID})
		os.Exit(6)
	}

	s.workspaces[conf.ID] = ws
	s.workspaceConfigs = append(s.workspaceConfigs, conf)
}

func loadInternal(f string) ([]byte, error) {
	return assets.Asset("workspaces/" + f + ".json")
}
