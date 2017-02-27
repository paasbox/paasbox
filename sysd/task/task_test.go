package task

import (
	"fmt"
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/state"
	"github.com/paasbox/paasbox/sysd/loadbalancer"
	. "github.com/smartystreets/goconvey/convey"
)

func TestNewTask(t *testing.T) {
	st := make(map[string]string)
	s := state.NewMock(func(k string) string { return st[k] }, func(k string, v string) {
		st[k] = v
	})
	storage, _ := s.Wrap("workspaces")

	fileCreator := func(instanceID, name string) (*os.File, error) {
		return ioutil.TempFile("", instanceID+"-"+name)
	}

	lb, _ := loadbalancer.New()

	Convey("NewTask creates a new task with correct field data", t, func() {
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t, err := NewTask(storage, lb, Config{"taskID", "Example task", false, false, "driver", "command", []string{"args"}, []string{"FOO=bar"}, "", []int{}, 1, nil}, logger, fileCreator)
		So(err, ShouldBeNil)

		So(t, ShouldNotBeNil)
		t2 := t.(*task)
		So(t2.taskID, ShouldEqual, "taskID")
		So(t2.name, ShouldEqual, "Example task")
		So(t2.driver, ShouldEqual, "driver")
		So(t2.command, ShouldEqual, "command")
		So(t2.logger, ShouldEqual, logger)
		So(t2.args, ShouldResemble, []string{"args"})
		So(t2.env, ShouldResemble, []string{"FOO=bar", "PAASBOX_TASKID=taskID"})
	})

	Convey("Start starts a task", t, func() {
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t, err := NewTask(storage, lb, Config{"taskID", "Example task", false, false, "shell", "echo", []string{"foo"}, []string{}, "", []int{}, 1, nil}, logger, fileCreator)
		So(err, ShouldBeNil)
		So(t, ShouldNotBeNil)
		t2 := t.(*task)
		So(t2.instances, ShouldBeEmpty)

		err = t2.Start()
		So(err, ShouldBeNil)
		So(t2.instances, ShouldHaveLength, 1)
		log.Debug(fmt.Sprintf("%+v", t2.instances), nil)
		So(t2.instances["1"].doneCh, ShouldNotBeNil)

		<-t2.instances["1"].doneCh
	})

	Convey("Recover recovers a running task", t, func() {
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t, err := NewTask(storage, lb, Config{"taskID", "Example task", false, false, "shell", "sleep", []string{"2"}, []string{}, "", []int{}, 1, nil}, logger, fileCreator)
		So(err, ShouldBeNil)
		t2 := t.(*task)
		So(t2, ShouldNotBeNil)
		So(t2.instances, ShouldBeEmpty)

		err = t2.Start()
		So(err, ShouldBeNil)
		So(t2.instances, ShouldHaveLength, 1)
		So(t2.instances["2"].doneCh, ShouldNotBeNil)

		time.Sleep(time.Millisecond * 250)

		t3, err := NewTask(storage, lb, Config{"taskID", "Example task", false, false, "shell", "sleep", []string{"2"}, []string{}, "", []int{}, 1, nil}, logger, fileCreator)
		So(err, ShouldBeNil)
		t4 := t3.(*task)
		So(t4, ShouldNotBeNil)
		So(t4.instances, ShouldBeEmpty)

		i := t2.instances["2"].instance.(*instance)
		ok, err := t4.Recover()
		So(err, ShouldBeNil)
		So(ok, ShouldBeTrue)
		So(t4.instances, ShouldHaveLength, 1)
		t4.instances["2"].instance.(*instance).signalInterval = time.Second * 2
		So(t4.instances["2"].doneCh, ShouldNotBeNil)
		So(t4.instances["2"].instance.(*instance).process.Pid, ShouldEqual, i.process.Pid)

		<-t4.instances["2"].doneCh
	})

	Convey("Service restarts on exit", t, func() {
		st = make(map[string]string)
		logger := func(event string, data log.Data) {
			fmt.Printf("%s: %+v\n", event, data)
		}
		t, err := NewTask(storage, lb, Config{"taskID", "Example task", true, false, "shell", "sleep", []string{"1"}, []string{}, "", []int{}, 1, nil}, logger, fileCreator)
		So(err, ShouldBeNil)
		t2 := t.(*task)
		So(t2, ShouldNotBeNil)
		So(t2.instances, ShouldBeEmpty)
		So(t2.execCount, ShouldEqual, 0)
		So(t2.service, ShouldEqual, true)
		So(t2.stopped, ShouldEqual, false)

		err = t2.Start()
		So(err, ShouldBeNil)
		So(t2.instances, ShouldHaveLength, 1)
		So(t2.instances["1"].doneCh, ShouldNotBeNil)
		So(t2.execCount, ShouldEqual, 1)

		time.Sleep(time.Second * 5)
		t2.Stop()
		So(t2.execCount, ShouldEqual, 5)
		So(t2.stopped, ShouldEqual, true)
	})
}
