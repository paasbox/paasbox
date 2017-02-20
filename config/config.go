package config

import "os"

// BindAddr is the bind address
var BindAddr = ":8080"

func init() {
	if v := os.Getenv("BIND_ADDR"); len(v) > 0 {
		BindAddr = v
	}
}
