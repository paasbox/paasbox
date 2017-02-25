package task

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"sync"
	"syscall"

	"github.com/facebookgo/freeport"
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
	CurrentInstance() Instance
	Instance(id string) (Instance, error)
	Instances(start, count uint, desc bool) []Instance

	ID() string
	Name() string
	Service() bool
	Driver() string
	Command() string
	Args() []string
	Env() []string
	Pwd() string
	Ports() []int
	Persist() bool

	ExecCount() int
}

// Config ...
type Config struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Service bool     `json:"service"`
	Persist bool     `json:"persist"`
	Driver  string   `json:"driver"`
	Command string   `json:"command"`
	Args    []string `json:"args"`
	Env     []string `json:"env"`
	Pwd     string   `json:"pwd"`
	Ports   []int    `json:"ports"`
}

// WithEnv ...
func (c Config) WithEnv(env []string) Config {
	c2 := Config(c)
	c2.Env = append(env, c2.Env...)
	return c2
}

type task struct {
	taskID  string
	name    string
	service bool
	persist bool
	driver  string
	command string
	args    []string
	env     []string
	ports   []int
	pwd     string
	logger  func(event string, data log.Data)

	store         state.Store
	instanceStore state.Store
	fileCreator   func(name string) (*os.File, error)
	instance      Instance
	doneCh        chan struct{}
	stopped       bool
	execCount     int
	execMutex     *sync.Mutex
}

var _ Task = &task{}

// NewTask ...
func NewTask(store state.Store, config Config, logger func(event string, data log.Data), fileCreator func(instanceID, name string) (*os.File, error)) (Task, error) {
	var t *task
	t = &task{
		taskID:    config.ID,
		name:      config.Name,
		service:   config.Service,
		persist:   config.Persist,
		driver:    config.Driver,
		command:   config.Command,
		args:      config.Args,
		env:       config.Env,
		pwd:       config.Pwd,
		ports:     config.Ports,
		logger:    logger,
		stopped:   false,
		execMutex: new(sync.Mutex),
		fileCreator: func(name string) (*os.File, error) {
			return fileCreator(t.instance.ID(), name)
		},
		store: store,
	}
	instanceStore, err := store.Wrap("instances")
	if err != nil {
		return nil, err
	}
	t.instanceStore = instanceStore

	c, err := t.store.Get("execCount")
	if err != nil {
		return nil, err
	}
	if len(c) > 0 {
		t.execCount, err = strconv.Atoi(c)
		if err != nil {
			return nil, err
		}
	}

	logger("created task", log.Data{
		"id":      t.taskID,
		"service": t.service,
		"driver":  t.driver,
		"command": t.command,
		"args":    t.args,
	})
	return t, nil
}

func (t *task) CurrentInstance() Instance {
	return t.instance
}

func (t *task) Instance(id string) (Instance, error) {
	return t.getArchivedInstance(id)
}

func (t *task) getArchivedInstance(id string) (Instance, error) {
	instanceStorage, err := t.instanceStore.Wrap(id)
	if err != nil {
		return nil, err
	}

	driver, err := instanceStorage.Get("driver")
	if err != nil {
		log.Error(err, nil)
	}
	if len(driver) == 0 {
		return nil, nil
	}
	command, err := instanceStorage.Get("command")
	if err != nil {
		log.Error(err, nil)
	}
	args, err := instanceStorage.GetArray("args")
	if err != nil {
		log.Error(err, nil)
	}
	env, err := instanceStorage.GetArray("env")
	if err != nil {
		log.Error(err, nil)
	}
	stdout, err := instanceStorage.Get("stdout")
	if err != nil {
		log.Error(err, nil)
	}
	stderr, err := instanceStorage.Get("stderr")
	if err != nil {
		log.Error(err, nil)
	}
	pwd, err := instanceStorage.Get("pwd")
	if err != nil {
		log.Error(err, nil)
	}
	pid, err := instanceStorage.Get("pid")
	if err != nil {
		log.Error(err, nil)
	}
	running, err := instanceStorage.Get("running")
	if err != nil {
		log.Error(err, nil)
	}
	ports, err := instanceStorage.GetIntArray("ports")
	if err != nil {
		log.Error(err, nil)
	}

	pidN, _ := strconv.Atoi(pid)
	runningB, _ := strconv.ParseBool(running)

	i := &instance{
		//doneCh:         config.DoneCh,
		//logger:         config.Logger,
		//fileCreator:    config.FileCreator,
		driver:  driver,
		command: command,
		args:    args,
		env:     env,
		pwd:     pwd,
		ports:   ports,
		//signalInterval: time.Second * 10,
		instanceID: id,
		stderr:     stderr,
		stdout:     stdout,
		pid:        pidN,
		//store:          store,
		started: true,
		isDone:  !runningB,
	}
	return i, nil
}

func (t *task) Instances(start, count uint, desc bool) []Instance {
	var instances []Instance
	if desc {
		for i := t.ExecCount() - int(start); i > t.ExecCount()-int(start)-int(count); i-- {
			instance, err := t.getArchivedInstance(fmt.Sprintf("%d", i))
			if err != nil {
				log.Error(err, nil)
				continue
			}
			if instance != nil {
				instances = append(instances, instance)
			}
		}
	} else {
		for i := start + 1; i <= start+count; i++ {
			instance, err := t.getArchivedInstance(fmt.Sprintf("%d", i))
			if err != nil {
				log.Error(err, nil)
				continue
			}
			if instance != nil {
				instances = append(instances, instance)
			}
		}
	}
	return instances
}

func (t *task) ExecCount() int {
	return t.execCount
}

func (t *task) ID() string {
	return t.taskID
}

func (t *task) Name() string {
	return t.name
}

func (t *task) Service() bool {
	return t.service
}

func (t *task) Persist() bool {
	return t.persist
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

func (t *task) Env() []string {
	return t.env
}

func (t *task) Pwd() string {
	return t.pwd
}

func (t *task) Ports() []int {
	return t.ports
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
	t.instance = RecoveredInstance(instanceID, instanceStore, InstanceConfig{t.doneCh, t.logger, t.fileCreator, t.driver, t.command, t.args, nil, "", []int{}}, proc)

	return true, t.waitLoop()
}

func (t *task) Start() error {
	if t.instance != nil {
		return errAlreadyStarted
	}

	var instanceID string
	t.execMutex.Lock()
	t.execCount++
	instanceID = fmt.Sprintf("%d", t.execCount)
	t.execMutex.Unlock()

	err := t.store.Set("instanceID", instanceID)
	if err != nil {
		return err
	}

	err = t.store.Set("execCount", fmt.Sprintf("%d", t.execCount))
	if err != nil {
		return err
	}

	instanceStore, err := t.instanceStore.Wrap(instanceID)
	if err != nil {
		return err
	}

	t.doneCh = make(chan struct{})
	t.instance = NewInstance(instanceID, instanceStore, InstanceConfig{t.doneCh, t.logger, t.fileCreator, t.driver, t.command, t.args, t.getEnv(), t.pwd, t.getInstancePorts()})

	return t.waitLoop()
}

func (t *task) getEnv() []string {
	var env []string
	for _, v := range t.env {
		env = append(env, fmt.Sprintf("%s", v))
	}
	env = append(env, fmt.Sprintf("PAASBOX_TASKID=%s", t.taskID))
	return env
}

func (t *task) getInstancePorts() []int {
	var ports []int
	if len(t.ports) > 0 {
		var attempts int
		for {
			attempts++
			port, err := freeport.Get()
			if err == nil {
				ports = append(ports, port)
				if len(ports) == len(t.ports) {
					break
				}
				continue
			}

			if attempts > 10 {
				panic("TODO! how to gracefully handle this?")
			}
		}
	}
	return ports
}

func (t *task) waitLoop() error {
	t.stopped = false
	if err := t.instance.Start(); err != nil {
		return err
	}
	go func() {
		<-t.doneCh
		t.instance = nil
		if !t.stopped && t.service {
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
