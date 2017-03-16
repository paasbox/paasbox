package server

import (
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"fmt"
	"strconv"

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
	/*
		TODO

		Finish implementing range/offset, but its currently wrong

		In normal 'download' mode, default is to return the entire file,
		controlled by Range header

		In tail mode, default should be to get last few thousand bytes of the file,
		unless its overridden by query string. offset/length sort of works, but need
		a way to specify "last n bytes" - maybe do similar to how `tail -f` works?
	*/

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

	w.Header().Set("Accept-Ranges", "bytes")

	var offset, end int64 = -1, -1

	if r := req.Header.Get("Range"); len(r) > 0 {
		p := strings.SplitN(r, "-", 2)
		i, err := strconv.ParseInt(p[0], 10, 64)
		if err != nil {
			w.WriteHeader(400)
			w.Write([]byte(fmt.Sprintf("invalid range header: %s", err)))
			return
		}
		offset = i
		if len(p) > 1 && len(p[1]) > 0 {
			i, err := strconv.ParseInt(p[1], 10, 64)
			if err != nil {
				w.WriteHeader(400)
				w.Write([]byte(fmt.Sprintf("invalid range header (end): %s", err)))
				return
			}
			end = i
		}
	} else if r := req.URL.Query().Get("offset"); len(r) > 0 {
		i, err := strconv.ParseInt(r, 10, 64)
		if err != nil {
			w.WriteHeader(400)
			w.Write([]byte(fmt.Sprintf("invalid offset parameter: %s", err)))
			return
		}
		offset = i
		if s := req.URL.Query().Get("length"); len(s) > 0 {
			i, err := strconv.ParseInt(r, 10, 64)
			if err != nil {
				w.WriteHeader(400)
				w.Write([]byte(fmt.Sprintf("invalid length parameter: %s", err)))
				return
			}
			end = offset + i
		}
	}

	if isTail {
		var t *tail.Tail
		wh := os.SEEK_END
		if offset > -1 {
			wh = os.SEEK_SET
		} else {
			offset = -1024
		}
		t, err = tail.TailFile(logFile, tail.Config{Follow: true, Location: &tail.SeekInfo{Offset: offset, Whence: wh}})
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
			log.DebugR(req, "upgrading connection to websocket", nil)
			conn, err := upgrader.Upgrade(w, req, nil)
			if err != nil {
				w.WriteHeader(400)
				log.ErrorR(req, err, nil)
				return
			}

			log.DebugR(req, "beginning range over lines", nil)
			for line := range t.Lines {
				err = conn.WriteMessage(websocket.TextMessage, []byte(line.Text))
				if err != nil {
					log.ErrorR(req, err, nil)
					err := t.Stop()
					if err != nil {
						log.ErrorR(req, err, nil)
					}
					//t.Cleanup()
					break
				}
				if end > -1 {
					if o, err := t.Tell(); err != nil && o > end {
						log.DebugR(req, "stopping tail, end exceeded", nil)
						err := t.Stop()
						if err != nil {
							log.ErrorR(req, err, nil)
						}
						//t.Cleanup()
						break
					}
				}
			}

			err = t.Stop()
			if err != nil {
				log.ErrorR(req, err, nil)
			}
			//t.Cleanup()

			conn.Close()
			return
		}

		log.DebugR(req, "beginning range over lines", nil)

		for line := range t.Lines {
			_, err = w.Write([]byte(line.Text + "\n"))
			if err != nil {
				log.ErrorR(req, err, nil)
				err := t.Stop()
				if err != nil {
					log.ErrorR(req, err, nil)
				}
				//t.Cleanup()
				break
			}
			if flusher != nil {
				flusher.Flush()
			}
		}

		err := t.Stop()
		if err != nil {
			log.ErrorR(req, err, nil)
		}
		//t.Cleanup()

		return
	}

	log.DebugR(req, "reading file from disk", nil)

	// TODO handle range values

	b, err := ioutil.ReadFile(logFile)
	if err != nil {
		w.WriteHeader(500)
		log.ErrorR(req, err, nil)
		return
	}

	w.Write(b)
}
