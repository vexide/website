---
title: cargo-v5 0.9.0
project: cargo-v5
date: 2024-12-18
---

## Added

- **Filesystem Access**: `cargo-v5` can now list, download, view, and erase files from flash on a brain through the `ls`, `cat`, and `rm` subcommands (NO you can't delete system files sorry guys :c).
- **Event Logs**: `cargo v5 log` allows you to view a brain's event log directly from your computer, which logs stuff like program runs, port connects/disconnects, device and OS errors, power on/off, field control status, etc...
- **Device Listing**: `cargo v5 lsdev`/`cargo v5 devices` will list all devices currently connected to a brain, as well as their firmware/bootloader version for debugging purposes or checking if a port got disconnected.
- **Screenshots**: You can save a capture of your brain's screen with `cargo v5 screenshot`/`cargo v5 sc`.
- `cargo-v5` will now emit temporary log files for debugging purposes.

## Changed

- `cargo v5 run` will now immediately stop the running program when closed or quit with the `^C` escape sequence.
