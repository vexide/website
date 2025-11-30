---
title: Optional Features
---

![vexide logo next to a settings icon](/docs/config.svg)

Certain features of vexide can be optionally enabled or disabled using Cargo. This serves three purposes:
- Projects aiming to be lightweight can disable the features they don't need to save on compile and upload times.
- People who value convenience can add some functionality to their programming environment without having to re-invent the wheel themselves.
- Libraries that depend on `vexide` can avoid bringing in features that users don't want or need.

This page will cover every optional feature in vexide, what each one does, why you should (or shouldn't) enable them, and which ones are enabled by default.

# Recommendations

Let's first cover some sane defaults that you should probably stick with if you aren't sure what to use. Our recommendations here depend on if you're writing a *program* or a *library*.

## For Programs

If you're creating a robot program (that is, if your project contains a `main` function), then enable the `full` and `default-sdk` features.

```toml title="Cargo.toml"
[dependencies]
vexide = { version = "*", features = ["full", "default-sdk"] }
```

(This is the same set of features you get when making a project with [`vexide-template`](https://github.com/vexide/vexide-template/blob/main/Cargo.toml).)

## For Libraries

If you're writing a library that other robot programs will use, do not enable any additional features.

```toml title="Cargo.toml"
[dependencies]
vexide = "*"
```

**Important:** Avoid enabling `full` or any of the `sdk` features in your library, since this can cause versioning and feature conflicts with programs which use a different feature-set.

# Feature Reference

Here are all of vexide's optional features. You can check which APIs each one enables in the [vexide API docs](https://docs.rs/vexide).

## Core Features

These features control access to vexide's core modules. They are all enabled by default.

- `core`: A core set of utilities for accessing operating system features.
- `async`: Support for starting and managing async tasks.
- `sync`: Utilities for synchronizing async tasks, such as mutexes and read-write locks.
- `devices`: Hardware APIs and peripheral access (smart ports, ADI ports, motors, sensors, etc...)

## Program Support Features

These features enable functionality that helps robot programs compile and run properly. They can either be enabled individually or all at once by using the `full` feature. *Libraries should not enable these features.*

- `startup`: User program startup, differential uploading, and runtime support. Enabling this feature is **required** for user programs to compile.
- `abort-handler`: Enables a custom crash handler and error screen for critical CPU faults. This feature provides additional debugging information (stacktraces, fault information, register dumps) to programs that have crashed due to undefined behavior. See [Aborts and Crashes](/docs/aborts/) for more details.
- `panic-hook`: Enables a custom crash handler and error screen for [Rust panics](https://doc.rust-lang.org/book/ch09-01-unrecoverable-errors-with-panic.html).
- `allocator`: Enables an optimized global memory allocator using the [`talc`](https://crates.io/crates/talc) crate. This overrides the default allocator provided by `std` (based on `dlmalloc`), which is more heavy and performs worse on average. The custom allocator will only be used when compiling for VEXos targets.
- `backtrace`: Adds support for capturing stack backtraces on VEXos for use in error messages using the [`Backtrace`](https://docs.rs/vexide/latest/vexide/backtrace/struct.Backtrace.html) API. This is distinct from [`std::backtrace`](https://doc.rust-lang.org/stable/std/backtrace/index.html), which doesn't work on programs compiled for VEXos.
- `macros`: Enables attribute macros such as [`#[vexide::main]`](https://docs.rs/vexide/latest/vexide/attr.main.html) and [`#[vexide::test]`](https://docs.rs/vexide/latest/vexide/attr.test.html) for declaring program entrypoints. See [Program Structure](/docs/program-structure/) for more details.

## SDK-Related Features

vexide and the Rust Standard Library use an SDK to access VEX peripherals and operating system resources. The following vexide features allow you to pick which SDK your program will use. All SDKs should have the same functionality and only differ in platform support and licensing.

> [!IMPORTANT]
> These features shouldn't be used by libraries. Only one V5 SDK may be enabled at a time, so enabling one in a library will make it incompatible with libraries or programs that enable a different SDK.

The `default-sdk` feature enables the recommended SDKs. This is the best option for most vexide projects and should be preferred over picking an SDK. At the time of writing, the recommended SDKs are `vex-sdk-jumptable` on VEXos and `vex-sdk-mock` on desktop due to their compatibility and flexible licenses.

Alternatively, vexide allows you to choose a different SDK by enabling one of the following features.

These three SDKs work on the VEX V5 platform. All programs targeting the brain should enable at *exactly one* of these features. Enabling more than one of these three features will cause a compiler error.

- `vex-sdk-jumptable` *(Recommended)*: An open-source SDK created by vexide.
- `vex-sdk-pros`: Uses the proprietary parter developer SDK embedded inside of the [PROS kernel](https://pros.cs.purdue.edu/).
- `vex-sdk-vexcode`: Uses the proprietary & restricted SDK used in the VEXcode framework. Enabling this feature will require an internet connection on first build, as the SDK is downloaded from VEX's servers and stored separately from your project's source code.

    > [!WARNING]
    > Before using the VEXcode SDK, make sure you've reviewed its [restrictive licensing terms](https://www.vexrobotics.com/software-eula?srsltid=AfmBOoop-q9pTDFOns6CpYF1UVcBAKUG6j2n8DJ07IUycX4aXO9AUCWw) to ensure your project is compliant. Notably, VEX prohibits redistribution and decompilation of their SDK.

These SDKs work when targeting desktop operating systems, and may be enabled alongside one of the three V5-compatible SDKs:

- `vex-sdk-mock` *(Recommended)*: An SDK created by vexide for unit testing and simulation.

> [!TIP]
> If you aren't sure what to use in your or don't care, stick with the `default-sdk` feature.

## Miscellaneous Features

These features provide extra functionality or compatibility. They are not enabled by default, since most vexide users do not (or should not) need them. They may be freely enabled by both libraries and programs.

- `embedded-io`: Support for the [`embedded-io`](https://crates.io/crates/embedded-io) crate (as an alternative to using [`std::io`](https://doc.rust-lang.org/stable/std/io/index.html)).
- `dangerous-motor-tuning` **(Advanced)**: Enables customizing the PID constants used by [Smart Motors](/docs/motor/).

  > [!CAUTION]
  > Misuse of the `dangerous-motor-tuning` feature can (and likely will) cause **permanent damage** to your motors. It is *strongly advised* to leave this feature disabled. The vexide project and its contributors are not responsible for any hardware damage caused by this feature. **You have been warned.**
