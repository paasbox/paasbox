package loadbalancer

import (
	"fmt"
	"github.com/ian-kent/service.go/log"
	"sync"
	"time"
)

type lbLogger struct {
	Messages []*lbLoggerMessage
	Limit    int
	Pos      int
	RWMutex  sync.RWMutex
	Log      bool
}

type lbLoggerMessage struct {
	Date    time.Time
	ConnID  string
	Message string
	Data    log.Data
}

func (l *lbLogger) Message(connID, message string, data log.Data) {
	m := &lbLoggerMessage{Date: time.Now(), ConnID: connID, Message: message, Data: data}

	l.RWMutex.Lock()
	defer l.RWMutex.Unlock()

	l.Pos++
	if l.Pos >= l.Limit {
		l.Pos = 0
	}

	if l.Log {
		log.DebugC(connID, message, data)
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
