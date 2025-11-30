---
title: vexide 0.8.0
project: vexide
date: 2025-11-29
---

## Added

- Added support for encoders with custom resolutions in the `AdiEncoder` API. (#328) (**Breaking Change**)
- Added the `AdiOpticalEncoder` type alias for use with VEX optical encoders. (#328) (**Breaking Change**)
- Added several missing derived trait implementations for many device error types. (#331)
- Added support for task-local data storage using the new `task_local!` macro. This is closely modeled after `thread_local!`s in the standard library. (#333)
- Added the `AiVisionCode::iter`/`into_iter` methods for iterating over the available signature IDs stored in a color code. (#376).
- Added the `CalibrateError` type returned by `InertialSensor::calibrate` when it fails. (#376).
- Added the `vexide::time::user_uptime` function for getting the time since user processor boot. (#373)
- Added support for desktop compilation targets. (#361)
- Added support for the `embedded_io` crate. (#361)
- When a CPU abort (i.e. segmentation fault) occurs, a backtrace and error details are now printed to serial and shown on the display. (#368)
- Added `vexide::program::code_signature` for reading the current program's code signature. (#361)
- Added `vexide::program::linked_file` for detecting the use of VEXos's [linked files] feature. (#361)
- Added the `vexide::test` attribute macro, used to implement unit tests which run on your host machine and have access to vexide's async runtime and peripherals. (#361)
- Added support for using VEXcode's SDK via the `vex-sdk-vexcode` feature. (#361)
- Added support for using the VEX partner SDK via the `vex-sdk-pros` feature. (#361)
- Added the `default-sdk` feature for specifying the recommended default SDK features for projects. (#417)
- Added support for using a no-op SDK (for testing code on desktop) via the `vex-sdk-mock` feature. (#361)
- On vexide's error details screen, long error messages are now wrapped onto subsequent lines. (#368)
- Added the new `LowResolutionTime` type to `vexide::time` for recording timestamps taken by the Brain's low resolution clock. (#386)
- Added `SmartPort::timestamp` for accessing the time that the last packet on the port was processed by VEXos. (#386)
- Added the `task_local` macro to `vexide::prelude`. (#378)
- Added `Electromagnet` and `GpsSensor` to `vexide::prelude`. (#378)
- Derived `Default, Debug, Clone, Copy, Eq, PartialEq` for `AiVisionColorCode`. (#378)

[linked files]: https://github.com/rust-lang/rust/pull/145578

## Fixed

- Fixed an issue with `Metadata::len` using the wrong condition. (#314)
- Fixed backwards assertion logic causing a panic in `AiVision::color` and `AiVision::set_color`. (#316)
- Symbols within the internal implementation of the patcher's `memcpy` will no longer clash with some libc compiler intrinsics. This should only matter if are linking to C libraries. (#314)
- Fixed a signature validation problem in the original `VisionSensor`. (#319)
- Fixed `AdiDigital*::is_low` improperly returning `is_high` (#324)
- Fixed an issue where writing to the controller screen would sometimes be unreliable in fast loops (#336)
- Fixed `Display::erase` always using the display's default background color. (#350)
- `AiVisionObject` and `VisionObject` now use the new `Angle` type for storing object angles. This fixes a bug with the legacy vision sensor using the wrong angle units. (#386) (**Breaking Change**)
- Fixed an off-by-one error in `Display::draw_buffer`'s buffer stride calculation causing slanted image rendering. (#397)
- `Display` now uses half-open pixel coordinates for `Rect`, `Line` and `Display::draw_buffer`. (#395) (**Breaking Change**)
- `Controller::try_rumble` now doesn't unconditionally fail an assert. (#413)

## Changed

- Submodules of `vexide::devices` have been promoted to crate-root modules. For example, `vexide::devices::smart::motor::Motor` is now `vexide::smart::motor::Motor`. (#380) (**Breaking Change**)
- Replaced the `Position` type with a new `Angle` type.
  - `Angle` resides in `vexide::math`. (#380) (**Breaking Change**)
  - `Angle`s are backed now backed by radians stored in an `f64` rather than a fixed-point representation.
  - Renamed `Position::{from, as}_revolutions` to `Angle::{from, as}_turns`.
- `{InertialSensor, GpsSensor}::{heading, rotation, angle, euler, set_heading, set_rotation}` now take and return instances of the `Angle` type rather than degrees. (#380) (#378) (**Breaking Change**)
- `AdiGyroscope::yaw` now returns `Angle`. (#380) (**Breaking Change**)
- Renamed the `vexide::devices::rgb` module to `vexide::color`. (#380) (**Breaking Change**)
- Replaced `Rgb<u8>` with the `Color` type. (#395) (**Breaking Change**)
- Renamed `RotationSensor::set_computation_interval` to `RotationSensor::set_data_interval`. (#329) (**Breaking Change**)
- Renamed `vexide::time::uptime` to `vexide::time::system_uptime`. (#373) (**Breaking Change**)
- `TouchEvent` now stores the location of the press in a `point: Point2<i16>` field rather than separate `x` and `y` `i16` fields. (#375) (**Breaking Change**)
- Feature-gated the `MotorTuningConstants` type behind the `dangerous-motor-tuning` feature. (#374) (**Breaking Change**)
- Renamed `{SerialPort, RadioLink}::available_write_bytes` to `{SerialPort, RadioLink}::write_capacity`. (#376) (**Breaking Change**)
- `Motor` methods now return `PortError` rather than `MotorError`, which has been removed. (#376) (**Breaking Change**)
- Renamed `AdiGyroscopeError` to `YawError`. (#376) (**Breaking Change**)
- `AdiGyroscope::is_calibrating` now returns the `PortError` when it fails (#376) (**Breaking Change**).
- Renamed `AiVisionError` to `AiVisionObjectError` (#376) (**Breaking Change**).
- The `AiVisionSensor::{temperature, set_color_code, color_code, color_codes, set_color, color, colors, set_detection_mode, raw_status, flags, set_flags, start_awb, enable_test, set_apriltag_family}` methods now return `PortError` when failing (#376) (**Breaking Change**).
- Renamed `DistanceError` to `DistanceObjectError`. (#376) (**Breaking Change**)
- `DistanceSensor::status` now returns the `PortError` when it fails (#376) (**Breaking Change**).
- The `InertialSensor::{status, is_calibrating, is_auto_calibrated, physical_orientation, gyro_rate, acceleration, set_data_interval}` methods now return `PortError` when failing. (#376) (**Breaking Change**).
- `InertialSensor::calibrate` now returns the new `CalibrateError` type rather than `InertialError` when it fails. (#376) (**Breaking Change**).
- The `backtraces` Cargo feature is now named `backtrace`. (#361) (**Breaking Change**)
- The `dangerous_motor_tuning` Cargo feature is now named `dangerous-motor-tuning`. (#361) (**Breaking Change**)
- Frames of backtraces are now accessed through the `Backtrace::frames` function. (#368) (**Breaking Change**)
- The `ProgramFlags` struct has been renamed to `ProgramOptions`. (#361) (**Breaking Change**)
- The structs related to `CodeSignature`s have been moved into `vexide::program`. (#361) (**Breaking Change**)
- Programs must now opt-in to vexide's custom memory layout by specifying the linker flag `-Tvexide.ld`. (#355) (**Breaking Change**)
- Programs must now opt-in to using vexide's open source SDK via the `vex-sdk-jumptable` feature. (#361) (**Breaking Change**)
- All methods previously returning `DeviceTimestamp` now return `LowResolutionTime`. (#386) (**Breaking Change**)
- `Motor::raw_position` no longer returns a timestamp along with the raw position. Use `Motor::timestamp` to access this data instead. (#386) (**Breaking Change**)
- `AdiPotentiomter::angle` now returns the `Angle` type. (#378) (**Breaking Change**)
- Renamed `AdiGyroscopeCalibrationFuture` to `CalibrateFuture`. (#378) (**Breaking Change**)
- `Text::new()` now takes a `CStr` to avoid allocation. Use `Text::from_string` to pass a regular string. (#395) (**Breaking Change**)
- `FontSize::from_float` will now panic rather than returning an error when passed invalid values. (#395) (**Breaking Change**)
- Renamed the `start` and `end` fields on `Rect` to `top_left` and `bottom_right`. (#395) (**Breaking Change**)
- Renamed the `horizontal_align` and `vertical_align` fields on `Rect` to `horizontal_alignment` and `vertical_alignment`. (#395) (**Breaking Change**)
- `SmartDeviceType` and `AdiDeviceType` are now marked `#[non_exhaustive]`. (#405) (**Breaking Change**)
- Overhauled the `AdiAddrLed` API. This API no longer dynamically allocates, and should handle errors more sensibly. Strip length is now a const generic parameter (`AdiAddrled<N>` where `N` is the number of diodes on the LED strip). (#325) (**Breaking Change**)

## Removed

- The vexide prelude no longer contains `Angle`, `AiVisionColor`, `AiVisionColorCode`, `AiVisionObject`, `BrakeMode`, `LedMode`, `VisionCode`, `VisionMode`, `VisionObject`, `VisionSensor`, `VisionSignature`, `WhiteBalance`, `DynamicPeripherals`, `battery` and `Rgb`. (#380) (**Breaking Change**)
- The `Position::{from, as}_ticks` methods (now `Angle::{from, as}_ticks`) methods are now private. This may change in the future. (#383) (**Breaking Change**).
- `vexide::startup::startup` no longer handles banner printing and no longer takes arguments. If you wish to print a banner without using `#[vexide::main]`, consider using `vexide::startup::banner::print` instead. (#313) (**Breaking Change**)
- Removed `stride` from `Display::draw_buffer`, fixing a buffer size validation error. If you wish to specify the stride, use `vex-sdk` directly instead. (#323) (**Breaking Change**)
- `SmartPort` and `AdiPort` are no longer in `vexide::prelude`. (#376) (**Breaking Change**)
- Removed `AiVisionCode::colors`. Prefer using `AiVisionCode::iter`/`AiVisionCode::into_iter` instead. (#376) (**Breaking Change**)
- Removed `MotorError`. Motors now return `PortError` with the exception of `set_gearset`, which returns `SetGearsetError`. (#376) (**Breaking Change**)
- Removed vexide's custom Rust target. Developers should now use the identically-named one built into Rust. (#361) (**Breaking Change**)
- Removed `vexide_core::float` and the `force_rust_libm` Cargo feature. Developers should now use the functions built into `std`. (#361) (**Breaking Change**)
- Removed the `exit` and `abort` functions. Developers should now use the functions built into `std`. (#361) (**Breaking Change**)
- Removed the filesystem access APIs. Developers should now use `std::fs`. (#361) (**Breaking Change**)
- Removed the I/O API. Developers should now use `std::io`. (#361) (**Breaking Change**)
- Removed certain time measurement APIs, including `Instant`. Developers should now use `std::time`. (#361) (**Breaking Change**)
- Removed the `vexide_panic` crate. Its functionality has been moved to `vexide_startup`. (#361) (**Breaking Change**)
- Removed `vexide_startup`'s copy of libm it previously linked to. Its functionality is now available from `std`. (#361)
- Removed `InertialSensor::MAX_HEADING` and `GpsSensor::MAX_HEADING`. Prefer `Angle::FULL_TURN` instead.
- Removed `DeviceTimestamp` in favor of `LowResolutionTime`. (#386) (**Breaking Change**)
- Removed `Task` and `CompetitionRuntime` from `vexide::prelude`. (#393) (**Breaking Change**)
- Removed `HAlign` and `VAlign`. Use `Alignment` instead. (#395) (**Breaking Change**)
- Removed `InvalidFontSizeError`, as it's no longer returned by `FontSize::from_float`. (#395) (**Breaking Change**)
- Removed `AddrLedError` error. This device now will just return `PortError`, since the other error states are now either unreachable or will panic at runtime. (#325) (**Breaking Change**)

## Miscellaneous

- The project's officially supported channel of Rust has been updated to `nightly-2025-09-26`.
- Extended and improved the documentation for various APIs. (#361)
- Several of vexide's internal linker script symbols, such as `__program_ram_start`, have been renamed or removed. (#361)
