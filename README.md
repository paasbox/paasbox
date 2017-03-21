paasbox
========

`paasbox` is a rewrite of [websysd](https://github.com/websysd/websysd) - and currently a work in progress.

### Getting started

Start paasbox with the example workspace:

- `go get github.com/paasbox/paasbox/cmd/pb`
- `pb https://raw.githubusercontent.com/paasbox/paasbox/master/example/workspace.json`

### Todo

- rethink workspace IDs
  - global-uniqueness/collisions
  - go-like scm support, e.g. `github.com/paasbox/workspace`
  - internal workspaces - `@elk`, or should `@` be different?
    - @elk => github.com/paasbox/workspaces/elk/latest
    - @elk:5.2.2 => github.com/paasbox/workspaces/elk/5.2.2
    - @github.com/paasbox/workspaces/elk
    - @github.com/paasbox/workspaces/elk:5.2.2 (branch/tag switch)
    - @bitbucket.org/<id>/<repo>/<dir>
    - @bitbucket.org/<id>/<repo>/<dir>:5.2.2 (branch/tag switch)
  - store workspaces locally, e.g. in `~/.paasbox/workspaces`?
  - how/if runtime updates are persisted (e.g. for http)
  - is a workspace a 'stack'?
  - versioning?
  - workspaces.paasbox.io? or stacks.paasbox.io?
- enabled flag for workspaces/tasks in config?
- handle log/instance retention
- auto-tail latest/all instances from task endpoint
- store state in remote db/s3/api(?)
- support HTTP-specific load balancer and Host headers?
- $ref to external JSON files?
- native SCM support? (e.g. git info in task api output?)
- exponential back-off on restarts after failure?

### Notes

Stuff to remember when writing documentation:

#### Drivers

- `exec` - a native OS process
- `shell` - currently executes using `/bin/sh -c`
- `docker` - runs a docker container
  - `image` - image to run
  - `port_map` - port mapping, ports[0] -> LB -> port_map[0]

### Licence

Copyright ©‎ 2014 - 2017, Ian Kent (http://iankent.uk)

Released under MIT license, see [LICENSE](LICENSE.md) for details.
