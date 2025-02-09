---
title: cargo-v5 0.6.1
project: cargo-v5
date: 2024-07-12
---

## Added

- You can now pass pre-`objcopied` program binaries (.bin) files to `cargo v5 upload` using the `--file` argument.

## Changed

- Cut down on some dependencies to improve compile times.

## Fixed

- Fixed a bug with the internal implementation of `objcopy` in cargo-v5 generating invalid user programs.