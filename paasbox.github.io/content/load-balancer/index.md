---
date: 2016-03-08T21:00:00+01:00
title: Load balancer
weight: 150
---

## Overview

paasbox includes an embedded load balancer, simulating the way HAProxy or nginx
might be used to route traffic within a PaaS cluster.

It uses the 'service port' model for service discovery, and is enabled by default
for any task with the `ports` field.

Dynamically allocated port numbers are passed to the task using the `PORT`, `PORT0`,
`PORT1` (etc) environment variables.

## API

The load balancer API is exposed at `/api/loadbalancer`.

## Logging

Load balancer logs are stored in-memory (unless centralised logging is configured).

A 50,000 entry circular buffer is used to avoid excessive memory usage.

The load balancer logs are available over HTTP at `/api/loadbalancer/logs`.

You can set `PAASBOX_LB_LOG=1` environment variable to output load balancer logs to the console.

## Single port apps

If you have a task with a single port configured:

```json
{
    "id": "foo-server",
    "name": "Foo server",
    "service": true,
    "driver": "exec",
    "command": "/bin/foo-server",
    "args": [ "-bind-addr", ":$PORT" ],
    "ports": [ 15000 ]
}
```

* The port `15000` will be added to the load balancer
* A dynamically allocated port, e.g. `56271` is passed in as `PORT` and `PORT0`
* The allocated port, `56271`, is added to the load balancer
* The `-bind-addr` value is set to `:56271`

This means all network traffic to port `15000` will be handled by paasbox, and
forwarded to the currently running application instance.

## Multiple port apps

If you have a task with a multiple ports configured:

```json
{
    "id": "foo-server",
    "name": "Foo server",
    "service": true,
    "driver": "exec",
    "command": "/bin/foo-server",
    "args": [ "-ui-bind-addr", ":$PORT0", "-api-bind-addr", ":$PORT1" ],
    "ports": [ 15000, 16000 ]
}
```

* The ports `15000` and `16000` will be added to the load balancer
* A dynamically allocated port, e.g. `56271` is passed in as `PORT` and `PORT0`
* Another dynamically allocated port, e.g. `54115` is passed in as `PORT1`
* The allocated port, `56271`, is added to the load balancer for port `15000`
* The allocated port, `54115`, is added to the load balancer for port `16000`
* The `-ui-bind-addr` value is set to `:56271`
* The `-api-bind-addr` value is set to `:54115`

This means all network traffic to port `15000` and `16000` will be handled by paasbox,
and forwarded to the appropriate port of the currently running application instance.

## Multiple instances

If you have a task with a single port and multiple instances configured:

```json
{
    "id": "foo-server",
    "name": "Foo server",
    "service": true,
    "driver": "exec",
    "command": "/bin/foo-server",
    "args": [ "-bind-addr", ":$PORT" ],
    "ports": [ 15000 ],
    "instances": 2
}
```

* The port `15000` will be added to the load balancer
* A dynamically allocated port, e.g. `56271` is passed in as `PORT` and `PORT0` to instance 0
* A dynamically allocated port, e.g. `54115` is passed in as `PORT` and `PORT0` to instance 1
* The allocated ports, `56271` and `54115`, are added to the load balancer
* The `-bind-addr` value is set to `:56271` for instance 0
* The `-bind-addr` value is set to `:54115` for instance 1

This means all network traffic to port `15000` will be handled by paasbox, and
forwarded (randomly selected) to one of the currently running application instances.

Multiple ports with multiple instances works as you'd expect - each 'service port' is forwarded
to a randomly selected instance on the appropriate allocated port number.