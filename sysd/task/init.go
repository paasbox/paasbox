package task

import (
	"errors"
	"os"
	"os/exec"

	"github.com/ian-kent/service.go/log"
	"github.com/paasbox/paasbox/sysd/util/env"
)

type taskInit interface {
	Do() error
}

type gitInit struct {
	task   *task
	Source string
	Dest   string
	Branch string
}

func NewGitInit(t *task, config map[string]interface{}, e []string) (taskInit, error) {
	var source, dest, branch string

	if v, ok := config["source"]; ok {
		if sv, ok := v.(string); ok {
			source = env.Replace(sv, e)
		} else {
			return nil, errors.New("incorrect type for source, expected string")
		}
	} else {
		return nil, errors.New("missing source")
	}

	if v, ok := config["dest"]; ok {
		if dv, ok := v.(string); ok {
			dest = env.Replace(dv, e)
		} else {
			return nil, errors.New("incorrect type for dest, expected string")
		}
	} else {
		return nil, errors.New("missing dest")
	}

	if v, ok := config["branch"]; ok {
		if bv, ok := v.(string); ok {
			branch = env.Replace(bv, e)
		} else {
			return nil, errors.New("incorrect type for branch, expected string")
		}
	}

	return &gitInit{t, source, dest, branch}, nil
}

func (g *gitInit) Do() error {
	g.task.log("running git initialisation", nil)

	if s, err := os.Stat(g.Dest); err == nil {
		if !s.IsDir() {
			return errors.New("destination is not a directory")
		}
		// TODO do nothing if directory exists - can this be more useful?
		g.task.log("git initialisation not required", log.Data{"dest": g.Dest})
		return nil
	}

	args := []string{"clone"}
	if len(g.Branch) > 0 {
		args = append(args, "-b", g.Branch)
	}
	args = append(args, g.Source, g.Dest)

	g.task.log("git command", log.Data{"command": "git", "args": args})

	cmd := exec.Command("git", args...)
	err := cmd.Run()
	if err != nil {
		return err
	}

	g.task.log("git initialisation complete", nil)

	return nil
}

var _ taskInit = &gitInit{}
