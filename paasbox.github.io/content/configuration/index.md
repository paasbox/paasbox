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

| Environment variable | Default | Description
| -------------------- | ------- | -----------
| BIND_ADDR            | :8080   | The host/port to listen on
| PAASBOX_PROFILE_CPU  | n       | Enable CPU profiling
| PB_DEBUG             | n       | Enable BoltDB logging
| PAASBOX_LB_LOG       | n       | Enable load balancer logging
| PAASBOX_LOG          |         | Logstash endpoint for centralised logging

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
