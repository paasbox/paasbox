package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

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

type instancesOutput struct {
	Instances       []instancesOutputInstance `json:"instances"`
	NextPageURL     string                    `json:"next_page,omitempty"`
	PreviousPageURL string                    `json:"previous_page,omitempty"`
}

type instancesOutputInstance struct {
	ID        string `json:"id"`
	Stdout    string `json:"stdout"`
	StdoutURL string `json:"stdout_url"`
	Stderr    string `json:"stderr"`
	StderrURL string `json:"stderr_url"`
	Pid       int    `json:"pid"`

	Driver  string   `json:"driver"`
	Command string   `json:"command"`
	Args    []string `json:"args"`
	Env     []string `json:"env"`

	InstanceURL  string `json:"instance_url"`
	TaskURL      string `json:"task_url"`
	WorkspaceURL string `json:"workspace_url"`
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
		i := t.CurrentInstance()
		var instanceID, instanceURL string
		if i != nil {
			instanceID = i.ID()
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

	i := t.CurrentInstance()
	var instanceID, instanceURL string
	if i != nil {
		instanceID = i.ID()
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

func (s *srv) instances(w http.ResponseWriter, req *http.Request) {
	wsID := req.URL.Query().Get(":workspace_id")
	taskID := req.URL.Query().Get(":task_id")

	ws, ok := s.sysd.Workspace(wsID)
	if !ok {
		w.WriteHeader(404)
		return
	}

	task, ok := ws.Tasks()[taskID]
	if !ok {
		w.WriteHeader(404)
		return
	}

	var start, count = 0, 10
	s1 := req.URL.Query().Get("start")
	if len(s1) > 0 {
		start, _ = strconv.Atoi(s1)
		if start < 0 {
			start = 0
		}
	}
	c1 := req.URL.Query().Get("count")
	if len(c1) > 0 {
		count, _ = strconv.Atoi(c1)
		if count > 1000 {
			count = 1000
		}
		if count < 0 {
			count = 10
		}
	}

	if start > task.ExecCount() {
		w.WriteHeader(404)
		return
	}

	prevStart := start - count
	nextStart := start + count

	if prevStart < 0 {
		prevStart = 0
	}

	if start+count > task.ExecCount() {
		count = task.ExecCount() - start
	}

	o := instancesOutput{
		Instances: make([]instancesOutputInstance, 0),
	}

	if nextStart != start && nextStart <= task.ExecCount() {
		o.NextPageURL = fmt.Sprintf("/workspaces/%s/tasks/%s/instances?start=%d&count=%d", wsID, taskID, nextStart, count)
	}
	if prevStart != start {
		o.PreviousPageURL = fmt.Sprintf("/workspaces/%s/tasks/%s/instances?start=%d&count=%d", wsID, taskID, prevStart, count)
	}

	for _, i := range task.Instances(uint(start), uint(count)) {
		o.Instances = append(o.Instances, instancesOutputInstance{
			ID: i.ID(),

			Stdout:    i.Stdout(),
			StdoutURL: fmt.Sprintf("/workspaces/%s/tasks/%s/instances/%s/stdout", ws.ID(), task.ID(), i.ID()),
			Stderr:    i.Stderr(),
			StderrURL: fmt.Sprintf("/workspaces/%s/tasks/%s/instances/%s/stdout", ws.ID(), task.ID(), i.ID()),
			Pid:       i.Pid(),

			Driver:  i.Driver(),
			Command: i.Command(),
			Args:    i.Args(),
			Env:     i.Env(),

			WorkspaceURL: fmt.Sprintf("/workspaces/%s", ws.ID()),
			TaskURL:      fmt.Sprintf("/workspaces/%s/tasks/%s", ws.ID(), task.ID()),
			InstanceURL:  fmt.Sprintf("/workspaces/%s/tasks/%s/instances/%s", ws.ID(), task.ID(), i.ID()),
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

func (s *srv) instance(w http.ResponseWriter, req *http.Request) {
	wsID := req.URL.Query().Get(":workspace_id")
	taskID := req.URL.Query().Get(":task_id")
	instanceID := req.URL.Query().Get(":instance_id")

	ws, ok := s.sysd.Workspace(wsID)
	if !ok {
		w.WriteHeader(404)
		return
	}

	task, ok := ws.Tasks()[taskID]
	if !ok {
		w.WriteHeader(404)
		return
	}

	i, err := task.Instance(instanceID)
	if err != nil {
		log.ErrorR(req, err, nil)
		w.WriteHeader(500)
		return
	}
	if i == nil {
		w.WriteHeader(404)
		return
	}

	o := instancesOutputInstance{
		ID: i.ID(),

		Stdout:    i.Stdout(),
		StdoutURL: fmt.Sprintf("/workspaces/%s/tasks/%s/instances/%s/stdout", ws.ID(), task.ID(), i.ID()),
		Stderr:    i.Stderr(),
		StderrURL: fmt.Sprintf("/workspaces/%s/tasks/%s/instances/%s/stdout", ws.ID(), task.ID(), i.ID()),
		Pid:       i.Pid(),

		Driver:  i.Driver(),
		Command: i.Command(),
		Args:    i.Args(),
		Env:     i.Env(),

		WorkspaceURL: fmt.Sprintf("/workspaces/%s", ws.ID()),
		TaskURL:      fmt.Sprintf("/workspaces/%s/tasks/%s", ws.ID(), task.ID()),
		InstanceURL:  fmt.Sprintf("/workspaces/%s/tasks/%s/instances/%s", ws.ID(), task.ID(), i.ID()),
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
