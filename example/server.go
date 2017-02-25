package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	addr := os.Getenv("BIND_ADDR")
	instanceID := os.Getenv("PAASBOX_INSTANCEID")
	if err := http.ListenAndServe(addr, http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.Write([]byte(instanceID))
	})); err != nil {
		log.Fatal(err)
	}
}
