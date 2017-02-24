package env

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

type test struct {
	val    string
	env    []string
	result string
}

var tests = []test{
	{"Test", []string{}, "Test"},
	{"$PORT", []string{"PORT=1000"}, "1000"},
	{"Use $PORT?", []string{"PORT=1000"}, "Use 1000?"},
	{"$PORT0 $PORT1", []string{"PORT0=1000", "PORT1=2000"}, "1000 2000"},
	{"$PORT0$PORT1", []string{"PORT0=1000", "PORT1=2000"}, "10002000"},
	{"Test $PORT0, Test $PORT1", []string{"PORT0=1000", "PORT1=2000"}, "Test 1000, Test 2000"},
	{"Test $PORT0, $PORT2, Test $PORT1", []string{"PORT0=1000", "PORT1=2000"}, "Test 1000, $PORT2, Test 2000"},
}

func TestReplace(t *testing.T) {
	Convey("Replace", t, func() {
		for _, t := range tests {
			res := Replace(t.val, t.env)
			So(res, ShouldEqual, t.result)
		}
	})
}
