---
title: vexide 0.4.0
project: vexide
date: 2024-10-04
---

This is the fall vexide update (0.4.0) changelog! This is only the changelog for the vexide crate. For more in-depth info and a project update, read our [fall update](/blog/posts/fall-update-24/) blog post.



## Added

- Added support for the V5 GPS Sensor ([#79](https://github.com/vexide/vexide/pull/79))
- Added support for custom banner themes configurable through the `vexide::main` macro ([#127](https://github.com/vexide/vexide/pull/127))

## Fixed

- Fixed an issue where the distance sensor relative_size returned a u32 when it can be negative. ([#116](https://github.com/vexide/vexide/pull/116))
- Fixed an issue preventing the `Screen::draw_buffer` function from working properly. ([#128](https://github.com/vexide/vexide/pull/128))
- Fixed an issue where panic messages would not be displayed even when the `display_panics` feature was enabled if the screens render mode was set to `DoubleBuffered`. ([#134](https://github.com/vexide/vexide/pull/134))
- `GpsImu` should now validate on the correct port. ([#141](https://github.com/vexide/vexide/pull/141))

## Changed

- Refactored the distance sensor API. All readings from the sensor are now read at once in a `object` method that can be possibly `None` if no object was detected. ([#122](https://github.com/vexide/vexide/pull/122)) (**Breaking Change**)
- Adjusted distance sensor status code errors to be more clear.
- Overhauled the design of the startup banner.
- Adjusted distance sensor error names. ([#113](https://github.com/vexide/vexide/pull/113)) (**Breaking Change**)
- Renamed `SmartDevice::port_index` and `SmartPort::index` to `SmartDevice::port_number` and `SmartPort::port_number`. ([#121](https://github.com/vexide/vexide/pull/121)) (**Breaking Change**)
- Renamed `AdiDevice::port_index` and `AdiPort::index` to `AdiDevice::port_number` and `AdiDevice::port_number`. ([#121](https://github.com/vexide/vexide/pull/121)) (**Breaking Change**)
- `SmartPort::device_type` now no longer returns a `Result`. ([#121](https://github.com/vexide/vexide/pull/121)) (**Breaking Change**)
- Updated the names of certain misspelled `enum` variants, constants, and fields. ([#132](https://github.com/vexide/vexide/pull/132)) (**Breaking Change**)
- Marks many futures as `#[must_use]` to warn when futures are created without `await`ing them. ([#112](https://github.com/vexide/vexide/pull/112))
- Changes the banner attribute syntax in the `vexide::main` macro. ([#127](https://github.com/vexide/vexide/pull/127)) (**Breaking Change**)
- Controller joystick axis getters now return `f64` instead of `f32`. ([#133](https://github.com/vexide/vexide/pull/133)) (**Breaking Change**)
- Fixed an issue where the async executor would block indefinetly on the first program run after a Brain reboot ([#139](https://github.com/vexide/vexide/pull/139))
- Removed the `critical_section` module from `vexide_core`, since vexide doesn't use interrupts and it can potentially break VEXos operations. ([#144](https://github.com/vexide/vexide/pull/144)) (**Breaking Change**)
- Switched to a hard-float libm build with up to 6 times faster floating point operations. ([#145](https://github.com/vexide/vexide/pull/145))
