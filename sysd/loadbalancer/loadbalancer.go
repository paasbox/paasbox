package loadbalancer

import (
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net"
	"sync"
	"time"

	"github.com/ian-kent/service.go/log"
)

// LB is a load balancer
type LB interface {
	AddListener(port int) (Listener, error)
	StopListener(port int) error
	Stats() LBStats
}

// LBStats ...
type LBStats struct {
	Connections      ConnectionStats `json:"connections"`
	Bytes            ByteStats       `json:"bytes"`
	ConnectionErrors int64           `json:"connection_errors"`
	DialErrors       int64           `json:"dial_errors"`
	ReadErrors       int64           `json:"read_errors"`
	WriteErrors      int64           `json:"write_errors"`
	Listeners        map[int]Stats   `json:"listeners"`
}

// Stats ...
type Stats struct {
	Connections      ConnectionStats `json:"connections"`
	Bytes            ByteStats       `json:"bytes"`
	ConnectionErrors int64           `json:"connection_errors"`
	DialErrors       int64           `json:"dial_errors"`
	ReadErrors       int64           `json:"read_errors"`
	WriteErrors      int64           `json:"write_errors"`
	HealthyInstances int64           `json:"healthy_instances"`
}

// ConnectionStats ...
type ConnectionStats struct {
	Total  int64 `json:"total"`
	Active int64 `json:"active"`
}

// ByteStats ...
type ByteStats struct {
	Sent     int64 `json:"sent"`
	Received int64 `json:"received"`
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

	txSend      int64
	txRecv      int64
	totalConns  int64
	activeConns int64

	connErrors  int64
	readErrors  int64
	writeErrors int64
	dialErrors  int64

	statChan chan listenerStat
}

type listenerStat struct {
	statType listenerStatType
	n        int64
}

type listenerStatType int

const (
	statTX listenerStatType = iota
	statRX
	statConn
	statConnError
	statReadError
	statWriteError
	statDialError
)

type lbInstance struct {
	port int
}

// New creates a new load balancer
func New() (LB, error) {
	return &lb{
		listeners: make(map[int]*lbListener),
	}, nil
}

func (lb *lb) Stats() LBStats {
	var totalRx, totalTx, activeConns, totalConns, connErrors, dialErrors, readErrors, writeErrors int64
	listeners := make(map[int]Stats)

	for port, ln := range lb.listeners {
		totalRx += ln.txRecv
		totalTx += ln.txSend
		activeConns += ln.activeConns
		totalConns += ln.totalConns
		connErrors += ln.connErrors
		dialErrors += ln.dialErrors
		readErrors += ln.readErrors
		writeErrors += ln.writeErrors

		listeners[port] = Stats{
			Connections:      ConnectionStats{ln.totalConns, ln.activeConns},
			Bytes:            ByteStats{ln.txSend, ln.txRecv},
			ConnectionErrors: ln.connErrors,
			DialErrors:       ln.dialErrors,
			WriteErrors:      ln.writeErrors,
			ReadErrors:       ln.readErrors,
			HealthyInstances: int64(len(ln.instances)),
		}
	}
	return LBStats{
		Connections:      ConnectionStats{totalConns, activeConns},
		Bytes:            ByteStats{totalTx, totalRx},
		Listeners:        listeners,
		ConnectionErrors: connErrors,
		DialErrors:       dialErrors,
		WriteErrors:      writeErrors,
		ReadErrors:       readErrors,
	}
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
	listener := &lbListener{l, port, make(map[string]struct{}, 0), new(sync.RWMutex), 0, 0, 0, 0, 0, 0, 0, 0, make(chan listenerStat, 500)}
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
	doneCh := make(chan struct{})
	go func() {
		for {
			select {
			case n := <-li.statChan:
				switch n.statType {
				case statRX:
					li.txRecv += n.n
				case statTX:
					li.txSend += n.n
				case statConn:
					li.activeConns += n.n
					if n.n > 0 {
						li.totalConns++
					}
				case statConnError:
					li.connErrors++
				case statReadError:
					li.readErrors++
				case statWriteError:
					li.writeErrors++
				case statDialError:
					li.dialErrors++
				}
			case <-doneCh:
				return
			}
		}
	}()

	for {
		lconn, err := li.Accept()
		if err != nil {
			log.Error(err, nil)
			li.statChan <- listenerStat{statConnError, 1}
			continue
		}

		li.statChan <- listenerStat{statConn, 1}

		li.mutex.RLock()
		instances := li.Instances()
		num := len(instances)
		if num < 1 {
			li.mutex.RUnlock()
			log.Debug("no healthy instances", nil)
			lconn.Close()
			li.statChan <- listenerStat{statConn, -1}
			return
		}

		n := rand.Intn(num)
		//log.Debug("instances", log.Data{"count": len(li.instances), "n": n, "instances": li.instances})
		dest := instances[n]
		li.mutex.RUnlock()

		rconn, err := net.DialTimeout("tcp", dest, time.Second*2)
		if err != nil {
			log.Error(err, nil)
			lconn.Close()
			li.statChan <- listenerStat{statConn, -1}
			li.statChan <- listenerStat{statDialError, 1}
			continue
		}

		go func() {
			defer lconn.Close()
			defer rconn.Close()
			defer func() {
				li.statChan <- listenerStat{statConn, -1}
			}()

			// TODO handle errors?
			var wg sync.WaitGroup
			var readErr, writeErr error

			wg.Add(2)
			go func() {
				defer wg.Done()
				writeErr = li.pipe(lconn, rconn)
			}()
			go func() {
				defer wg.Done()
				readErr = li.pipe(rconn, lconn)
			}()
			wg.Wait()

			if readErr != nil && readErr != io.EOF {
				log.Error(errors.New("load balancer read error"), log.Data{"reason": readErr})
			}
			if writeErr != nil && writeErr != io.EOF {
				log.Error(errors.New("load balancer write error"), log.Data{"reason": writeErr})
			}
		}()
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

func (li *lbListener) pipe(src, dst io.ReadWriter) error {
	//directional copy (64k buffer)
	buff := make([]byte, 0xffff)
	for {
		n, err := src.Read(buff)
		li.statChan <- listenerStat{statRX, int64(n)}
		if err != nil {
			if err != io.EOF {
				li.statChan <- listenerStat{statReadError, 1}
			}
			return err
		}
		b := buff[:n]

		//write out result
		n, err = dst.Write(b)
		li.statChan <- listenerStat{statTX, int64(n)}
		if err != nil {
			if err != io.EOF {
				li.statChan <- listenerStat{statWriteError, 1}
			}
			return err
		}
	}
}

func (li *lbInstance) Port() int {
	return li.port
}
