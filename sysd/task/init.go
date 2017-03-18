package task

import (
	"errors"
	"os"
	"os/exec"
)

type taskInit interface {
	Do() error
}

type gitInit struct {
	Source string
	Dest   string
	Branch string
}

func NewGitInit(c map[string]interface{}) (taskInit, error) {
	var source, dest, branch string

	if v, ok := c["source"]; ok {
		if sv, ok := v.(string); ok {
			source = sv
		} else {
			return nil, errors.New("incorrect type for source, expected string")
		}
	} else {
		return nil, errors.New("missing source")
	}

	if v, ok := c["dest"]; ok {
		if dv, ok := v.(string); ok {
			dest = dv
		} else {
			return nil, errors.New("incorrect type for dest, expected string")
		}
	} else {
		return nil, errors.New("missing dest")
	}

	if v, ok := c["branch"]; ok {
		if bv, ok := v.(string); ok {
			branch = bv
		} else {
			return nil, errors.New("incorrect type for branch, expected string")
		}
	}

	return &gitInit{source, dest, branch}, nil
}

func (g *gitInit) Do() error {
	if s, err := os.Stat(g.Dest); err == nil {
		if !s.IsDir() {
			return errors.New("destination is not a directory")
		}
		// TODO do nothing if directory exists - can this be more useful?
		return nil
	}

	args := []string{"clone"}
	if len(g.Branch) > 0 {
		args = append(args, "-b", g.Branch)
	}
	args = append(args, g.Source, g.Dest)

	cmd := exec.Command("git", args...)
	err := cmd.Run()
	if err != nil {
		return err
	}

	return nil
}

var _ taskInit = &gitInit{}
