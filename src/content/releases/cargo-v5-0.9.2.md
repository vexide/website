---
title: cargo-v5 0.9.2
project: cargo-v5
date: 2024-12-18
---

## Added

- `cargo-v5` will now cache the locally downloaded template when the `fetch-template` feature is enabled.
- Added the `llvm-floatabi` field to the `armv7a-vex-v5` target spec to support builds on the latest rustc nightly versions. 

## Fixed

- Fixed an issue with `cargo v5 screenshot` capturing images with too large of a buffer.
- Fixed a compiler error from the `directories` dependency when the `fetch-template` feature was enabled.