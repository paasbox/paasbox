package sysd

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"fmt"

	"sync"

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
	workspaceIDs     []string
	exitCh           chan struct{}

	stateLoader  State
	server       server.Server
	loadBalancer loadbalancer.LB
	logDriver    logger.Driver
}

var _ Sysd = &sysd{}

var (
	errOpenBoltDBFailed        = errors.New("error opening bolt database")
	errOpenBoltWorkspaceFailed = errors.New("error opening bolt workspace")
)

var cli = &http.Client{Timeout: time.Second * 5}

// New ...
func New(exitCh chan struct{}) Sysd {
	var logDriver logger.Driver
	if ld := os.Getenv("PAASBOX_LOG"); len(ld) > 0 {
		driver, err := logger.NewDriver(ld)
		if err != nil {
			fmt.Printf("error creating log driver: %s\n", err)
			os.Exit(1)
		}
		logDriver = driver
	}

	lb, err := loadbalancer.New(logDriver)
	if err != nil {
		fmt.Printf("error creating load balancer: %s\n", err)
		os.Exit(1)
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
			fmt.Printf("error reading internal file %s: %s\n", internalFile, err)
			os.Exit(1)
		}

		err = s.loadWorkspaces(b)
		if err != nil {
			fmt.Printf("error loading internal workspace %s: %s\n", internalFile, err)
			os.Exit(1)
		}
	}

	for _, workspaceFile := range loadFiles {
		var b []byte

		if strings.HasPrefix(strings.ToLower(workspaceFile), "http://") ||
			strings.HasPrefix(strings.ToLower(workspaceFile), "https://") {
			res, e := cli.Get(workspaceFile)
			if e != nil {
				fmt.Printf("error fetching file %s: %s\n", workspaceFile, e)
				os.Exit(1)
			}
			b, err = ioutil.ReadAll(res.Body)
			res.Body.Close()
			if err != nil {
				fmt.Printf("error reading response body %s: %s\n", workspaceFile, err)
				os.Exit(1)
			}
		} else {
			b, err = ioutil.ReadFile(workspaceFile)
			if err != nil {
				fmt.Printf("error reading file %s: %s\n", workspaceFile, err)
				os.Exit(1)
			}
		}

		err = s.loadWorkspaces(b)
		if err != nil {
			fmt.Printf("error loading workspace %s: %s\n", workspaceFile, err)
			os.Exit(1)
		}
	}

	var wg sync.WaitGroup
	var initErrors bool

	for _, ws := range s.workspaces {
		s.workspaceIDs = append(s.workspaceIDs, ws.ID())
		wg.Add(1)
		go func() {
			defer wg.Done()

			err := ws.Init()
			if err != nil {
				fmt.Printf("error initialising workspace %s: %s\n", ws.ID(), err)
				initErrors = true
			}
		}()
	}

	sort.Strings(s.workspaceIDs)

	wg.Wait()

	if initErrors {
		fmt.Println("workspace initialisation failed")
		os.Exit(1)
	}

	return s
}

// Start ...
func Start(exitCh chan struct{}) {
	err := New(exitCh).Start()
	if err != nil {
		fmt.Printf("error starting paasbox: %s\n", err)
		os.Exit(1)
	}
}

func (s *sysd) Start() error {
	log.Debug("starting sysd", nil)

	if s.logDriver != nil {
		s.logDriver.Start()
	}

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
	if s.logDriver != nil {
		if err := s.logDriver.Stop(); err != nil {
			log.Error(err, nil)
		}
	}
	if err := s.server.Stop(); err != nil {
		log.Error(err, nil)
	}
	log.Debug("sysd stopped", nil)
}

func (s *sysd) Workspaces() (ws []workspace.Workspace) {
	for _, v := range s.workspaceIDs {
		if w, ok := s.workspaces[v]; ok {
			ws = append(ws, w)
		}
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

func (s *sysd) loadWorkspaces(b []byte) error {
	var m map[string]interface{}
	err := json.Unmarshal(b, &m)
	if err != nil {
		return err
	}

	if _, ok := m["workspaces"]; ok {
		if wsDefs, ok := m["workspaces"].([]interface{}); ok {
			for _, wsDef := range wsDefs {
				b2, err := json.Marshal(&wsDef)
				if err != nil {
					return err
				}
				err = s.loadWorkspace(b2)
				if err != nil {
					return err
				}
			}
		}
	} else {
		return s.loadWorkspace(b)
	}
	return nil

}

func (s *sysd) loadWorkspace(b []byte) error {
	var conf workspace.Config
	err := json.Unmarshal(b, &conf)
	if err != nil {
		return err
	}

	state, err := s.stateLoader.Load(conf.ID)
	if err != nil {
		return err
	}

	ws, err := workspace.New(s.logDriver, state, s.loadBalancer, conf)
	if err != nil {
		return err
	}

	s.workspaces[conf.ID] = ws
	s.workspaceConfigs = append(s.workspaceConfigs, conf)
	return nil
}

func loadInternal(f string) ([]byte, error) {
	return assets.Asset("workspaces/" + f + ".json")
}
