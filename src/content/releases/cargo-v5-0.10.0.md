---
title: cargo-v5 0.10.0
project: cargo-v5
date: 2025-01-26
---

## Added

- Added support for differential uploads in `vexide` 0.6.0. This can be configured using the `upload-strategy` CLI argument or metadata option.

## Changed

- Uploads will now only reupload the `ini` file (program configuration) if it has changed.
- Redesigned progress bars and other logs to match the styling used by `cargo`.
- Decreased the amount of log messages that are printed to users by default.
- Relaxed timeout durations on the code responsible for switching radio channels.
- Adjusted our file naming format on flash to match the one used by VEXCode and PROS.

## Fixed

- Fixed `cargo v5 terminal` when using a controller.
- Fixed `cargo v5 rm` not erasing files from flash.
- Fixed an issue affecting vexide projects in cargo workspaces where programs could sometimes upload using the metadata of another project in the same workspace.