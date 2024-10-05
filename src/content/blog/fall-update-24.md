---
title: "Fall Updates: vexide 0.4.0, cargo-v5 0.8.0, Simulator, Docs, and more!"
description: Important project updates for Fall 2024!
author: tropix126
tags: ["blog"]
date: 2024-10-05
thumbnail: {
    url: "/images/thumbnails/y2k.png",
    alt: "Thumbnail Image"
}
---

It's that time of the year — and by "that time", I mean... early October! Hey, fall is a nice season.

We've got some important updates to share with you regarding the vexide project, so let's recap everything that's been worked on since our [summer update](/blog/posts/summer-update-24/).

# Releasing vexide 0.4.0

vexide 0.4.0 has just released, containing our last 3 months of work on the vexide runtime. [If bullet points are more your style, the full changelog can be viewed here.](/blog/posts/vexide-040/)

This new version of vexide will require you to update to the latest version of `cargo-v5`. You can do that with the following terminal command:

```sh
cargo install cargo-v5
```

> [!IMPORTANT]
> If you are not on `cargo-v5` 0.8.0 or above, some things will be broken due to [ABI changes in our target specification](#target-spec-changes). You can check your version using `cargo v5 --version`.


## Major Stability Improvements

0.4.0 comes with many **major** improvements to runtime stability, and things should overall run a lot smoother. This includes a major bug where programs would freeze when being run for the first time with a motor plugged in.

> [!IMPORTANT]
> In fact, it's strongly recommended that you update to 0.4.0 as soon as possible, since some of the bugs fixed here were fairly serious and unpredictable.

## New Startup Banner

We've got a fancy new startup banner inspired by `neofetch`. It looks like this:

```ansi
[1;38;2;210;15;57m=%%%%%#-  [38;5;254m-#%%%%-[0m[1;38;2;210;15;57m  :*%%%%%+.[1;33m   🦀 vexide 0.4.0[0m
[1;38;2;254;100;11m  -#%%%%#-  [38;5;254m:%-[0m[1;38;2;254;100;11m  -*%%%%#[0m       ---------------
[1;38;2;223;142;29m    *%%%%#=   -#%%%%%+[0m         ╭─[1;33m🔲 VEXos:[0m 1.1.4-r19
[1;38;2;64;160;43m      *%%%%%+#%%%%%%%#=[0m        ├─[1;33m🦀 Rust:[0m 1.78.0-nightly
[1;38;2;32;159;181m        *%%%%%%%*-+%%%%%+[0m      ├─[1;33m🏆 Mode:[0m Driver
[1;38;2;30;102;245m          +%%%*:   .+###%#[0m     ├─[1;33m🔋 Battery:[0m 100%
[1;38;2;114;135;253m           .%:[0m                 ╰─[1;33m⌚ Uptime:[0m 64.57ms
```

This makes better use of space in the terminal, and prints some useful information along with it for debugging. It also supports a bunch of custom themes!

<div class="code-split">

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
use vexide::startup::banner::themes::THEME_TRANS;

#[vexide::main(banner(theme = THEME_TRANS))]
async fn main(_peripherals: Peripherals) {}
```

```ansi
[1;38;2;115;207;244m=%%%%%#-  [38;5;254m-#%%%%-[0m[1;38;2;115;207;244m  :*%%%%%+.[1;33m   🏳️‍⚧️ vexide 0.4.0[0m
[1;38;2;115;207;244m  -#%%%%#-  [38;5;254m:%-[0m[1;38;2;115;207;244m  -*%%%%#[0m       ---------------
[1;38;2;238;175;192m    *%%%%#=   -#%%%%%+[0m         ╭─[1;33m🔲 VEXos:[0m 1.1.4-r19
[1;38;2;255;255;255m      *%%%%%+#%%%%%%%#=[0m        ├─[1;33m🦀 Rust:[0m 1.78.0-nightly
[1;38;2;238;175;192m        *%%%%%%%*-+%%%%%+[0m      ├─[1;33m🏆 Mode:[0m Driver
[1;38;2;115;207;244m          +%%%*:   .+###%#[0m     ├─[1;33m🔋 Battery:[0m 100%
[1;38;2;115;207;244m           .%:[0m                 ╰─[1;33m⌚ Uptime:[0m 60.18ms
```

</div>

## Math Got Even Faster

[Last release](/blog/posts/vexide-030/), we improved floating point math performance by over 100 times by switching to a more optimized build of `libm`. This release, we made some adjustments to our platform target to use the [ARM Hard-float ABI (`eabihf`)](https://wiki.debian.org/ArmHardFloatPort), which brings in additional floating-point performance improvements.

Here's a crude benchmark computing `f64::sin(35.0)` 10,000 times with our old `libm` (+softfp) and our new `libm` (+hard):

| `libm.a` (+softfp) | `libm.a` (+hard)    |
| ------------------ | ------------------- |
| 3.699ms (1.0x)     | **1.659ms (2.22x)** |

For context, the `libm` used by PROS/VEXcode completes this benchmark in 383.284ms.

## GPS Support

vexide now has support for the [V5 GPS Sensor](https://www.vexrobotics.com/276-7405.html), a visual odometry sensor with an integrated IMU. This puts us on feature parity device-wise with PROS. Expect AI Vision support in the next release!

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let gps = GpsSensor::new(
        peripherals.port_1,
        (0.0, 0.0), // Offset from the robot's center.
        ((0.0, 0.0), 90.0), // Starting pose.
    );

    println!("{:?}", gps.pose().unwrap());
}
```

Check out the [GPS Sensor API](https://docs.rs/vexide-devices/latest/vexide_devices/smart/gps/index.html) for a full list of functionality.

## New Distance Sensor API

The [Distance Sensor API](https://docs.rs/vexide-devices/latest/vexide_devices/smart/distance/index.html) has receieved a refactor. Information about detected objects is now available all at once through the `DistanceObject` struct, and some improvements to error handling have been made.


```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
async fn main(peripherals: Peripherals) {
    let sensor = DistanceSensor::new(peripherals.port_1);
    
    if let Some(object) = sensor.object().unwrap() {
        println!("Distance: {}", object.distance);
        println!("Size: {}", object.relative_size);
        println!("Velocity: {}", object.velocity);
        println!("Confidence: {}", object.confidence);
    }
}
```

## Panic Backtraces

Panics in vexide will now print a stack backtrace to the terminal.

```ansi
panicked at packages/vexide/examples/basic.rs:9:5:
explicit panic
stack backtrace:
  0: 0x380978b
  1: 0x382effb
  2: 0x382f1ef
  3: 0x382f17b
  4: 0x38022eb
  5: 0x380517f
  6: 0x3803377
  7: 0x381694b
  8: 0x381736f
  9: 0x3806773
 10: 0x3808b87
 11: 0x38022ab
note: Use a symbolizer to convert stack frames to human-readable function names.
```

This is a useful debugging feature that gives you the memory location of each function call leading up to the panic. You can retrieve the human-readable function names by putting these addresses through a symbolizer like [`llvm-symbolizer`](https://llvm.org/docs/CommandGuide/llvm-symbolizer.html):

<div class="code-split">

```sh
llvm-symbolizer --obj ./target/armv7a-vex-v5/debug/examples/basic -p 0x380978b 0x382effb 0x382f1ef 0x382f17b 0x38022eb 0x380517f 0x3803377 0x381694b 0x381736f 0x3806773 0x3808b87 0x38022ab
```

```ansi
vexide_core::backtrace::Backtrace::capture::hbfed684cb9d820ef at /home/tropical/Documents/GitHub/vexide/packages/vexide-core/src/backtrace.rs:56:16
 (inlined by) rust_begin_unwind at /home/tropical/Documents/GitHub/vexide/packages/vexide-panic/src/lib.rs:114:21
core::panicking::panic_fmt::hc1365e6e8c700089 at /home/tropical/.rustup/toolchains/nightly-2024-02-07-x86_64-unknown-linux-gnu/lib/rustlib/src/rust/library/core/src/panicking.rs:72:14
core::panicking::panic_display::h206c1c445d549671 at /home/tropical/.rustup/toolchains/nightly-2024-02-07-x86_64-unknown-linux-gnu/lib/rustlib/src/rust/library/core/src/panicking.rs:196:5
core::panicking::panic_explicit::h2aa18692b89c3465 at /home/tropical/.rustup/toolchains/nightly-2024-02-07-x86_64-unknown-linux-gnu/lib/rustlib/src/rust/library/core/src/panicking.rs:179:5
basic::_::_start::main::_$u7b$$u7b$closure$u7d$$u7d$::panic_cold_explicit::h76e53da393cce4ed at /home/tropical/.rustup/toolchains/nightly-2024-02-07-x86_64-unknown-linux-gnu/lib/rustlib/src/rust/library/core/src/panic.rs:87:13
basic::_::_start::main::_$u7b$$u7b$closure$u7d$$u7d$::hb4dfae4a10176451 at /home/tropical/Documents/GitHub/vexide/packages/vexide/examples/basic.rs:9:5
async_task::raw::RawTask$LT$F$C$T$C$S$C$M$GT$::run::hdca7ede889e96330 at /home/tropical/.cargo/registry/src/index.crates.io-6f17d22bba15001f/async-task-4.7.1/src/raw.rs:542:20
async_task::runnable::Runnable$LT$M$GT$::run::h8acf0b31ab2e927b at /home/tropical/.cargo/registry/src/index.crates.io-6f17d22bba15001f/async-task-4.7.1/src/runnable.rs:781:18
vexide_async::executor::Executor::tick::hca8e75d3755732ea at /home/tropical/Documents/GitHub/vexide/packages/vexide-async/src/executor.rs:68:17
vexide_async::executor::Executor::block_on::h276b25d369d57fbe at /home/tropical/Documents/GitHub/vexide/packages/vexide-async/src/executor.rs:95:13
vexide_async::block_on::h89430167eae07d09 at /home/tropical/Documents/GitHub/vexide/packages/vexide-async/src/lib.rs:26:5
_start at /home/tropical/Documents/GitHub/vexide/packages/vexide/examples/basic.rs:7:1
```

</div>

> [!NOTE]
> This was made possible by compiling a custom version of [`libunwind`](https://github.com/llvm/llvm-project/tree/main/libunwind) for the V5 brain, then [writing our own bindings to the library for retrieving backtrace context](https://github.com/vexide/vex-libunwind). Thanks to [Lewis](https://github.com/doinkythederp/) for his work on this!

## Startup/Boot Code Rewrite

Since vexide's release, we had this stupid line of code in our linkerscript (a file that lays out memory regions for your program):

```linkerscript
/*
It's currently unclear why subtracting anything is necessary, but it fixes memory permission errors.
0x100 is an arbitrary number that works.
*/
__heap_end = __user_ram_end - __stack_length - 0x100;
```

Why did we subtract `0x100` from the end of the heap? I dunno, but if we didn't do that then your program would crash and burn with a memory error under some conditions. The worst part was that the number that needed to be subtracted for a working program *depended on if you compiled with release or debug*. `0x100` was just a number seemingly large enough to satisfy both debug and release. Seriously weird stuff.

Sometime after the release of 0.3.0, the bug got worse and led to `debug` builds failing 100% of the time no matter what, which led me on a wild goose chase to find the source of this error.

![Discord conversation showing the stack corruption bug](/blog/stack-corruption.png)

Eventually, this led to the discovery of a stack corruption bug in vexide's startup code. This bug has been fixed in 0.4.0 and our boot routine in `vexide_startup` has been completely refactored — vexide programs now boot starting from a small assembly routine rather than starting directly in Rust. No more stack corruption and no more magic numbers.

# `cargo-v5` 0.8.0

Along with vexide 0.4.0, we are releasing `cargo-v5` version 0.8.0. `cargo-v5` is our command-line tool for building and uploading vexide projects, and this release comes with some minor improvements and polish to the tool.

## Target Spec Changes

We've made some breaking changes to the `armv7a-vex-v5` target spec in order to support vexide 0.4.0's new math optimizations. This switches us to use LLVM's `armv7a-none-eabihf` target, as well as clean up a few relics from the `pros-rs` days.

## Runner

A new command has been added — `cargo v5 run`, which uploads your program, runs it on the brain, then opens the serial terminal all in a single command. This is effectively a faster shorthand for `cargo v5 upload --after=run && cargo v5 terminal`, which was a lot to type out and a pretty common operation.

## Uploading Outside of Cargo Projects

Previously, it was absolutely required that cargo-v5 be ran inside of a valid Rust project, despite manual file uploads supported. This is no longer the case, and you can use it as a generic CLI tool anywhere for uploading program binaries.

```sh
cargo v5 upload --file program.bin
```

# Simulator Progress

Since our summer update, the [QEMU simulator project](https://github.com/vexide/vex-v5-qemu) has made huge progress and proved useful as a kernel debugging tool. The simulator kernel now correctly emulates interrupts on the V5 to allow for execution and debugging of PROS and vexide programs, the V5 Display SDK, and much more.

This is a big deal, because it allows attaching a debugger like [GDB](https://en.wikipedia.org/wiki/GNU_Debugger) to user programs for low-level inspection of program behavior (single-stepping, breakpoints, etc...)

As is customary, here it is running [Sylvie's fullscreen DOOM port](https://sylvie.fyi/posts/v5doom-fullres/).

![Simulator rendering frames from a V5 DOOM port](/blog/sim-doom.png)

## Simulator GUI

Work has been started on a GUI interface for the QEMU simulator. It's written using [Tauri](https://tauri.app/) and [Svelte](https://svelte.dev/) with a rust backend for communication with QEMU via the host crate. It's general UI flow is pretty interesting, where you can wire up your devices in a node graph similar to how a real robot is wired.

<div style="margin-block-start: 16px; text-align: center">
  <video width="600" controls>
    <source src="/blog/sim-gui-preview.mp4" type="video/mp4">
  </video>
</div>

The GUI is still in its early stages of development. Gavin had to write his own language interpreter for the node graph system, making this by far one of the most complicated and wide-scoped projects we've worked on.

![Preview of the simulator GUI](/blog/sim-gui.png)

## Simulator Host

The simulator's [host crate](https://github.com/vexide/vex-v5-qemu/tree/main/packages/host) is the API behind the QEMU sim, and is where the host-side device abstractions are being developed. This is where things like interactions with motors and sensors are mocked and communication with the QEMU child process over our binary protocol is done.

```rs
let mut simulated_brain = Brain::new();
let peripherals = simulated_brain.peripherals.take().unwrap();

simulated_brain
    .run_program(Command::new("qemu-system-arm"), kernel, binary)
    .await
    .context("Failed to start QEMU.")?;

simulated_brain.wait_for_exit().await?;
```

Both our GUI and CLI client implementations of the simulator use the host crate for communication, and we hope that it can eventually be used to create fun things like CIs and test harnesses for people to use.

![Simulator architecture](/blog/sim-architecture.svg)

# Standard Library Port

This summer, we announced that progress was made on [a port of the Rust Standard Library](https://github.com/vexide/rust/tree/armv7a-vex-v5) (`libstd`) to the V5 Brain. Well, that work is nearing completion and we are going to attempt to upstream this platform support into `rust-lang/rust` in the near future. This will open the door to much of the wider Rust ecosystem to vexide and allow the use of many more crates.

Work has already begun on a rewritten version of `vexide` that works in a `std`-enabled enviornment. You can track development of that [here](https://github.com/vexide/vexide/tree/feat/rust-std).

# Documentation Improvements

Many improvements to both our [API docs](https://docs.rs/vexide) and [tutorials](https://vexide.dev/docs) have been made, along with some fixes to mobile support on our website. Tutorials should now be much more in-depth and come with some fancy new annotated codeblocks as examples. Hope you enjoy those.

# New Contributors

vexide is a community project maintained for free by open-source contributors. We'd like to thank the following new contributors to the project:

- [Game Dungeon](https://github.com/GameDungeon) for their work refactoring the distance sensor API and helping us debug some major runtime bugs.
- [ion098](https://github.com/ion098) for adding MMU support to the simulator's embedded kernel.
- [meisZWFLZ](https://github.com/meisZWFLZ) for adding enviornemnt variable support for the simulator's CLI, allowing it to be ran in a docker container.
