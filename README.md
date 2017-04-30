paasbox
========

`paasbox` is a rewrite of [websysd](https://github.com/websysd/websysd) - and currently a work in progress.

### Getting started

Start paasbox with the example stack:

- `go get github.com/paasbox/paasbox/cmd/pb`
- `pb https://raw.githubusercontent.com/paasbox/paasbox/master/example/stack.json`

### Todo

- rethink stack IDs
  - test for invalid IDs? i.e. compare expected against value in stack?
    - might not be relevant if stack is local file
  - store stacks locally, e.g. in `~/.paasbox/stacks`?
  - how/if runtime updates are persisted (e.g. for http)
  - versioning? (works with @, but not boltdb)
  - stacks.paasbox.io? or is SCM URL enough?
- enabled flag for stacks/tasks in config?
- handle log/instance retention
- auto-tail latest/all instances from task endpoint
- store state in remote db/s3/api(?)
- support HTTP-specific load balancer and Host headers?
- $ref to external JSON files?
- custom UI info, e.g. git info in task api output?
- exponential back-off on restarts after failure?

### Notes

Stuff to remember when writing documentation:

#### Loading remote stacks

- @elk => github.com/paasbox/stacks/elk/latest
- @elk:5.2.2 => github.com/paasbox/stacks/elk/5.2.2
- @github.com/paasbox/stacks/elk
- @github.com/paasbox/stacks/elk:5.2.2 (branch/tag switch)

#### Drivers

- `exec` - a native OS process
- `shell` - currently executes using `/bin/sh -c`
- `docker` - runs a docker container
  - `image` - image to run
  - `port_map` - port mapping, ports[0] -> LB -> port_map[0]

### Licence

Copyright ©‎ 2014 - 2017, Ian Kent (http://iankent.uk)

Released under MIT license, see [LICENSE](LICENSE.md) for details.
