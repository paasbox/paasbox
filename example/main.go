// +build ignore

package main

import (
	"log"
	"time"
)

func main() {
	var i int
	for {
		time.Sleep(1 * time.Second)
		i++
		log.Printf("Incremented to %d", i)
	}
}
