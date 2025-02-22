---
title: pros-rs 0.7.0
project: pros-rs
date: 2024-01-21
---

## Added

- `SmartPort` struct for device access. (#34)
- `SmartDevice` trait for common functionality across smart port devices. (#34)
- Methods to get a device's port number as well as determine if the device is plugged in or not. (#34)
- Added various missing derives for hardware-related data structures. (#34)
- `CompetitionSystem` and `CompetitionMode` structs for better retrieving information about the robot's competition state. (#38)
- `competition::system` method for retrieving the type of competition control the robot is connected to. (#38)
- New `From` implementation to convert `Quaternion` and `Euler` to their pros-sys equivalents. (#45)
- `pros::io` module for I/O related operations. (#30)
- Various types from the `no_std_io` have are re-exported from this module to provide missing functionality from `std`. (#30)
- Macros for printing to stdout (`println`, `print`, `eprintln`, etc...) (#30)
- All ADI device bindings (#55)
- `LocalKey` now has `Cell`/`RefCell`-specific methods for setting and taking values. (#42)
- `Peripherals` and `DynamicPeripherals` structs to ensure that you have only registered one device on a given smart or ADI port. (#53)
- Support for ADI Expander modules with `AdiExpander`. (#63)

## Fixed

- Fixed competition state-related getters in the `pros::competition` module. (#38)
- Fixed error handling in IMU sensor bindings. (#37)
- Fixed errors in doctests and examples throughout the crate. (#37)
- Fixed Missing ERRNO and ADI config variants in pros-sys (#55)
- Fixed incorrect error handling with `InertialSensor::status`. (#65)
- `Controller::status` now handles errors by returning `Result<ControllerStatus, ControllerError>`. (**Breaking Change**) (#74)

## Changed

- Overhauled the `competition` module with more straightforward getters for competition state. (#38) (**Breaking Change**)
- LLEMU-related macros have been prefixed with `llemu_` (e.g. `llemu_println`). (**Breaking Change**) (#30)
- Added `Debug`, `Copy`, and `Clone` derives for common structs (#37)
- Renamed `InertialSensor::is_calibrating` to `InertialSensor::calibrating`. (**Breaking Change**) (#65)
- Battery API functions now return `Result<_, BatteryError>`. (**Breaking Change**) (#62)
- Renamed `battery::get_capacity` to `battery::capacity`, `battery::get_current` -> `battery::current`, `battery::get_temperature` -> `battery::temperature`, `battery::get_voltage` -> `battery::voltage`. (**Breaking Change**) (#62)

## Removed

- Removed several broken bindings in `pros_sys` relating to competition state. (#38) (**Breaking Change**)
- `LocalKey` no longer implements `set` for non-`Cell`/`RefCell` stored values. (**Breaking change**) (#42)
- Removed the now-redundant `InertialStatus::error` function. (**Breaking Change**) (#65)
