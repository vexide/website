---
title: "Fall 2026: vexide 0.9.0, Rust 1.101, and Other Fun Stuff"
description: meowmeowmeow read my post pleas e
author: {
    name: "Tropical",
    github: "tropicaaal",
}
tags: ["news"]
date: 2026-09-06
thumbnail: {
    url: "/images/thumbnails/melancholy.png",
    alt: "pink, blue, and white glowing vexide logo."
}
---

[Hi!](/blog/hi.png) It's been a while. Almost a whole year since our last blog post in fact. Yes, we're still alive!

# Alright, where have we been?

Development on *vexide* in specific has somewhat slowed down since we released 0.8.0 last November. That isn't really because of burnout or anything <i style="font-style: italic; font-size: 10px;">[ okay, maybe a little :( ]</i>, but more because we just don't have all that much to work on. People have mostly put time towards side projects instead *(we'll get into those later down this post; they're pretty cool!)*

VEX has mostly stopped work on new V5 peripherals after releasing the AI Vision Sensor back in 2024. They made a thingamabob for the BEST Robotics Compeition last year, the [MC55](https://www.vexrobotics.com/270-8996.html), but that's already usable from vexide's existing `Motor` API. Most of the work being done on vexide has therefore been small maintenance things and bugfixes that have been building up over the past few months.

That being said, we did expect VEX to release one more V5 firmware update (VEXos 1.1.6) that adds support for AprilTag localization to the AI Vision Sensor this competition season. Originally, we were planning on waiting for VEXos 1.1.6 before updating vexide so that we could support these new features on Day 1, but things started breaking in other places and VEXos 1.1.6 has taken longer than we expected to release.

> [!TIP]
> **Fun Fact:** Both teams in the VEXU world championship finals last season were vexide users!

# So here we are: vexide 0.9.0

This is probably the first release where we *haven't* gone out and broken a whole bunch of stuff. That's a good thing though; it means our API surface has mostly stabilized out.

<img height="340" alt="0.9.0's changelog is a lot smaller!" align="center" src="/blog/0.9.0-changelog-comparison.png" />

There are still a few important things worth mentioning, though.

## Updating to Rust 1.101

Every time we update vexide, we also update the specific Rust version that vexide projects must use. We enforce a specific Rust version inside projects for two reasons:

1. Each vexide release is built and tested against a specific version of Rust. Despite stability guarantees, Rust can and does break things in our toolchain between releases, mostly due to our usage of unstable features.
2. We try to stay up to date with new Rust features and best practices internally, and therefore need to update our Minimum Supported Rust Version (MSRV) whenever we use a newly introduced language feature.

This release, we're updating from Rust `1.93.0-nightly (80d8f292d 2025-11-25)` to Rust `1.101.0-nightly (e9bbadf68 2026-10-12)`. This means you'll now be able to use a load of new language features in your project like [`cfg_select!`](https://doc.rust-lang.org/beta/std/macro.cfg_select.html), [`core::range`](https://doc.rust-lang.org/beta/core/range/index.html), and [the `!` type](https://doc.rust-lang.org/std/primitive.never.html).

> [!NOTE]
> This release stabilized all of the previously unstable/nightly language features that we used in vexide internally, but we still have to use nightly Rust for [reasons](https://doc.rust-lang.org/cargo/reference/unstable.html#build-std).


## Programs Got Even Smaller!

[Lewis](https://github.com/lewisfm) has done some great work reducing the binary size of vexide programs in this release, which should hopefully shave off a second or two from your cold wireless upload times. A "hello world" program is now 39.0kB and the Clawbot program is now 45.0kB uncompressed. Here are some fun (non-scientific) [stats](https://docs.google.com/spreadsheets/d/1EH5849VuZbjJsZvNI7nMzp7p4jwLM3UHZNYsuK5TCWA/edit) taken on equivalent programs across vexide, PROS, and VEXcode after compression is applied (what's actually uploaded to the brain):

|Runtime|First Upload Size|Second Upload Size|
|-------|-----------------|------------------|
|VEXcode (20240802)|4.5 kB|4.5 kB|
|vexide (dev)|29.2 kB|0.2 kB|
|vexide (0.8.0)|38.6 kB|0.2 kB|
|PROS monolith (4.2.2)|248.3 kB|248.3 kB|
|PROS hot/cold (4.2.2)|1122.6 kB|0.6 kB|

> [!NOTE]
> "First Upload Size" refers to the size of what's transferred to a brain the first time that the program is uploaded. "Second Upload Size" refers to what's transferred in subsequent uploads to illustrate the characteristics of [hot/cold linking](https://pros.cs.purdue.edu/v5/tutorials/topical/wireless-upload.html) and [differential uploads](https://vexide.dev/docs/building-uploading/#differential-uploading).

![comparison of PROS to vexide to vexcode upload sizes](/blog/0.9.0-upload-comparison.png)

Most of the size gains come from us switching the instruction set of vexide programs from ARM to Thumb-2. Yes, the brain's processor [actually supports two different instruction sets](https://support.arm.com/documentation/den0013/0400/ARM-Architecture-and-Processors/Architecture-history-and-extensions/Thumb-2). Compared to classic ARM mode, Thumb-2 has higher instruction density due to using variable-length encoding (certain CPU instructions fit in 16 bits rather than 32), which reduces binary size by up to 30%. In our testing, the switch to Thumb-2 did not cause any meaningful performance penalty either. This does mean that vexide programs now use a different target though: the `armv7a-vex-v5` target in the Rust compiler has been renamed to [`thumbv7a-vex-v5`](https://doc.rust-lang.org/nightly/rustc/platform-support/thumbv7a-vex-v5.html).

We also rewrote our backtrace collection system to no longer use LLVM's [`libunwind`](https://bcain-llvm.readthedocs.io/projects/libunwind/en/latest/) library when we report errors, which shaved a further 15% off of smaller programs due to no longer needing unwind tables. We have some further plans in the works to potentially improve our differential uploading system in the future, so stay tuned for that as well!

## I Hate Modular Arithmetic

In 0.8.0, we introduced the [`Angle`](https://docs.rs/vexide/0.8.0/vexide/math/struct.Angle.html) type, which is used by a bunch of different sensors that report angular position (e.g. `RotationSensor`, `InertialSensor`).

A common operation that people want to do on angles is wrapping/normalizing them to be in the range of `[0°, 360°)` or `[-180°, 180°)`. The latter is often used in motion control algorithms to determine the most efficient direction to turn to an angle.

```rs
// @fold start
use vexide::math::Angle;

// @fold end
let my_angle = Angle::from_degrees(395.0);

//         (                                                )
assert_eq!(my_angle.wrapped_half(), Angle::from_degrees(35.0));
//        ^
// [These should be the same after we normalize to [-180, 180).]<<<<
```

Unfortunately, something was wrong in 0.8.0's implementation of `Angle::wrapped_half` that caused it to return the *negative* version of the correct angle. That's now fixed in this release. Sorry about that, we have unit tests in place to catch stuff like this now. If you were using this API in your libraries, be sure to flip the signs around since it's now implemented correctly.

## Speaking of testing...

Last release, we added support for compiling vexide programs to host computers, meaning you can run your robot's program directly on your own computer with a mock SDK. This enables us to automatically test the individual parts of vexide not reliant on real hardware to ensure they work correctly.

<div style="margin-block-start: 16px; text-align: center">
  <video width="600" controls>
    <source src="/blog/tests.mp4" type="video/mp4" />
  </video>
</div>

There is one problem with this approach, and that's the fact that we couldn't run automatic tests on real hardware. Well, now we can! vexide now has a [custom test harness](https://github.com/vexide/vexide/tree/main/self-tests) that can run a series of hardware tests on a real brain to ensure that our device APIs work as intended. We currently have a few of these implemented as a proof-of-concept, but you can expect coverage to expand over time.

## Distance Sensor Weirdness

Some people reported having issues with the distance sensor. Specifically, the sensor would fail to return values on occasion. [zabackary](https://github.com/zabackary/) did some digging and found that the sensor could take anywhere from 10-100 milliseconds to initialize on startup. During this initialization period, you couldn't read values from the sensor.

As a result, we now have a new `DistanceSensor::wait_ready` function that lets you to wait until the sensor is available:

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let sensor = DistanceSensor::new(peripherals.port_1);

    // @highlight
    _ = sensor.wait_ready().await;

    match sensor.object() {
        Ok(Some(object)) => println!("{object:?}"),
        Ok(None) => println!("No object!"),
        Err(error) => println!("Error! {error}"),
    }
}
```

## New Contribution and LLM/AI Policies

## How to Update from 0.8.0 to 0.9.0

Before you update the vexide dependency in your project's `Cargo.toml`, make the following adjustment to the `rust-toolchain.toml` file in your project's root. This will update your Rust version to the version vexide now requires:

```toml
[toolchain]
# @diff +
channel = "nightly-2026-10-12"
# @diff -
channel = "nightly-2025-11-26"
components = ["rust-src"]
```

After that, you can update vexide:

```sh
cargo update vexide
```

You will also need to update cargo-v5 to the latest version:

```sh
cargo v5 self-update
```

...oh right, we updated that too...

# cargo-v5 0.13.0: A (not so) Small Update

As always, we have a new cargo-v5 update to go along with this release of `vexide`. This update doesn't add much new functionality on the surface, but the story is much, much different under the hood...

![cargo-v5 pull request #39: 1,755 lines added, 3,178 lines removed](/blog/cargo-v5-pr.png)

The entire CLI has been more-or-less rewritten. It now has roughly half the dependencies as before, and uses the [smol](https://github.com/smol-rs/) async runtime rather than the more heavyweight and needlessly multi-threaded [tokio](http://tokio.rs/) runtime. This goes along with a significant restructuring of our `vex-v5-serial` and `vex-cdc` libraries, which implement the serial protocol required to communicate and send commands to VEX products over USB.

<img height="480" alt="output of cargo v5 cat --help" align="center" src="/blog/cargo-v5-cat.png" />

## More Than Just V5?

Despite the name, `cargo-v5` actually supports more than just the V5 Brain. Its primary purpose is to serve as vexide's uploading and project management tool, but it's also a general-purpose multitool for managing and retrieving information from VEX devices.

In this release, we've added limited support for a few newer VEX products, including:

- EXP Brain (`0x0600`)
- AIM Coding Robot (`0x0700`)
- AIR Controller (`0x0a10`)
- AIR Hornet (`0x0a00`)

> [!IMPORTANT]
> As a reminder, this does *NOT* mean that these devices are supported by vexide in any way. vexide will not run on anything other than V5 currently. It just means that `cargo v5` will recognize them and support basic commands like `cargo v5 ls`, `cargo v5 cat`, and `cargo v5 terminal`.
>
> Also, not everything works. In particular, some newer devices use a different file transfer format than the V5 that we don't support yet.

[Anish](https://github.com/Luminoso-256) also contributed some patches to our serial library to allow us to talk to AI Vision Sensors in a limited fashion from a PC, though that isn't supported in cargo-v5 at the moment. Other contributions from him include packets for setting the controller's backlight state and rumble motor over USB.

# v5gdb: A Debugger for Your Brain

# Running Linux on a V5 Brain?

# Roboscope: Yet another vexide simulator.

Over the last few years, we've made a chingoncerning number of short-lived projects trying to do one thing: run your vexide programs without a physical robot.

# Parting Words

