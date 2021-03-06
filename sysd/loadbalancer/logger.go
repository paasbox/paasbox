package loadbalancer

import (
	"fmt"
	"sync"
	"time"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/sysd/logger"
	"github.com/paasbox/paasbox/sysd/util/lockwarn"
)

type lbLogger struct {
	logDriver logger.Driver
	Messages  []*lbLoggerMessage
	Limit     int
	Pos       int
	RWMutex   sync.RWMutex
	Log       bool
}

type lbLoggerMessage struct {
	Date    time.Time
	ConnID  string
	Message string
	Data    log.Data
}

func (l *lbLogger) Message(connID, message string, data log.Data) {
	m := &lbLoggerMessage{Date: time.Now(), ConnID: connID, Message: message, Data: data}

	c := lockwarn.Notify()
	l.RWMutex.Lock()
	close(c)
	defer l.RWMutex.Unlock()

	l.Pos++
	if l.Pos >= l.Limit {
		l.Pos = 0
	}

	if l.Log {
		log.DebugC(connID, message, data)
	}
	if l.logDriver != nil {
		l.logDriver.SendPBMessage(logger.PBMessage{"loadbalancer", connID, message, data})
	}

	l.Messages[l.Pos] = m
}

func (l *lbLogger) Error(err, reason error, connID, message string, data log.Data) {
	if data == nil {
		data = log.Data{}
	}
	data["error"] = err
	data["reason"] = reason
	l.Message(connID, message, data)
}

func (m *lbLoggerMessage) String() string {
	return fmt.Sprintf("%s [%s] %s: %+v", m.Date, m.ConnID, m.Message, m.Data)
}
