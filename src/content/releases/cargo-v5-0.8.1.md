---
title: cargo-v5 0.8.1
project: cargo-v5
date: 2024-10-13
---

## Added

- Uploads will now switch the radio to the download channel when uploading wirelessly.

## Changed

- Switched back to an internal implementation of `objcopy` for producing binary artifacts. `cargo-binutils` is therefore no longer required.