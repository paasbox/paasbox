package server

import (
	"net/http"
	"strings"

	"github.com/paasbox/paasbox/assets"
)

func (s *srv) home(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	b, _ := assets.Asset("templates/index.tmpl")
	w.Write(b)
}

func (s *srv) staticFiles(w http.ResponseWriter, req *http.Request) {
	b, err := assets.Asset(strings.TrimPrefix(req.URL.Path, "/"))
	if err != nil {
		w.WriteHeader(404)
		return
	}

	var contentType string
	if strings.HasSuffix(req.URL.Path, ".css") {
		contentType = "text/css"
	} else {
		contentType = http.DetectContentType(b)
	}

	w.Header().Set("Content-Type", contentType)
	w.Write(b)
}
