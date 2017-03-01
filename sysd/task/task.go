package task

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/facebookgo/freeport"
	"github.com/ian-kent/service.go/log"
	pconfig "github.com/paasbox/paasbox/config"
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

var cli = &http.Client{
	Timeout: time.Second * 2,
}

var _ InstanceHealth = &taskInstanceTracker{}
var _ Task = &task{}

// Task ...
type Task interface {
	Start() error
	Stop() error
	Recover() (ok bool, err error)
	CurrentInstances() []Instance
	Instance(id string) (Instance, error)
	Instances(start, count uint, desc bool) []Instance
	Healthchecks() []Healthcheck

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
	Persist() bool
	TargetInstances() int
	Network() string

	ExecCount() int
	Started() bool
}

// Healthcheck ...
type Healthcheck interface {
	Type() string
	Target() string
	HealthyThreshold() int
	UnhealthyThreshold() int
	ReapThreshold() int
	Frequency() time.Duration
	Instances() []InstanceHealth
}

// InstanceHealth ...
type InstanceHealth interface {
	ID() string
	Healthy() bool
	Score() int
}

// Config ...
type Config struct {
	ID           string              `json:"id"`
	Name         string              `json:"name"`
	Service      bool                `json:"service"`
	Persist      bool                `json:"persist"`
	Driver       string              `json:"driver"`
	Command      string              `json:"command"`
	Args         []string            `json:"args"`
	Env          []string            `json:"env"`
	Pwd          string              `json:"pwd"`
	Ports        []int               `json:"ports"`
	PortMap      []int               `json:"port_map"`
	Instances    int                 `json:"instances"`
	Healthchecks []HealthcheckConfig `json:"healthchecks"`
	Image        string              `json:"image"`
	Network      string              `json:"network"`
}

// HealthcheckConfig ...
type HealthcheckConfig struct {
	Type               string `json:"type"`
	Target             string `json:"target"`
	HealthyThreshold   int    `json:"healthy_threshold"`
	UnhealthyThreshold int    `json:"unhealthy_threshold"`
	ReapThreshold      int    `json:"reap_threshold"`
	Frequency          string `json:"frequency"`
}

// WithEnv ...
func (c Config) WithEnv(env []string) Config {
	c2 := Config(c)
	c2.Env = append(env, c2.Env...)
	return c2
}

type task struct {
	workspaceID     string
	taskID          string
	name            string
	service         bool
	persist         bool
	driver          string
	command         string
	args            []string
	env             []string
	ports           []int
	portMap         []int
	pwd             string
	targetInstances int
	image           string
	network         string
	logger          func(event string, data log.Data)

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
}

type taskInstance struct {
	doneCh   chan struct{}
	instance Instance
}

type taskHealthcheck struct {
	task               *task
	_type              string
	target             string
	healthyThreshold   int
	unhealthyThreshold int
	reapThreshold      int
	frequency          time.Duration
	tracker            map[Instance]*taskInstanceTracker
}

func (t *taskHealthcheck) Type() string {
	return t._type
}

func (t *taskHealthcheck) Target() string {
	return t.target
}

func (t *taskHealthcheck) HealthyThreshold() int {
	return t.healthyThreshold
}

func (t *taskHealthcheck) UnhealthyThreshold() int {
	return t.unhealthyThreshold
}

func (t *taskHealthcheck) ReapThreshold() int {
	return t.reapThreshold
}

func (t *taskHealthcheck) Frequency() time.Duration {
	return t.frequency
}

func (t *taskHealthcheck) Instances() (res []InstanceHealth) {
	for _, t := range t.tracker {
		res = append(res, t)
	}
	return
}

type taskInstanceTracker struct {
	instance Instance
	score    int
	healthy  bool
}

func (t *taskInstanceTracker) ID() string {
	return t.instance.ID()
}

func (t *taskInstanceTracker) Healthy() bool {
	return t.healthy
}

func (t *taskInstanceTracker) Score() int {
	return t.score
}

func (t *taskHealthcheck) Start() {
	t.tracker = make(map[Instance]*taskInstanceTracker)
	mtx := new(sync.Mutex)
	go func() {
		ticker := time.NewTicker(t.frequency)
		for {
			select {
			case <-ticker.C:
				for _, i := range t.task.instances {
					if _, ok := t.tracker[i.instance]; !ok {
						mtx.Lock()
						t.tracker[i.instance] = &taskInstanceTracker{i.instance, 0, true}
						mtx.Unlock()
					}
					go func(i taskInstance) {
						mtx.Lock()
						defer mtx.Unlock()
						track := t.tracker[i.instance]

						t.task.log("running healthcheck", log.Data{"instance_id": i.instance.ID(), "score": t.tracker[i.instance]})
						healthy := t.Run(i.instance)
						if healthy && !track.healthy {
							track.score++
						} else if !healthy {
							track.score--
						}
						t.task.log("healthcheck complete", log.Data{"instance_id": i.instance.ID(), "score": t.tracker[i.instance], "healthy": healthy})
						if track.healthy && track.score == 0-t.unhealthyThreshold {
							track.healthy = false
							err := t.task.removeInstanceFromLB(i.instance)
							if err != nil {
								t.task.error(errors.New("error removing instance from load balancer"), err, nil)
							}
						} else {
							if track.score == 0-t.reapThreshold {
								t.task.log("reaping instance", log.Data{"instance_id": i.instance.ID()})
								delete(t.tracker, i.instance)
								err := i.instance.Stop()
								if err != nil {
									t.task.error(errors.New("error stopping instance"), err, log.Data{"instance_id": i.instance.ID()})
								}
							} else if track.score > t.healthyThreshold {
								track.healthy = true
								track.score = 0
								healthy := true
								for _, h := range t.task.healthchecks {
									if !h.tracker[i.instance].healthy {
										healthy = false
										break
									}
								}
								if healthy {
									err := t.task.addInstanceToLB(i.instance)
									if err != nil {
										t.task.error(errors.New("error removing instance from load balancer"), err, nil)
									}
								}
							}
						}
					}(i)
				}
			}
		}
	}()
}

func (t *taskHealthcheck) Run(i Instance) bool {
	switch t._type {
	case "http":
		url := t.target
		url = strings.Replace(url, "$HOST$", "127.0.0.1", -1)
		if len(i.Ports()) > 0 {
			url = strings.Replace(url, "$PORT$", fmt.Sprintf("%d", i.Ports()[0]), -1)
			for j, p := range i.Ports() {
				url = strings.Replace(url, fmt.Sprintf("$PORT%d$", j), fmt.Sprintf("%d", p), -1)
			}
		}
		res, err := cli.Get(url)
		if err != nil {
			t.task.error(errors.New("healthcheck error"), err, nil)
			return false
		}
		io.Copy(ioutil.Discard, res.Body)
		res.Body.Close()
		if res.StatusCode < 400 {
			return true
		}
		t.task.error(errors.New("healthcheck error"), errors.New("unexpected status code"), log.Data{"code": res.StatusCode})
		return false
	default:
		// TODO check this sooner
		log.Error(errors.New("unknown healthcheck type"), nil)
	}
	return false
}

var _ Task = &task{}

// NewTask ...
func NewTask(workspaceID string, store state.Store, lb loadbalancer.LB, config Config, logger func(event string, data log.Data), fileCreator func(instanceID, name string) (*os.File, error)) (Task, error) {
	if config.Driver == "docker" && !pconfig.HasDocker {
		return nil, errors.New("docker is not available")
	}
	e := append(config.Env, fmt.Sprintf("PAASBOX_TASKID=%s", config.ID))
	var t *task
	t = &task{
		workspaceID:     workspaceID,
		taskID:          config.ID,
		name:            config.Name,
		service:         config.Service,
		persist:         config.Persist,
		driver:          config.Driver,
		command:         config.Command,
		args:            config.Args,
		image:           config.Image,
		network:         config.Network,
		env:             e,
		pwd:             config.Pwd,
		ports:           config.Ports,
		portMap:         config.PortMap,
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
	image, err := instanceStorage.Get("image")
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

func (t *task) TargetInstances() int {
	return t.targetInstances
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
		inst := RecoveredInstance("workspaceID", "taskID", instanceID, instanceStore, InstanceConfig{doneCh, t.logger, t.fileCreator, t.driver, t.command, t.args, nil, "", ports, t.portMap, ""}, proc)
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
	t.execMutex.Lock()
	defer t.execMutex.Unlock()

	need := t.targetInstances - len(t.instances)
	log.Debug("creating target instances", log.Data{"target": t.targetInstances, "current": len(t.instances), "need": need})
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
		inst := NewInstance(t.workspaceID, t.taskID, instanceID, instanceStore, InstanceConfig{doneCh, t.logger, t.fileCreator, t.driver, t.command, t.args, t.getEnv(), t.pwd, t.getInstancePorts(), t.portMap, t.image})
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
		err := i.instance.Stop()
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
	err := proc.Signal(syscall.Signal(code))
	if err != nil {
		t.error(errProcessSignalError, err, log.Data{"code": code, "proc_pid": proc.Pid})
		return proc, err
	}
	return proc, nil
}

func (t *task) Started() bool {
	return !t.stopped
}
