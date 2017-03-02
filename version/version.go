package version

import "fmt"

const (
	// Version is the version
	Version = "0.1.0-alpha"
	// BuildDate is the build date
<<<<<<< HEAD
	BuildDate = "2017-03-01 23:00"
=======
	BuildDate = "2017-03-02 13:13"
>>>>>>> master
)

// String returns a formatted version and build date string
func String() string {
	return fmt.Sprintf("%s (%s)", Version, BuildDate)
}
