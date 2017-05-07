package main

import (
	"os"

	"fmt"
	"runtime/pprof"

	"github.com/paasbox/paasbox/cmd"
	"github.com/paasbox/paasbox/sysd"
)

func main() {
	if v := os.Getenv("PAASBOX_PROFILE_CPU"); v == "1" || v == "y" {
		f, err := os.Create("cpu.pprof")
		if err != nil {
			fmt.Println("could not create CPU profile: ", err)
			os.Exit(1)
		}
		if err := pprof.StartCPUProfile(f); err != nil {
			fmt.Println("could not start CPU profile: ", err)
			os.Exit(1)
		}
		defer func() {
			fmt.Println("Stopping CPU profile!")
			pprof.StopCPUProfile()
		}()
	}
	cmd.New(cmd.Hooks{
		//"stop": sysd.Stop,
		"update": sysd.Update,
	}).Start(sysd.Start)
}
