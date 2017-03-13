// +build ignore

package main

import (
	"fmt"
	"os"
	"time"
)

func main() {
	var i int
	var flip bool
	for {
		time.Sleep(1 * time.Second)
		i++
		if flip {
			fmt.Fprintf(os.Stdout, "Incremented to %d\n", i)
		} else {
			fmt.Fprintf(os.Stderr, "Incremented to %d\n", i)
		}
		flip = !flip
	}
}
