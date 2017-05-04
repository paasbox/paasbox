package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"io/ioutil"

	"github.com/ian-kent/service.go/log"
)

type stacksOutput struct {
	Stacks []stacksOutputStack `json:"stacks"`
}

type stacksOutputStack struct {
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	Env      stackEnv `json:"env"`
	StackURL string   `json:"stack_url"`
	TasksURL string   `json:"tasks_url"`
	Started  bool     `json:"is_started"`
}

type stackEnv struct {
	InheritAll bool     `json:"inherit_all"`
	Inherit    []string `json:"inherit"`
	Remove     []string `json:"remove"`
	Set        []string `json:"set"`
}

type tasksOutput struct {
	Tasks []tasksOutputTask `json:"tasks"`
}

type tasksOutputTask struct {
	ID           string                  `json:"id"`
	Name         string                  `json:"name"`
	Service      bool                    `json:"is_service"`
	Persist      bool                    `json:"persist"` // FIXME `is_persist` would be wrong, but `persist` breaks bool pattern
	Driver       string                  `json:"driver"`
	Command      string                  `json:"command,omitempty"`
	Image        string                  `json:"image,omitempty"`
	Network      string                  `json:"network,omitempty"`
	Args         []string                `json:"args"`
	Env          []string                `json:"env"`
	Pwd          string                  `json:"pwd"`
	Ports        []int                   `json:"ports"`
	Instances    int                     `json:"instances"`
	Healthchecks []taskOutputHealthcheck `json:"healthchecks"`
	Started      bool                    `json:"is_started"`
	DevMode      bool                    `json:"dev_mode"`

	TaskURL      string `json:"task_url"`
	StackURL     string `json:"stack_url"`
	InstancesURL string `json:"instances_url"`

	CurrentInstances []tasksOutputTaskInstances `json:"current_instances,omitempty"`
}

type taskOutputHealthcheck struct {
	Type               string                     `json:"type"`
	Target             string                     `json:"target"`
	HealthyThreshold   int                        `json:"healthy_threshold"`
	UnhealthyThreshold int                        `json:"unhealthy_threshold"`
	ReapThreshold      int                        `json:"reap_threshold"`
	Frequency          time.Duration              `json:"frequency"`
	Instances          []taskOutputInstanceHealth `json:"instances"`
}

type taskOutputInstanceHealth struct {
	InstanceID string `json:"instance_id"`
	Healthy    bool   `json:"healthy"`
	Score      int    `json:"score"`
}

type tasksOutputTaskInstances struct {
	ID  string `json:"id"`
	URL string `json:"url"`
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
	Running   bool   `json:"running"`

	Driver  string   `json:"driver"`
	Command string   `json:"command"`
	Args    []string `json:"args"`
	Env     []string `json:"env"`
	Pwd     string   `json:"pwd"`
	Ports   []int    `json:"ports"`

	InstanceURL string `json:"instance_url"`
	TaskURL     string `json:"task_url"`
	StackURL    string `json:"stack_url"`
}

func (s *srv) loadBalancer(w http.ResponseWriter, req *http.Request) {
	stats := s.sysd.LoadBalancer().Stats()

	b, err := json.Marshal(stats)
	if err != nil {
		log.ErrorR(req, err, nil)
		w.WriteHeader(500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(b)
}

func (s *srv) loadBalancerLog(w http.ResponseWriter, req *http.Request) {
	logs := s.sysd.LoadBalancer().Log()

	b, err := json.Marshal(logs)
	if err != nil {
		log.ErrorR(req, err, nil)
		w.WriteHeader(500)
		return
	}
	w.Header().Set("Content-Type", "text/plain")
	w.Write(b)
}

func (s *srv) stacks(w http.ResponseWriter, req *http.Request) {
	o := stacksOutput{
		Stacks: make([]stacksOutputStack, 0),
	}

	stacks := s.sysd.Stacks()
	for _, ws := range stacks {
		o.Stacks = append(o.Stacks, stacksOutputStack{
			ID:       ws.ID(),
			Name:     ws.Name(),
			Env:      stackEnv(ws.Env()),
			StackURL: fmt.Sprintf("/stacks/%s", ws.ID()),
			TasksURL: fmt.Sprintf("/stacks/%s/tasks", ws.ID()),
			Started:  ws.Started(),
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

func (s *srv) stack(w http.ResponseWriter, req *http.Request) {
	id := req.URL.Query().Get(":stack_id")
	ws, ok := s.sysd.Stack(id)

	if !ok {
		w.WriteHeader(404)
		return
	}

	o := stacksOutputStack{
		ID:       ws.ID(),
		Name:     ws.Name(),
		Env:      stackEnv(ws.Env()),
		StackURL: fmt.Sprintf("/stacks/%s", ws.ID()),
		TasksURL: fmt.Sprintf("/stacks/%s/tasks", ws.ID()),
		Started:  ws.Started(),
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
	id := req.URL.Query().Get(":stack_id")
	ws, ok := s.sysd.Stack(id)

	if !ok {
		w.WriteHeader(404)
		return
	}

	o := tasksOutput{
		Tasks: make([]tasksOutputTask, 0),
	}

	for _, t := range ws.Tasks() {
		var instances []tasksOutputTaskInstances
		for _, inst := range t.CurrentInstances() {
			instances = append(instances, tasksOutputTaskInstances{
				ID:  inst.ID(),
				URL: fmt.Sprintf("/stacks/%s/tasks/%s/instances/%s", ws.ID(), t.ID(), inst.ID()),
			})
		}

		var hcOutput []taskOutputHealthcheck
		for _, hc := range t.Healthchecks() {
			var insts []taskOutputInstanceHealth
			for _, inst := range hc.Instances() {
				insts = append(insts, taskOutputInstanceHealth{
					Healthy:    inst.Healthy(),
					InstanceID: inst.ID(),
					Score:      inst.Score(),
				})
			}
			hcOutput = append(hcOutput, taskOutputHealthcheck{
				Type:               hc.Type(),
				Target:             hc.Target(),
				HealthyThreshold:   hc.HealthyThreshold(),
				UnhealthyThreshold: hc.UnhealthyThreshold(),
				ReapThreshold:      hc.ReapThreshold(),
				Frequency:          hc.Frequency(),
				Instances:          insts,
			})
		}

		o.Tasks = append(o.Tasks, tasksOutputTask{
			ID:           t.ID(),
			Name:         t.Name(),
			Service:      t.Service(),
			Persist:      t.Persist(),
			Driver:       t.Driver(),
			Command:      t.Command(),
			Args:         t.Args(),
			Env:          t.Env(),
			Pwd:          t.Pwd(),
			Ports:        t.Ports(),
			Instances:    t.TargetInstances(),
			Image:        t.Image(),
			Network:      t.Network(),
			Healthchecks: hcOutput,
			Started:      t.Started(),
			DevMode:      t.DevMode(),

			TaskURL:      fmt.Sprintf("/stacks/%s/tasks/%s", ws.ID(), t.ID()),
			InstancesURL: fmt.Sprintf("/stacks/%s/tasks/%s/instances", ws.ID(), t.ID()),
			StackURL:     fmt.Sprintf("/stacks/%s", ws.ID()),

			CurrentInstances: instances,
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
	wsID := req.URL.Query().Get(":stack_id")
	taskID := req.URL.Query().Get(":task_id")

	ws, ok := s.sysd.Stack(wsID)

	if !ok {
		w.WriteHeader(404)
		return
	}

	t, ok := ws.Task(taskID)

	if !ok {
		w.WriteHeader(404)
		return
	}

	var instances []tasksOutputTaskInstances
	for _, inst := range t.CurrentInstances() {
		instances = append(instances, tasksOutputTaskInstances{
			ID:  inst.ID(),
			URL: fmt.Sprintf("/stacks/%s/tasks/%s/instances/%s", ws.ID(), t.ID(), inst.ID()),
		})
	}

	var hcOutput []taskOutputHealthcheck
	for _, hc := range t.Healthchecks() {
		var insts []taskOutputInstanceHealth
		for _, inst := range hc.Instances() {
			insts = append(insts, taskOutputInstanceHealth{
				Healthy:    inst.Healthy(),
				InstanceID: inst.ID(),
				Score:      inst.Score(),
			})
		}
		hcOutput = append(hcOutput, taskOutputHealthcheck{
			Type:               hc.Type(),
			Target:             hc.Target(),
			HealthyThreshold:   hc.HealthyThreshold(),
			UnhealthyThreshold: hc.UnhealthyThreshold(),
			ReapThreshold:      hc.ReapThreshold(),
			Frequency:          hc.Frequency(),
			Instances:          insts,
		})
	}

	o := tasksOutputTask{
		ID:           t.ID(),
		Name:         t.Name(),
		Service:      t.Service(),
		Persist:      t.Persist(),
		Driver:       t.Driver(),
		Command:      t.Command(),
		Args:         t.Args(),
		Env:          t.Env(),
		Pwd:          t.Pwd(),
		Ports:        t.Ports(),
		Instances:    t.TargetInstances(),
		Image:        t.Image(),
		Network:      t.Network(),
		Healthchecks: hcOutput,
		Started:      t.Started(),
		DevMode:      t.DevMode(),

		TaskURL:      fmt.Sprintf("/stacks/%s/tasks/%s", ws.ID(), t.ID()),
		InstancesURL: fmt.Sprintf("/stacks/%s/tasks/%s/instances", ws.ID(), t.ID()),
		StackURL:     fmt.Sprintf("/stacks/%s", ws.ID()),

		CurrentInstances: instances,
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

type updateTaskModel struct {
	Env *[]string `json:"env"`
}

func (s *srv) updateTask(w http.ResponseWriter, req *http.Request) {
	wsID := req.URL.Query().Get(":stack_id")
	taskID := req.URL.Query().Get(":task_id")

	ws, ok := s.sysd.Stack(wsID)

	if !ok {
		w.WriteHeader(404)
		return
	}

	t, ok := ws.Task(taskID)

	if !ok {
		w.WriteHeader(404)
		return
	}

	b, err := ioutil.ReadAll(req.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}

	req.Body.Close()

	// FIXME probably better way than unmarshaling the json twice

	var jsonVal map[string]interface{}
	err = json.Unmarshal(b, &jsonVal)
	if err != nil {
		w.WriteHeader(400)
		return
	}

	var m updateTaskModel
	err = json.Unmarshal(b, &m)
	if err != nil {
		w.WriteHeader(400)
		return
	}

	var updatedSomething bool

	if m.Env != nil {
		updatedSomething = true
		err = t.SetEnv(*m.Env)
		if err != nil {
			w.WriteHeader(500)
			w.Write([]byte(err.Error()))
			return
		}
	}

	if dm, ok := jsonVal["dev_mode"]; ok {
		if dm2, ok := dm.(bool); ok {
			updatedSomething = true
			err = t.SetDevMode(dm2)
			if err != nil {
				w.WriteHeader(500)
				w.Write([]byte(err.Error()))
				return
			}
		} else {
			w.WriteHeader(400)
			w.Write([]byte(`dev_mode must be a boolean`))
			return
		}
	}

	if !updatedSomething {
		w.WriteHeader(400)
		w.Write([]byte(`nothing to update`))
		return
	}
}

func (s *srv) startTask(w http.ResponseWriter, req *http.Request) {
	wsID := req.URL.Query().Get(":stack_id")
	taskID := req.URL.Query().Get(":task_id")

	ws, ok := s.sysd.Stack(wsID)

	if !ok {
		w.WriteHeader(404)
		return
	}

	if !ws.Started() {
		w.WriteHeader(400)
		return
	}

	t, ok := ws.Task(taskID)

	if !ok {
		w.WriteHeader(404)
		return
	}

	if t.Started() {
		w.WriteHeader(400)
		return
	}

	err := t.Start()
	if err != nil {
		w.WriteHeader(400)
		log.ErrorR(req, err, nil)
		return
	}

	w.WriteHeader(201)
}

func (s *srv) startStack(w http.ResponseWriter, req *http.Request) {
	wsID := req.URL.Query().Get(":stack_id")

	ws, ok := s.sysd.Stack(wsID)

	if !ok {
		w.WriteHeader(404)
		return
	}

	if ws.Started() {
		w.WriteHeader(400)
		return
	}

	err := ws.Start()
	if err != nil {
		w.WriteHeader(400)
		log.ErrorR(req, err, nil)
		return
	}

	w.WriteHeader(201)
}

func (s *srv) instances(w http.ResponseWriter, req *http.Request) {
	wsID := req.URL.Query().Get(":stack_id")
	taskID := req.URL.Query().Get(":task_id")

	order := req.URL.Query().Get("order")
	order = strings.ToLower(order)
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	ws, ok := s.sysd.Stack(wsID)
	if !ok {
		w.WriteHeader(404)
		return
	}

	task, ok := ws.Task(taskID)
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
		o.NextPageURL = fmt.Sprintf("/stacks/%s/tasks/%s/instances?start=%d&count=%d", wsID, taskID, nextStart, count)
	}
	if prevStart != start {
		o.PreviousPageURL = fmt.Sprintf("/stacks/%s/tasks/%s/instances?start=%d&count=%d", wsID, taskID, prevStart, count)
	}

	desc := true
	if order == "asc" {
		desc = false
	}
	instances := task.Instances(uint(start), uint(count), desc)

	for _, i := range instances {
		o.Instances = append(o.Instances, instancesOutputInstance{
			ID: i.ID(),

			Stdout:    i.Stdout(),
			StdoutURL: fmt.Sprintf("/stacks/%s/tasks/%s/instances/%s/stdout", ws.ID(), task.ID(), i.ID()),
			Stderr:    i.Stderr(),
			StderrURL: fmt.Sprintf("/stacks/%s/tasks/%s/instances/%s/stderr", ws.ID(), task.ID(), i.ID()),
			Pid:       i.Pid(),

			Driver:  i.Driver(),
			Command: i.Command(),
			Args:    i.Args(),
			Env:     i.Env(),
			Pwd:     i.Pwd(),
			Running: i.Running(),
			Ports:   i.Ports(),

			StackURL:    fmt.Sprintf("/stacks/%s", ws.ID()),
			TaskURL:     fmt.Sprintf("/stacks/%s/tasks/%s", ws.ID(), task.ID()),
			InstanceURL: fmt.Sprintf("/stacks/%s/tasks/%s/instances/%s", ws.ID(), task.ID(), i.ID()),
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
	wsID := req.URL.Query().Get(":stack_id")
	taskID := req.URL.Query().Get(":task_id")
	instanceID := req.URL.Query().Get(":instance_id")

	ws, ok := s.sysd.Stack(wsID)
	if !ok {
		w.WriteHeader(404)
		return
	}

	task, ok := ws.Task(taskID)
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
		StdoutURL: fmt.Sprintf("/stacks/%s/tasks/%s/instances/%s/stdout", ws.ID(), task.ID(), i.ID()),
		Stderr:    i.Stderr(),
		StderrURL: fmt.Sprintf("/stacks/%s/tasks/%s/instances/%s/stderr", ws.ID(), task.ID(), i.ID()),
		Pid:       i.Pid(),

		Driver:  i.Driver(),
		Command: i.Command(),
		Args:    i.Args(),
		Env:     i.Env(),
		Pwd:     i.Pwd(),
		Running: i.Running(),
		Ports:   i.Ports(),

		StackURL:    fmt.Sprintf("/stacks/%s", ws.ID()),
		TaskURL:     fmt.Sprintf("/stacks/%s/tasks/%s", ws.ID(), task.ID()),
		InstanceURL: fmt.Sprintf("/stacks/%s/tasks/%s/instances/%s", ws.ID(), task.ID(), i.ID()),
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

func (s *srv) stopInstance(w http.ResponseWriter, req *http.Request) {
	wsID := req.URL.Query().Get(":stack_id")
	taskID := req.URL.Query().Get(":task_id")
	instanceID := req.URL.Query().Get(":instance_id")

	ws, ok := s.sysd.Stack(wsID)
	if !ok {
		w.WriteHeader(404)
		return
	}

	task, ok := ws.Task(taskID)
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

	if !i.Running() {
		w.WriteHeader(400)
		return
	}

	err = i.Stop()
	if err != nil {
		w.WriteHeader(500)
		log.ErrorR(req, err, nil)
		return
	}

	w.WriteHeader(200)
}

func (s *srv) stopTask(w http.ResponseWriter, req *http.Request) {
	wsID := req.URL.Query().Get(":stack_id")
	taskID := req.URL.Query().Get(":task_id")

	ws, ok := s.sysd.Stack(wsID)
	if !ok {
		w.WriteHeader(404)
		return
	}

	task, ok := ws.Task(taskID)
	if !ok {
		w.WriteHeader(404)
		return
	}

	if !task.Started() {
		w.WriteHeader(400)
		return
	}

	err := task.Stop()
	if err != nil {
		w.WriteHeader(500)
		log.ErrorR(req, err, nil)
		return
	}

	w.WriteHeader(200)
}

func (s *srv) stopStack(w http.ResponseWriter, req *http.Request) {
	wsID := req.URL.Query().Get(":stack_id")

	ws, ok := s.sysd.Stack(wsID)
	if !ok {
		w.WriteHeader(404)
		return
	}

	if !ws.Started() {
		w.WriteHeader(400)
		return
	}

	err := ws.Stop()
	if err != nil {
		w.WriteHeader(500)
		log.ErrorR(req, err, nil)
		return
	}

	w.WriteHeader(200)
}
