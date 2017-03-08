package version

import "fmt"

const (
	// Version is the version
	Version = "0.1.0-alpha"
	// BuildDate is the build date
	BuildDate = "2017-03-08 22:34"
)

// String returns a formatted version and build date string
func String() string {
	return fmt.Sprintf("%s (%s)", Version, BuildDate)
}
