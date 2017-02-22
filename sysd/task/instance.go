package task

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"syscall"
	"time"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/state"
)

var errWaitingForProcess = errors.New("error waiting for process")
var errUpdateBoltDBFailed = errors.New("error updating boltdb")

// Instance ...
type Instance interface {
	Start() error
	Stop() error

	ID() string
	Stdout() string
	Stderr() string
	Pid() int

	Driver() string
	Command() string
	Args() []string
	Env() []string
}

// InstanceConfig ...
type InstanceConfig struct {
	DoneCh      chan struct{}
	Logger      func(event string, data log.Data)
	FileCreator func(name string) (*os.File, error)
	Driver      string
	Command     string
	Args        []string
	Env         []string
}

var _ Instance = &instance{}

type instance struct {
	instanceID string

	doneCh      chan struct{}
	logger      func(event string, data log.Data)
	fileCreator func(name string) (*os.File, error)
	driver      string
	command     string
	args        []string
	env         []string

	store     state.Store
	process   *os.Process
	recovered bool

	isDone         bool
	signalInterval time.Duration

	pid    int
	stdout string
	stderr string
}

// NewInstance ...
func NewInstance(instanceID string, store state.Store, config InstanceConfig) Instance {
	i := &instance{
		doneCh:         config.DoneCh,
		logger:         config.Logger,
		fileCreator:    config.FileCreator,
		driver:         config.Driver,
		command:        config.Command,
		args:           config.Args,
		env:            config.Env,
		signalInterval: time.Second * 10,
		instanceID:     instanceID,
		store:          store,
	}

	err := store.Set("driver", config.Driver)
	if err != nil {
		log.Error(err, nil)
	}
	err = store.Set("command", config.Command)
	if err != nil {
		log.Error(err, nil)
	}
	err = store.SetArray("args", config.Args)
	if err != nil {
		log.Error(err, nil)
	}
	err = store.SetArray("env", config.Env)
	if err != nil {
		log.Error(err, nil)
	}

	return i
}

// RecoveredInstance ...
func RecoveredInstance(instanceID string, store state.Store, config InstanceConfig, proc *os.Process) Instance {
	i := NewInstance(instanceID, store, config).(*instance)
	i.process = proc
	i.pid = proc.Pid
	i.recovered = true

	err := i.store.Set("recovered", "true")
	if err != nil {
		i.error(errUpdateBoltDBFailed, err, log.Data{"recovered": true})
	}

	return i
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

	err := i.process.Kill()
	if err != nil {
		return err
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

func (i *instance) start() error {
	i.log("starting process", nil)

	cmd := "" + i.command
	args := append([]string{}, i.args...)

	switch i.driver {
	case "shell":
		args = append([]string{"-c"}, strings.Join(append([]string{cmd}, args...), " "))
		cmd = "/bin/sh"
		fallthrough
	case "exec":
		stdin, err := os.Open(os.DevNull)
		if err != nil {
			return err
		}
		i.log("created stdin file", log.Data{"stdin": stdin.Name()})

		stdout, err := i.fileCreator("stdout")
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

		stderr, err := i.fileCreator("stderr")
		if err != nil {
			stdin.Close()
			stdout.Close()
			return err
		}
		i.log("created stderr file", log.Data{"stderr": stderr.Name()})
		i.stderr = stderr.Name()

		err = i.store.Set("stderr", i.stdout)
		if err != nil {
			return err
		}

		attr := os.ProcAttr{
			Dir: "",
			Env: i.env,
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
	default:
		return errUnsupportedDriver
	}
}
