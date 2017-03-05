// +build ignore

package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"time"
)

type logOutput struct {
	Namespace string        `json:"namespace"`
	Duration  time.Duration `json:"duration,omitempty"`
	Message   string        `json:"message,omitempty"`
}

func main() {
	appName := "elk-app"
	if len(os.Args) > 1 {
		appName = os.Args[1]
	}

	b, _ := json.Marshal(&logOutput{appName, 0, "Started " + appName})
	fmt.Println(string(b))

	var duration time.Duration
	for {
		time.Sleep(duration)
		duration = time.Millisecond * time.Duration(rand.Intn(250))
		b, _ := json.Marshal(&logOutput{appName, duration, ""})
		fmt.Println(string(b))
	}
}
