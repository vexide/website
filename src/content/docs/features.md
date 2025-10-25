---
title: Optional Features
category: 04. Reference
page: 401
---

You can enable or disable certain attributes of vexide by toggling its various Cargo features. This serves a dual purpose: projects aiming to be lightweight can disable features they don't directly need to save on compilation and upload times. At the same time, end users who value convenience can easy add some functionality to their programming environment without having to re-invent the wheel.

The set of features that vexide enables by default are ideal for libraries and other projects that value adaptability: they don't make many assumptions about the environment they run in and keep the framework fairly lightweight. While this flexible-by-default approach helps vexide work well even for projects with unique constraints, the majority of people writing their robot logic will appreciate vexide's helpful components that enable patch uploading, memory allocation, and crash debugging.

## Quick Guide

If you're creating a robot program (that is, your project contains the `main` function), then enable the `full`, `vex-sdk-jumptable`, and `vex-sdk-mock` features.

```toml title="Cargo.toml"
[dependencies.vexide]
version = "*"
features = ["full", "vex-sdk-jumptable", "vex-sdk-mock"]
```

If you're writing a library that other robot programs will use, avoid using `full` or enabling any SDK.

```toml title="Cargo.toml"
[dependencies.vexide]
version = "*"
```

# Feature Reference

Here are descriptions of each of vexide's optional features. You can also check which APIs they enable on the [vexide API docs](https://docs.rs/vexide)

## Core Modules (enabled by default)

These features control access to vexide's core modules. They are enabled by default.

- `core`: A core set of utilities for determining the current state of the program and accessing operating system features
- `async`: Support for starting and managing async tasks
- `sync`: Utilities for synchronizing async tasks, such as mutexes and read-write locks
- `devices`: Hardware abstractions and APIs for accessing peripherals (smart ports, ADI ports, touch-screen, etc.)

## Support Modules

These features enable functionality that helps robot programs compile and run properly. They can either be enabled individually or all at once by using the `full` feature.

These features should only be disabled if you are writing a library or if you have set up an alternative to them.

- `abort-handler`: Crash handler and error screen for segmentation faults
- `allocator`: Heap memory allocator to support `Box`, `Vec`, and more
- `backtrace`: Support for capturing stack traces for use in error messages
- `macros`: Enables attributes such as `#[vexide::main]` and `#[vexide::test]`
- `panic-hook`: Crash handler and error screen for Rust panics
- `startup`: User program startup, patch uploading, and runtime support

## SDK Support

vexide and the Rust Standard Library use an SDK to access VEX peripherals, determine program state, and retrieve operating system resources. The following vexide features allow you to pick which SDK your program will use. All SDKs have the same functionality and only differ in platform support and licensing.

If you're not *absolutely sure* your project needs to use an alternative SDK, use `vex-sdk-jumptable` and `vex-sdk-mock`.

```toml title="Cargo.toml"
[dependencies.vexide]
version = "*"
features = ["full", "vex-sdk-jumptable", "vex-sdk-mock"]
```

These SDKs work on the VEX V5 platform:

- `vex-sdk-jumptable` *(Recommended)*: An open-source SDK created by vexide
- `vex-sdk-pros`: The proprietary SDK provided to the PROS operating system by VEX
- `vex-sdk-vexcode`: The proprietary & restricted SDK used in the VEXcode framework

These SDKs work on desktop operating systems:

- `vex-sdk-mock` *(Recommended)*: An SDK created by vexide for unit testing and simulation

> [!TIP]
> Before using the VEXcode SDK, make sure you've reviewed its **restrictive licensing terms** to ensure
> your project is compliant. Notably, VEX prohibits redistribution and decompilation of their SDK.

## Miscellaneous Features

Most vexide users do not need to enable these features.

- `embedded-io`: Support for the `embedded-io` crate (as an alternative to using `std`)
- `dangerous-motor-tuning` **(Advanced)**: Enables customizing the PID constants used by Smart Motors. *Setting certain values can damage your motors' hardware. You are encouraged to manually use voltage control instead.*
