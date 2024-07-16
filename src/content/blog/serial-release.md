---
title: TODO CHANG ETHIS
description: A brand new serial protocol implementation and our plans to use it.
author: gavin-niederman
tags: ["blog"]
date: 2024-07-13
draft: true
---

For vexide 0.3.0, we have completely revamped our build tooling. Now, instead of `cargo-pros`, vexide projects should be built and uploaded through [`cargo-v5`](https://github.com/vexide/cargo-v5). The biggest change between `cargo-pros` and `cargo-v5` is that `cargo-v5` doesn't depend on pros-cli, or anything else for that matter. In order to do that, we have created a complete Rust implementation of the V5 serial protocol. You can find it on crates.io with the name [`vex-v5-serial`](https://crates.io/crates/vex-v5-serial). It supports wired, controller, and direct Bluetooth connections.

# What This Means For You

Tools like `cargo-v5` will be much easier to install than before because they don't have any non-Rust dependencies. Installing `cargo-v5` is as simple as `cargo install cargo-v5`!

## Using `cargo-v5`

The only differences in usage between `cargo-v5` and `cargo-pros` is in some arguments for the upload command and the entirely new terminal command. That's right, you can now view program output through cargo-v5!
Some common commands are:
- `cargo v5 build --release`: This builds and doesn't upload your program.
- `cargo v5 upload --release`: This will build and upload your program. If you haven't defined a program slot in your `cargo-v5` metadata or passed one through the `--slot` argument, it will prompt you.
- `cargo v5 terminal`: This will view the output of your program. To stop it, press `Ctrl+C`.

You may have noticed the mention of metadata. In your project's `Cargo.toml` file you can, optionally, configure `cargo-v5` without needing to pass any extra arguments. The current metadata keys are:
- `package.metadata.v5.icon` (string): Configures the program icon shown in the program menu. To see all of the options, run `cargo v5 upload --help`.
- `package.metadata.v5.slot` (integer): Configures the slot that the program is uploaded to by default. This can be overwritten by the `--slot` flag.
- `package.metadata.v5.compress` (boolean): Configures whether or not programs should be compressed before uploading. You should pretty much always have this set to true (the default value).

# Future Plans

We won't stop at just `cargo-v5`!

## `v5d` and `v5ctl`

In the future, we plan on using `vex-v5-serial` to implement a V5 Brain Daemon (`v5d`) which will allow sharing a connection with the brain. Multiple programs will be able to communicate with the brain even though only one program can connect to it at a time. `v5ctl` will be a general purpose CLI tool that supports most features of the V5 Serial protocol. Once `v5d` is finished, `cargo-v5` will be switched to using `v5d`. You can find the repo for both `v5d` and `v5ctl` [here](https://github.com/vexide/v5ctl).

## LemLink

LemLink is a project that is being developed by the LemLib team as well as the vexide team. The current plan is for it to be backwards compatible with `pros-cli` but with better dependency management. It will also be implemented in terms of `v5d`. This will make it easier to run multiple LemLink commands simultaneously. The LemLink repo is [here](https://github.com/LemLib/LemLink).
