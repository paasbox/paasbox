package server

import (
	"io"
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
	CheckOrigin: func(req *http.Request) bool {
		return true
	},
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

	wsID := req.URL.Query().Get(":stack_id")
	taskID := req.URL.Query().Get(":task_id")
	instanceID := req.URL.Query().Get(":instance_id")
	tailFile := strings.ToLower(req.URL.Query().Get("tail"))

	var isTail bool
	if tailFile == "y" || tailFile == "yes" || tailFile == "true" || tailFile == "1" {
		isTail = true
	}

	ws, ok := s.sysd.Stack(wsID)
	if !ok {
		w.WriteHeader(404)
		return
	}

	task, ok := ws.Task(taskID)
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

		stat, err := os.Stat(logFile)
		if err != nil {
			log.ErrorR(req, err, nil)
			w.WriteHeader(404)
			return
		}

		wh := os.SEEK_END
		if offset > -1 {
			wh = os.SEEK_SET
		} else {
			offset = -1024
			if stat.Size() < 1024 {
				offset = -stat.Size()
			}
		}

		t, err = s.tailMap.get(logFile, offset, wh)
		defer s.tailMap.done(logFile, t)

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
				// dont WriteHeader here, upgrader.Upgrade does it for us including on error
				log.ErrorR(req, err, nil)
				return
			}

			defer conn.Close()

			go func() {
				for {
					if _, _, err := conn.NextReader(); err != nil {
						conn.Close()
						break
					}
				}
			}()

			log.DebugR(req, "beginning range over lines", nil)
			firstLine := true
			for line := range t.Lines {
				if firstLine {
					offset, err := t.Tell()
					if err != nil {
						// FIXME logging error but silently ignoring
						// not sure what ideal behaviour is here, log tailing will still work, but
						// offset data for back scroll won't be available
						log.ErrorR(req, err, nil)
					} else {
						err = conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("Offset: %d", offset)))
						if err != nil {
							log.ErrorR(req, err, nil)
							return
						}
					}
					firstLine = false
				}
				err = conn.WriteMessage(websocket.TextMessage, []byte(line.Text))
				if err != nil {
					log.ErrorR(req, err, nil)
					break
				}
				// FIXME does this even make sense? why would we limit tail output on the server side,
				// when the client can just close the connection?
				if end > -1 {
					// FIXME this isn't 100% reliable (see https://godoc.org/github.com/hpcloud/tail docs)
					if o, err := t.Tell(); err != nil && o > end {
						log.DebugR(req, "stopping tail, end exceeded", nil)
						break
					}
				}
			}

			return
		}

		log.DebugR(req, "beginning range over lines", nil)

		for line := range t.Lines {
			_, err = w.Write([]byte(line.Text + "\n"))
			if err != nil {
				log.ErrorR(req, err, nil)
				break
			}
			if flusher != nil {
				flusher.Flush()
			}
		}

		return
	}

	log.DebugR(req, "reading file from disk", nil)
	var size int64 = -1

	if offset > -1 || end > -1 {
		stat, err := os.Stat(logFile)
		if err != nil {
			log.ErrorR(req, err, nil)
			w.WriteHeader(404)
			return
		}
		if (offset > -1 && offset > stat.Size()) || (end > -1 && end > stat.Size()) {
			w.WriteHeader(http.StatusRequestedRangeNotSatisfiable)
			return
		}
		size = stat.Size()
		if end == -1 {
			end = size
		}
	}

	lf, err := os.OpenFile(logFile, os.O_RDONLY, 0)
	if err != nil {
		log.ErrorR(req, err, nil)
		w.WriteHeader(404)
		return
	}
	defer lf.Close()

	if offset > -1 || end > -1 {
		_, err = lf.Seek(offset, os.SEEK_SET)
		if err != nil {
			log.ErrorR(req, err, nil)
			w.WriteHeader(500)
			return
		}

		var rng string
		if offset > -1 {
			rng += fmt.Sprintf("%d-", offset)
		}
		if end > -1 {
			if offset == -1 {
				rng += "-"
			}
			rng += fmt.Sprintf("%d", end)
		}
		if size > -1 {
			rng += fmt.Sprintf("/%d", size)
		}

		w.Header().Set("Content-Range", rng)
		w.WriteHeader(http.StatusPartialContent)
	}

	if end > -1 {
		_, err = io.CopyN(w, lf, end-offset)
	} else {
		_, err = io.Copy(w, lf)
	}

	if err != nil && err != io.EOF {
		log.ErrorR(req, err, nil)
	}
}
