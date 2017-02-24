package loadbalancer

import (
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net"
	"sync"

	"github.com/ian-kent/service.go/log"
)

// LB is a load balancer
type LB interface {
	AddListener(port int) (Listener, error)
	StopListener(port int) error
}

// Listener ...
type Listener interface {
	Instances() []Instance
	AddInstance(i Instance)
	RemoveInstance(i Instance)
}

// Instance ...
type Instance interface {
	Port() int
}

var _ LB = &lb{}
var _ Listener = &lbListener{}
var _ Instance = &lbInstance{}

type lb struct {
	listeners map[int]*lbListener
}

type lbListener struct {
	net.Listener
	port      int
	instances []Instance
	mutex     *sync.RWMutex
}

type lbInstance struct {
	port int
}

// New creates a new load balancer
func New() (LB, error) {
	return &lb{
		listeners: make(map[int]*lbListener),
	}, nil
}

// NewInstance ...
func NewInstance(port int) Instance {
	return &lbInstance{port}
}

func (lb *lb) AddListener(port int) (Listener, error) {
	log.Debug("adding listener", log.Data{"port": port})

	if _, ok := lb.listeners[port]; ok {
		return nil, errors.New("port already in use")
	}
	l, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return nil, err
	}
	listener := &lbListener{l, port, make([]Instance, 0), new(sync.RWMutex)}
	lb.listeners[port] = listener
	go listener.start()
	return listener, nil
}

func (lb *lb) StopListener(port int) error {
	return errors.New("not implemented")
}

func (li *lbListener) Instances() []Instance {
	return li.instances
}

func (li *lbListener) start() {
	for {
		lconn, err := li.Accept()
		if err != nil {
			log.Error(err, nil)
			continue
		}
		li.mutex.RLock()
		n := rand.Intn(len(li.instances))
		log.Debug("instances", log.Data{"count": len(li.instances), "n": n, "instances": li.instances})
		dest := li.instances[n]
		li.mutex.RUnlock()
		rconn, err := net.Dial("tcp", fmt.Sprintf("127.0.0.1:%d", dest.Port()))
		if err != nil {
			log.Error(err, nil)
			continue
		}

		// TODO handle errors?
		go pipe(lconn, rconn)
		go pipe(rconn, lconn)
	}
}

func (li *lbListener) AddInstance(i Instance) {
	li.mutex.Lock()
	defer li.mutex.Unlock()
	li.instances = append(li.instances, i)
}

func (li *lbListener) RemoveInstance(i Instance) {
	li.mutex.Lock()
	defer li.mutex.Unlock()
	var instances []Instance
	for _, v := range li.instances {
		if v != i {
			instances = append(instances, v)
		}
	}
	li.instances = instances
}

func pipe(src, dst io.ReadWriter) error {
	//directional copy (64k buffer)
	buff := make([]byte, 0xffff)
	for {
		n, err := src.Read(buff)
		if err != nil {
			return err
		}
		b := buff[:n]

		//write out result
		_, err = dst.Write(b)
		if err != nil {
			return err
		}
	}
}

func (li *lbInstance) Port() int {
	return li.port
}
