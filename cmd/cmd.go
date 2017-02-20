package cmd

import (
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/mailhog/mh2/version"
)

// Hooks ...
type Hooks map[string]func(chan struct{})

// App ...
type App interface {
	Start(f func(chan struct{}))
}

type app struct {
	hooks map[string]func(chan struct{})
}

// New ...
func New(hooks map[string]func(chan struct{})) App {
	return &app{hooks}
}

// Start starts the app, calling `f` if no default/hooked commands are matched
func (a *app) Start(f func(chan struct{})) {
	sigs := make(chan os.Signal, 1)
	exitCh := make(chan struct{})
	go func() {
		<-sigs
		close(exitCh)
	}()
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	if len(os.Args) > 1 {
		switch strings.ToLower(os.Args[1]) {
		case "version":
			fmt.Fprintf(os.Stderr, "%s (%s)\n", version.Version, version.BuildDate)
			os.Exit(0)
			return
		default:
			if a.hooks != nil {
				if h, ok := a.hooks[strings.ToLower(os.Args[1])]; ok {
					os.Args = os.Args[1:]
					h(exitCh)
					return
				}
			}
		}
	}

	f(exitCh)
}
