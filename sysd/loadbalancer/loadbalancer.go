package loadbalancer

import (
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net"
	"os"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/sysd/logger"
)

// LB is a load balancer
type LB interface {
	AddListener(port int) (Listener, error)
	StopListener(port int) error
	Stats() LBStats
	Log() []string
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
	logger    *lbLogger
	logDriver logger.Driver
}

type lbListener struct {
	net.Listener
	port      int
	instances map[string]struct{}
	mutex     *sync.RWMutex
	logger    *lbLogger

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

type lbInstance struct {
	port int
}

// New creates a new load balancer
func New(logDriver logger.Driver) (LB, error) {
	var logOutput bool
	if s := os.Getenv("PAASBOX_LB_LOG"); s == "y" || s == "1" {
		logOutput = true
	}

	return &lb{
		listeners: make(map[int]*lbListener),
		logger: &lbLogger{
			Messages:  make([]*lbLoggerMessage, 50000, 50000),
			Pos:       0,
			Limit:     50000,
			Log:       logOutput,
			logDriver: logDriver,
		},
		logDriver: logDriver,
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

func (lb *lb) Log() (output []string) {
	lb.logger.RWMutex.RLock()
	defer lb.logger.RWMutex.RUnlock()

	for i := lb.logger.Pos; i < lb.logger.Limit; i++ {
		if s := lb.logger.Messages[i]; s != nil {
			output = append(output, s.String())
		}
	}
	for i := 0; i < lb.logger.Pos; i++ {
		if s := lb.logger.Messages[i]; s != nil {
			output = append(output, s.String())
		}
	}

	return
}

func (lb *lb) AddListener(port int) (Listener, error) {
	lb.logger.Message("<loadbalancer>", "adding listener", log.Data{"port": port})

	if _, ok := lb.listeners[port]; ok {
		return nil, errors.New("port already in use")
	}
	l, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return nil, err
	}
	listener := &lbListener{l, port, make(map[string]struct{}, 0), new(sync.RWMutex), lb.logger, 0, 0, 0, 0, 0, 0, 0, 0, make(chan listenerStat, 500)}
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

func (li *lbListener) trackStats(doneCh chan struct{}) {
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
}

func (li *lbListener) start() {
	doneCh := make(chan struct{})
	go li.trackStats(doneCh)

	for {
		connID := uuid.New().String()

		lconn, err := li.Accept()
		if err != nil {
			li.logger.Error(err, nil, connID, "", nil)
			li.statChan <- listenerStat{statConnError, 1}
			continue
		}

		li.logger.Message(connID, "connection accepted", log.Data{"remote_addr": lconn.RemoteAddr(), "local_addr": lconn.LocalAddr()})
		li.statChan <- listenerStat{statConn, 1}

		li.mutex.RLock()
		instances := li.Instances()
		num := len(instances)
		if num < 1 {
			li.mutex.RUnlock()
			li.logger.Message(connID, "no healthy instances", nil)
			lconn.Close()
			li.statChan <- listenerStat{statConn, -1}
			continue
		}

		n := rand.Intn(num)
		li.logger.Message(connID, "instances", log.Data{"count": len(li.instances), "n": n, "instances": li.instances})
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

		li.logger.Message(connID, "connection opened", log.Data{"remote_addr": rconn.RemoteAddr(), "local_addr": rconn.LocalAddr()})

		go func() {
			defer lconn.Close()
			defer rconn.Close()
			defer func() {
				li.statChan <- listenerStat{statConn, -1}
				li.logger.Message(connID, "connection closed", log.Data{"remote_addr": lconn.RemoteAddr(), "local_addr": lconn.LocalAddr()})
			}()

			// TODO handle errors?
			var wg sync.WaitGroup
			var readErr, writeErr error
			wg.Add(2)

			go func() {
				defer wg.Done()
				writeErr = li.pipe(lconn, rconn)
				li.logger.Message(connID, "lconn->rconn pipe closed", log.Data{"error": writeErr})
			}()
			go func() {
				defer wg.Done()
				readErr = li.pipe(rconn, lconn)
				li.logger.Message(connID, "rconn->lconn pipe closed", log.Data{"error": readErr})
			}()

			wg.Wait()
			li.logger.Message(connID, "wait completed", nil)
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

func (li *lbListener) pipe(src, dst io.ReadWriteCloser) error {
	//directional copy (64k buffer)
	buff := make([]byte, 0xffff)
	for {
		n, err := src.Read(buff)
		li.statChan <- listenerStat{statRX, int64(n)}
		if err != nil {
			if err != io.EOF && err != io.ErrClosedPipe {
				li.statChan <- listenerStat{statReadError, 1}
			}
			dst.Close()
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
			src.Close()
			return err
		}
	}
}

func (li *lbInstance) Port() int {
	return li.port
}
