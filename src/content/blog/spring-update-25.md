---
title: "Spring Updates: vexide 0.7.0, Auton Selectors, Docs & Ecosystem"
description: An quick recap of recent developments in vexide.
author: tropicaaal
tags: ["news"]
date: 2025-03-05
thumbnail: {
    url: "/images/thumbnails/plastic-death.png",
    alt: "vexide logo next to two wireframe models."
}
---

Hi everyone, we're excited to announce some new releases in vexide! In the last few months, a large amount of our focus has gone towards stabilizing, documenting, and cleaning up existing APIs, as well as working on libraries separate from vexide itself to promote our growing ecosystem of packages.

> [!TIP]
> For more information on what vexide is and why you should use it, check out our [introduction](/docs/).

# Releasing `vexide` 0.7.0

As mentioned before, this release is more focused on polishing and documenting existing code within vexide over announcing new features.

> [!NOTE]
> *We generally think that `vexide` is close to feature-complete.* Our API surface and device support currently exceeds PROS and nearly matches VEXcode, but we're still a long way from complete API stability. The hope is that this release is at least a step in that direction.

## Module Restructure

`vexide` 0.7.0's modules have been reorganized to be more consistent and generally less of a pain to type out. You can observe these changes in our [API docs](https://docs.rs/vexide). Notice how many modules have now been moved to the top-level:

| 0.6.0 | 0.7.0 |
| ----- | ----- |
| ![top-level modules in vexide 0.6.0](/blog/0.6.0-modules.png) | ![top-level modules in vexide 0.7.0](/blog/0.7.0-modules.png) |

This makes finding things in vexide easier and saves your fingers from typing out a 3-mile long `use`-path.

Most significantly, the `core` and `async_runtime` modules are gone. Rather than typing out `vexide::core::time::Instant` or `vexide::async_runtime::time::sleep`, you can now use the top-level [`time`](https://docs.rs/vexide/latest/vexide/time/index.html) module:

```rs
// @diff - start
use vexide::{
    core::time::Instant,
    async_runtime::time::sleep,
};
// @diff - end
// @diff +
use vexide::time::{Instant, sleep};
```

> [!TIP]
> This refactor also comes with many additions to our [API reference](https://docs.rs/vexide), which now provides detailed examples and explanations in most of the top-level modules.

## Directory Reading

`vexide` programs can now read folder entries off of the SDCard with the new [`read_dir`](https://docs.rs/vexide/latest/vexide/fs/fn.read_dir.html) function.

```rs
for entry in vexide::fs::read_dir("somefolder") {
    println!("{:?}", entry.path);
}
```

This function was somewhat of a pain to implement due to technical limitations in VEXos. The PR adding this functionality to PROS has been held up for [two years (!!!)](https://github.com/purduesigbots/pros/pull/615) due to this reason.

## New GPS Sensor API

The `GpsSensor` API has recieved an overhaul in 0.7.0. Heading and angle sensing functionality has been integrated into the sensor, and the separate `GpsImu` struct has been completely removed. Here's a quick example of the new API:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    // Assume we're starting in the middle of the field facing upwards, with the
    // sensor's mounting point being our reference for position.
    let gps = GpsSensor::new(
        peripherals.port_1,
        Point2 { x: 0.0, y: 0.0 },
        Point2 { x: 0.0, y: 0.0 },
        0.0,
    );

    if let Ok(position) = gps.position() {
        println!(
            "Robot is at x={}, y={} facing {} degrees",
            position.x,
            position.y,
            gps.heading().unwrap_or_default(),
        );
    }
}
```

## Graphics Drivers

The `slint` and `embedded-graphics` drivers have been removed from the main vexide runtime and split into separate repositories due to licensing concerns.

<div style="display: block; text-align: center; margin: 0 auto;">

![email client written in slint](/blog/email.png)

<small>
Using the brain for its intended purpose — email.
</small>
</div>

- The new [`vexide-slint`](https://github.com/vexide/vexide-slint) crate provides a platform implementation for the [Slint UI](https://slint.dev/) library. This library is GPL-licensed.
- The new [`vexide-embedded-graphics`](https://github.com/vexide/vexide-embedded-graphics) crate provides a display driver for the [`embedded-graphics`](http://docs.rs/embedded-graphics) crate. This library is MIT-licensed.

If you were using these features previously, you'll need to migrate to these new crates by adding them to your `Cargo.toml`:

```sh
cargo add vexide-slint
```

or...

```sh
cargo add vexide-embedded-graphics
```

## Generic Serial Refactor

The `SerialPort` API, which allows you to use a smartport as a generic serial tranciever got a refactor this release.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    // @highlight
    let mut serial = SerialPort::open(peripherals.port_1, 115200).await;
    //                                                           ^
    // [SerialPort::open is now an async function, which prevents a race condition bug]
    // [that caused this function to fail sometimes in earlier releases.]
    _ = serial.write(b"yo");
}
```

## Important Bug Fixes

- SDCard file write operations will now be synced when dropped out of scope.
- Three-wire Encoders had a bug in them where they could sometimes be configured on the wrong port pairing or be randomly reset back to 0 degrees. That bug has been fixed.
- The reliability of the `println!()` macro has been significantly improved this release when trying to print large amounts of data at once.
- Writing to the controller screen or rumbling the controller previously had a bug that would sometimes cause a crash. That has been fixed.

# Announcing `autons` - Auton selectors for `vexide`!

[`autons`](https://github.com/vexide/autons) is a new library built for vexide that allows you to use and build auton selectors for `vexide`. It currently has builtin support for a simple auton selector.

![simple auton selector](/blog/autons-simpleselect.png)

The goal of `autons` is not to offer just a single type of auton selector, but rather provide a framework for people to make their own.  The API allows for people to build their own selectors around the `Selector` trait, making it easy to swap between different auton selectors while sharing a standard API.

```rs
// @fold start
#![no_std]
#![no_main]

extern crate alloc;

use autons::{
    prelude::*,
    simple::{route, SimpleSelect},
};
use vexide::prelude::*;

// @fold end
struct Robot {}

impl Robot {
    async fn route_1(&mut self) {}
    async fn route_2(&mut self) {}
}

impl SelectCompete for Robot {
    async fn driver(&mut self) {
        // Driver stuff goes here
    }
}

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let robot = Robot {};

    robot
        .compete(SimpleSelect::new(
            peripherals.display,
            [
                route!("Route 1", Robot::route_1),
                route!("Route 2", Robot::route_2),
            ],
        ))
        .await;
}
```

`autons` can be added as a dependency in any existing vexide project using the following command:

```sh
cargo add autons
```

# Community Showcase

> [!THANKS]
> These are some new packages made by our community using vexide that we'd like to recognize!

## `vexide-motorgroup`

[`vexide-motorgroup`](http://crates.io/crates/vexide-motorgroup) provides a `MotorGroup` type for `vexide` similar to the one found in VEXcode and PROS. `vexide` intentionally doesn't include motor groups, since we believe that users should have control over the underlying collection and error handling strategy, but if you need something quick and easy then this library is for you!

## `veranda`

[`veranda`](https://crates.io/crates/veranda) is a library that provides a random number generation (RNG) entropy source for vexide projects for use with the [`rand`](https://crates.io/crates/rand) crate. This is useful for anything involving random numbers or non-determinstic execution (such as particle filters).

## `shrewnit`

[`shrewnit`](https://crates.io/crates/shrewnit) is a new units library that allows you to strongly type units of measure at compile time in stable rust. This library isn't specific to vexide, but is developed by one of our maintainers with vexide and its projects in mind.

## `doxa-selector`

This is an auton selector made by team 99484 developed for `vexide` using the `slint` GUI library. Check it out on [GitHub](https://github.com/doxa-robotics/doxa-selector-rs).
