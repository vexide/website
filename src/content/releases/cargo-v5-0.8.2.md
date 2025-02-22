---
title: cargo-v5 0.8.2
project: cargo-v5
date: 2024-11-03
---

## Added

- You can now create new vexide projects with the `cargo v5 new` and `cargo v5 init` commands.
- Added support for user input in `cargo v5 terminal`.
- Added the ability to use `cargo-v5` as a field controller through the `cargo v5 fc` command. This can only be used if installed with the optional `field-control` feature.

## Fixed

- Target specification now uses the correct VFPv3 float ABI.
- Uploads will now only be attempted when a successful build occurs.