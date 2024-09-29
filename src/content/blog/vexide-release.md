---
title: vexide has been released to crates.io!
description: All about the first version of vexide
author: gavin-niederman
thumbnail: {
    url: "https://i.imgur.com/ulrHCP2.jpeg",
    alt: "Thumbnail Image"
}
tags: ["release"]
date: 2024-05-11
---

vexide has now officially been released! <br />
vexide is still relatively early in development and therefore has an unstable API surface,
but it is nearly feature complete.

If you end up using or contributing to vexide or just want to learn more,
please join [our discord server](https://discord.gg/y9mcGuQRYz) and tell us how it goes.

# What is vexide

vexide is a brand new library for programming V5 Brains.
Unlike the two major V5 Brain libraries (VEXCode and PROS), vexide is written in Rust instead of C and C++.
For this reason vexide has many advantages over PROS and VEXCode.
- vexide uses Rust async/await instead of an RTOS.
- vexide binaries are small, like, *really small* compared to PROS monoliths.
- All device errors need to be explicitly handled or ignored.
- vexide gives you complete control over what runs in your programs. Don't want a banner to print on startup? Disable the feature.
- vexide programs are built and linked with LLVM instead of the bulky ARM GNU Toolchain. 
- vexide is frequently updated. VEXCode will always get new features first, unfortunately.

Every single line of code in vexide is open source and 100% Rust. 
vexide doesn't depend on any external C libraries (even libv5rt).
This means that anyone can build and contribute to vexide with ease.


# In practice

How does code written with vexide look?
Most APIs in vexide are asynchronous.
Here is a quick example showing a working program using the ``CompetitionRobot`` API.

```rust
#![no_std]
#![no_main]
#![feature(never_type)]

use vexide::prelude::*;

struct Robot;

impl CompetitionRobot for Robot {
    type Error = !;
    async fn driver(&mut self) -> Result<(), !> {
        println!("Driver control started!");
        Ok(())
    }
}

#[vexide::main]
async fn main(_peripherals: Peripherals) {
    Robot.compete().await.unwrap();
}
```

Most device types can be constructed infallibly, but all methods called after the fact return ``Result``s.

```rust
// Infallibly create a motor
let mut motor = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);
// Set the voltage or return early if there is an error.
motor.set_voltage(12.0)?;
// Set the voltage and ignore any error.
let _ = motor.set_voltage(0.0);
```

# Should you use vexide

## If you have been using pros-rs

Yes!
You should switch away from pros-rs in favour of vexide.
vexide is the successor to pros-rs and has many improvements over it.

## For everyone else 

Like any library vexide has pros and cons.
I've gone over a lot of the pros already, but not any of the cons.
vexide has one major con: a lack of hardware testing.
vexide is very new and thus hasn't been thoroughly tested.

So should you use it?
For a competition, I do not advise using vexide ***yet***.
However, I encourage you to give vexide a try and help us get it to a state where we are confident in competition readiness.
