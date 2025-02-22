---
title: cargo-v5 0.8.0
project: cargo-v5
date: 2024-10-05
---

## Added

- `cargo v5 run` provides a cargo runner capable of building and uploading a program, running the program, and opening the terminal in one command.


## Changed

- Added support for `vexide` 0.4.0's new target specification using the ARM hard-float ABI.
- Previous target specification files will now be overwritten.
- The `package.metadata.v5` field in `Cargo.toml` is now no longer required for projects.
