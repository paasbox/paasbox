package state

import (
	"errors"

	"github.com/boltdb/bolt"
	"github.com/ian-kent/service.go/log"
)

var _ Storage = &boltDBStorage{}
var _ Store = &boltDBStore{}

type boltDBStorage struct {
	db *bolt.DB
}
type boltDBStore struct {
	storage *boltDBStorage
	prefix  string
}

// NewBoltDB ...
func NewBoltDB(file string) (Storage, error) {
	boltDB, err := bolt.Open(file, 0600, nil)
	if err != nil {
		return nil, err
	}
	return &boltDBStorage{boltDB}, nil
}

func (b *boltDBStorage) Wrap(name string) (Store, error) {
	log.Debug("boltdb: wrap", log.Data{"name": name})
	err := b.db.Update(func(arg1 *bolt.Tx) error {
		_, err := arg1.CreateBucketIfNotExists([]byte(name))
		return err
	})
	if err != nil {
		return nil, err
	}
	return &boltDBStore{b, name}, nil
}

func (b *boltDBStorage) Close() error {
	log.Debug("boltdb: close", nil)
	return b.db.Close()
}

func (b *boltDBStore) Get(key string) (s string, err error) {
	log.Debug("boltdb: get", log.Data{"prefix": b.prefix, "key": key})

	err = b.storage.db.View(func(arg1 *bolt.Tx) error {
		bucket := arg1.Bucket([]byte(b.prefix))

		b := bucket.Get([]byte(key))
		o := make([]byte, len(b))
		n := copy(o, b)
		log.Debug("boltdb: get", log.Data{"value": string(o)})
		if n != len(b) {
			return errors.New("error copying data")
		}
		s = string(o)
		return nil
	})

	return
}

func (b *boltDBStore) Set(key string, value string) (err error) {
	log.Debug("boltdb: set", log.Data{"prefix": b.prefix, "key": key, "value": value})

	err = b.storage.db.Update(func(arg1 *bolt.Tx) error {
		bucket := arg1.Bucket([]byte(b.prefix))
		return bucket.Put([]byte(key), []byte(value))
	})
	return
}

func (b *boltDBStore) Wrap(name string) (Store, error) {
	if len(b.prefix) > 0 {
		name = b.prefix + "/" + name
	}
	err := b.storage.db.Update(func(arg1 *bolt.Tx) error {
		_, err := arg1.CreateBucketIfNotExists([]byte(name))
		return err
	})
	if err != nil {
		return nil, err
	}
	return &boltDBStore{b.storage, name}, nil
}
