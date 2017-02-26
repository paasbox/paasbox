paasbox
========

`paasbox` is a rewrite of [websysd](https://github.com/websysd/websysd) - and currently a work in progress.

### Getting started

Start paasbox with the example workspace:

- `go get github.com/paasbox/paasbox/cmd/pb`
- `curl -O https://raw.githubusercontent.com/paasbox/paasbox/master/example/workspace.json`
- `pb`

### Todo

- handle log/instance retention
- auto-tail latest/all instances from task endpoint
- load workspace from http(s)/s3/gist(?)
- store state in remote db/s3/api(?)
- support HTTP-specific load balancer and Host headers?
- workspace initialisation stage?
- $ref to external JSON files?
- native SCM support?
- healthcheck

### Notes

Stuff to remember when writing documentation:

#### Drivers

- `exec` - a native OS process
- `shell` - currently executes using `/bin/sh -c`

### Licence

Copyright ©‎ 2014 - 2017, Ian Kent (http://iankent.uk)

Released under MIT license, see [LICENSE](LICENSE.md) for details.
