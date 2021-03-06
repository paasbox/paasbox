package stack

import (
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/paasbox/paasbox/state"
	"github.com/paasbox/paasbox/sysd/loadbalancer"
	"github.com/paasbox/paasbox/sysd/task"
	. "github.com/smartystreets/goconvey/convey"
)

func TestNewStack(t *testing.T) {
	s := state.NewMock(func(string) string { return "" }, func(string, string) {})
	storage, _ := s.Wrap("stacks")

	logTemp, err := ioutil.TempDir("", "paasbox")
	if err != nil {
		t.Error(err)
		t.Fail()
		return
	}

	lb, _ := loadbalancer.New(nil)

	defer func() {
		err := os.RemoveAll(logTemp)
		if err != nil {
			t.Error(err)
		}
	}()

	Convey("New creates a new stack with correct field data", t, func() {
		cfg := Config{
			ID:      "example-stack",
			Name:    "Example stack",
			Env:     EnvConfig{Set: []string{"FOO=bar"}},
			LogPath: logTemp,
			Tasks: []task.Config{
				task.Config{
					ID:      "taskID",
					Name:    "Example task",
					Service: false,
					Driver:  "driver",
					Command: "command",
					Args:    []string{"args"},
					Env:     []string{"FOO=bar"},
				},
			},
		}
		w, err := New(nil, storage, lb, cfg)
		So(err, ShouldBeNil)
		ws := w.(*stack)
		So(ws, ShouldNotBeNil)
		So(ws.id, ShouldEqual, cfg.ID)
		So(ws.taskConfigs, ShouldResemble, cfg.Tasks)
		So(ws.tasks, ShouldHaveLength, 1)
		So(ws.name, ShouldEqual, cfg.Name)
		So(ws.env, ShouldResemble, cfg.Env)

		wsTask := ws.tasks["taskID"]

		So(wsTask.CurrentInstances(), ShouldHaveLength, 0)
	})

	Convey("Start starts a stack", t, func() {
		cfg := Config{
			LogPath: logTemp,
			Tasks: []task.Config{
				task.Config{
					ID:        "sleep",
					Service:   true,
					Driver:    "shell",
					Command:   "sleep",
					Args:      []string{"5"},
					Instances: 1,
				},
			},
		}
		w, err := New(nil, storage, lb, cfg)
		So(err, ShouldBeNil)
		ws := w.(*stack)
		task := ws.tasks["sleep"]
		So(task.CurrentInstances(), ShouldHaveLength, 0)
		So(err, ShouldBeNil)

		err = ws.Start()
		So(err, ShouldBeNil)

		time.Sleep(time.Millisecond * 500)

		i := task.CurrentInstances()[0]
		So(i, ShouldNotBeNil)
		So(err, ShouldBeNil)
		So(i.Pid(), ShouldBeGreaterThan, 0)

		err = ws.Shutdown()
		So(err, ShouldBeNil)
	})

	Convey("Stack env is passed through", t, func() {
		cfg := Config{
			LogPath: logTemp,
			Env:     EnvConfig{Set: []string{"FOO=1"}},
			Tasks: []task.Config{
				task.Config{
					ID:      "sleep",
					Service: true,
					Driver:  "shell",
					Command: "sleep",
					Args:    []string{"5"},
					Env:     []string{"BAR=2"},
				},
			},
		}
		w, err := New(nil, storage, lb, cfg)
		So(err, ShouldBeNil)
		ws := w.(*stack)
		task := ws.tasks["sleep"]
		So(task.CurrentInstances(), ShouldHaveLength, 0)

		So(task.Env(), ShouldResemble, []string{"FOO=1", "PAASBOX_WSID=", "PAASBOX_LOGPATH=" + ws.logPath, "BAR=2", "PAASBOX_TASKID=sleep"})
	})

}
