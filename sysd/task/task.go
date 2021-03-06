package task

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"sync"
	"syscall"
	"time"

	"github.com/facebookgo/freeport"
	"github.com/ian-kent/service.go/log"
	pconfig "github.com/paasbox/paasbox/config"
	"github.com/paasbox/paasbox/state"
	"github.com/paasbox/paasbox/sysd/loadbalancer"
	"github.com/paasbox/paasbox/sysd/logger"
	"github.com/paasbox/paasbox/sysd/util/env"
	"github.com/paasbox/paasbox/sysd/util/lockwarn"
)

var (
	errZeroPid            = errors.New("pid is zero")
	errNoInstanceID       = errors.New("instanceID is empty")
	errProcessNotFound    = errors.New("process not found")
	errProcessSignalError = errors.New("signal error")
	errUnsupportedDriver  = errors.New("unsupported driver")
	errAlreadyStarted     = errors.New("already started")
)

var _ Task = &task{}

// Task ...
type Task interface {
	Init() error
	Start() error
	Stop() error
	Recover() (ok bool, err error)
	CurrentInstances() []Instance
	Instance(id string) (Instance, error)
	Instances(start, count uint, desc bool) []Instance
	Healthchecks() []Healthcheck
	SetDevMode(bool) error
	DevMode() bool

	ID() string
	Name() string
	Service() bool
	Driver() string
	Command() string
	Args() []string
	Env() []string
	Pwd() string
	Ports() []int
	PortMap() []int
	Image() string
	Volumes() []string
	Persist() bool
	TargetInstances() int
	Network() string

	ExecCount() int
	Started() bool

	// TODO not sure how/if to persist changes made with these functions
	SetEnv([]string) error
}

// Config ...
type Config struct {
	ID           string                   `json:"id"`
	Name         string                   `json:"name"`
	Service      bool                     `json:"service"`
	Persist      bool                     `json:"persist"`
	Driver       string                   `json:"driver"`
	Command      string                   `json:"command"`
	Args         []string                 `json:"args"`
	Env          []string                 `json:"env"`
	Pwd          string                   `json:"pwd"`
	Ports        []int                    `json:"ports"`
	PortMap      []int                    `json:"port_map"`
	Instances    int                      `json:"instances"`
	Healthchecks []HealthcheckConfig      `json:"healthchecks"`
	Image        string                   `json:"image"`
	Network      string                   `json:"network"`
	Volumes      []string                 `json:"volumes"`
	Init         []map[string]interface{} `json:"init"`
}

// WithEnv ...
func (c Config) WithEnv(env []string) Config {
	c2 := Config(c)
	c2.Env = append(env, c2.Env...)
	return c2
}

type task struct {
	stackID                 string
	taskID                  string
	name                    string
	service                 bool
	persist                 bool
	driver                  string
	command                 string
	args                    []string
	env                     []string
	ports                   []int
	portMap                 []int
	pwd                     string
	targetInstances         int
	originalTargetInstances int
	image                   string
	network                 string
	volumes                 []string
	logger                  func(event string, data log.Data)
	logDriver               logger.Driver

	store         state.Store
	instanceStore state.Store
	loadBalancer  loadbalancer.LB
	healthchecks  []*taskHealthcheck
	lbListeners   map[int]loadbalancer.Listener
	fileCreator   func(instanceID, name string) (*os.File, error)
	instances     map[string]taskInstance
	stopped       bool
	execCount     int
	execMutex     *sync.Mutex
	init          []taskInit
	devMode       bool
}

type taskInstance struct {
	doneCh   chan struct{}
	instance Instance
}

// NewTask ...
func NewTask(stackID string, store state.Store, logDriver logger.Driver, lb loadbalancer.LB, config Config, logger func(event string, data log.Data), fileCreator func(instanceID, name string) (*os.File, error)) (Task, error) {
	if config.Driver == "docker" && !pconfig.HasDocker {
		return nil, errors.New("docker is not available")
	}
	e := append(config.Env, fmt.Sprintf("PAASBOX_TASKID=%s", config.ID))
	var t *task
	t = &task{
		stackID:                 stackID,
		taskID:                  config.ID,
		name:                    config.Name,
		service:                 config.Service,
		persist:                 config.Persist,
		driver:                  config.Driver,
		command:                 config.Command,
		args:                    config.Args,
		image:                   config.Image,
		volumes:                 config.Volumes,
		network:                 config.Network,
		env:                     e,
		pwd:                     config.Pwd,
		ports:                   config.Ports,
		portMap:                 config.PortMap,
		targetInstances:         config.Instances,
		originalTargetInstances: config.Instances,
		logDriver:               logDriver,
		loadBalancer:            lb,
		lbListeners:             make(map[int]loadbalancer.Listener),
		logger:                  logger,
		stopped:                 true,
		execMutex:               new(sync.Mutex),
		fileCreator: func(instanceID string, name string) (*os.File, error) {
			return fileCreator(instanceID, name)
		},
		instances: make(map[string]taskInstance),
		store:     store,
	}
	for _, i := range config.Init {
		if tt, ok := i["type"]; ok {
			switch tt {
			case "git":
				gI, err := NewGitInit(t, i, t.env)
				if err != nil {
					return nil, err
				}
				t.init = append(t.init, gI)
			default:
				return nil, fmt.Errorf("unknown init type: %s", t.init)
			}
		} else {
			return nil, errors.New("init type not specified")
		}
	}
	for _, hc := range config.Healthchecks {
		var d time.Duration
		var err error
		if len(hc.Frequency) == 0 {
			d = time.Second * 30
		} else {
			d, err = time.ParseDuration(hc.Frequency)
			if err != nil {
				return nil, err
			}
		}
		thc := &taskHealthcheck{
			task:               t,
			_type:              hc.Type,
			target:             hc.Target,
			healthyThreshold:   hc.HealthyThreshold,
			unhealthyThreshold: hc.UnhealthyThreshold,
			reapThreshold:      hc.ReapThreshold,
			frequency:          d,
		}
		thc.Start()
		t.healthchecks = append(t.healthchecks, thc)
	}
	if t.service && t.targetInstances == 0 {
		// FIXME this works for now if `instances` isn't set, but means
		// setting `instances` to 0 won't prevent the service starting
		t.targetInstances = 1
		t.originalTargetInstances = 1
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
	if t.devMode && id == "dev" {
		if i, ok := t.instances["dev"]; ok {
			return i.instance, nil
		}
		return nil, errors.New("error fetching dev instance")
	}
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
	image, err := instanceStorage.Get("image")
	if err != nil {
		log.Error(err, nil)
	}
	network, err := instanceStorage.Get("network")
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
	volumes, err := instanceStorage.GetArray("volumes")
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
	portMap, err := instanceStorage.GetIntArray("port_map")
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
		portMap: portMap,
		image:   image,
		network: network,
		volumes: volumes,
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

func (t *task) Image() string {
	return t.image
}

func (t *task) Network() string {
	return t.network
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

func (t *task) PortMap() []int {
	return t.portMap
}

func (t *task) Volumes() []string {
	return t.volumes
}

func (t *task) TargetInstances() int {
	return t.targetInstances
}

func (t *task) SetEnv(e []string) error {
	// FIXME does this make sense? append to the end so don't have to resend the entire env again
	for _, ev := range e {
		t.env = append(t.env, env.Replace(ev, t.env))
	}
	t.RestartInstances()
	return nil
}

func (t *task) RestartInstances() {
	c := lockwarn.Notify()
	t.execMutex.Lock()
	close(c)
	defer t.execMutex.Unlock()

	var instances []taskInstance
	for _, i := range t.instances {
		instances = append(instances, i)
	}

	// TODO error handling
	for _, i := range instances {
		i.instance.Stop()
	}
}

func (t *task) Healthchecks() (res []Healthcheck) {
	res = make([]Healthcheck, 0)
	for _, hc := range t.healthchecks {
		res = append(res, hc)
	}
	return
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
		inst := RecoveredInstance(t.logDriver, "stackID", "taskID", instanceID, instanceStore, InstanceConfig{doneCh, t.logger, t.fileCreator, t.driver, t.command, t.args, nil, "", ports, t.portMap, "", "", []string{}}, proc)
		t.instances[instanceID] = taskInstance{doneCh, inst}

		// TODO handle waitLoop errors
		go t.waitLoop(inst, doneCh)
	}

	return true, nil
}

func (t *task) Init() error {
	t.log("initialising task", nil)

	for _, i := range t.init {
		err := i.Do()
		if err != nil {
			return err
		}
	}

	t.log("task initialisation complete", nil)

	return nil
}

func (t *task) DevMode() bool {
	return t.devMode
}

func (t *task) SetDevMode(enabled bool) error {
	c := lockwarn.Notify()
	t.execMutex.Lock()
	close(c)
	defer t.execMutex.Unlock()

	t.devMode = enabled

	if enabled {
		t.targetInstances = 0

		for _, i := range t.instances {
			// FIXME handle errors
			i.instance.Stop()
		}

		inst := NewDevInstance(t.getInstancePorts())
		doneCh := make(chan struct{})
		t.instances["dev"] = taskInstance{doneCh, inst}

		// TODO handle waitLoop errors properly
		go func() {
			err := t.waitLoop(inst, doneCh)
			if err != nil {
				log.Error(err, nil)
			}
		}()

		var instanceIDs []string
		for _, i := range t.instances {
			instanceIDs = append(instanceIDs, i.instance.ID())
		}
		return t.store.SetArray("instanceIDs", instanceIDs)
	}

	close(t.instances["dev"].doneCh)
	t.log("setting target instances", log.Data{"target": t.originalTargetInstances})
	t.targetInstances = t.originalTargetInstances
	go t.Start()
	return nil
}

func (t *task) Start() error {
	// if len(t.instances) > 0 {
	// 	return errAlreadyStarted
	// }
	c := lockwarn.Notify()
	t.execMutex.Lock()
	close(c)
	defer t.execMutex.Unlock()

	need := t.targetInstances - len(t.instances)
	t.log("creating target instances", log.Data{"target": t.targetInstances, "current": len(t.instances), "need": need})
	for i := 0; i < need; i++ {
		var instanceID string
		t.execCount++
		instanceID = fmt.Sprintf("%d", t.execCount)
		err := t.store.Set("execCount", fmt.Sprintf("%d", t.execCount))
		if err != nil {
			return err
		}

		instanceStore, err := t.instanceStore.Wrap(instanceID)
		if err != nil {
			return err
		}

		doneCh := make(chan struct{})

		var net string
		if len(t.network) > 0 {
			net = "paasbox-" + env.Replace(t.network, t.Env())
		}

		inst := NewInstance(t.logDriver, t.stackID, t.taskID, instanceID, instanceStore, InstanceConfig{doneCh, t.logger, t.fileCreator, t.driver, t.command, t.args, t.getEnv(), t.pwd, t.getInstancePorts(), t.portMap, t.image, net, t.volumes})
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

func (t *task) addInstanceToLB(inst Instance) error {
	for i, p := range t.ports {
		l, err := t.getListener(p)
		if err != nil {
			return err
		}
		l.AddInstances(fmt.Sprintf("127.0.0.1:%d", inst.Ports()[i]))
	}
	return nil
}

func (t *task) removeInstanceFromLB(inst Instance) error {
	for i, p := range t.ports {
		l, err := t.getListener(p)
		if err != nil {
			return err
		}
		l.RemoveInstance(fmt.Sprintf("127.0.0.1:%d", inst.Ports()[i]))
	}
	return nil
}

func (t *task) waitLoop(inst Instance, doneCh chan struct{}) error {
	t.stopped = false
	if err := inst.Start(); err != nil {
		return err
	}
	if err := t.addInstanceToLB(inst); err != nil {
		return err
	}
	go func() {
		<-doneCh

		delete(t.instances, inst.ID())
		for _, hc := range t.healthchecks {
			delete(hc.tracker, inst)
		}

		if err := t.removeInstanceFromLB(inst); err != nil {
			t.error(errors.New("error removing instance from load balancer"), err, nil)
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
		c := lockwarn.Notify()
		err := i.instance.Stop()
		close(c)
		if err != nil {
			t.error(errors.New("error stopping process"), err, nil)
		}
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
	c := lockwarn.Notify()
	err := proc.Signal(syscall.Signal(code))
	close(c)
	if err != nil {
		t.error(errProcessSignalError, err, log.Data{"code": code, "proc_pid": proc.Pid})
		return proc, err
	}
	return proc, nil
}

func (t *task) Started() bool {
	return !t.stopped
}
