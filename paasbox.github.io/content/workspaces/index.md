---
date: 2016-03-08T21:00:00+01:00
title: Workspaces
weight: 50
---

## Overview

A workspace is a related collection of tasks.

Each workspace can define its own environment variables and logging configuration.

A workspace configuration file can define one or more workspaces.

## Workspace IDs

Workspace IDs are used by paasbox, to:

* Generate the `.db` state file filename (generally `$HOME/.paasbox/$WORKSPACE_ID.db`)
* Generate the log path (generally `./logs/$WORKSPACE_ID/...`)

For this reason, workspace IDs should ideally be globally unique (or, unique enough that
an individual user is unlikely to see a workspace ID collision).
