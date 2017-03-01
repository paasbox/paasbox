package task

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"time"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/config"
	"github.com/paasbox/paasbox/state"
	"github.com/paasbox/paasbox/sysd/util/env"
)

var errWaitingForProcess = errors.New("error waiting for process")
var errUpdateBoltDBFailed = errors.New("error updating boltdb")

// Instance ...
type Instance interface {
	Start() error
	Stop() error
	Running() bool

	ID() string
	Stdout() string
	Stderr() string
	Pid() int

	Driver() string
	Command() string
	Args() []string
	Env() []string
	Pwd() string
	Ports() []int
	PortMap() []int

	Image() string
	Network() string
}

// InstanceConfig ...
type InstanceConfig struct {
	DoneCh      chan struct{}
	Logger      func(event string, data log.Data)
	FileCreator func(instanceID, name string) (*os.File, error)
	Driver      string
	Command     string
	Args        []string
	Env         []string
	Pwd         string
	Ports       []int
	PortMap     []int
	Image       string
	Network     string
}

var _ Instance = &instance{}

type instance struct {
	workspaceID string
	taskID      string
	instanceID  string

	doneCh      chan struct{}
	logger      func(event string, data log.Data)
	fileCreator func(instanceID, name string) (*os.File, error)
	driver      string
	command     string
	args        []string
	env         []string
	pwd         string
	ports       []int
	portMap     []int
	image       string
	network     string

	store     state.Store
	process   *os.Process
	recovered bool

	started        bool
	isDone         bool
	signalInterval time.Duration

	pid    int
	stdout string
	stderr string
}

// NewInstance ...
func NewInstance(workspaceID, taskID, instanceID string, store state.Store, config InstanceConfig) Instance {
	e := append(config.Env, fmt.Sprintf("PAASBOX_INSTANCEID=%s", instanceID))
	if len(config.Ports) > 0 {
		e = append(e, fmt.Sprintf("PORT=%d", config.Ports[0]))
		for i, p := range config.Ports {
			e = append(e, fmt.Sprintf("PORT%d=%d", i, p))
		}
	}
	command := env.Replace(config.Command, e)
	var args []string
	for _, a := range config.Args {
		args = append(args, env.Replace(a, e))
	}
	pwd := env.Replace(config.Pwd, e)

	for i, e2 := range e {
		e[i] = env.Replace(e2, e)
	}

	i := &instance{
		workspaceID:    workspaceID,
		taskID:         taskID,
		doneCh:         config.DoneCh,
		logger:         config.Logger,
		fileCreator:    config.FileCreator,
		driver:         config.Driver,
		image:          config.Image,
		network:        config.Network,
		command:        command,
		args:           args,
		env:            e,
		pwd:            pwd,
		ports:          config.Ports,
		portMap:        config.PortMap,
		signalInterval: time.Second * 10,
		instanceID:     instanceID,
		store:          store,
	}

	err := store.Set("driver", config.Driver)
	if err != nil {
		log.Error(err, nil)
	}
	err = store.Set("command", command)
	if err != nil {
		log.Error(err, nil)
	}
	err = store.Set("pwd", config.Pwd)
	if err != nil {
		log.Error(err, nil)
	}
	err = store.Set("image", config.Image)
	if err != nil {
		log.Error(err, nil)
	}
	err = store.Set("network", config.Network)
	if err != nil {
		log.Error(err, nil)
	}
	err = store.SetArray("args", args)
	if err != nil {
		log.Error(err, nil)
	}
	err = store.SetArray("env", e)
	if err != nil {
		log.Error(err, nil)
	}
	err = store.SetIntArray("ports", config.Ports)
	if err != nil {
		log.Error(err, nil)
	}
	err = store.SetIntArray("port_map", config.PortMap)
	if err != nil {
		log.Error(err, nil)
	}

	return i
}

// RecoveredInstance ...
func RecoveredInstance(workspaceID, taskID, instanceID string, store state.Store, config InstanceConfig, proc *os.Process) Instance {
	i := NewInstance(workspaceID, taskID, instanceID, store, config).(*instance)
	i.process = proc
	i.pid = proc.Pid
	i.recovered = true
	i.started = true

	err := i.store.Set("recovered", "true")
	if err != nil {
		i.error(errUpdateBoltDBFailed, err, log.Data{"recovered": true})
	}

	return i
}

func (i *instance) Running() bool {
	return i.started && !i.isDone
}

func (i *instance) ID() string {
	return i.instanceID
}

func (i *instance) Stdout() string {
	return i.stdout
}

func (i *instance) Stderr() string {
	return i.stderr
}

func (i *instance) Pid() int {
	return i.pid
}

func (i *instance) Driver() string {
	return i.driver
}

func (i *instance) Command() string {
	return i.command
}

func (i *instance) Args() []string {
	return i.args
}

func (i *instance) Env() []string {
	return i.env
}

func (i *instance) Pwd() string {
	return i.pwd
}

func (i *instance) Ports() []int {
	return i.ports
}

func (i *instance) PortMap() []int {
	return i.portMap
}

func (i *instance) Image() string {
	return i.image
}

func (i *instance) Network() string {
	return i.network
}

func (i *instance) Start() error {
	if !i.recovered {
		err := i.start()
		if err != nil {
			return err
		}
	}

	err := i.store.Set("pid", fmt.Sprintf("%d", i.pid))
	if err != nil {
		return err
	}
	err = i.store.Set("running", "true")
	if err != nil {
		return err
	}

	i.wait()
	return nil
}

func (i *instance) Stop() error {
	if i.isDone {
		return nil
	}
	if i.process == nil {
		return nil
	}

	defer i.done()

	switch i.driver {
	case "docker":
		cmd := exec.Command(config.DockerPath, "stop", fmt.Sprintf("paasbox-%s-%s-%s", i.workspaceID, i.taskID, i.instanceID))
		cmd.Env = os.Environ()
		if err := cmd.Start(); err != nil {
			i.error(errors.New("error starting docker stop"), err, nil)
			return err
		}
		if err := cmd.Wait(); err != nil {
			i.error(errors.New("error waiting for docker stop"), err, nil)
			return err
		}
	default:
		err := syscall.Kill(-i.process.Pid, syscall.SIGKILL)
		if err != nil {
			return err
		}
	}

	return nil
}

func (i *instance) log(event string, data log.Data) {
	if data == nil {
		data = log.Data{}
	}
	data["instance_id"] = i.instanceID
	i.logger(event, data)
}

func (i *instance) error(err error, reason error, data log.Data) {
	if data == nil {
		data = log.Data{}
	}
	data["error"] = err
	data["reason"] = reason
	i.log("error", data)
}

func (i *instance) done() {
	if i.isDone {
		return
	}
	i.isDone = true
	err := i.store.Set("running", "false")
	if err != nil {
		log.Error(err, nil)
	}
	close(i.doneCh)
}

func (i *instance) wait() {
	if i.isDone {
		return
	}

	if i.recovered {
		i.waitForRecoveredInstance()
		return
	}

	i.waitForChildInstance()
}

func (i *instance) waitForChildInstance() {
	go func() {
		defer i.done()

		var status syscall.WaitStatus
		var rusage syscall.Rusage
		pid, err := syscall.Wait4(i.process.Pid, &status, 0, &rusage)
		if err != nil {
			i.error(errWaitingForProcess, err, nil)
			return
		}

		err = i.store.Set("exitStatus", fmt.Sprintf("%d", status.ExitStatus()))
		if err != nil {
			i.error(errUpdateBoltDBFailed, err, log.Data{"exitStatus": status.ExitStatus()})
		}

		i.log("process finished", log.Data{"status": status, "rusage": rusage, "pid1": pid})
	}()
}

func (i *instance) signal() error {
	i.log("signalling process", log.Data{"pid": i.process.Pid})
	err := i.process.Signal(syscall.Signal(0))
	if err != nil {
		i.error(errProcessSignalError, err, log.Data{"proc_pid": i.process.Pid})
		return err
	}
	return nil
}

func (i *instance) waitForRecoveredInstance() {
	err := i.signal()
	if err != nil {
		i.error(err, nil, nil)
		i.done()
		return
	}

	var done bool
	go func() {
		defer i.done()

		c := time.Tick(i.signalInterval)
		for {
			if done {
				break
			}
			select {
			case <-c:
				err := i.signal()
				if err != nil {
					i.error(err, nil, nil)
					done = true
				}
			}
		}

		i.log("process finished", nil)
	}()
}

func (i *instance) startDocker() error {
	i.log("docker pull", log.Data{"image": i.image})
	cmd := exec.Command("docker", "pull", i.image)
	cmd.Env = os.Environ()
	if err := cmd.Start(); err != nil {
		i.error(errors.New("error starting docker pull"), err, nil)
		return err
	}
	if err := cmd.Wait(); err != nil {
		i.error(errors.New("error waiting for docker pull"), err, nil)
		return err
	}

	i.log("docker run", log.Data{"image": i.image})
	args := []string{"run", "--rm", "-t", "--name", fmt.Sprintf("paasbox-%s-%s-%s", i.workspaceID, i.taskID, i.instanceID)}
	if len(i.network) > 0 {
		args = append(args, "--net", i.network, "--network-alias", i.taskID)
	}
	for j, p := range i.portMap {
		var fromPort string
		if j < len(i.ports) {
			fromPort = fmt.Sprintf("%d:", i.ports[j])
		}
		args = append(args, "-p", fmt.Sprintf("%s%d", fromPort, p))
	}
	args = append(args, i.image)
	args = append(args, i.args...)
	i.log("docker args", log.Data{"args": args})
	return i.startExec(config.DockerPath, args, os.Environ())
}

func (i *instance) start() error {
	i.log("starting process", nil)

	cmd := "" + i.command
	args := append([]string{}, i.args...)

	switch i.driver {
	case "docker":
		return i.startDocker()
	case "shell":
		args = append([]string{"-c"}, strings.Join(append([]string{cmd}, args...), " "))
		cmd = "/bin/sh"
		fallthrough
	case "exec":
		return i.startExec(cmd, args, i.env)
	default:
		return errUnsupportedDriver
	}
}

func (i *instance) startExec(cmd string, args []string, env []string) error {
	stdin, err := os.Open(os.DevNull)
	if err != nil {
		return err
	}
	i.log("created stdin file", log.Data{"stdin": stdin.Name()})

	stdout, err := i.fileCreator(i.instanceID, "stdout")
	if err != nil {
		stdin.Close()
		return err
	}
	i.log("created stdout file", log.Data{"stdout": stdout.Name()})
	i.stdout = stdout.Name()

	err = i.store.Set("stdout", i.stdout)
	if err != nil {
		return err
	}

	stderr, err := i.fileCreator(i.instanceID, "stderr")
	if err != nil {
		stdin.Close()
		stdout.Close()
		return err
	}
	i.log("created stderr file", log.Data{"stderr": stderr.Name()})
	i.stderr = stderr.Name()

	err = i.store.Set("stderr", i.stderr)
	if err != nil {
		return err
	}

	attr := os.ProcAttr{
		Dir: i.pwd,
		Env: env,
		Files: []*os.File{
			stdin,
			stdout,
			stderr,
		},
		Sys: &syscall.SysProcAttr{
			Setpgid: true,
		},
	}

	args = append([]string{cmd}, args...)

	proc, err := os.StartProcess(cmd, args, &attr)
	if err != nil {
		stdin.Close()
		stdout.Close()
		stderr.Close()
		return err
	}

	i.process = proc
	i.pid = proc.Pid

	err = i.store.Set("pid", fmt.Sprintf("%d", i.pid))
	if err != nil {
		return err
	}

	i.log("process started", log.Data{"proc_pid": proc.Pid})
	return nil
}
