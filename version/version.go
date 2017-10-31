package version

import "fmt"

const (
	// Version is the version
	Version = "0.1.0-alpha"
	// BuildDate is the build date
	BuildDate = "2017-10-31 22:53"
)

// String returns a formatted version and build date string
func String() string {
	return fmt.Sprintf("%s (%s)", Version, BuildDate)
}
