package server

import (
	"errors"
	"net"
	"net/http"
	"net/http/pprof"
	"sync"
	"time"

	"github.com/gorilla/pat"
	"github.com/hpcloud/tail"
	"github.com/ian-kent/service.go/handlers/requestID"
	"github.com/ian-kent/service.go/log"
	"github.com/justinas/alice"
	"github.com/paasbox/paasbox/sysd/loadbalancer"
	"github.com/paasbox/paasbox/sysd/stack"
	"github.com/paasbox/paasbox/sysd/util/lockwarn"
)

// Server ...
type Server interface {
	Start(bindAddr string) error
	Stop() error
}

// Sysd ...
type Sysd interface {
	Stacks() []stack.Stack
	Stack(id string) (stack.Stack, bool)
	LoadBalancer() loadbalancer.LB
}

type srv struct {
	server  *http.Server
	sysd    Sysd
	tailMap *tailMap
}

type tailMap struct {
	mtx       *sync.Mutex
	fileCount map[string]int
	tails     map[string][]*tail.Tail
}

var (
	errStartingServer = errors.New("failed to start http server")
	errStoppingServer = errors.New("failed to stop http server")
)

// New ...
func New(sysd Sysd) Server {
	return &srv{nil, sysd, &tailMap{
		mtx:       new(sync.Mutex),
		fileCount: make(map[string]int),
		tails:     make(map[string][]*tail.Tail),
	}}
}

func (t *tailMap) Stop() {
	for _, f := range t.tails {
		for _, f2 := range f {
			f2.Stop()
			f2.Cleanup()
		}
	}
}

func (t *tailMap) done(file string, tf *tail.Tail) {
	if _, ok := t.fileCount[file]; !ok {
		log.Debug("file not found in fileCount", log.Data{"file": file})
		return
	}

	c := lockwarn.Notify()
	t.mtx.Lock()
	close(c)
	defer t.mtx.Unlock()

	t.fileCount[file]--

	if t.fileCount[file] == 0 {
		log.Debug("fileCount is zero, stopping tf", log.Data{"file": file})
		err := tf.Stop()
		if err != nil {
			log.Error(err, nil)
		}
		tf.Cleanup()
	}

	var tfArr []*tail.Tail
	for _, tf2 := range t.tails[file] {
		if tf2 != tf {
			tfArr = append(tfArr, tf2)
		}
	}
	t.tails[file] = tfArr
}

func (t *tailMap) get(file string, offset int64, whence int) (*tail.Tail, error) {
	c := lockwarn.Notify()
	t.mtx.Lock()
	close(c)
	defer t.mtx.Unlock()

	if _, ok := t.fileCount[file]; !ok {
		log.Debug("first tail, adding entry to fileCount", log.Data{"file": file})
		t.fileCount[file] = 0
	}
	t.fileCount[file]++

	tf, err := tail.TailFile(file, tail.Config{Follow: true, Location: &tail.SeekInfo{Offset: offset, Whence: whence}})
	if err != nil {
		log.Error(err, nil)
		t.fileCount[file]--
		return nil, err
	}

	if _, ok := t.tails[file]; !ok {
		t.tails[file] = make([]*tail.Tail, 0)
	}
	t.tails[file] = append(t.tails[file], tf)

	return tf, nil
}

// Start ...
func (s *srv) Start(bindAddr string) error {
	log.Debug("starting http server", log.Data{"bind_addr": bindAddr})

	p := pat.New()
	var TODO = func(w http.ResponseWriter, req *http.Request) { w.WriteHeader(http.StatusNotImplemented) }

	p.HandleFunc("/api/stacks/{stack_id}/tasks/{task_id}/instances/{instance_id}/stdout.ws", s.getInstanceStdout /* get instance stdout */)
	p.HandleFunc("/api/stacks/{stack_id}/tasks/{task_id}/instances/{instance_id}/stderr.ws", s.getInstanceStderr /* get instance stderr */)
	p.Get("/api/stacks/{stack_id}/tasks/{task_id}/instances/{instance_id}/stdout", s.getInstanceStdout /* get instance stdout */)
	p.Get("/api/stacks/{stack_id}/tasks/{task_id}/instances/{instance_id}/stderr", s.getInstanceStderr /* get instance stderr */)
	p.Post("/api/stacks/{stack_id}/tasks/{task_id}/instances/{instance_id}/stop", s.stopInstance /* stop instance */)
	p.Get("/api/stacks/{stack_id}/tasks/{task_id}/instances/{instance_id}", s.instance /* get instance */)
	p.Get("/api/stacks/{stack_id}/tasks/{task_id}/instances", s.instances /* list instances */)

	p.Post("/api/stacks/{stack_id}/tasks/{task_id}/start", s.startTask /* start task */)
	p.Post("/api/stacks/{stack_id}/tasks/{task_id}/stop", s.stopTask /* stop task */)
	p.Delete("/api/stacks/{stack_id}/tasks/{task_id}", TODO /* delete task */)
	p.Put("/api/stacks/{stack_id}/tasks/{task_id}", s.updateTask /* update task */)
	p.Get("/api/stacks/{stack_id}/tasks/{task_id}", s.task /* get task */)
	p.Get("/api/stacks/{stack_id}/tasks/{task_id}/stdout", TODO /* get task stdout */)
	p.Get("/api/stacks/{stack_id}/tasks/{task_id}/stderr", TODO /* get task stderr */)

	p.Delete("/api/stacks/{stack_id}/tasks", TODO /* delete all tasks */)
	p.Post("/api/stacks/{stack_id}/tasks", TODO /* create task */)
	p.Get("/api/stacks/{stack_id}/tasks", s.tasks /* list tasks */)

	p.Post("/api/stacks/{stack_id}/start", s.startStack /* start stack */)
	p.Post("/api/stacks/{stack_id}/stop", s.stopStack /* stop stack */)
	p.Delete("/api/stacks/{stack_id}", TODO /* delete stack */)
	p.Put("/api/stacks/{stack_id}", TODO /* update stack */)
	p.Get("/api/stacks/{stack_id}", s.stack /* get stack */)

	p.Delete("/api/stacks", TODO /* delete all stacks */)
	p.Post("/api/stacks", TODO /* create stack */)
	p.Get("/api/stacks", s.stacks /* list stacks */)

	p.Get("/api/loadbalancer/log", s.loadBalancerLog /* load balancer log */)
	p.Get("/api/loadbalancer", s.loadBalancer /* load balancer stats */)

	p.Get("/js", s.staticFiles)
	p.Get("/css", s.staticFiles)
	p.Get("/images", s.staticFiles)

	p.Get("/debug/pprof/cmdline", http.HandlerFunc(pprof.Cmdline))
	p.Get("/debug/pprof/profile", http.HandlerFunc(pprof.Profile))
	p.Get("/debug/pprof/symbol", http.HandlerFunc(pprof.Symbol))
	p.Get("/debug/pprof/trace", http.HandlerFunc(pprof.Trace))
	p.Get("/debug/pprof", http.HandlerFunc(pprof.Index))

	p.Get("/", s.home)

	m := []alice.Constructor{
		requestID.Handler(16),
		//log.Handler,
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
		if err != nil && err != http.ErrServerClosed {
			log.Error(errStartingServer, log.Data{"reason": err})
		}
	}()

	return nil
}

// Stop ...
func (s *srv) Stop() error {
	log.Debug("stopping tail", nil)
	if s.tailMap != nil {
		s.tailMap.Stop()
	}
	log.Debug("stopping http server", nil)
	if s.server != nil {
		err := s.server.Shutdown(nil)
		if err != nil {
			log.Error(errStoppingServer, log.Data{"reason": err})
		}
		return err
	}
	return nil
}
