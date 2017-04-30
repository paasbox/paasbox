package task

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"strings"
	"sync"
	"time"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/sysd/util/lockwarn"
)

var _ InstanceHealth = &taskInstanceTracker{}

// Healthcheck ...
type Healthcheck interface {
	Type() string
	Target() string
	HealthyThreshold() int
	UnhealthyThreshold() int
	ReapThreshold() int
	Frequency() time.Duration
	Instances() []InstanceHealth
}

// InstanceHealth ...
type InstanceHealth interface {
	ID() string
	Healthy() bool
	Score() int
}

// HealthcheckConfig ...
type HealthcheckConfig struct {
	Type               string `json:"type"`
	Target             string `json:"target"`
	HealthyThreshold   int    `json:"healthy_threshold"`
	UnhealthyThreshold int    `json:"unhealthy_threshold"`
	ReapThreshold      int    `json:"reap_threshold"`
	Frequency          string `json:"frequency"`
}

type taskHealthcheck struct {
	task               *task
	_type              string
	target             string
	healthyThreshold   int
	unhealthyThreshold int
	reapThreshold      int
	frequency          time.Duration
	tracker            map[Instance]*taskInstanceTracker
}

func (t *taskHealthcheck) Type() string {
	return t._type
}

func (t *taskHealthcheck) Target() string {
	return t.target
}

func (t *taskHealthcheck) HealthyThreshold() int {
	return t.healthyThreshold
}

func (t *taskHealthcheck) UnhealthyThreshold() int {
	return t.unhealthyThreshold
}

func (t *taskHealthcheck) ReapThreshold() int {
	return t.reapThreshold
}

func (t *taskHealthcheck) Frequency() time.Duration {
	return t.frequency
}

func (t *taskHealthcheck) Instances() (res []InstanceHealth) {
	for _, t := range t.tracker {
		res = append(res, t)
	}
	return
}

type taskInstanceTracker struct {
	instance Instance
	score    int
	healthy  bool
}

func (t *taskInstanceTracker) ID() string {
	return t.instance.ID()
}

func (t *taskInstanceTracker) Healthy() bool {
	return t.healthy
}

func (t *taskInstanceTracker) Score() int {
	return t.score
}

func (t *taskHealthcheck) Start() {
	t.tracker = make(map[Instance]*taskInstanceTracker)
	mtx := new(sync.Mutex)
	go func() {
		ticker := time.NewTicker(t.frequency)
		for {
			select {
			case <-ticker.C:
				for _, i := range t.task.instances {
					if _, ok := t.tracker[i.instance]; !ok {
						c := lockwarn.Notify()
						mtx.Lock()
						close(c)
						if _, ok := t.tracker[i.instance]; !ok {
							t.tracker[i.instance] = &taskInstanceTracker{i.instance, 0, true}
						}
						mtx.Unlock()
					}
					go func(i taskInstance) {
						c := lockwarn.Notify()
						mtx.Lock()
						close(c)
						defer mtx.Unlock()
						track := t.tracker[i.instance]

						t.task.log("running healthcheck", log.Data{"instance_id": i.instance.ID(), "score": t.tracker[i.instance]})
						healthy := t.Run(i.instance)
						if healthy && !track.healthy {
							if track.score < 0 {
								track.score = 0
							}
							track.score++
						} else if !healthy {
							track.score--
						}
						if track.healthy && track.score == 0-t.unhealthyThreshold {
							track.healthy = false
							err := t.task.removeInstanceFromLB(i.instance)
							if err != nil {
								t.task.error(errors.New("error removing instance from load balancer"), err, nil)
							}
						} else {
							if track.score == 0-t.reapThreshold {
								t.task.log("reaping instance", log.Data{"instance_id": i.instance.ID()})
								delete(t.tracker, i.instance)
								err := i.instance.Stop()
								if err != nil {
									t.task.error(errors.New("error stopping instance"), err, log.Data{"instance_id": i.instance.ID()})
								}
							} else if track.score >= t.healthyThreshold {
								track.healthy = true
								track.score = 0
								healthy := true
								for _, h := range t.task.healthchecks {
									if !h.tracker[i.instance].healthy {
										healthy = false
										break
									}
								}
								if healthy {
									err := t.task.addInstanceToLB(i.instance)
									if err != nil {
										t.task.error(errors.New("error removing instance from load balancer"), err, nil)
									}
								} else {
									t.task.error(errors.New("instance still has failing healthchecks"), nil, nil)
								}
							}
						}
						t.task.log("healthcheck complete", log.Data{"instance_id": i.instance.ID(), "score": t.tracker[i.instance], "healthy": healthy})
					}(i)
				}
			}
		}
	}()
}

func (t *taskHealthcheck) Run(i Instance) bool {
	switch t._type {
	case "http":
		url := t.target
		url = strings.Replace(url, "$HOST$", "127.0.0.1", -1)
		if len(i.Ports()) > 0 {
			url = strings.Replace(url, "$PORT$", fmt.Sprintf("%d", i.Ports()[0]), -1)
			for j, p := range i.Ports() {
				url = strings.Replace(url, fmt.Sprintf("$PORT%d$", j), fmt.Sprintf("%d", p), -1)
			}
		}
		res, err := cli.Get(url)
		if err != nil {
			t.task.error(errors.New("healthcheck error"), err, nil)
			return false
		}
		io.Copy(ioutil.Discard, res.Body)
		res.Body.Close()
		if res.StatusCode < 400 {
			return true
		}
		t.task.error(errors.New("healthcheck error"), errors.New("unexpected status code"), log.Data{"code": res.StatusCode})
		return false
	default:
		// TODO check this sooner
		log.Error(errors.New("unknown healthcheck type"), nil)
	}
	return false
}
