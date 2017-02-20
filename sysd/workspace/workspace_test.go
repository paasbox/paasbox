package workspace

import (
	"testing"
	"time"

	"github.com/paasbox/paasbox/state"
	"github.com/paasbox/paasbox/sysd/task"
	. "github.com/smartystreets/goconvey/convey"
)

func TestNewWorkspace(t *testing.T) {
	s := state.NewMock(func(string) string { return "" }, func(string, string) {})
	storage, _ := s.Wrap("workspaces")

	Convey("New creates a new workspace with correct field data", t, func() {
		cfg := Config{
			ID:   "example-workspace",
			Name: "Example workspace",
			Env:  []string{"FOO=bar"},
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

		i := wsTask.Instance()
		So(i, ShouldBeNil)
	})

	Convey("Start starts a workspace", t, func() {
		cfg := Config{
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
		i := task.Instance()
		So(i, ShouldBeNil)

		err = ws.Start()
		So(err, ShouldBeNil)

		time.Sleep(time.Millisecond * 250)

		i = task.Instance()
		So(i, ShouldNotBeNil)
		So(i.Pid(), ShouldBeGreaterThan, 0)

		err = ws.Shutdown()
		So(err, ShouldBeNil)
	})

	Convey("Workspace env is passed through", t, func() {
		cfg := Config{
			Env: []string{"FOO=1"},
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
		i := task.Instance()
		So(i, ShouldBeNil)

		So(task.Env(), ShouldResemble, []string{"FOO=1", "BAR=2"})
	})

}
