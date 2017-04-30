package stack

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"

	"sync"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/state"
	"github.com/paasbox/paasbox/sysd/loadbalancer"
	"github.com/paasbox/paasbox/sysd/logger"
	"github.com/paasbox/paasbox/sysd/task"
	pbEnv "github.com/paasbox/paasbox/sysd/util/env"
	"github.com/paasbox/paasbox/sysd/util/lockwarn"
)

var (
	errStartTaskFailed      = errors.New("start task failed")
	errRecoveringTaskFailed = errors.New("recovering task failed")
	errStopTaskFailed       = errors.New("error stopping task")
	errLogPathIsFile        = errors.New("log path is a file, need directory")
)

// Stack ...
type Stack interface {
	Init() error
	Start() error
	Stop() error
	Shutdown() error
	Tasks() []task.Task
	Task(id string) (t task.Task, ok bool)
	ID() string
	Name() string
	Env() EnvConfig
	LogPath() string

	Started() bool
}

// Config ...
type Config struct {
	ID         string        `json:"id"`
	Name       string        `json:"name"`
	Tasks      []task.Config `json:"tasks"`
	LogPath    string        `json:"log_path"`
	LogPattern string        `json:"log_pattern"`
	Env        EnvConfig     `json:"env"`
}

// EnvConfig ...
type EnvConfig struct {
	InheritAll bool     `json:"inherit_all"`
	Inherit    []string `json:"inherit"`
	Remove     []string `json:"remove"`
	Set        []string `json:"set"`
}

type stack struct {
	id          string
	name        string
	taskConfigs []task.Config
	env         EnvConfig
	logPath     string
	logPattern  string

	tasks        map[string]task.Task
	taskIDs      []string
	store        state.Store
	loadBalancer loadbalancer.LB
	stopped      bool

	dockerNetworks map[string]struct{}
	logDriver      logger.Driver
}

// New ...
func New(logDriver logger.Driver, store state.Store, lb loadbalancer.LB, config Config) (Stack, error) {
	log.Debug("creating stack", log.Data{"id": config.ID, "tasks": config.Tasks})
	ws := &stack{
		id:          config.ID,
		name:        config.Name,
		taskConfigs: config.Tasks,
		env:         config.Env,
		tasks:       make(map[string]task.Task),
		logPath:     config.LogPath,
		logPattern:  config.LogPattern,

		loadBalancer:   lb,
		dockerNetworks: make(map[string]struct{}),
		logDriver:      logDriver,
	}

	if len(config.LogPath) == 0 {
		ws.logPath = "./logs"
	}
	if len(config.LogPattern) == 0 {
		ws.logPattern = "$STACK_ID$/$TASK_ID$/$INSTANCE_ID$/$NAME$.log"
	}

	o, err := os.Stat(ws.logPath)
	if err == nil && !o.IsDir() {
		return nil, errLogPathIsFile
	}
	if err != nil {
		err = os.MkdirAll(ws.logPath, 0775)
		if err != nil {
			return nil, err
		}
	}

	taskStore, err := store.Wrap("tasks")
	if err != nil {
		return nil, err
	}

	for _, t := range config.Tasks {
		s, err := taskStore.Wrap(t.ID)
		if err != nil {
			return nil, err
		}
		taskID := t.ID

		// FIXME this all feels really nasty
		var env []string
		if ws.env.InheritAll {
			env = append(env, os.Environ()...)
		} else {
			for _, v := range ws.env.Inherit {
				if s := os.Getenv(v); len(s) > 0 {
					env = append(env, fmt.Sprintf("%s=%s", v, s))
				}
			}
		}
		origEnv := append([]string{}, env...)
		env = []string{}
		for _, v := range origEnv {
			a := true
			for _, r := range ws.env.Remove {
				if strings.HasPrefix(v, fmt.Sprintf("%s=", r)) {
					a = false
				}
			}
			if a {
				env = append(env, v)
			}
		}
		env = append(env, ws.env.Set...)
		env = append(env, fmt.Sprintf("PAASBOX_WSID=%s", ws.id), fmt.Sprintf("PAASBOX_LOGPATH=%s", ws.logPath))

		t2, err := task.NewTask(ws.id, s, ws.logDriver, ws.loadBalancer, t.WithEnv(env), ws.log, func(instanceID, name string) (*os.File, error) {
			logPattern := ws.logPattern
			logPattern = strings.Replace(logPattern, "$STACK_ID$", ws.ID(), -1)
			logPattern = strings.Replace(logPattern, "$TASK_ID$", taskID, -1)
			logPattern = strings.Replace(logPattern, "$INSTANCE_ID$", instanceID, -1)
			logPattern = strings.Replace(logPattern, "$NAME$", name, -1)
			path := filepath.Join(ws.logPath, logPattern)
			dir := filepath.Dir(path)
			log.Debug("creating directory", log.Data{"dir": dir})
			e := os.MkdirAll(dir, 0775)
			if e != nil {
				return nil, e
			}
			log.Debug("opening file", log.Data{"file": path})
			return os.OpenFile(path, os.O_RDWR|os.O_CREATE, 0660)
		})
		if err != nil {
			return nil, err
		}
		ws.tasks[t.ID] = t2

		if net := t2.Network(); len(net) > 0 {
			if _, ok := ws.dockerNetworks[net]; !ok {
				ws.dockerNetworks["paasbox-"+pbEnv.Replace(net, env)] = struct{}{}
			}
		}
	}

	for net := range ws.dockerNetworks {
		log.Debug("finding docker network", log.Data{"network": net})

		cmd := exec.Command("docker", "network", "inspect", net)
		cmd.Env = os.Environ()
		if err := cmd.Start(); err != nil {
			log.Error(errors.New("error starting docker network inspect"), log.Data{"reason": err})
			return nil, err
		}
		c := lockwarn.Notify()
		if err := cmd.Wait(); err != nil {
			close(c)
			log.Error(errors.New("error starting docker network inspect"), log.Data{"reason": err})
			log.Debug("docker network not found, creating", log.Data{"network": net})

			cmd = exec.Command("docker", "network", "create", net)
			cmd.Env = os.Environ()
			if err = cmd.Start(); err != nil {
				log.Error(errors.New("error starting docker network create"), log.Data{"reason": err})
				return nil, err
			}
			c := lockwarn.Notify()
			if err = cmd.Wait(); err != nil {
				close(c)
				log.Error(errors.New("error starting docker network create"), log.Data{"reason": err})
				return nil, err
			}
			log.Debug("created docker network", log.Data{"network": net})
		}
	}

	for _, t := range ws.tasks {
		ws.taskIDs = append(ws.taskIDs, t.ID())
	}
	sort.Strings(ws.taskIDs)

	return ws, nil
}

func (ws *stack) ID() string {
	return ws.id
}

func (ws *stack) Tasks() (t []task.Task) {
	for _, tID := range ws.taskIDs {
		if task, ok := ws.tasks[tID]; ok {
			t = append(t, task)
		}
	}
	return
}

func (ws *stack) Task(id string) (t task.Task, ok bool) {
	t, ok = ws.tasks[id]
	return
}

func (ws *stack) Name() string {
	return ws.name
}

func (ws *stack) Env() EnvConfig {
	return ws.env
}

func (ws *stack) LogPath() string {
	return ws.logPath
}

func (ws *stack) log(event string, data log.Data) {
	if data == nil {
		data = log.Data{}
	}
	data["stack_id"] = ws.id
	log.Debug(event, data)
}

func (ws *stack) error(err error, reason error, data log.Data) {
	if data == nil {
		data = log.Data{}
	}
	data["error"] = err
	data["reason"] = reason
	ws.log("error", data)
}

type initError struct {
	error
	errs []error
}

func (ws *stack) Init() (err error) {
	ws.log("initialising stack", nil)

	var wg sync.WaitGroup
	errChan := make(chan error)
	var errs []error

	go func() {
		for e := range errChan {
			errs = append(errs, e)
		}
	}()

	for _, t := range ws.tasks {
		wg.Add(1)
		go func(t task.Task) {
			defer wg.Done()

			err := t.Init()
			if err != nil {
				errChan <- err
			}
		}(t)
	}

	wg.Wait()
	close(errChan)

	if len(errs) > 0 {
		err = initError{errors.New("stack initialisation failed"), errs}
		return
	}

	ws.log("stack initialisation complete", nil)

	return
}

func (ws *stack) Start() error {
	ws.log("starting stack", nil)
	ws.stopped = false

	for _, t := range ws.taskConfigs {
		if task, ok := ws.tasks[t.ID]; ok {
			ok, err := task.Recover()
			if ok {
				continue
			}
			ws.error(errRecoveringTaskFailed, err, log.Data{"task_id": t.ID})

			if t.Service {
				ws.log("starting task", log.Data{"task_id": t.ID})
				err := task.Start()
				if err != nil {
					ws.error(errStartTaskFailed, err, log.Data{"task_id": t.ID})
				}
			}
		}
	}

	return nil
}

func (ws *stack) Shutdown() error {
	ws.log("shutting down stack, stopping tasks", nil)
	for _, t := range ws.taskConfigs {
		if task, ok := ws.tasks[t.ID]; ok {
			ws.log("stopping task", log.Data{"task_id": t.ID})
			err := task.Stop()
			if err != nil {
				ws.error(errStopTaskFailed, err, log.Data{"task_id": t.ID})
			}
		}
	}
	return nil
}

func (ws *stack) Stop() error {
	ws.stopped = true
	ws.log("stopping stack, stopping tasks", nil)
	for _, t := range ws.taskConfigs {
		if task, ok := ws.tasks[t.ID]; ok && !task.Persist() {
			ws.log("task doesn't persist, stopping task", log.Data{"task_id": t.ID})
			err := task.Stop()
			if err != nil {
				ws.error(errStopTaskFailed, err, log.Data{"task_id": t.ID})
			}
		}
	}
	return nil
}

func (ws *stack) Started() bool {
	return !ws.stopped
}
