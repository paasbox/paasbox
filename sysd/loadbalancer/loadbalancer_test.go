package loadbalancer

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"

	"github.com/facebookgo/freeport"
	. "github.com/smartystreets/goconvey/convey"
)

var servers []*http.Server

func newServer(port int) {
	s := &http.Server{
		Addr: fmt.Sprintf(":%d", port),
		Handler: http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			w.WriteHeader(200)
			w.Write([]byte(fmt.Sprintf("%d", port)))
		}),
	}
	servers = append(servers, s)
	go func() {
		err := s.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			panic(err)
		}
	}()
}

func stopServers() {
	for _, s := range servers {
		s.Shutdown(nil)
	}
	servers = []*http.Server{}
}

func TestLoadBalancer(t *testing.T) {
	defer stopServers()
	Convey("Load balancer", t, func() {
		p0, err := freeport.Get()
		So(err, ShouldBeNil)
		p1, err := freeport.Get()
		So(err, ShouldBeNil)
		p2, err := freeport.Get()
		So(err, ShouldBeNil)

		lb, err := New(nil)
		So(err, ShouldBeNil)
		So(lb, ShouldNotBeNil)

		listener, err := lb.AddListener(p0)
		So(err, ShouldBeNil)
		So(listener, ShouldNotBeNil)

		http.DefaultTransport.(*http.Transport).DisableKeepAlives = true

		newServer(p1)
		listener.AddInstances(fmt.Sprintf("127.0.0.1:%d", p1))
		res, err := http.Get(fmt.Sprintf(fmt.Sprintf("http://127.0.0.1:%d", p0)))
		So(err, ShouldBeNil)
		So(res, ShouldNotBeNil)
		So(res.StatusCode, ShouldEqual, 200)
		b, _ := ioutil.ReadAll(res.Body)
		res.Body.Close()
		So(string(b), ShouldEqual, fmt.Sprintf("%d", p1))

		newServer(p2)
		listener.AddInstances(fmt.Sprintf("127.0.0.1:%d", p2))
		ports := []string{fmt.Sprintf("%d", p1), fmt.Sprintf("%d", p2)}

		for i := 0; i < 10; i++ {
			res, err = http.Get(fmt.Sprintf("http://127.0.0.1:%d", p0))
			So(err, ShouldBeNil)
			So(res, ShouldNotBeNil)
			So(res.StatusCode, ShouldEqual, 200)
			b, _ = ioutil.ReadAll(res.Body)
			res.Body.Close()
			s := string(b)
			So(s, ShouldBeIn, ports)
		}
	})
}
