---
title: vexide 0.7.0
project: vexide
date: 2025-03-05
---

## Added

- Added the `FsString` `PathBuf` types as mutable and owned equivalents to `FsStr` and `Path`. (#296)
- Added `read_dir`, `ReadDir`, and `DirEntry` to `vexide_core::fs` for directory reading support. (#296)
- Implemented `PartialOrd` for `Version`. (#288)
- Added `RadioLink::INTERNAL_BUFFER_SIZE` constant. (#293)
- `AiVisionSensor` is now re-exported through `vexide::devices`. (#302)
- Added a new `GpsSensor::set_offset` method that allows reconfiguring the GPS sensor's physical offset after creation. (#302)
- Added the `vexide::program::abort` method to match `std::process::abort`. Unlike `vexide::program::exit`, `abort` attempts to terminate the program as immediately as possible without doing any cleanup to the serial buffer. (#309)
- Added `Deref` implementation back to `LazyLock`, which will panic if lazy initialization is performed recursively. (#310)
- Added `DerefMut` implementation and `force_mut` functionto `LazyLock`. (#310)
- Added `Once::try_call_once` which will return an error if called from within itself rather than returning a future. (#310)

## Fixed

- Added a missing `Drop` implementation to `File` that will close and flush the file descriptor. (#295)
- Fixed an issue where printing large amounts of data to `Stdout` without ticking the executor would immediately exit the program. (#296)
- `StdoutRaw::flush` now flushes the outgoing serial buffer (#296)
- Fixed an issue with `AdiEncoder` potentially configuring the wrong port. (#301)

## Changed

- `Controller::battery_capacity` now returns a float from 0.0 to 1.0 instead of an i32. (#286) (**Breaking Change**)
- `RadioLink::open` now panics if `id` is not a valid `CStr` rather than returning a `Result`. (#293) (**Breaking Change**)
- `SerialPort::open` now returns a `Future` that must be awaited before opening the port. (#293) (**Breaking Change**)
- Renamed `vexide::async_runtime` module to `vexide::runtime`. (#305) (**Breaking Change**)
- The `vexide::async_runtime::task` module is now a top-level `vexide::task` module. (#305) (**Breaking Change**)
- Merged `vexide::core::time` and `vexide::async_runtime::time` into a single `vexide::time` module. (#305) (**Breaking Change**)
- Moved `vexide::core` modules to the top-level `vexide` crate. For example, `vexide::core::fs` is now `vexide::fs`. (#305) (**Breaking Change**)
- `InertialSensor::calibrate`, `AdiGyroscope::calibrate`, `DynamicPeripherals` methods, `OpenOptions` methods, and `Text::align` are now callable in `const fn` context. (#308)
- `vexide::allocator` is no longer cfg-gated to `target_vendor = "vex"`. (#307)
- Refactored the GPS Sensor API to provide all functionality through a single struct. (#302) (**Breaking Change**)
- Renamed `LazyLock::get` back to `LazyLock::force`. (#310) (**Breaking Change**)
- The default `talc` allocator can now be removed by disabling the `allocator` feature, which is enabled by default. (#311) (**Breaking Change**) 

## Removed

- Removed `SerialError::Port`. `SerialPort` methods can no longer return `PortError`. (#293) (**Breaking Change**)
- Removed the `vexide::macro` module. (#305) (**Breaking Change**)
- Removed the `vexide::core` module in favor of top-level modules of the `vexide` crate. (#305) (**Breaking Change**)
- Removed the `GpsImu` struct. This functionality is now provided entirely through `GpsSensor`. (#302) (**Breaking Change**)
