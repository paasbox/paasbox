paasbox
========

`paasbox` is a rewrite of [websysd](https://github.com/websysd/websysd) - and currently a work in progress.

### Getting started

Start paasbox with the example workspace:

- `go get github.com/paasbox/paasbox/cmd/pb`
- `pb https://raw.githubusercontent.com/paasbox/paasbox/master/example/workspace.json`

### Todo

- internal docker:
  - localhost:9200 points to own container, not host, so can't contact ES
  - use user defined docker network
  - give containers aliases 'paasbox-wsid-taskid' which is known in workspace.json

- handle log/instance retention
- auto-tail latest/all instances from task endpoint
- store state in remote db/s3/api(?)
- support HTTP-specific load balancer and Host headers?
- workspace initialisation stage?
- $ref to external JSON files?
- native SCM support?

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
