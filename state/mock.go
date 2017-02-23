package state

import (
	"encoding/json"
	"fmt"
	"strconv"
)

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

// GetInt ...
func (m *MockStore) GetInt(key string) (i int, err error) {
	s, err := m.Get(key)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(s)
}

// SetInt ...
func (m *MockStore) SetInt(key string, value int) (err error) {
	return m.Set(key, fmt.Sprintf("%d", value))
}

// GetArray ...
func (m *MockStore) GetArray(key string) (s []string, err error) {
	err = json.Unmarshal([]byte(m.Storage.Get(key)), &s)
	return
}

// SetArray ...
func (m *MockStore) SetArray(key string, value []string) (err error) {
	v, err := json.Marshal(&value)
	if err != nil {
		return err
	}
	m.Storage.Set(key, string(v))
	return
}

// GetIntArray ...
func (m *MockStore) GetIntArray(key string) (s []int, err error) {
	err = json.Unmarshal([]byte(m.Storage.Get(key)), &s)
	return
}

// SetIntArray ...
func (m *MockStore) SetIntArray(key string, value []int) (err error) {
	v, err := json.Marshal(&value)
	if err != nil {
		return err
	}
	m.Storage.Set(key, string(v))
	return
}

// Wrap ...
func (m *MockStore) Wrap(name string) (Store, error) {
	if len(m.Prefix) > 0 {
		name = m.Prefix + "/" + name
	}
	return &MockStore{m.Storage, name}, nil
}
