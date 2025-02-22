---
title: vexide 0.6.0
project: vexide
date: 2025-01-26
---

This release includes work on our new uploading strategy. Check out the [update post](/blog/winter-update-25) for more info.

## Added

- Added functions to get VEXos version and uptime. (#278)
- Added a self-modifying memory patcher to `vexide_startup` that applies patches over the current program. This will be paired with `cargo-v5` changes to allow for much faster uploading.

## Fixed

- Fixed error handling for encoder port numbers. (#264)
- Fixed error handling for rangefinder port numbers. (#268)
- Fixed an internal issue regarding units with `Motor::set_position`.
- Fixed `File::seek` seeking to the wrong position when using `SeekFrom::End` with a negative offset. (#267)
- Fixed a rare issue with IMU calibration timing out at the start of some programs. (#275, #279)
- Recursive panics (panics that occur *within* `vexide_panic`'s handler) will now immediately abort rather than potentially causing a stack overflow. (#275)

## Changed

- Renamed `Once::is_complete` to `Once::is_completed` for consistency with the standard library. (#257) (**Breaking Change**)
- All `Position` methods are now usable in `const` context. (#254)
- Two-wire ADI devices (`AdiEncoder` and `AdiRangeFinder`) now take their ports as separate arguments instead of a tuple. (#271) (**Breaking Change**)
- `AdiEncoder` and `AdiRangeFinder` will now panic if invalid port pairings are passed rather than return a `Result`. (#271) (**Breaking Change**)
- `AdiDevice` is now const-generic over the number of ports used by the device. (#271) (**Breaking Change**)
- Replaced `AdiDevice::port_number` with `AdiDevice::port_numbers`. (#271) (**Breaking Change**)

## Removed

- Replaced `vexide_core::allocator::init_heap` with `vexide_core::allocator::claim`, which allows claiming uninitialized memory spans as heap space.
- The `Nul`, `InvalidLine`, and `InvalidColumn` `ControllerError` variants have been removed. These errors now cause panics. (#266) (**Breaking Change**)
- `DisplayError` has been removed and `Display::draw_buffer` now panics when given a buffer of invalid size. (#266) (**Breaking Change**)
- The `InvalidId` and `InvalidIdInCode` `AiVisionError` variants have been removed. These errors now cause panics. (#266) (**Breaking Change**)
- `VisionError::InvalidId` has been removed. Invalid signature IDs given to `VisionSensor` will now cause panics. (#266) (**Breaking Change**)
- The `lock` functions on `Stdin` and `Stdout` are now async. (#265) (**Breaking Change**)
- `Stdin` and `Stdout` instances can no longer be instantiated using struct initialization syntax. Prefer using `stdin()`/`stdout()`. (#281) (**Breaking Change**)

## Removed

- Removed the `Deref` implementation and `force` method on `LazyLock` to prevent deadlocks. use the async `LazyLock::get` instead. (#265) (**Breaking Change**)
- Removed the `Read` and `Write` implementations on `Stdin` and `Stdout` respectively to prevent deadlocks. (#265) (**Breaking Change**)
- Removed `EncoderError` and `RangeFinderError`. The respective devices now just return `PortError`. (#271) (**Breaking Change**)

## New Contributors

- @Saylar27 made their first contribution in #279!
- @ion098 made their first contribution in #278!
