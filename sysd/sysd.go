package sysd

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
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
	"github.com/paasbox/paasbox/sysd/stack"
	"github.com/paasbox/paasbox/sysd/util/lockwarn"
)

// Sysd ...
type Sysd interface {
	Start() error
	LoadBalancer() loadbalancer.LB
	LogDriver() logger.Driver
}

type sysd struct {
	stackConfigs []stack.Config
	stacks       map[string]stack.Stack
	stackIDs     []string
	exitCh       chan struct{}

	stateLoader  State
	server       server.Server
	loadBalancer loadbalancer.LB
	logDriver    logger.Driver
}

var _ Sysd = &sysd{}

var (
	errOpenBoltDBFailed    = errors.New("error opening bolt database")
	errOpenBoltStackFailed = errors.New("error opening bolt stack")
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
		stackConfigs: []stack.Config{},
		stacks:       make(map[string]stack.Stack),
		exitCh:       exitCh,
		stateLoader:  NewState(),
		loadBalancer: lb,
		logDriver:    logDriver,
	}
	srv := server.New(s)
	s.server = srv

	stackFiles := os.Args[1:]
	var loadFiles []string
	var atFiles []string

	for _, f := range stackFiles {
		if strings.HasPrefix(f, "@") {
			atFiles = append(atFiles, strings.TrimPrefix(f, "@"))
			continue
		}
		loadFiles = append(loadFiles, f)
	}

	if len(loadFiles) == 0 && len(atFiles) == 0 {
		loadFiles = append(loadFiles, "stack.json")
	}

	// @elk => github.com/paasbox/stacks/elk/latest
	// @elk:5.2.2 => github.com/paasbox/stacks/elk/5.2.2
	// @github.com/paasbox/stacks/elk
	// @github.com/paasbox/stacks/elk:5.2.2 (branch/tag switch)

	for _, internalFile := range atFiles {
		path, err := getAtFilePath(internalFile)
		if err != nil {
			fmt.Printf("error parsing @file %s: %s\n", internalFile, err)
			os.Exit(1)
		}

		fmt.Println("PATH: ", path)
		loadFiles = append(loadFiles, path)

		// b, e := loadInternal(internalFile)
		// if e != nil {
		// 	fmt.Printf("error reading internal file %s: %s\n", internalFile, err)
		// 	os.Exit(1)
		// }

		// err = s.loadStacks(b)
		// if err != nil {
		// 	fmt.Printf("error loading internal stack %s: %s\n", internalFile, err)
		// 	os.Exit(1)
		// }
	}

	for _, stackFile := range loadFiles {
		var b []byte
		var remote string

		if strings.HasPrefix(strings.ToLower(stackFile), "http://") ||
			strings.HasPrefix(strings.ToLower(stackFile), "https://") {
			u, e := url.Parse(stackFile)
			if e != nil {
				fmt.Printf("error parsing url %s: %s\n", stackFile, e)
				os.Exit(1)
			}
			cachePath := u.Host + "/" + u.Path
			cachePath = strings.Replace(cachePath, "/", "_", -1)
			remote = cachePath
			cachePath = filepath.Join(getStateDir(), "stacks/"+cachePath)
			var loaded bool
			if _, err := os.Stat(cachePath); err == nil {
				b, err = ioutil.ReadFile(cachePath)
				if err != nil {
					fmt.Printf("error reading cached file %s: %s\n", stackFile, err)
				} else {
					fmt.Printf("loaded cached file %s\n", cachePath)
					loaded = true
				}
			}
			if !loaded {
				res, e := cli.Get(stackFile)
				if e != nil {
					fmt.Printf("error fetching file %s: %s\n", stackFile, e)
					os.Exit(1)
				}
				b, err = ioutil.ReadAll(res.Body)
				res.Body.Close()
				if err != nil {
					fmt.Printf("error reading response body %s: %s\n", stackFile, err)
					os.Exit(1)
				}

				dirName := filepath.Dir(cachePath)
				err = os.MkdirAll(dirName, os.FileMode(0755))
				if err != nil {
					fmt.Printf("error creating cache directory %s: %s", dirName, err)
				} else {
					err = ioutil.WriteFile(cachePath, b, os.FileMode(0755))
					if err != nil {
						fmt.Printf("error writing cache file %s: %s", cachePath, err)
					}
				}
			}
		} else {
			b, err = ioutil.ReadFile(stackFile)
			if err != nil {
				fmt.Printf("error reading file %s: %s\n", stackFile, err)
				os.Exit(1)
			}
		}

		err = s.loadStacks(remote, b)
		if err != nil {
			fmt.Printf("error loading stack %s: %s\n", stackFile, err)
			os.Exit(1)
		}
	}

	var wg sync.WaitGroup
	var initErrors bool

	for _, ws := range s.stacks {
		s.stackIDs = append(s.stackIDs, ws.ID())
		wg.Add(1)
		go func(ws stack.Stack) {
			defer wg.Done()

			err := ws.Init()
			if err != nil {
				fmt.Printf("error initialising stack %s: %s\n", ws.ID(), err)
				initErrors = true
			}
		}(ws)
	}

	sort.Strings(s.stackIDs)

	c := lockwarn.Notify()
	wg.Wait()
	close(c)

	if initErrors {
		fmt.Println("stack initialisation failed")
		os.Exit(1)
	}

	return s
}

func getAtFilePath(internalFile string) (string, error) {
	version := "latest"
	var path string

	parts := strings.SplitN(internalFile, ":", 2)
	if len(parts) > 1 {
		version = parts[len(parts)-1]
	}

	path = parts[0]
	parts = strings.Split(path, "/")
	if len(parts) > 1 {
		switch strings.ToLower(parts[0]) {
		case "github.com":
			if len(parts) <= 3 {
				return "", errors.New("invalid @file path: " + internalFile)
			}
			path = fmt.Sprintf("https://raw.githubusercontent.com/%s/%s/master/%s/%s.json", parts[1], parts[2], strings.Join(parts[3:], "/"), version)
		default:
		}
	} else {
		path = fmt.Sprintf("https://raw.githubusercontent.com/paasbox/stacks/master/%s/%s.json", parts[0], version)
	}

	return path, nil
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

	log.Debug("starting stacks", nil)
	for _, ws := range s.stackConfigs {
		err := s.stacks[ws.ID].Start()
		if err != nil {
			log.Error(err, log.Data{"stack_id": ws.ID})
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
	for _, ws := range s.stacks {
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

func (s *sysd) Stacks() (ws []stack.Stack) {
	for _, v := range s.stackIDs {
		if w, ok := s.stacks[v]; ok {
			ws = append(ws, w)
		}
	}
	return
}

func (s *sysd) Stack(id string) (ws stack.Stack, ok bool) {
	ws, ok = s.stacks[id]
	return
}

func (s *sysd) LoadBalancer() loadbalancer.LB {
	return s.loadBalancer
}

func (s *sysd) LogDriver() logger.Driver {
	return s.logDriver
}

func (s *sysd) loadStacks(remote string, b []byte) error {
	var m map[string]interface{}
	err := json.Unmarshal(b, &m)
	if err != nil {
		return err
	}

	if _, ok := m["stacks"]; ok {
		if wsDefs, ok := m["stacks"].([]interface{}); ok {
			for _, wsDef := range wsDefs {
				b2, err := json.Marshal(&wsDef)
				if err != nil {
					return err
				}
				err = s.loadStack(remote, b2)
				if err != nil {
					return err
				}
			}
		}
	} else {
		return s.loadStack(remote, b)
	}
	return nil

}

func (s *sysd) loadStack(remote string, b []byte) error {
	var conf stack.Config
	err := json.Unmarshal(b, &conf)
	if err != nil {
		return err
	}

	stateFile := conf.ID
	if len(remote) > 0 {
		stateFile = remote + "/" + conf.ID
	}
	state, err := s.stateLoader.Load(stateFile)
	if err != nil {
		return err
	}

	ws, err := stack.New(s.logDriver, state, s.loadBalancer, conf)
	if err != nil {
		return err
	}

	s.stacks[conf.ID] = ws
	s.stackConfigs = append(s.stackConfigs, conf)
	return nil
}

func loadInternal(f string) ([]byte, error) {
	return assets.Asset("stacks/" + f + ".json")
}
