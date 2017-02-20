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
	Wrap(name string) (Store, error)
}
