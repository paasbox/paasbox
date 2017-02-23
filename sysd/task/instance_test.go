package task

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"syscall"
	"testing"
	"time"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/state"
	. "github.com/smartystreets/goconvey/convey"
)

func TestInstance(t *testing.T) {
	s := state.NewMock(func(string) string { return "" }, func(string, string) {})
	storage, _ := s.Wrap("tasks")

	var tempFiles []*os.File
	defer func() {
		for _, f := range tempFiles {
			f.Close()
		}
	}()
	tempFile := func(name string) (*os.File, error) {
		f, err := ioutil.TempFile("", name)
		if err != nil {
			return f, err
		}
		tempFiles = append(tempFiles, f)
		return f, nil
	}

	env := []string{"PAASBOX=true"}

	Convey("NewInstance creates a new instance with correct field data", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "driver", "command", []string{"args"}, env, "", []int{}}).(*instance)
		So(t, ShouldNotBeNil)
		So(t.doneCh, ShouldEqual, doneCh)
		So(t.isDone, ShouldEqual, false)
		So(t.logger, ShouldEqual, logger)
		So(t.process, ShouldBeNil)
		So(t.recovered, ShouldEqual, false)
	})

	Convey("log logger captures log correctly", t, func() {
		doneCh := make(chan struct{})
		var fEvent string
		var fData log.Data
		var calls int
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
			fEvent = event
			fData = data
			calls++
		}
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "driver", "command", []string{"args"}, env, "", []int{}}).(*instance)
		t.log("test", nil)
		So(fEvent, ShouldEqual, "test")
		So(fData, ShouldHaveSameTypeAs, log.Data{})
		So(fData, ShouldResemble, log.Data{"instance_id": t.instanceID})
		So(calls, ShouldEqual, 1)
	})

	Convey("error logger captures error correctly", t, func() {
		doneCh := make(chan struct{})
		var fEvent string
		var fData log.Data
		var calls int
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
			fEvent = event
			fData = data
			calls++
		}
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "driver", "command", []string{"args"}, env, "", []int{}}).(*instance)
		t.error(errors.New("foo"), errors.New("bar"), nil)
		So(fEvent, ShouldEqual, "error")
		So(fData, ShouldResemble, log.Data{"error": errors.New("foo"), "reason": errors.New("bar"), "instance_id": t.instanceID})
		So(calls, ShouldEqual, 1)
	})

	Convey("isDone is set to true when done is called", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "driver", "command", []string{"args"}, env, "", []int{}}).(*instance)
		So(t.isDone, ShouldEqual, false)
		t.done()
		So(t.isDone, ShouldEqual, true)
		_, ok := <-doneCh
		So(ok, ShouldBeFalse)
	})

	Convey("Unsupported driver returns an error", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "driver", "command", []string{"args"}, env, "", []int{}}).(*instance)
		So(t.isDone, ShouldEqual, false)
		err := t.Start()
		So(err, ShouldEqual, errUnsupportedDriver)
		So(t.isDone, ShouldEqual, false)
	})

	Convey("Start starts a process", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "exec", "/bin/sh", []string{"-c", "echo 'foo'"}, env, "", []int{}}).(*instance)
		So(t.isDone, ShouldEqual, false)
		err := t.Start()
		So(err, ShouldBeNil)
		<-doneCh
		So(t.isDone, ShouldEqual, true)

		So(t.Stdout(), ShouldEqual, t.stdout)
		So(t.Stderr(), ShouldEqual, t.stderr)
		So(t.Pid(), ShouldEqual, t.pid)
	})

	Convey("doneCh waits for new process to complete", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		start := time.Now()
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "exec", "/bin/sh", []string{"-c", "sleep 1"}, env, "", []int{}}).(*instance)
		So(t.isDone, ShouldEqual, false)
		err := t.Start()
		So(err, ShouldBeNil)
		So(t.isDone, ShouldEqual, false)
		<-doneCh
		duration := time.Now().Sub(start)
		So(duration.Seconds(), ShouldBeGreaterThan, float64(0.9))
		So(t.isDone, ShouldEqual, true)
	})

	Convey("stdout has output", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "exec", "/bin/sh", []string{"-c", "echo 'foo'"}, env, "", []int{}}).(*instance)
		So(t.isDone, ShouldEqual, false)
		err := t.Start()
		So(err, ShouldBeNil)
		So(t.isDone, ShouldEqual, false)
		<-doneCh
		So(t.isDone, ShouldEqual, true)

		b, err := ioutil.ReadFile(t.stdout)
		So(err, ShouldBeNil)
		So(string(b), ShouldEqual, "foo\n")
	})

	Convey("stderr has output", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "exec", "/bin/sh", []string{"-c", "sleep"}, env, "", []int{}}).(*instance)
		So(t.isDone, ShouldEqual, false)
		err := t.Start()
		So(err, ShouldBeNil)
		So(t.isDone, ShouldEqual, false)
		<-doneCh
		So(t.isDone, ShouldEqual, true)

		b, err := ioutil.ReadFile(t.stderr)
		So(err, ShouldBeNil)
		So(string(b), ShouldEqual, "usage: sleep seconds\n")
	})

	Convey("shell driver uses `/bin/sh -c`", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		start := time.Now()
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "shell", "sleep", []string{"1"}, env, "", []int{}}).(*instance)
		So(t.isDone, ShouldEqual, false)
		err := t.Start()
		So(err, ShouldBeNil)
		So(t.isDone, ShouldEqual, false)
		<-doneCh
		duration := time.Now().Sub(start)
		So(duration.Seconds(), ShouldBeGreaterThan, float64(0.9))
		So(t.isDone, ShouldEqual, true)
	})

	Convey("Stop kills a running process", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		start := time.Now()
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "exec", "/bin/sh", []string{"-c", "sleep 10"}, env, "", []int{}}).(*instance)
		So(t.isDone, ShouldEqual, false)
		err := t.Start()
		So(err, ShouldBeNil)
		go func() {
			time.Sleep(time.Millisecond * 500)
			err = t.Stop()
		}()

		So(t.isDone, ShouldEqual, false)
		<-doneCh
		duration := time.Now().Sub(start)
		So(duration.Seconds(), ShouldBeLessThan, 1)
		So(err, ShouldBeNil)
		So(t.isDone, ShouldEqual, true)

		time.Sleep(time.Millisecond * 500)
		sigErr := t.process.Signal(syscall.Signal(0))
		So(sigErr, ShouldNotBeNil)
		So(sigErr.Error(), ShouldEqual, "os: process already finished")
	})

	Convey("RecoverInstance recovers a running process", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		start := time.Now()
		cfg1 := InstanceConfig{doneCh, logger, tempFile, "exec", "/bin/sh", []string{"-c", "sleep 10"}, env, "", []int{}}
		t := NewInstance("instanceID", storage, cfg1).(*instance)
		So(t.isDone, ShouldEqual, false)
		err := t.Start()
		So(err, ShouldBeNil)

		doneCh2 := make(chan struct{})
		cfg2 := InstanceConfig{doneCh2, logger, tempFile, "exec", "/bin/sh", []string{"-c", "sleep 10"}, env, "", []int{}}
		proc, err := os.FindProcess(t.process.Pid)
		So(err, ShouldBeNil)
		So(proc, ShouldNotBeNil)
		t2 := RecoveredInstance("instanceID", storage, cfg2, proc).(*instance)
		So(t2, ShouldNotBeNil)
		So(t2.recovered, ShouldEqual, true)
		// 2 is the magic number which allows t2 signal loop to complete in a reasonable time,
		// but still allows a check of t2.isDone to return true before reading from the isDone channel
		t2.signalInterval = time.Second * 2
		err = t2.Start()
		So(err, ShouldBeNil)

		go func() {
			time.Sleep(time.Millisecond * 500)
			err = t.Stop()
		}()

		So(t.isDone, ShouldEqual, false)
		<-doneCh
		duration := time.Now().Sub(start)
		So(duration.Seconds(), ShouldBeLessThan, 1)
		So(err, ShouldBeNil)
		So(t.isDone, ShouldEqual, true)

		time.Sleep(time.Millisecond * 500)

		sigErr := t.process.Signal(syscall.Signal(0))
		So(sigErr, ShouldNotBeNil)
		So(sigErr.Error(), ShouldEqual, "os: process already finished")

		So(t2.isDone, ShouldEqual, false)
		<-doneCh2
		So(t2.isDone, ShouldEqual, true)

		sigErr2 := t2.process.Signal(syscall.Signal(0))
		So(sigErr2, ShouldNotBeNil)
		So(sigErr2.Error(), ShouldEqual, "os: process already finished")
	})

	Convey("Stop on done process returns nil error", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "exec", "/bin/sh", []string{"-c", "echo 'foo'"}, env, "", []int{}}).(*instance)
		So(t.isDone, ShouldEqual, false)
		err := t.Start()
		So(err, ShouldBeNil)
		<-doneCh
		So(t.isDone, ShouldEqual, true)
		So(t.Stop(), ShouldBeNil)
	})

	Convey("Stop on unstarted process returns nil error", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "exec", "/bin/sh", []string{"-c", "echo 'foo'"}, env, "", []int{}}).(*instance)
		So(t.isDone, ShouldEqual, false)
		So(t.Stop(), ShouldBeNil)
	})

	Convey("wait on done process does nothing", t, func() {
		doneCh := make(chan struct{})
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t := NewInstance("instanceID", storage, InstanceConfig{doneCh, logger, tempFile, "exec", "/bin/sh", []string{"-c", "echo 'foo'"}, env, "", []int{}}).(*instance)
		t.isDone = true
		t.wait()
		So(func() { close(doneCh) }, ShouldNotPanic)
		So(func() { close(doneCh) }, ShouldPanicWith, "close of closed channel")
	})
}
