package server

import (
	"net/http"

	"github.com/paasbox/paasbox/assets"
	"strings"
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

	w.Header().Set("Content-Type", http.DetectContentType(b))
	w.Write(b)
}
