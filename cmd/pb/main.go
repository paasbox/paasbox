package main

import (
	"bufio"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"sync"

	"fmt"
	"runtime/pprof"

	"github.com/paasbox/paasbox/cmd"
	"github.com/paasbox/paasbox/sysd"
	"github.com/paasbox/paasbox/sysd/util/lockwarn"
)

func main() {
	if v := os.Getenv("PAASBOX_PROFILE_CPU"); v == "1" || v == "y" {
		f, err := os.Create("cpu.pprof")
		if err != nil {
			fmt.Println("could not create CPU profile: ", err)
			os.Exit(1)
		}
		if err := pprof.StartCPUProfile(f); err != nil {
			fmt.Println("could not start CPU profile: ", err)
			os.Exit(1)
		}
		defer func() {
			fmt.Println("Stopping CPU profile!")
			pprof.StopCPUProfile()
		}()
	}
	cmd.New(cmd.Hooks{
		//"stop": sysd.Stop,
		"tail": tail,
	}).Start(sysd.Start)
}

func tail(doneCh chan struct{}) {
	pbURL := "http://localhost:8080"
	if v := os.Getenv("PB_URL"); len(v) > 0 {
		pbURL = v
	}

	if len(os.Args) <= 1 {
		fmt.Println("usage: pb tail <stack-id>/<task-id>")
		os.Exit(1)
	}

	remote := os.Args[1]
	parts := strings.SplitN(remote, "/", 2)
	if len(parts) < 2 {
		fmt.Printf("invalid tail path: %s\n", remote)
		os.Exit(1)
	}

	insts := getTaskInstances(pbURL, parts[0], parts[1])
	url := pbURL + "/api/stacks/" + parts[0] + "/tasks/" + parts[1]
	var wg sync.WaitGroup

	for _, v := range insts {
		instanceURL := url + "/instances/" + v
		stdoutURL := instanceURL + "/stdout"
		stderrURL := instanceURL + "/stderr"

		stdoutCh, err := getTail(stdoutURL)
		if err != nil {
			fmt.Printf("error getting stdout tail: %s\n", remote)
			os.Exit(1)
		}

		stderrCh, err := getTail(stderrURL)
		if err != nil {
			fmt.Printf("error getting stderr tail: %s\n", remote)
			os.Exit(1)
		}

		wg.Add(1)
		go func() {
			defer wg.Done()
			var done bool
			for {
				if done {
					close(stdoutCh)
					close(stderrCh)
					break
				}
				select {
				case <-doneCh:
					done = true
				case l, ok := <-stdoutCh:
					fmt.Println("STDOUT:", l)
					if !ok {
						done = true
					}
				case l, ok := <-stderrCh:
					fmt.Println("STDERR:", l)
					if !ok {
						done = true
					}
				}
			}
		}()
	}

	c := lockwarn.Notify()
	wg.Wait()
	close(c)
}

func getTail(url string) (chan string, error) {
	// FIXME timeout
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.URL.RawQuery = "tail=y"

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	if res.StatusCode != 200 {
		fmt.Printf("unexpected status code on %s: %d", url, res.StatusCode)
		res.Body.Close()
		os.Exit(1)
	}

	ch := make(chan string)
	rdr := bufio.NewReader(res.Body)

	go func() {
		defer res.Body.Close()

		for {
			c := lockwarn.Notify()
			line, err := rdr.ReadBytes('\n')
			close(c)
			if err != nil {
				fmt.Println("ERROR:", err)
				close(ch)
				break
			}
			c = lockwarn.Notify()
			ch <- string(line)
			close(c)
		}
	}()

	return ch, nil
}

func getTaskInstances(pbURL, stackID, taskID string) (res []string) {
	url := pbURL + "/api/stacks/" + stackID + "/tasks/" + taskID

	// FIXME timeout
	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("error calling paasbox: %s", err)
		os.Exit(1)
	}

	if resp.StatusCode != 200 {
		fmt.Printf("unexpected response code: %d", resp.StatusCode)
		os.Exit(1)
	}

	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("error reading task response: %s", err)
		os.Exit(1)
	}

	if err = resp.Body.Close(); err != nil {
		fmt.Printf("error closing response body: %s", err)
		os.Exit(1)
	}

	var task struct {
		CurrentInstances []struct {
			ID  string `json:"id"`
			URL string `json:"url"`
		} `json:"current_instances"`
	}

	if err = json.Unmarshal(b, &task); err != nil {
		fmt.Printf("error unmarshaling response: %s", err)
		os.Exit(1)
	}

	for _, v := range task.CurrentInstances {
		res = append(res, v.ID)
	}

	return
}
