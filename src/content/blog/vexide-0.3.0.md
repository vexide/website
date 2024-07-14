---
title: vexide v0.3.0
description: vexide 0.3.0 released
author: gavin-niederman
tags: ["release"]
date: 2024-07-13
---

This is the first major vexide update this summer! To read about our summer plans, take a look at [our blog post on that subject](/blog/posts/summer-update-24/).

We are releasing vexide 0.3.0 along side two new vexide projects: [`vex-v5-serial`](https://github.com/vexide/vex-v5-serial) and [`cargo-v5`](https://github.com/vexide/cargo-v5).
`cargo-v5` is our new build tooling. Unlike `cargo-pros`, `cargo-v5` doesn't depend on pros-cli, the ARM GNU Toolchain, or `cargo-binutils`. It is highly recommended to switch to `cargo-v5`. You can learn more about both `cargo-v5` and `vex-v5-serial` in [this blog post](/blog/posts/serial-release).

Now for the vexide changes!

# Changelog

## Added

- The startup banner and code signature may now be configured using parameters passed to `vexide::main`. ([#102](https://github.com/vexide/vexide/pull/102))
- Added the ``ProgramOwner``, ``ProgramType``, and ``ProgramFlags`` types for code signature configuration. ([#76](https://github.com/vexide/vexide/pull/76))
- Created new ``force_rust_libm`` feature to force the use of a slower, 100% Rust, libm implementation. This is useful for building on WASM. ([#106](https://github.com/vexide/vexide/pull/106))
- Optimized floating point math operations available through the `Float` extension trait. ([#77](https://github.com/vexide/vexide/pull/77))
- Added text metrics getters to the `Text` widget. ([#83](https://github.com/vexide/vexide/pull/83))
- Added alignment support for the `Text` widget. ([#85](https://github.com/vexide/vexide/pull/85))
- `CompetitonBuilder` functions can now return a `ControlFlow` in order to explicitly end execution. ([#89](https://github.com/vexide/vexide/pull/89))
- `Point2` can now be converted to mint when using the `nalgebra` feature. ([#91](https://github.com/vexide/vexide/pull/91))

## Fixed

- Peripherals can now be mutated in the main function ([#75](https://github.com/vexide/vexide/pull/75))
- Panic messages now output over serial even on `display_panics` feature.

## Changed

- Updated ``vex-sdk`` to version 0.17.0. ([#76](https://github.com/vexide/vexide/pull/76))
- Renamed ``ColdHeader`` to ``CodeSignature``. ([#76](https://github.com/vexide/vexide/pull/76)) (**Breaking Change**)
- Renamed the entrypoint symbol from ``_entry`` to ``_start``. ([#76](https://github.com/vexide/vexide/pull/76)) (**Breaking Change**)
- Renamed ``__stack_start`` and ``__stack_end`` symbols to ``__stack_top`` and ``__stack_bottom`` respectively. ([#76](https://github.com/vexide/vexide/pull/76)) (**Breaking Change**)
- Renamed the ``.cold_magic`` section to ``.code_signature``. ([#76](https://github.com/vexide/vexide/pull/76)) (**Breaking Change**)
- Made fields on screen widgets public. ([#81](https://github.com/vexide/vexide/pull/81))
- Renamed `Competition` to `CompetitionRuntime`, `CompetitionRobotExt` to `CompetitionExt`, and `CompetitionRobot` to `Competition`. ([#87](https://github.com/vexide/vexide/pull/87)) (**Breaking Change**)
- Removed the `Error` associated type from the `Competition` trait and made all methods infallible. ([#87](https://github.com/vexide/vexide/pull/87)) (**Breaking Change**)

## Removed

- The `no-banner` feature has been removed from `vexide-startup` and must now be toggled through the `vexide:main` attribute. ([#102](https://github.com/vexide/vexide/pull/102)) (**Breaking Change**)
- Removed the useless ``__rodata_start`` and ``__rodata_end`` symbols.
- Support for `vexide-math` has been dropped. ([#78](https://github.com/vexide/vexide/pull/78)) (**Breaking Change**)
