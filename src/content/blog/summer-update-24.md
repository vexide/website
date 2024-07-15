---
title: "Summer Updates: Announcing cargo-v5 and vexide 0.3.0"
description: Important project updates for Summer 2024!
author: tropix126
tags: ["blog"]
date: 2024-06-28
thumbnail: {
    url: "/images/thumbnails/vaporwave.png",
    alt: "Thumbnail Image"
}
# draft: true
---

Happy summer everyone, hope you're enjoying the vacation! It's been a solid minute since the [initial release of vexide](/blog/posts/vexide-010/) back in May, but we've been busy with development and (finally) have some important announcements!

# Growing Pains & `pros-cli`

Since this project started, we've always relied on [pros-cli](https://github.com/purduesigbots/pros-cli) for uploading programs to the brain. This worked great for a while, but as the scope of things grew and we branched further from dependence on the PROS kernel, pros-cli became a less suitable fit.

The breaking point for us happened a few months back when I wrote some tutorials on setting up a project and realized that almost *half of the installation instructions* had to do with packaging and troubleshooting pros-cli across various operating systems. When it comes to Linux distributions in particular, things can get very messy due to differences in packaging.

This isn't to fault the PROS project or anything, their CLI works great for them where everything is included with a VSCode extension by default, but we're working with Rust tooling here and instructing users install an entire python toolchain to upload programs became a little unreasonable.

## Implementing VEX's Serial Protocol in Rust

Since as early as [January of this year](/blog/protocol-plans.png), we had plans to do our own USB communication in Rust to run direct uploads without any external programs. Last month those efforts finally became a reality with the [`vex-v5-serial` crate](https://crates.io/crates/vex-v5-serial).

<a href="https://github.com/vexide/v5-serial-protocol-rust" target="_blank" rel="noreferrer noopener">

![vex-v5-serial banner](/blog/serial-experiments-vex.png)

</a>

> Thanks to the help of [JerryLum's past reverse-engineering efforts](https://github.com/jerrylum/v5-serial-protocol) for making this possible.

## `cargo-pros` is dead. Long live `cargo-v5`! 🦀

Shortly after our new serial crate became usable, we began putting efforts towards improving vexide's tooling. So yeah, we now have a new command-line tool called [cargo-v5](https://github.com/vexide/cargo-v5)! You'll no longer need to install `cargo-binutils` or `pros-cli` to use vexide.

<div style="margin-block-start: 16px; text-align: center">
  <video width="600" controls>
    <source src="/docs/upload-demo.mp4" type="video/mp4">
  </video>
</div>

You can install it as a cargo subcommand by running `cargo install cargo-v5`. This tool comes with a few fancy new features, like better error messages and the ability to configure uploads from your Rust project's `Cargo.toml` file.

```ansi
[32mtropical@island[0m:[32m~/Documents/GitHub/vexide[0m$ cargo v5 upload
[1m[32m    Finished[0m dev [unoptimized + debuginfo] target(s) in 0.13s
Error: [31mcargo_v5::no_artifact[0m

  [31m×[0m ELF build artifact not found. Is this a binary crate?
[36m  help: [0m`cargo v5 build` should generate an ELF file in your project's `target` folder unless this is a
         library crate. You can explicitly supply a file to upload with the `--file` (`-f`) argument.
```

```toml
# Cargo.toml

[package.metadata.v5]
slot = 1
icon = "cool-x"
compress = true
```

# Releasing vexide 0.3.0

Along with the new tooling improvements, we've also released vexide version 0.3.0 which includes a some of useful improvements. I'll try to cover the important stuff, but you can view the full changelog for that [here](https://github.com/vexide/vexide/blob/main/CHANGELOG.md).

## New Competition API

We've revamped the old `CompetitionRobot` trait for this version. It's now called `Compete` and should have less boilerplate.

<div class="code-split">

```rs
//! 0.2.0
#![feature(error_in_core)]

impl CompetitionRobot for Robot {
    type Error = Box<dyn Error>;

    async fn driver(&mut self) -> Result<(), Box<dyn Error>> {
        Ok(())
    }

    async fn autonomous(&mut self) -> Result<(), Box<dyn Error>> {
        Ok(())
    }
}
```

```rs
//! 0.3.0
impl Compete for Robot {
    async fn driver(&mut self) {}

    async fn autonomous(&mut self) {}
}
```

</div>

An important change here is that competition functions are now *infallible*, meaning they can no longer return an error type. This was previously allowed for the convenience of using Rust's `?` operator to return early if an error occurs, but returning early in the competition lifecycle will effectively just crash your program, which isn't good practice at all.

## Floating-point Math Support

Embedded Rust is a little weird. If you're coming from a typical Rust project with the standard library, you may find many things just *missing* in a `no_std` enviornment. One of those things is support for math on floating-point numbers.

<div class="code-split">

```rs
#![no_std]

fn main() {
    f32::sin(2.0);
}

...
```

```ansi
[K[0m[1m[38;5;9merror[E0599][0m[0m[1m: no function or associated item named `sin` found for type `f32` in the current scope[0m
[0m [0m[0m[1m[38;5;12m--> [0m[0mpackages/vexide/examples/bad.rs:4:10[0m
[0m  [0m[0m[1m[38;5;12m|[0m
[0m[1m[38;5;12m4[0m[0m [0m[0m[1m[38;5;12m|[0m[0m [0m[0m    f32::sin(2.0);[0m
[0m  [0m[0m[1m[38;5;12m| [0m[0m         [0m[0m[1m[38;5;9m^^^[0m
[0m  [0m[0m[1m[38;5;12m| [0m[0m         [0m[0m[1m[38;5;9m|[0m
[0m  [0m[0m[1m[38;5;12m| [0m[0m         [0m[0m[1m[38;5;9mfunction or associated item not found in `f32`[0m
[0m  [0m[0m[1m[38;5;12m| [0m[0m         [0m[0m[1m[38;5;9mhelp: there is a method with a similar name: `min`[0m
```

</div>

This is because Rust's standard library uses a combination of your platform's `libm` library and certain LLVM intrinisics that just aren't available for our target. There's active proposals being made to [fix this](https://github.com/rust-lang/rfcs/issues/2505) in upstream Rust, but we aren't quite there yet.

For the time being, vexide now [has its own implementation](https://github.com/vexide/vexide/blob/main/packages/vexide-core/src/float/mod.rs) of these floating-point math functions.

```rs
#![no_std]
#![no_main]

use vexide::core::float::Float;

#[vexide::main]
async fn main(_: Peripherals) {
    f32::sin(2.0); // it works!
}
```

We use two different libraries for this depending on the target you're compiling to:

- If you're compiling for the native `armv7a-vex-v5` target (a brain) then we use newlib's [libm](https://sourceware.org/newlib/), which has platform-specific optimizations for our target (such as leveraging the brain's [FPU](https://developer.arm.com/documentation/ddi0408/latest/)).
- If you're compiling for WebAssmebly to run in a simulator, then we use [Rust's official port of MUSL's libm](https://github.com/rust-lang/libm/), which is platform-agnostic, but generally slower due to not being especially optimized.

> This means that we now link to a C library when compiling for the brain. If you want a pure Rust binary, you can force vexide to always use the Rust libm port with the `force_rust_libm` feature flag. This will result slower math and larger binaries!

## It's fast too!

These math functions are actually far more performant than the ones in PROS or VEXcode due to using a more optimized build of libm, with trig performance benchmarking around **100 times faster**.

Here's the results of a (crude) benchmark we ran testing 10,000 iterations of `f64::sin(35.0)` on a V5 brain:

| [PROS libm.a](https://github.com/purduesigbots/pros/blob/develop/firmware/libm.a) (baseline) | [rust-lang/libm](https://github.com/rust-lang/libm/) | [newlib libm.a](https://github.com/vexide/vexide/blob/main/packages/vexide-startup/link/libm.a) |
| -- | -- | -- |
| 383.284ms (1.0x) | 6.809ms (56.29x) | **3.699ms (103.61x)** |

> We've also passed this more optimized version of `libm` to the PROS team, so you can expect to see similar improvements soon if you're a PROS user!

## Text-drawing APIs

Along with several memory-related fixes to the screen drawing API, you can now measure and draw aligned text to the screen:

```rs
let mut text = Text::new("Test Text", TextSize::Medium, (0, 0));
text.align(HAlign::Center, VAlign::Top);

text.fill(&mut screen, Rgb::new(0, 255, 255));

println!("width: {}, height: {}", text.width(), text.height());
```

## Changes to the `vexide::main` Macro

This is the entrypoint of a vexide program:

```rs
#[vexide::main]
async fn main(peripherals: Peripherals) {}
```

As of vexide 0.3.0, you can now pass in some startup options, including the ability to disable the startup terminal banner (this replaces the `no_banner` feature flag).

```rs
#[vexide::main(banner = false)]
async fn main(peripherals: Peripherals) {
    println!("Look ma! No banners!");
}
```

# Future Plans

As we look forward to next competition season, there are several improvements and projects we plan to focus our work on. Here's a rundown of what's work-in-progress right now.

## Runtime Stuff

As of currently writing this, the vexide runtime is fairly feature-complete (although lacking real-world testing). That being said, there are a still a few things missing before we have complete feature parity with PROS. This includes:

- SDCard filesystem support. Currently being worked on by Gavin in [PR #22](https://github.com/vexide/vexide/pull/22).
- GPS sensor bindings, which are already [feature-complete](https://github.com/vexide/vexide/pull/79) but couldn't be tested on real hardware in time for 0.3.0.
- AI Vision Sensor support, which has a [draft PR](https://github.com/vexide/vexide/pull/58) in the works by Gavin.
- Some irrelevant legacy ADI devices that nobody uses. I'll maybe add these one day. 

## Evian

Evian is a work in progress controls library for vexide. You can think of it as similar to a template like [LemLib](https://github.com/LemLib/LemLib) for PROS. This library will make it much easier for advanced users to fully leverage vexide for writing autonomous routines. Evian is highly generic across different localization and robot setups, and uses a command-based architecture. We hope it can serve as a base framework for testing and writing new motion algorithms and controls libraries.

It's not competition-ready at all yet -- many API details haven't been ironed out and it's completely untested, but you can check out the repository [here](https://github.com/vexide/evian).

## Simulators

Some significant effort has been put into our simulator tooling by [Lewis](https://github.com/doinkythederp), who has written a communications protocol for V5 simulator backends to communicate with. For a more in-depth look at that, we have a [simulators section in our internal documentation](https://internals.vexide.dev/simulators/).

The "holy grail" of our simulator backends is currently the [QEMU backend](https://github.com/vexide/vex-v5-sim/) which emulates the actual user processor of the brain on a hardware level, allowing you to run both PROS and vexide programs compiled for ARM. We hope that this will allow for some accurate realtime user program simulations in the future with advanced debugging features through GDB.

This has proved to be a pretty hard project though, as it's essentially a completely bare metal embedded kernel designed to emulate a proprietary userspace. Despite this, we are currently able to emulate a PROS user program with functional FreeRTOS tasks as well as vexide programs. The main hurdle at this point is finding a cross-platform solution for host-to-guest communication, which will likely result in us having to write our own embedded UART driver. (Fun!)

## Porting `std` to the V5

Back in May, [Max](https://github.com/max-niederman) forked the Rust compiler and [began efforts](https://github.com/max-niederman/rust) to port the Rust standard library (`std` crate) to the V5. We ended up with a program that compiled against our new experimental port, but threw memory errors at runtime. As a result, this was put on the backburner while the serial protocol efforts happened, but it's something we plan to come back to. We've already identified the probable cause of these memory errors and will be testing things soon.

The end-goal of these efforts is to eventually merge in support for a [Tier-3 compiler target](https://doc.rust-lang.org/rustc/target-tier-policy.html) for the V5 to upstream Rust, which will serve as a large step in improving Rust tooling on the V5.

# New Contributors

vexide is a community project maintained for free by open-source contributors. We'd like to thank the following new contributors to the project:

- [alexDickhans](https://github.com/alexDickhans) (VRC team 2654P) for several contributions to our screen drawing API.
- [42Willow](https://github.com/42Willow) for finding and fixing some bugs in `vexide-template`.