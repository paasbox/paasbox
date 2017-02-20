package task

import (
	"fmt"
	"testing"
	"time"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/state"
	. "github.com/smartystreets/goconvey/convey"
)

func TestNewTask(t *testing.T) {
	s := state.NewMock(func(string) string { return "" }, func(string, string) {})
	storage, _ := s.Wrap("workspaces")

	Convey("NewTask creates a new task with correct field data", t, func() {
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t, err := NewTask(storage, Config{"taskID", false, "driver", "command", []string{"args"}}, logger)
		t2 := t.(*task)
		So(err, ShouldBeNil)
		So(t2, ShouldNotBeNil)
		So(t2.taskID, ShouldEqual, "taskID")
		So(t2.driver, ShouldEqual, "driver")
		So(t2.command, ShouldEqual, "command")
		So(t2.logger, ShouldEqual, logger)
		So(t2.args, ShouldResemble, []string{"args"})
	})

	Convey("Start starts a task", t, func() {
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t, err := NewTask(storage, Config{"taskID", false, "shell", "echo", []string{"foo"}}, logger)
		t2 := t.(*task)
		So(err, ShouldBeNil)
		So(t2, ShouldNotBeNil)
		So(t2.instance, ShouldBeNil)
		So(t2.doneCh, ShouldBeNil)

		err = t2.Start()
		So(err, ShouldBeNil)
		So(t2.instance, ShouldNotBeNil)
		So(t2.doneCh, ShouldNotBeNil)

		<-t2.doneCh
	})

	Convey("Recover recovers a running task", t, func() {
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t, err := NewTask(storage, Config{"taskID", false, "shell", "sleep", []string{"2"}}, logger)
		So(err, ShouldBeNil)
		t2 := t.(*task)
		So(t2, ShouldNotBeNil)
		So(t2.instance, ShouldBeNil)
		So(t2.doneCh, ShouldBeNil)

		err = t2.Start()
		So(err, ShouldBeNil)
		So(t2.instance, ShouldNotBeNil)
		So(t2.doneCh, ShouldNotBeNil)

		t3, err := NewTask(storage, Config{"taskID", false, "shell", "sleep", []string{"2"}}, logger)
		So(err, ShouldBeNil)
		t4 := t3.(*task)
		So(t4, ShouldNotBeNil)
		So(t4.instance, ShouldBeNil)
		So(t4.doneCh, ShouldBeNil)

		i := t2.instance.(*instance)
		s.Get = func(key string) (value string) {
			switch key {
			case "pid":
				return fmt.Sprintf("%d", i.process.Pid)
			case "instanceID":
				return t2.instance.InstanceID()
			}
			return ""
		}
		ok, err := t2.Recover()
		So(err, ShouldBeNil)
		So(ok, ShouldBeTrue)
		So(t2.instance, ShouldNotBeNil)
		t2.instance.(*instance).signalInterval = time.Second * 2
		So(t2.doneCh, ShouldNotBeNil)
		So(t2.instance.(*instance).process.Pid, ShouldEqual, i.process.Pid)

		<-t2.doneCh
	})

	Convey("Service restarts on exit", t, func() {
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t, err := NewTask(storage, Config{"taskID", true, "shell", "sleep", []string{"1"}}, logger)
		So(err, ShouldBeNil)
		t2 := t.(*task)
		So(t2, ShouldNotBeNil)
		So(t2.instance, ShouldBeNil)
		So(t2.doneCh, ShouldBeNil)
		So(t2.execCount, ShouldEqual, 0)
		So(t2.service, ShouldEqual, true)
		So(t2.stopped, ShouldEqual, false)

		err = t2.Start()
		So(err, ShouldBeNil)
		So(t2.instance, ShouldNotBeNil)
		So(t2.doneCh, ShouldNotBeNil)
		So(t2.execCount, ShouldEqual, 1)

		time.Sleep(time.Second * 5)
		t2.Stop()
		<-t2.doneCh
		So(t2.execCount, ShouldEqual, 5)
		So(t2.stopped, ShouldEqual, true)
	})
}
