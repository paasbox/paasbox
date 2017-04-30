package lockwarn

import (
	"fmt"
	"runtime"
	"time"

	"github.com/ian-kent/service.go/log"
)

// Notify ...
func Notify() chan struct{} {
	c := make(chan struct{})
	t := time.NewTicker(time.Second * 5)
	_, f, l, _ := runtime.Caller(1)

	go func() {
		var done bool
		for {
			if done {
				t.Stop()
				break
			}
			select {
			case <-c:
				done = true
			case <-t.C:
				log.Debug(fmt.Sprintf("LockWarn => %s:%d", f, l), nil)
			}
		}
	}()

	return c
}
