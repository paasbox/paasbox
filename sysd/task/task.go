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
	"github.com/paasbox/paasbox/sysd/loadbalancer"
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
	CurrentInstances() []Instance
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
	TargetInstances() int

	ExecCount() int
}

// Config ...
type Config struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	Service   bool     `json:"service"`
	Persist   bool     `json:"persist"`
	Driver    string   `json:"driver"`
	Command   string   `json:"command"`
	Args      []string `json:"args"`
	Env       []string `json:"env"`
	Pwd       string   `json:"pwd"`
	Ports     []int    `json:"ports"`
	Instances int      `json:"instances"`
}

// WithEnv ...
func (c Config) WithEnv(env []string) Config {
	c2 := Config(c)
	c2.Env = append(env, c2.Env...)
	return c2
}

type task struct {
	taskID          string
	name            string
	service         bool
	persist         bool
	driver          string
	command         string
	args            []string
	env             []string
	ports           []int
	pwd             string
	targetInstances int
	logger          func(event string, data log.Data)

	store         state.Store
	instanceStore state.Store
	loadBalancer  loadbalancer.LB
	lbListeners   map[int]loadbalancer.Listener
	fileCreator   func(instanceID, name string) (*os.File, error)
	instances     map[string]taskInstance
	stopped       bool
	execCount     int
	execMutex     *sync.Mutex
}

type taskInstance struct {
	doneCh   chan struct{}
	instance Instance
}

var _ Task = &task{}

// NewTask ...
func NewTask(store state.Store, lb loadbalancer.LB, config Config, logger func(event string, data log.Data), fileCreator func(instanceID, name string) (*os.File, error)) (Task, error) {
	var t *task
	t = &task{
		taskID:          config.ID,
		name:            config.Name,
		service:         config.Service,
		persist:         config.Persist,
		driver:          config.Driver,
		command:         config.Command,
		args:            config.Args,
		env:             config.Env,
		pwd:             config.Pwd,
		ports:           config.Ports,
		targetInstances: config.Instances,
		loadBalancer:    lb,
		lbListeners:     make(map[int]loadbalancer.Listener),
		logger:          logger,
		stopped:         false,
		execMutex:       new(sync.Mutex),
		fileCreator: func(instanceID string, name string) (*os.File, error) {
			return fileCreator(instanceID, name)
		},
		instances: make(map[string]taskInstance),
		store:     store,
	}
	if t.service && t.targetInstances == 0 {
		// FIXME this works for now if `instances` isn't set, but means
		// setting `instances` to 0 won't prevent the service starting
		t.targetInstances = 1
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

func (t *task) CurrentInstances() (inst []Instance) {
	for _, i := range t.instances {
		inst = append(inst, i.instance)
	}
	return
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

func (t *task) TargetInstances() int {
	return t.targetInstances
}

func (t *task) Recover() (bool, error) {
	t.log("fetching instanceID", nil)
	instanceIDs, err := t.store.GetArray("instanceIDs")
	if err != nil {
		return false, err
	}

	if len(instanceIDs) == 0 {
		return false, errNoInstanceID
	}

	for _, instanceID := range instanceIDs {
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

		t.log("fetching ports", nil)
		ports, err := instanceStore.GetIntArray("ports")
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

		doneCh := make(chan struct{})
		inst := RecoveredInstance(instanceID, instanceStore, InstanceConfig{doneCh, t.logger, t.fileCreator, t.driver, t.command, t.args, nil, "", ports}, proc)
		t.instances[instanceID] = taskInstance{doneCh, inst}

		// TODO handle waitLoop errors
		go t.waitLoop(inst, doneCh)
	}

	return true, nil
}

func (t *task) Start() error {
	// if len(t.instances) > 0 {
	// 	return errAlreadyStarted
	// }

	need := t.targetInstances - len(t.instances)
	log.Debug("creating target instances", log.Data{"target": t.targetInstances, "current": len(t.instances), "need": need})
	for i := 0; i < need; i++ {
		var instanceID string
		t.execMutex.Lock()
		t.execCount++
		instanceID = fmt.Sprintf("%d", t.execCount)
		err := t.store.Set("execCount", fmt.Sprintf("%d", t.execCount))
		if err != nil {
			t.execMutex.Unlock()
			return err
		}
		t.execMutex.Unlock()

		instanceStore, err := t.instanceStore.Wrap(instanceID)
		if err != nil {
			return err
		}

		doneCh := make(chan struct{})
		inst := NewInstance(instanceID, instanceStore, InstanceConfig{doneCh, t.logger, t.fileCreator, t.driver, t.command, t.args, t.getEnv(), t.pwd, t.getInstancePorts()})
		t.instances[instanceID] = taskInstance{doneCh, inst}

		// TODO handle waitLoop errors properly
		go func() {
			err := t.waitLoop(inst, doneCh)
			if err != nil {
				log.Error(err, nil)
			}
		}()
	}

	var instanceIDs []string
	for _, i := range t.instances {
		instanceIDs = append(instanceIDs, i.instance.ID())
	}
	return t.store.SetArray("instanceIDs", instanceIDs)
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

func (t *task) getListener(port int) (loadbalancer.Listener, error) {
	if l, ok := t.lbListeners[port]; ok {
		return l, nil
	}
	l, err := t.loadBalancer.AddListener(port)
	if err != nil {
		return nil, err
	}
	t.lbListeners[port] = l
	return l, nil
}

func (t *task) waitLoop(inst Instance, doneCh chan struct{}) error {
	t.stopped = false
	if err := inst.Start(); err != nil {
		return err
	}
	for i, p := range t.ports {
		l, err := t.getListener(p)
		if err != nil {
			return err
		}
		l.AddInstances(fmt.Sprintf("127.0.0.1:%d", inst.Ports()[i]))
	}
	go func() {
		<-doneCh

		delete(t.instances, inst.ID())

		for i, p := range t.ports {
			l, err := t.getListener(p)
			if err != nil {
				log.Error(err, nil)
				return
			}
			l.RemoveInstance(fmt.Sprintf("127.0.0.1:%d", inst.Ports()[i]))
		}

		if !t.stopped && t.service {
			go t.Start()
		}
	}()
	return nil
}

func (t *task) Stop() error {
	t.stopped = true
	for _, i := range t.instances {
		// TODO handle errors
		i.instance.Stop()
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
