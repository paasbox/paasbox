package config

import (
	"os"
	"os/exec"
)

// BindAddr is the bind address
var BindAddr = ":8080"

// HasDocker is true if docker is available
var HasDocker bool

// DockerPath is the path to docker
var DockerPath string

func init() {
	if v := os.Getenv("BIND_ADDR"); len(v) > 0 {
		BindAddr = v
	}

	s, err := exec.LookPath("docker")
	if err == nil {
		HasDocker = true
		DockerPath = s
	}
}
