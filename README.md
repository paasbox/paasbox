paasbox
========

`paasbox` is a rewrite of [websysd](https://github.com/websysd/websysd) - and currently a work in progress.

### Todo

- use events to update state
  - redux style
  - server/workspace/task emits events
  - state consumes events
- map out API
  - GET /workspaces -> list workspaces
  - POST /workspaces -> create workspace
  - DELETE /workspaces -> delete all workspaces

  - GET /workspaces/{workspace_id} -> get workspace
  - PUT /workspaces/{workspace_id} -> update workspace
  - DELETE /workspaces/{workspace_id} -> delete workspace

  - GET /workspaces/{workspace_id}/tasks -> list tasks
  - POST /workspaces/{workspace_id}/tasks -> create task
  - DELETE /workspaces/{workspace_id}/tasks -> delete all tasks

  - GET /workspaces/{workspace_id}/tasks/{task_id} -> get task
  - PUT /workspaces/{workspace_id}/tasks/{task_id} -> update task
  - DELETE /workspaces/{workspace_id}/tasks/{task_id} -> delete task

  - POST /workspaces/{workspace_id}/tasks/{task_id}/start -> start task

  - GET /workspaces/{workspace_id}/tasks/{task_id}/instances -> list instances
  - GET /workspaces/{workspace_id}/tasks/{task_id}/instances/{instance_id} -> get instance
  - POST /workspaces/{workspace_id}/tasks/{task_id}/instances/{instance_id}/stop -> stop instance

- support multiple instances of a task
- handle retention strategy for tasks/logs
- load workspace from http(s)/s3/gist(?)
- store state in db/s3/api(?)

### Notes

Stuff to remember when writing documentation:

#### Task types

- `task` - a one-off or recurring task
- `service` - a long-running task

#### Drivers

- `exec` - a native OS process

#### Retention

Retention strategy types:

- `retain`
- `discard`

### Licence

Copyright ©‎ 2014 - 2017, Ian Kent (http://iankent.uk)

Released under MIT license, see [LICENSE](LICENSE.md) for details.
