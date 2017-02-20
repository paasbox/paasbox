package workspace

import (
	"errors"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/state"
	"github.com/paasbox/paasbox/sysd/task"
)

var (
	errStartTaskFailed      = errors.New("start task failed")
	errRecoveringTaskFailed = errors.New("recovering task failed")
	errStopTaskFailed       = errors.New("error stopping task")
)

// Workspace ...
type Workspace interface {
	Start() error
	Stop() error
	Shutdown() error
	Tasks() map[string]task.Task
	ID() string
	Name() string
	Env() []string
}

// Config ...
type Config struct {
	ID    string        `json:"id"`
	Name  string        `json:"name"`
	Tasks []task.Config `json:"tasks"`
	Env   []string      `json:"env"`
}

type workspace struct {
	id          string
	name        string
	taskConfigs []task.Config
	env         []string

	tasks map[string]task.Task
	store state.Store
}

// New ...
func New(store state.Store, config Config) (Workspace, error) {
	log.Debug("creating workspace", log.Data{"id": config.ID, "tasks": config.Tasks})
	ws := &workspace{
		id:          config.ID,
		name:        config.Name,
		taskConfigs: config.Tasks,
		env:         config.Env,
		tasks:       make(map[string]task.Task),
	}

	taskStore, err := store.Wrap("tasks")
	if err != nil {
		return nil, err
	}

	for _, t := range config.Tasks {
		s, err := taskStore.Wrap(t.ID)
		if err != nil {
			return nil, err
		}
		t2, err := task.NewTask(s, t.WithEnv(ws.Env()), ws.log)
		if err != nil {
			return nil, err
		}
		ws.tasks[t.ID] = t2
	}

	return ws, nil
}

func (ws *workspace) ID() string {
	return ws.id
}

func (ws *workspace) Tasks() map[string]task.Task {
	return ws.tasks
}

func (ws *workspace) Name() string {
	return ws.name
}

func (ws *workspace) Env() []string {
	return ws.env
}

func (ws *workspace) log(event string, data log.Data) {
	if data == nil {
		data = log.Data{}
	}
	data["workspace_id"] = ws.id
	log.Debug(event, data)
}

func (ws *workspace) error(err error, reason error, data log.Data) {
	if data == nil {
		data = log.Data{}
	}
	data["error"] = err
	data["reason"] = reason
	ws.log("error", data)
}

func (ws *workspace) Start() error {
	ws.log("starting workspace", nil)

	for _, t := range ws.taskConfigs {
		if task, ok := ws.tasks[t.ID]; ok {
			ok, err := task.Recover()
			if ok {
				continue
			}
			ws.error(errRecoveringTaskFailed, err, log.Data{"task_id": t.ID})

			if t.Service {
				ws.log("starting task", log.Data{"task_id": t.ID})
				err := task.Start()
				if err != nil {
					ws.error(errStartTaskFailed, err, log.Data{"task_id": t.ID})
				}
			}
		}
	}

	return nil
}

func (ws *workspace) Shutdown() error {
	ws.log("stopping workspace, stopping tasks", nil)
	for _, t := range ws.taskConfigs {
		if task, ok := ws.tasks[t.ID]; ok {
			ws.log("stopping task", log.Data{"task_id": t.ID})
			err := task.Stop()
			if err != nil {
				ws.error(errStopTaskFailed, err, log.Data{"task_id": t.ID})
			}
		}
	}
	return nil
}

func (ws *workspace) Stop() error {
	return nil
}
