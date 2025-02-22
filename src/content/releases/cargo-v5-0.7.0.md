---
title: cargo-v5 0.7.0
project: cargo-v5
date: 2024-08-03
---

## Fixed

Switched to the `cargo-binutils` version of `objcopy` as an emergency fix for our implementation sometimes producing binaries with undefined behavior.

In order to use this newer version, you will need to install `cargo-binutils`:

```sh
rustup component add llvm-tools
cargo install cargo-binutils
```