package state

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/boltdb/bolt"
	"github.com/ian-kent/service.go/log"
)

var _ Storage = &boltDBStorage{}
var _ Store = &boltDBStore{}

var debug bool

func init() {
	if s := os.Getenv("PB_DEBUG"); s == "y" || s == "1" {
		debug = true
	}
}

type boltDBStorage struct {
	db *bolt.DB
}
type boltDBStore struct {
	storage *boltDBStorage
	prefix  string
}

// NewBoltDB ...
func NewBoltDB(file string) (Storage, error) {
	boltDB, err := bolt.Open(file, 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, err
	}
	return &boltDBStorage{boltDB}, nil
}

func (b *boltDBStorage) Wrap(name string) (Store, error) {
	if debug {
		log.Debug("boltdb: wrap", log.Data{"name": name})
	}
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
	if debug {
		log.Debug("boltdb: close", nil)
	}
	return b.db.Close()
}

func (b *boltDBStore) Get(key string) (s string, err error) {
	if debug {
		log.Debug("boltdb: get", log.Data{"prefix": b.prefix, "key": key})
	}

	err = b.storage.db.View(func(arg1 *bolt.Tx) error {
		bucket := arg1.Bucket([]byte(b.prefix))

		b := bucket.Get([]byte(key))
		o := make([]byte, len(b))
		n := copy(o, b)
		if debug {
			log.Debug("boltdb: get", log.Data{"value": string(o)})
		}
		if n != len(b) {
			return errors.New("error copying data")
		}
		s = string(o)
		return nil
	})

	return
}

func (b *boltDBStore) GetArray(key string) (s []string, err error) {
	if debug {
		log.Debug("boltdb: getArray", log.Data{"prefix": b.prefix, "key": key})
	}

	var v string
	v, err = b.Get(key)
	if err != nil {
		return
	}

	err = json.Unmarshal([]byte(v), &s)
	return
}

func (b *boltDBStore) GetIntArray(key string) (s []int, err error) {
	if debug {
		log.Debug("boltdb: getIntArray", log.Data{"prefix": b.prefix, "key": key})
	}

	var v string
	v, err = b.Get(key)
	if err != nil {
		return
	}

	err = json.Unmarshal([]byte(v), &s)
	return
}

func (b *boltDBStore) Set(key string, value string) (err error) {
	if debug {
		log.Debug("boltdb: set", log.Data{"prefix": b.prefix, "key": key, "value": value})
	}

	err = b.storage.db.Update(func(arg1 *bolt.Tx) error {
		bucket := arg1.Bucket([]byte(b.prefix))
		return bucket.Put([]byte(key), []byte(value))
	})
	return
}

func (b *boltDBStore) GetInt(key string) (i int, err error) {
	s, err := b.Get(key)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(s)
}

func (b *boltDBStore) SetInt(key string, value int) (err error) {
	return b.Set(key, fmt.Sprintf("%d", value))
}

func (b *boltDBStore) SetArray(key string, value []string) (err error) {
	if debug {
		log.Debug("boltdb: setArray", log.Data{"prefix": b.prefix, "key": key, "value": value})
	}

	var d []byte
	d, err = json.Marshal(&value)
	if err != nil {
		return
	}

	return b.Set(key, string(d))
}

func (b *boltDBStore) SetIntArray(key string, value []int) (err error) {
	if debug {
		log.Debug("boltdb: setIntArray", log.Data{"prefix": b.prefix, "key": key, "value": value})
	}

	var d []byte
	d, err = json.Marshal(&value)
	if err != nil {
		return
	}

	return b.Set(key, string(d))
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
