---
date: 2016-03-08T21:07:13+01:00
title: Configuration
weight: 0
---

## Command line

There are no command line parameters.

Anything which follows `pb` will be treated as a workspace file.

## Environment variables

You can control global paasbox options using environment variables.

| Environment variable | Default          | Description
| -------------------- | ---------------- | -----------
| BIND_ADDR            | :8080            | The host/port to listen on
| PAASBOX_LB_LOG       | n                | Enable load balancer logging
| PAASBOX_LOG          |                  | Logstash endpoint for centralised logging
| PAASBOX_PROFILE_CPU  | n                | Enable CPU profiling
| PB_DEBUG             | n                | Enable BoltDB logging
| PB_STATE_DIR         | `$HOME/.paasbox` | Directory to store BoltDB state files in

## Workspace files

A workspace file defines one or more workspaces.

A workspace can be loaded from disk or over HTTP/HTTPS.

```sh
pb ./example/workspaces.json
pb https://some.domain/workspace.json
```

You can load multiple workspace files at a time.

```sh
pb ./example/workspaces.json https://some.domain/workspace.json
```

## Workspace configuration

```json
{
  "id": "example-workspace",
  "name": "Example workspace",
  "log_path": "./logs",
  "log_pattern": "$WORKSPACE_ID$/$TASK_ID$/$INSTANCE_ID$/$NAME$.log",
  "env": {
    "inherit_all": false,
    "inherit": [ "PATH", "USER", "HOME" ],
    "remove": [ "REMOVED_ENV_VAR" ],
    "set": [ "FOO=1" ]
  },
  "tasks": [
    
  ]
}
```

| Field             | Description
| ----------------- | -----------
| `id`              | A unique ID (should be globally unique and URL friendly)
| `name`            | A short title for the workspace
| `log_path`        | Where to store task log output
| `log_pattern`     | The pattern used when creating log file paths/names
| `env`             | Environment configuration
| `env.inherit_all` | `true` imports all environment variables from the parent process
| `env.inherit`     | An array of environment variables to import
| `env.remove`      | An array of environment variables to remove (e.g. combined with `env.inherit_all`)
| `env.set`         | An array of `KEY=value` environment variables to set
| `tasks`           | An array of tasks (see below for details)

## Task configuration