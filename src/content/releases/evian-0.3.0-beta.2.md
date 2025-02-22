---
title: evian 0.3.0-beta.2
project: evian
date: 2024-11-24
---

This is a beta release of evian with preliminary support for vexide 0.5.0. It also further reorganizes modules compared to beta.1.

This release includes a few new key features:
- 2D distance-parameterized trapezoidal trajectory generation for `Differential`-configuration drivetrains.
- `Ramsete` unicycle controller command (trajectory follower) for `Differential`-configuration drivetrains.
- Rough implementation of a boomerang controller in the `Seeking` motions struct (completely untested and unoptimized).
- Cubic bezier splines in `evian::math`.
- 1D distance-parameterized trapezoidal motion profiling for general-purpose use in `evian::math`.

API docs for this release (still largely incomplete): https://docs.rs/evian/0.3.0-beta.2/evian/index.html
An example of evian's trajectory following capabilities can be seen here: https://github.com/vexide/evian/blob/master/examples/trajectory.rs

Please keep in mind that these APIs are unstable not thoroughly tested, so competition use of evian is *not recommended* at this point in time (unless you are working with your own motion algorithms and localization on top of it).