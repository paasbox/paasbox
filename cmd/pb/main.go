package main

import (
	"github.com/paasbox/paasbox/cmd"
	"github.com/paasbox/paasbox/sysd"
)

func main() {
	cmd.New(cmd.Hooks{
	//"stop": sysd.Stop,
	}).Start(sysd.Start)
}
