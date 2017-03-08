package logger

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"io/ioutil"
	"net/http"
	"sync"
	"time"

	"strings"

	"github.com/ian-kent/service.go/log"
)

var cli = &http.Client{
	Timeout: time.Second * 2,
}

// Driver ...
type Driver interface {
	Start() error
	Stop() error
	SendAppMessage(AppMessage)
	SendPBMessage(PBMessage)
}

type logstashDriver struct {
	host              string
	messageBufferSize int
	wg                *sync.WaitGroup
	appMessages       chan AppMessage
	pbMessages        chan PBMessage
}

var _ Driver = &logstashDriver{}

type AppMessage struct {
	WorkspaceID string
	TaskID      string
	InstanceID  string
	Fd          string
	Message     string
}

type PBMessage struct {
	Namespace string
	Context   string
	Event     string
	Data      log.Data
}

// NewDriver ...
func NewDriver(config string) (Driver, error) {
	args := strings.SplitN(config, "@", 2)
	if len(args) < 2 {
		return nil, errors.New("invalid config format, expected `driver@dest`")
	}

	switch args[0] {
	case "logstash":
		return NewLogstashDriver(args[1], 100, 500000), nil
	default:
		return nil, errors.New("unknown driver")

	}
}

// NewLogstashDriver ...
func NewLogstashDriver(host string, bufferSize, pbBufferSize int) Driver {
	return &logstashDriver{host, bufferSize, new(sync.WaitGroup), make(chan AppMessage, bufferSize), make(chan PBMessage, pbBufferSize)}
}

func (l *logstashDriver) SendAppMessage(m AppMessage) {
	// FIXME nicer way of preventing panic on shutdown
	defer func() {
		recover()
	}()
	l.appMessages <- m
}

func (l *logstashDriver) SendPBMessage(m PBMessage) {
	// FIXME nicer way of preventing panic on shutdown
	defer func() {
		recover()
	}()

	// FIXME manually buffer instead of relying on channel, no way to drop messages
	// and this will block PB execution until it can deliver messages
	l.pbMessages <- m
}

func (l *logstashDriver) Start() error {
	l.wg.Add(1)
	go func() {
		defer l.wg.Done()
		/*
			TODO: find a way to eventually abandon this loop if elasticsearch isn't available?
			reminder:
			 - can't use doneCh (might abandon tailing a recently terminated process without consuming all the logs)
			 - can't count retries (either elasticsearch is there or it isn't, no point moving to next message)
		*/
		var err error
		var backoff time.Duration
		for {
			//if appMessages == nil {
			//	break
			//}
			select {
			case m := <-l.appMessages:
				for {
					err = l.sendAppLine(m)
					if err == nil {
						backoff = 0
						break
					}
					time.Sleep(backoff)
					if backoff == 0 {
						backoff = time.Millisecond * 100
					} else {
						backoff *= 2
					}
					if backoff > time.Second*5 {
						backoff = time.Second * 5
					}
				}
			case m := <-l.pbMessages:
				for {
					err = l.sendPBLine(m)
					if err == nil {
						backoff = 0
						break
					}
					time.Sleep(backoff)
					if backoff == 0 {
						backoff = time.Millisecond * 100
					} else {
						backoff *= 2
					}
					if backoff > time.Second*5 {
						backoff = time.Second * 5
					}
				}
			}
		}
	}()
	return nil
}

func (l *logstashDriver) Stop() error {
	close(l.appMessages)
	close(l.pbMessages)
	l.wg.Wait()
	return nil
}

func (l *logstashDriver) sendAppLine(m AppMessage) error {
	data := map[string]interface{}{
		"paasbox": map[string]interface{}{
			"workspace_id": m.WorkspaceID,
			"task_id":      m.TaskID,
			"instance_id":  m.InstanceID,
			"Fd":           m.Fd,
		},
	}

	var kv map[string]interface{}
	if err := json.Unmarshal([]byte(m.Message), &kv); err == nil {
		for k, v := range kv {
			data[k] = v
		}
	} else {
		data["message"] = m.Message
	}

	return l.send(data)
}

func (l *logstashDriver) sendPBLine(m PBMessage) error {
	data := make(map[string]interface{})
	if m.Data != nil {
		data = m.Data
	}
	data["paasbox"] = map[string]interface{}{
		"namespace": m.Namespace,
		"context":   m.Context,
	}
	data["event"] = m.Event

	return l.send(data)
}

func (l *logstashDriver) send(data map[string]interface{}) error {
	b, err := json.Marshal(&data)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", l.host, bytes.NewReader(b))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	res, err := cli.Do(req)
	if err != nil {
		return err
	}

	defer res.Body.Close()
	defer io.Copy(ioutil.Discard, res.Body)

	if res.StatusCode != 200 {
		b, err := ioutil.ReadAll(res.Body)
		var logText string
		if err != nil {
			logText = "<" + err.Error() + ">"
		} else {
			logText = string(b)
		}
		log.Error(errors.New("unexpected status code storing log data"), log.Data{"code": res.StatusCode, "message": logText})
		return errors.New("unexpected status code")
	}

	return nil
}
