package server

import (
	"errors"
	"net"
	"net/http"
	"time"

	"github.com/gorilla/pat"
	"github.com/ian-kent/service.go/handlers/requestID"
	"github.com/ian-kent/service.go/log"
	"github.com/justinas/alice"
	"github.com/paasbox/paasbox/sysd/workspace"
)

// Server ...
type Server interface {
	Start(bindAddr string) error
	Stop() error
}

// Sysd ...
type Sysd interface {
	Workspaces() []workspace.Workspace
	Workspace(id string) (workspace.Workspace, bool)
}

type srv struct {
	server *http.Server
	sysd   Sysd
}

var (
	errStartingServer = errors.New("failed to start http server")
	errStoppingServer = errors.New("failed to stop http server")
)

// New ...
func New(sysd Sysd) Server {
	return &srv{nil, sysd}
}

// Start ...
func (s *srv) Start(bindAddr string) error {
	log.Debug("starting http server", log.Data{"bind_addr": bindAddr})

	p := pat.New()
	var TODO = func(w http.ResponseWriter, req *http.Request) { w.WriteHeader(http.StatusNotImplemented) }

	p.Get("/workspaces/{workspace_id}/tasks/{task_id}/instances/{instance_id}/stdout", s.getInstanceStdout /* get instance stdout */)
	p.Get("/workspaces/{workspace_id}/tasks/{task_id}/instances/{instance_id}/stderr", s.getInstanceStderr /* get instance stderr */)
	p.Post("/workspaces/{workspace_id}/tasks/{task_id}/instances/{instance_id}/stop", s.stopInstance /* stop instance */)
	p.Get("/workspaces/{workspace_id}/tasks/{task_id}/instances/{instance_id}", s.instance /* get instance */)
	p.Get("/workspaces/{workspace_id}/tasks/{task_id}/instances", s.instances /* list instances */)

	p.Post("/workspaces/{workspace_id}/tasks/{task_id}/start", s.startTask /* start task */)

	p.Delete("/workspaces/{workspace_id}/tasks/{task_id}", TODO /* delete task */)
	p.Put("/workspaces/{workspace_id}/tasks/{task_id}", TODO /* update task */)
	p.Get("/workspaces/{workspace_id}/tasks/{task_id}", s.task /* get task */)

	p.Delete("/workspaces/{workspace_id}/tasks", TODO /* delete all tasks */)
	p.Post("/workspaces/{workspace_id}/tasks", TODO /* create task */)
	p.Get("/workspaces/{workspace_id}/tasks", s.tasks /* list tasks */)

	p.Delete("/workspaces/{workspace_id}", TODO /* delete workspace */)
	p.Put("/workspaces/{workspace_id}", TODO /* update workspace */)
	p.Get("/workspaces/{workspace_id}", s.workspace /* get workspace */)

	p.Delete("/workspaces", TODO /* delete all workspaces */)
	p.Post("/workspaces", TODO /* create workspace */)
	p.Get("/workspaces", s.workspaces /* list workspaces */)

	p.Get("/", s.home)

	m := []alice.Constructor{
		requestID.Handler(16),
		log.Handler,
		//timeout.DefaultHandler,
	}
	a := alice.New(m...).Then(p)

	s.server = &http.Server{
		Addr:        bindAddr,
		Handler:     a,
		ReadTimeout: 5 * time.Second,
		//WriteTimeout: 10 * time.Second,
	}

	log.Debug("listening", log.Data{"bind_addr": bindAddr})
	l, err := net.Listen("tcp", bindAddr)
	if err != nil {
		log.Error(errStartingServer, log.Data{"reason": err})
		return err
	}

	log.Debug("listening on", log.Data{"addr": l.Addr()})

	go func() {
		log.Debug("calling Serve", nil)
		err := s.server.Serve(l)
		if err != nil {
			log.Error(errStartingServer, log.Data{"reason": err})
		}
	}()

	return nil
}

// Stop ...
func (s *srv) Stop() error {
	log.Debug("stopping http server", nil)
	err := s.server.Shutdown(nil)
	if err != nil {
		log.Error(errStoppingServer, log.Data{"reason": err})
	}
	return err
}
