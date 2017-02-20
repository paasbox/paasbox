package task

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"syscall"

	"github.com/google/uuid"
	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/state"
)

var (
	errZeroPid            = errors.New("pid is zero")
	errNoInstanceID       = errors.New("instanceID is empty")
	errProcessNotFound    = errors.New("process not found")
	errProcessSignalError = errors.New("signal error")
	errUnsupportedDriver  = errors.New("unsupported driver")
	errAlreadyStarted     = errors.New("already started")
)

// Task ...
type Task interface {
	Start() error
	Stop() error
	Recover() (ok bool, err error)
	Instance() Instance

	ID() string
	Service() bool
	Driver() string
	Command() string
	Args() []string
}

// Config ...
type Config struct {
	ID      string
	Service bool
	Driver  string
	Command string
	Args    []string
}

type task struct {
	taskID  string
	service bool
	driver  string
	command string
	args    []string
	env     map[string]string
	logger  func(event string, data log.Data)

	store         state.Store
	instanceStore state.Store
	tempFile      func(name string) (*os.File, error)
	instance      Instance
	doneCh        chan struct{}
	stopped       bool
	execCount     int
}

var _ Task = &task{}

// NewTask ...
func NewTask(store state.Store, config Config, logger func(event string, data log.Data)) (Task, error) {
	var t *task
	t = &task{
		taskID:  config.ID,
		service: config.Service,
		driver:  config.Driver,
		command: config.Command,
		args:    config.Args,
		logger:  logger,
		stopped: false,
		tempFile: func(name string) (*os.File, error) {
			return ioutil.TempFile("", t.instance.InstanceID()+"-"+name)
		},
		store: store,
	}
	instanceStore, err := store.Wrap("instances")
	if err != nil {
		return nil, err
	}
	t.instanceStore = instanceStore

	logger("created task", log.Data{
		"id":      t.taskID,
		"service": t.service,
		"driver":  t.driver,
		"command": t.command,
		"args":    t.args,
	})
	return t, nil
}

func (t *task) Instance() Instance {
	return t.instance
}

func (t *task) ID() string {
	return t.taskID
}

func (t *task) Service() bool {
	return t.service
}

func (t *task) Driver() string {
	return t.driver
}

func (t *task) Command() string {
	return t.command
}

func (t *task) Args() []string {
	return t.args
}

func (t *task) Recover() (bool, error) {
	t.log("fetching instanceID", nil)
	instanceID, err := t.store.Get("instanceID")
	if err != nil {
		return false, err
	}

	if len(instanceID) == 0 {
		return false, errNoInstanceID
	}

	t.log("wrapping instanceStore", nil)
	instanceStore, err := t.instanceStore.Wrap(instanceID)
	if err != nil {
		return false, err
	}

	t.log("fetching pid", nil)
	p, err := instanceStore.Get("pid")
	if err != nil {
		return false, err
	}

	t.log("converting pid to int", log.Data{"pid": p})
	pid, err := strconv.Atoi(p)
	if err != nil {
		return false, err
	}

	if pid == 0 || len(instanceID) == 0 {
		return false, errZeroPid
	}

	proc, err := t.getProcess(pid)
	if err != nil {
		return false, err
	}

	t.doneCh = make(chan struct{})
	t.instance = RecoveredInstance(instanceID, instanceStore, InstanceConfig{t.doneCh, t.logger, t.tempFile, t.driver, t.command, t.args, nil}, proc)

	return true, t.waitLoop()
}

func (t *task) Start() error {
	if t.instance != nil {
		return errAlreadyStarted
	}

	instanceID := uuid.New().String()
	instanceStore, err := t.instanceStore.Wrap(instanceID)
	if err != nil {
		return err
	}

	err = t.store.Set("instanceID", instanceID)
	if err != nil {
		return err
	}

	t.execCount++
	t.doneCh = make(chan struct{})
	t.instance = NewInstance(instanceID, instanceStore, InstanceConfig{t.doneCh, t.logger, t.tempFile, t.driver, t.command, t.args, t.getEnv()})

	return t.waitLoop()
}

func (t *task) getEnv() []string {
	var env []string
	for k, v := range t.env {
		env = append(env, fmt.Sprintf("%s=%s", k, v))
	}
	return env
}

func (t *task) waitLoop() error {
	t.stopped = false
	if err := t.instance.Start(); err != nil {
		return err
	}
	go func() {
		<-t.doneCh
		if !t.stopped && t.service {
			t.instance = nil
			go t.Start()
		}
	}()
	return nil
}

func (t *task) Stop() error {
	t.stopped = true
	if t.instance != nil {
		return t.instance.Stop()
	}
	return nil
}

func (t *task) log(event string, data log.Data) {
	if data == nil {
		data = log.Data{}
	}
	data["task_id"] = t.taskID
	t.logger(event, data)
}

func (t *task) error(err, reason error, data log.Data) {
	if data == nil {
		data = log.Data{}
	}
	data["error"] = err
	data["reason"] = reason
	t.log("error", data)
}

func (t *task) getProcess(pid int) (*os.Process, error) {
	t.log("finding process", nil)

	process, err := os.FindProcess(pid)
	if err != nil {
		t.error(errProcessNotFound, err, nil)
		return nil, err
	}

	return t.signal(process, 0)
}

func (t *task) signal(proc *os.Process, code int) (*os.Process, error) {
	t.log("signalling process", log.Data{"code": code, "pid": proc.Pid})
	err := proc.Signal(syscall.Signal(code))
	if err != nil {
		t.error(errProcessSignalError, err, log.Data{"code": code, "proc_pid": proc.Pid})
		return proc, err
	}
	return proc, nil
}
