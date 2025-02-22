---
title: pros-rs 0.6.0
project: pros-rs
date: 2024-01-14
---

### Fixed

- GPS sensor `set_offset` function now returns a result. The relevant PROS C bindings have been fixed as well. (**Breaking change**)
- FreeRTOS task creation now does not garble data that the provided closure captured.
- Grammar in the feature request template has been fixed. 
- Wasm build flags have been updated and fixed.

### Changed

- Panicking behavior has been improved so that spawned tasks will not panic the entire program. 
- Panic messages are now improved and printed over the serial connection.
- `AsyncRobot` should now be implemented using the newly stabilized async trait syntax instead of the old `async_trait` attribute macro. (**Breaking change**)

### Removed

- A nonexistent runner for armv7a-vexos-eabi target has been removed from the cargo config.