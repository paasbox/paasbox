package state

var _ Storage = &MockStorage{}
var _ Store = &MockStore{}

// MockStorage ...
type MockStorage struct {
	Get func(key string) string
	Set func(key, value string)
}

// MockStore ...
type MockStore struct {
	Storage *MockStorage
	Prefix  string
}

// NewMock ...
func NewMock(get func(key string) string, set func(key, value string)) *MockStorage {
	return &MockStorage{get, set}
}

// Wrap ...
func (m *MockStorage) Wrap(name string) (Store, error) {
	return &MockStore{m, name}, nil
}

// Close ...
func (m *MockStorage) Close() error {
	return nil
}

// Get ...
func (m *MockStore) Get(key string) (s string, err error) {
	s = m.Storage.Get(key)
	return
}

// Set ...
func (m *MockStore) Set(key string, value string) (err error) {
	m.Storage.Set(key, value)
	return
}

// Wrap ...
func (m *MockStore) Wrap(name string) (Store, error) {
	if len(m.Prefix) > 0 {
		name = m.Prefix + "/" + name
	}
	return &MockStore{m.Storage, name}, nil
}
