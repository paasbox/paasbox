package state

// Storage ...
type Storage interface {
	Wrap(name string) (Store, error)
	Close() error
}

// Store ...
type Store interface {
	Get(name string) (string, error)
	Set(name string, value string) error

	GetInt(name string) (int, error)
	SetInt(name string, value int) error

	GetArray(name string) ([]string, error)
	SetArray(name string, value []string) error

	GetIntArray(name string) ([]int, error)
	SetIntArray(name string, value []int) error

	Wrap(name string) (Store, error)
}
