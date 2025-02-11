
---
title: pros-rs 0.8.0
project: pros-rs
date: 2024-03-06
---

## Added

- Added feedforward motor controllers (#80)
- Lightly document all APIs with missing documentation. (#70)
- Added `Debug`, `Copy`, and `Clone` derives for common structs (#70)
- Screen drawing API. (#81)
- Added screen field to `Peripherals` and `DynamicPeripherals::take_screen` method. (#81)
- Added `AdiSolenoid`, a wrapper over `AdiDigitalOut` for actuating SMC pneumatic solenoids. (#61)
- Added `AdiSwitch`, another `AdiDigitalOut` wrapper that abstracts bumper switches and limit switches. (#61)
- Added `AdiLineTracker` for abstracting the EDR line tracker sensor.
- Implemented TryFrom for Gearset.
- Adds support for getting brake modes from motors. (#66)

## Fixed

- Fix error handling and error type variats in ADI bindings
- Fix `AsynRobot` only running opcontrol
- Properly handle `EADDRINUSE` return for smart port errors (**Breaking Change**) (#97)

## Changed

- Re-exported printing macros from `pros::io`. (#82)
- Applied several lints to improve code quality. (#70)
- Updated to PROS version 4. (**Breaking Change**) (#81)
- Moved `vision::Rgb` into its own `color.rs` file. (**Breaking Change**) (#81)
- The VEXOS target has been updated to improve file size and floating point operation speed. (#81)
- `Peripherals::new()` is no longer const (**Breaking Change) (#81)
- Updated panic handler to print to the brain display as well as over serial (#81)
- Refactors digital and analog ADI input/output. (**Breaking Change**) (#61)
	- Adds LogicLevel rather than bools for controlling digital devices.
	- Adds 0-5V voltage getters and setters for analog ADI.
	- Changed analog getters and setters to use `u16` data.
- Changed `AdiPotentiometer` to return degrees rather than tenth degrees (**Breaking Change**) (#61).
	- Renamed `AdiPotentiometer::value` to `AdiPotentiometer::angle`.
- Refactors `AdiMotor` to match the smart motor APIs, having output/raw output getters/setters.
- Renamed `AdiUltrasonic::value` to `AdiUltrasonic::distance` (**Breaking Change**) (#61).
- Renamed `AdiEncoder::value` to `AdiEncoder::position` (**Breaking Change**) (#61).
- Repurposed `AdiAnalogOut` as `AdiPwmOut` to correct match port output. (**Breaking Change**) (#90).
- Moved most device-related constants into their associated struct `impl` (**Breaking Change**) (#98).
- Renamed IMU_RESET_TIMEOUT to `InertialSensor::CALIBRATION_TIMEOUT` (**Breaking Change**) (#98).
- Repurposed the `pros` crate as a metapackage without any code of its own. (**Breaking Change**) (#86)
- Split the pros-rs into several small subcrates. (**Breaking Change**) (#86)
  - `pros-async` with the async executor and robot trait.
  - `pros-devices` for device bindings.
  - `pros-sync` for the sync robot trait.
  - `pros-core` with basic abstractions over `pros-sys` needed to compile a program to the brain.
  - `pros-math` with commonly used controllers and other mathematical models.
  - `pros-panic` for the panic handler implementation.

## Removed

- LVGL bindings (pros-sys) and colors (pros). (**Breaking Change**) (#81)
- LLEMU/lcd bindings. (**Breaking Change**) (#81)
- Re-exported printing macros from `pros::io`. (#82)
- Applied several lints to improve code quality. (#70)
- Removed the confusingly named `write`, `ewrite`, `writeln`, and `ewriteln` macros. (**Breaking Change**) (#82)
- Removed AdiDigitalIn::new_press, instead swapping it for AdiSwitch::was_pressed. (**Breaking Change**) (#61)