paasbox
========

`paasbox` is a rewrite of [websysd](https://github.com/websysd/websysd) - and currently a work in progress.

### Todo

- support multiple instances of a task
- handle retention strategy for tasks/logs
- load workspace from http(s)/s3/gist(?)
- store state in remote db/s3/api(?)
- port allocation and load balancing

### Notes

Stuff to remember when writing documentation:

#### Drivers

- `exec` - a native OS process
- `shell` - currently executes using `/bin/sh -c`

### Licence

Copyright ©‎ 2014 - 2017, Ian Kent (http://iankent.uk)

Released under MIT license, see [LICENSE](LICENSE.md) for details.
