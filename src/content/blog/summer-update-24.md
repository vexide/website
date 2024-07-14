---
title: "Summer Updates: Announcing cargo-v5 and vexide 0.3"
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

It's been a solid minute since the [initial release of vexide](/blog/posts/vexide-010/) back in May, but we've been busy with development this summer and finally have some important announcements!

# Growing Pains & `pros-cli`

Since this project started, we have always relied on [pros-cli](https://github.com/purduesigbots/pros-cli) for uploading programs to the brain. This worked great for a while, but as the scope of things grew and we branched further from dependence on the PROS kernel, pros-cli became a less suitable fit.

The breaking point for us happened a few months back when I wrote some tutorials on setting up a project and realized that almost *half of the installation instructions* had to do with packaging and troubleshooting pros-cli across various operating systems. When it comes to Linux distributions in particular **(not nixos though)**, things can get very messy.

This isn't to fault the PROS project or anything, their CLI works great for them where everything is packaged with a VSCode extension by default, but we are working primarily with Rust tooling here and having users install an entire python toolchain to upload programs seems a little unreasonable.

## Implementing VEX's Serial Protocol in Rust

Since as early as [January of this year](/blog/protocol-plans.png), we had plans to do USB communication in Rust so that we could perform our own direct uploads without any external programs. Well, last month those efforts finally became a reality with the [`vex-v5-serial` crate](https://crates.io/crates/vex-v5-serial).

<a href="https://github.com/vexide/v5-serial-protocol-rust" target="_blank" rel="noreferrer noopener">

![serial experiments vex](https://private-user-images.githubusercontent.com/42101043/342184335-6eea71ca-cc28-4f87-82fb-7b476a0becd3.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjA5ODA0NTMsIm5iZiI6MTcyMDk4MDE1MywicGF0aCI6Ii80MjEwMTA0My8zNDIxODQzMzUtNmVlYTcxY2EtY2MyOC00Zjg3LTgyZmItN2I0NzZhMGJlY2QzLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA3MTQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwNzE0VDE4MDIzM1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWY5OTFhYmJiNDM5OTgwYTgxZDA2MTI5YmUzOTYzNjQyM2Q2MDlhN2M1ODc5MWQyZTM2YjNkYmIzY2ZiZDE5MGMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.I9gzeILXceCTdekGEZDFCTfsB3Y_qQKBpYWy0y0fb-w)

</a>

> Thanks to the help of [JerryLum's past reverse-engineering efforts](https://github.com/jerrylum/v5-serial-protocol) for making this possible.

## `cargo-pros` is dead. Long live `cargo-v5`! 🦀

Shortly after our new serial crate became usable, we began putting efforts towards improving vexide's tooling. So yeah, we now have a new command-line tool, [cargo-v5](https://github.com/vexide/cargo-v5)! Now you'll no longer need to install `cargo-binutils` or PROS CLI to use vexide.

<div style="margin-block-start: 16px; text-align: center">
  <video width="600" controls>
    <source src="/docs/upload-demo.mp4" type="video/mp4">
  </video>
</div>

You can install it as a cargo subcommand by running `cargo install cargo-v5`. This tool comes with a few fancy new features, like better error messages and the ability to configure your uploads from your Rust project's `Cargo.toml` file.

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

# Releasing vexide 0.3

Along with the new tooling improvements, we've also released vexide version 0.3.0 which includes a bunch of useful feature improvements. I'll try to cover the important stuff, but you can view the full changelog for that [here](https://github.com/vexide/vexide/blob/main/CHANGELOG.md).

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

Embedded Rust is a little weird. If you're coming from a typical Rust `std` project, you may find many things that just *aren't there* in a `no_std` enviornment. One of those things is math support for floating-point numbers.

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

This is because of the fact that Rust's standard library uses a combination of your platform's native `libm` library and certain LLVM intrinisics that just aren't available on our target. There's currently progress being made to [fix this](https://github.com/rust-lang/rfcs/issues/2505) in upstream Rust, but we aren't quite there yet.

For the time being, vexide now [provides its own implementation](https://github.com/vexide/vexide/blob/main/packages/vexide-core/src/float/mod.rs) of these floating-point math functions. We actually use two different libraries for this, depending on the target you're compiling to:

- If you are compiling for the native `armv7a-vex-v5` target (a brain) then we use [newlib's libm library](https://sourceware.org/newlib/).
- If you are compiling for WebAssmebly to run in a simulator, then we use [Rust's official port of MUSL's libm](https://github.com/rust-lang/libm/).

> You can also force vexide to always use the Rust libm port regardless of target if you want truly pure-rust binaries using the `"force-rust-libm"` feature. Keep in mind that the Rust port is both much slower and consierably larger!

## Bonus: It's fast!

These functions are actually **more performant** than the ones you'll find in PROS or VEXcode due to using a more optimized build of libm, with trig performance being nearly **63 times faster**.

Here's a (crude) benchmark of us running 10,000 iterations of `f64::sin(35.0)` on a V5 brain:

| [rust-lang/libm](https://github.com/rust-lang/libm/) | newlib libm | [PROS libm](https://github.com/purduesigbots/pros/blob/develop/firmware/libm.a) |
| -- | -- | -- |
| `6.809ms` | `3.699ms` | `383.284ms` |

We've passed this more optimized version of libm to the PROS developers, so you can expect to see similar improvements on their end soon as well!

# Future Plans

We still have a lot of plans for the rest of the summer!
Here is a list of our major plans:
- Evian: Evian is a work in progress controls library for vexide. You can think of it as similar to a template like LemLib for PROS. This library will make it much easier for beginners to use vexide. We hope that Evian will be in a usable state by the end of summer. You can find the repository [here](https://github.com/vexide/evian)
- QEMU Simulator: For a very long time now we have been working on our simulators. The holy grail of simulators is the QEMU simulator backend which will allow any program for a V5 Brain written in any language to be simulated perfectly. This will allow for incredibly easy debugging. You can view the QEMU simulator backend code [here](https://github.com/vexide/vex-v5-sim). Unfortunately, this is a really hard project to create. We hope that this project will be finished by the end of summer, but it might not end up happening. For a more in-depth look at simulators, we have a [simulators section in our internal documentation](https://internals.vexide.dev/simulators/).