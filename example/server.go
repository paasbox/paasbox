// +build ignore

package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
)

func main() {
	addr := os.Getenv("BIND_ADDR")
	instanceID := os.Getenv("PAASBOX_INSTANCEID")
	i, _ := strconv.Atoi(instanceID)
	var broken bool
	if i%2 == 0 {
		broken = true
	}
	if err := http.ListenAndServe(addr, http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if broken {
			w.WriteHeader(500)
		}
		w.Write([]byte(instanceID))
	})); err != nil {
		log.Fatal(err)
	}
}
