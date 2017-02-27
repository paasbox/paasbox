package server

import (
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/websocket"
	"github.com/hpcloud/tail"
	"github.com/ian-kent/service.go/log"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func (s *srv) getInstanceStderr(w http.ResponseWriter, req *http.Request) {
	s.getInstanceLog("stderr", w, req)
}

func (s *srv) getInstanceStdout(w http.ResponseWriter, req *http.Request) {
	s.getInstanceLog("stdout", w, req)
}

func (s *srv) getInstanceLog(logType string, w http.ResponseWriter, req *http.Request) {
	var useWS bool
	if strings.HasSuffix(req.URL.Path, ".ws") {
		useWS = true
	}

	wsID := req.URL.Query().Get(":workspace_id")
	taskID := req.URL.Query().Get(":task_id")
	instanceID := req.URL.Query().Get(":instance_id")
	tailFile := strings.ToLower(req.URL.Query().Get("tail"))

	var isTail bool
	if tailFile == "y" || tailFile == "yes" || tailFile == "true" || tailFile == "1" {
		isTail = true
	}

	ws, ok := s.sysd.Workspace(wsID)
	if !ok {
		w.WriteHeader(404)
		return
	}

	task, ok := ws.Tasks()[taskID]
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

	var logFile string
	switch logType {
	case "stdout":
		logFile = i.Stdout()
	case "stderr":
		logFile = i.Stderr()
	default:
		panic("expected stdout/stderr, got " + logType)
	}

	if _, err = os.Stat(logFile); err != nil {
		w.WriteHeader(404)
		return
	}

	if isTail {
		var t *tail.Tail
		t, err = tail.TailFile(logFile, tail.Config{Follow: true})
		if err != nil {
			w.WriteHeader(500)
			log.ErrorR(req, err, nil)
			return
		}
		var flusher http.Flusher
		if f, ok := w.(http.Flusher); ok {
			flusher = f
		}

		if useWS {
			conn, err := upgrader.Upgrade(w, req, nil)
			if err != nil {
				w.WriteHeader(400)
				log.ErrorR(req, err, nil)
				return
			}
			for line := range t.Lines {
				err = conn.WriteMessage(websocket.TextMessage, []byte(line.Text))
				if err != nil {
					conn.Close()
				}
			}
			conn.Close()
			return
		}

		for line := range t.Lines {
			_, err = w.Write([]byte(line.Text + "\n"))
			if err != nil {
				t.Stop()
				break
			}
			if flusher != nil {
				flusher.Flush()
			}
		}

		return
	}

	b, err := ioutil.ReadFile(logFile)
	if err != nil {
		w.WriteHeader(500)
		log.ErrorR(req, err, nil)
		return
	}

	w.Write(b)
}
