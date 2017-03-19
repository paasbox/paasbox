---
date: 2016-03-08T21:07:13+01:00
title: paasbox
type: index
weight: 0
---

## PaaS in a box

paasbox is a lightweight PaaS environment (like Mesos or Kubernetes) for local development of microservices and other 12-factor apps.

![paasbox screenshot](/images/screen.png)

## Quick start

If you have a working Go development environment:

```sh
go get github.com/paasbox/paasbox/cmd/pb
```

Otherwise download the `pb` binary to `$PATH`.

Start paasbox and load an example workspace:

```sh
pb https://raw.githubusercontent.com/paasbox/paasbox/master/example/workspaces.json
```

Then open your browser at [http://localhost:8080]()

## Features

- Does
- Cool
- Stuff

See the [getting started guide]({{< relref "getting-started/index.md" >}}) for instructions how to get
it up and running.
