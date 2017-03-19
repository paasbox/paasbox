---
date: 2016-03-08T21:07:13+01:00
title: Getting started
weight: 0
---

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