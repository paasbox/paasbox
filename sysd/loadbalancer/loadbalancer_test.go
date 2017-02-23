package loadbalancer

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"

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
		lb, err := New()
		So(err, ShouldBeNil)
		So(lb, ShouldNotBeNil)

		listener, err := lb.AddListener(9000)
		So(err, ShouldBeNil)
		So(listener, ShouldNotBeNil)

		http.DefaultTransport.(*http.Transport).DisableKeepAlives = true

		newServer(10000)
		listener.AddInstance(NewInstance(10000))
		res, err := http.Get(fmt.Sprintf("http://127.0.0.1:9000"))
		So(err, ShouldBeNil)
		So(res, ShouldNotBeNil)
		So(res.StatusCode, ShouldEqual, 200)
		b, _ := ioutil.ReadAll(res.Body)
		res.Body.Close()
		So(string(b), ShouldEqual, "10000")

		newServer(10001)
		listener.AddInstance(NewInstance(10001))

		for i := 0; i < 10; i++ {
			res, err = http.Get(fmt.Sprintf("http://127.0.0.1:9000"))
			So(err, ShouldBeNil)
			So(res, ShouldNotBeNil)
			So(res.StatusCode, ShouldEqual, 200)
			b, _ = ioutil.ReadAll(res.Body)
			res.Body.Close()
			s := string(b)
			So(s, ShouldBeIn, []string{"10000", "10001"})
		}
	})
}
