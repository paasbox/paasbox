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
	Instances() []string
	AddInstances(addr ...string)
	RemoveInstance(addr ...string)
}

var _ LB = &lb{}
var _ Listener = &lbListener{}

type lb struct {
	listeners map[int]*lbListener
}

type lbListener struct {
	net.Listener
	port      int
	instances map[string]struct{}
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

func (lb *lb) AddListener(port int) (Listener, error) {
	log.Debug("adding listener", log.Data{"port": port})

	if _, ok := lb.listeners[port]; ok {
		return nil, errors.New("port already in use")
	}
	l, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return nil, err
	}
	listener := &lbListener{l, port, make(map[string]struct{}, 0), new(sync.RWMutex)}
	lb.listeners[port] = listener
	go listener.start()
	return listener, nil
}

func (lb *lb) StopListener(port int) error {
	return errors.New("not implemented")
}

func (li *lbListener) Instances() (res []string) {
	for k := range li.instances {
		res = append(res, k)
	}
	return
}

func (li *lbListener) start() {
	for {
		lconn, err := li.Accept()
		if err != nil {
			log.Error(err, nil)
			continue
		}
		li.mutex.RLock()
		instances := li.Instances()
		num := len(instances)
		if num < 1 {
			log.Debug("no healthy instances", nil)
			lconn.Close()
			return
		}
		n := rand.Intn(num)
		log.Debug("instances", log.Data{"count": len(li.instances), "n": n, "instances": li.instances})
		dest := instances[n]
		li.mutex.RUnlock()
		rconn, err := net.Dial("tcp", dest)
		if err != nil {
			log.Error(err, nil)
			lconn.Close()
			continue
		}

		defer lconn.Close()
		defer rconn.Close()

		// TODO handle errors?
		var wg sync.WaitGroup
		var readErr, writeErr error
		wg.Add(2)
		go func() {
			defer wg.Done()
			writeErr = pipe(lconn, rconn)
		}()
		go func() {
			defer wg.Done()
			readErr = pipe(rconn, lconn)
		}()
		wg.Wait()
		if readErr != nil && readErr != io.EOF {
			log.Error(errors.New("load balancer read error"), log.Data{"reason": readErr})
		}
		if writeErr != nil && writeErr != io.EOF {
			log.Error(errors.New("load balancer write error"), log.Data{"reason": writeErr})
		}
	}
}

func (li *lbListener) AddInstances(addr ...string) {
	li.mutex.Lock()
	defer li.mutex.Unlock()
	for _, a := range addr {
		li.instances[a] = struct{}{}
	}
}

func (li *lbListener) RemoveInstance(addr ...string) {
	li.mutex.Lock()
	defer li.mutex.Unlock()
	for _, a := range addr {
		delete(li.instances, a)
	}
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
