---
title: vexide 0.2.0
project: vexide
date: 2024-05-17
---

vexide version 0.2.0 has been released!

## Added

- Added `TICKS_PER_ROTATION` constant to `AdiEncoder` for use with `Position`.

## Fixed

- Removed unintentional re-exports from `vexide-core` program module. (**Breaking Change**)
- Fixed vision panicking after getting garbage data from vex-sdk.
- Corrected incorrect axis getters in the `Controller` API.
