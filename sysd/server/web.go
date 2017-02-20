package server

import (
	"net/http"

	"github.com/paasbox/paasbox/assets"
)

func (s *srv) home(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	b, _ := assets.Asset("templates/index.tmpl")
	w.Write(b)
}
