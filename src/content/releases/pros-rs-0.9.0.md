---
title: pros-rs 0.9.0
project: pros-rs
date: 2024-04-05
---

## Added
- New Motor API (**Breaking Change**) (#66)
  - Added `MotorControl` enum for controlling motor targets (#66).
  - Added support for onboard velocity and position control in motors (#66).
  - Added missing motor telemetry functions `velocity`, `efficiency`, `gearset`, `current_limit`.
  - Added support for current and voltage limiting in motors.
  - Added `Motor::raw_position` for getting raw IME ticks at a given timestamp.
  - Added support for getting motor fault flags (e.g. over-temperature, over-current, H-bridge faults).
  - Added support for internal motor PID tuning. Feature gated behind `dangerous_motor_tuning`, as this can cause hardware damage and is not recommended.
  - Added various constants for convenience around `Motor` and `Gearset`.
- Added `Controller` API to the `pros::prelude` module. (#108)

- `relative_size` method on `DistanceSensor` for getting a guess at an object's relative size. (#73)

## Fixed

- `pros_sys` bindings to the Motors C API now takes the correct port type (`i8`) as of PROS 4 (**Breaking Change**) (#66).
- Fixed the unintended `unsafe` context present in the `sync_robot` and `async_robot` family of macros (**Breaking Change**) (#107).

## Changed

- Renamed `DistanceSensor::object_velocity` to `DistanceSensor::velocity`.
- Adjusted `distance_confidence` to return a value from [`0.0`, `1.0`] rather than 0-100 to match other percentage getters.
- Refactored the Motor API (**Breaking Change**) (#66)
  - Adjusts constructor arguments for `Motor` to allow passing `Gearset` and a direction instead of `brake_mode` at construction. (**Breaking Change**) (#66)
  - Renamed `Motor::get_state` to `Motor::state`. (**Breaking Change**) (#66)
  - Changed `Motor::reversed` to return `Result<bool, _>`` rather than just `false` if `PROS_ERR` is returned. (**Breaking Change**) (#66)
  - Adjusted motor targeting to work around the `MotorControl` enum.
  - Adjusted motor reverse flag to use `Direction` enum rather than a boolean.
  - Motor braking is now stateless and requires an explicit method to be called to use `BrakeMode`s other than `BrakeMode::Coast`.
  - Renamed `Motor::current_draw` to `Motor::current`.
  - Renamed `Motor::get_state` to `Motor::status`.
- Status structs containing device bits now use the `bitflags!` crate. (**Breaking Change**) (#66)
- Renamed `InertialSensor::calibrating` to `InertialSensor::calibrating` (**Breaking CHange**) (#66)
- AdiEncoder now returns `Position` rather than just degrees (**Breaking Change**) (#106).

## Removed

- Removed `MotorStoppedFuture`, as it was broken due to hardware not returning the `stopped` flag (**Breaking Change**) (#66).
- Removed `Motor::set_output` and `Motor::set_raw_output` in favor of `set_voltage`.