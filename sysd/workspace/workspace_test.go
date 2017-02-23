package workspace

import (
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/paasbox/paasbox/state"
	"github.com/paasbox/paasbox/sysd/task"
	. "github.com/smartystreets/goconvey/convey"
)

func TestNewWorkspace(t *testing.T) {
	s := state.NewMock(func(string) string { return "" }, func(string, string) {})
	storage, _ := s.Wrap("workspaces")

	logTemp, err := ioutil.TempDir("", "paasbox")
	if err != nil {
		t.Error(err)
		t.Fail()
		return
	}

	defer func() {
		err := os.RemoveAll(logTemp)
		if err != nil {
			t.Error(err)
		}
	}()

	Convey("New creates a new workspace with correct field data", t, func() {
		cfg := Config{
			ID:      "example-workspace",
			Name:    "Example workspace",
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
		w, err := New(storage, cfg)
		So(err, ShouldBeNil)
		ws := w.(*workspace)
		So(ws, ShouldNotBeNil)
		So(ws.id, ShouldEqual, cfg.ID)
		So(ws.taskConfigs, ShouldResemble, cfg.Tasks)
		So(ws.tasks, ShouldHaveLength, 1)
		So(ws.name, ShouldEqual, cfg.Name)
		So(ws.env, ShouldResemble, cfg.Env)

		wsTask := ws.tasks["taskID"]

		i := wsTask.CurrentInstance()
		So(i, ShouldBeNil)
	})

	Convey("Start starts a workspace", t, func() {
		cfg := Config{
			LogPath: logTemp,
			Tasks: []task.Config{
				task.Config{
					ID:      "sleep",
					Service: true,
					Driver:  "shell",
					Command: "sleep",
					Args:    []string{"5"},
				},
			},
		}
		w, err := New(storage, cfg)
		So(err, ShouldBeNil)
		ws := w.(*workspace)
		task := ws.tasks["sleep"]
		i := task.CurrentInstance()
		So(i, ShouldBeNil)
		So(err, ShouldBeNil)

		err = ws.Start()
		So(err, ShouldBeNil)

		time.Sleep(time.Millisecond * 250)

		i = task.CurrentInstance()
		So(i, ShouldNotBeNil)
		So(err, ShouldBeNil)
		So(i.Pid(), ShouldBeGreaterThan, 0)

		err = ws.Shutdown()
		So(err, ShouldBeNil)
	})

	Convey("Workspace env is passed through", t, func() {
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
		w, err := New(storage, cfg)
		So(err, ShouldBeNil)
		ws := w.(*workspace)
		task := ws.tasks["sleep"]
		i := task.CurrentInstance()
		So(i, ShouldBeNil)

		So(task.Env(), ShouldResemble, []string{"FOO=1", "BAR=2"})
	})

}
