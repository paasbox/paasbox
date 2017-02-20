package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/ian-kent/service.go/log"
)

type workspacesOutput struct {
	Workspaces []workspacesOutputWorkspace `json:"workspaces"`
}

type workspacesOutputWorkspace struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Env          []string `json:"env"`
	WorkspaceURL string   `json:"workspace_url"`
	TasksURL     string   `json:"tasks_url"`
}

type tasksOutput struct {
	Tasks []tasksOutputTask `json:"tasks"`
}

type tasksOutputTask struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Service bool     `json:"is_service"`
	Driver  string   `json:"driver"`
	Command string   `json:"command"`
	Args    []string `json:"args"`
	Env     []string `json:"env"`

	TaskURL      string `json:"task_url"`
	WorkspaceURL string `json:"workspace_url"`
	InstancesURL string `json:"instances_url"`

	CurrentInstanceID  string `json:"current_instance_id,omitempty"`
	CurrentInstanceURL string `json:"current_instance_url,omitempty"`
}

func (s *srv) workspaces(w http.ResponseWriter, req *http.Request) {
	o := workspacesOutput{
		Workspaces: make([]workspacesOutputWorkspace, 0),
	}

	workspaces := s.sysd.Workspaces()
	for _, ws := range workspaces {
		o.Workspaces = append(o.Workspaces, workspacesOutputWorkspace{
			ID:           ws.ID(),
			Name:         ws.Name(),
			Env:          ws.Env(),
			WorkspaceURL: fmt.Sprintf("/workspaces/%s", ws.ID()),
			TasksURL:     fmt.Sprintf("/workspaces/%s/tasks", ws.ID()),
		})
	}

	b, err := json.Marshal(o)
	if err != nil {
		log.ErrorR(req, err, nil)
		w.WriteHeader(500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(b)
}

func (s *srv) workspace(w http.ResponseWriter, req *http.Request) {
	id := req.URL.Query().Get(":workspace_id")
	ws, ok := s.sysd.Workspace(id)

	if !ok {
		w.WriteHeader(404)
		return
	}

	o := workspacesOutputWorkspace{
		ID:           ws.ID(),
		Name:         ws.Name(),
		Env:          ws.Env(),
		WorkspaceURL: fmt.Sprintf("/workspaces/%s", ws.ID()),
		TasksURL:     fmt.Sprintf("/workspaces/%s/tasks", ws.ID()),
	}

	b, err := json.Marshal(o)
	if err != nil {
		log.ErrorR(req, err, nil)
		w.WriteHeader(500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(b)
}

func (s *srv) tasks(w http.ResponseWriter, req *http.Request) {
	id := req.URL.Query().Get(":workspace_id")
	ws, ok := s.sysd.Workspace(id)

	if !ok {
		w.WriteHeader(404)
		return
	}

	o := tasksOutput{
		Tasks: make([]tasksOutputTask, 0),
	}

	for _, t := range ws.Tasks() {
		i := t.Instance()
		var instanceID, instanceURL string
		if i != nil {
			instanceID = i.InstanceID()
			instanceURL = fmt.Sprintf("/workspaces/%s/tasks/%s/instances/%s", ws.ID(), t.ID(), instanceID)
		}
		o.Tasks = append(o.Tasks, tasksOutputTask{
			ID:      t.ID(),
			Name:    t.Name(),
			Service: t.Service(),
			Driver:  t.Driver(),
			Command: t.Command(),
			Args:    t.Args(),
			Env:     t.Env(),

			TaskURL:      fmt.Sprintf("/workspaces/%s/tasks/%s", ws.ID(), t.ID()),
			InstancesURL: fmt.Sprintf("/workspaces/%s/tasks/%s/instances", ws.ID(), t.ID()),
			WorkspaceURL: fmt.Sprintf("/workspaces/%s", ws.ID()),

			CurrentInstanceID:  instanceID,
			CurrentInstanceURL: instanceURL,
		})
	}

	b, err := json.Marshal(o)
	if err != nil {
		log.ErrorR(req, err, nil)
		w.WriteHeader(500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(b)
}

func (s *srv) task(w http.ResponseWriter, req *http.Request) {
	wsID := req.URL.Query().Get(":workspace_id")
	taskID := req.URL.Query().Get(":task_id")

	ws, ok := s.sysd.Workspace(wsID)

	if !ok {
		w.WriteHeader(404)
		return
	}

	t, ok := ws.Tasks()[taskID]

	if !ok {
		w.WriteHeader(404)
		return
	}

	i := t.Instance()
	var instanceID, instanceURL string
	if i != nil {
		instanceID = i.InstanceID()
		instanceURL = fmt.Sprintf("/workspaces/%s/tasks/%s/instances/%s", ws.ID(), t.ID(), instanceID)
	}

	o := tasksOutputTask{
		ID:      t.ID(),
		Name:    t.Name(),
		Service: t.Service(),
		Driver:  t.Driver(),
		Command: t.Command(),
		Args:    t.Args(),
		Env:     t.Env(),

		TaskURL:      fmt.Sprintf("/workspaces/%s/tasks/%s", ws.ID(), t.ID()),
		InstancesURL: fmt.Sprintf("/workspaces/%s/tasks/%s/instances", ws.ID(), t.ID()),
		WorkspaceURL: fmt.Sprintf("/workspaces/%s", ws.ID()),

		CurrentInstanceID:  instanceID,
		CurrentInstanceURL: instanceURL,
	}

	b, err := json.Marshal(o)
	if err != nil {
		log.ErrorR(req, err, nil)
		w.WriteHeader(500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(b)
}
