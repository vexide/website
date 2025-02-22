---
title: evian 0.3.0-beta.1
project: evian
date: 2024-11-19
---

This is a beta release of evian, with a rewritten architecture. You can view an example of it in use here: <https://github.com/vexide/evian/blob/master/examples/testing.rs>

This version depends on the latest vexide release candidate, so you will also have to use that to test it. At this point in time, the general architecture (how things are structured and passed around) is nearly finalized, but the *implementations of things* (specifically the stuff in `tracking` and the commands) are not hardware tested and incomplete (some may even panic with `todo!`). It's highly discouraged from using those for competition purposes in this release.