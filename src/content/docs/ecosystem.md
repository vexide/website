---
title: Ecosystem
---

There are many libraries and applications developed by the vexide team or by third-party contributors to help you develop your robot's software. These projects include features that would otherwise be out-of-scope for vexide, such as path planning, advanced motion control, simulation, and debugging. However, external libraries you add to your program might not have the same level of platform support or stability as vexide itself.

Participants in the VEX Robotics Competition should keep in mind the [relevant rules](https://www.robotevents.com/V5RC/2025-2026/QA/2823) around creating code that reflects the capabilities of their team members.

## Installing Libraries

All vexide projects use [Cargo](https://doc.rust-lang.org/cargo/index.html), a package manager and build system which handles downloading and compiling the *crates* (libraries or executables) you have added to your project. External crates can usually be added to your project via the `cargo add` command, but some projects might have special instructions.

```sh title="example"
cargo add veranda
```

# General-purpose libraries

For some features not included in the standard library, such as logging facilities, error handling, and serialization, you can simply add a crate from the wider Rust ecosystem.

If you're not quite sure what you're looking for yet or want additional guidance, it can be helpful to scroll though the [Blessed.rs directory](https://blessed.rs/crates) (which is, in their own words, an "unofficial guide to the Rust ecosystem"). If you're looking for an index, [lib.rs](https://lib.rs) is a more comprehensive Rust crate search engine that's generally able to find the highest-quality libraries.

> [!Tip]
> When adding general-purpose dependencies to your project, consider the limitations of the VEX V5's operating system (for example, its lack of internet access and a persistent system clock). Many popular libraries such as `reqwest`, `chrono`, and `tokio` either will not compile or will work in such a limited way as to be practically useless.

# Libraries for vexide and VEX V5

Various additional libraries and tools to help you develop your robots are available from both the vexide team and third-party contributors.

## Motion Control

Libraries regarding motion control algorithms, position tracking, and autonomous pathing.

- [evian](https://lib.rs/crates/evian) (by Tropical): Highly extensible library for controlling mobile robots using the vexide robotics runtime.

## Utilities

Libraries which provide convenient extensions to vexide or standard library functionality.

- [vexide-motorgroup](https://lib.rs/crates/vexide-motorgroup) (by zabackary): Allows you to group motors together and control them as one.
- [veranda](https://lib.rs/crates/veranda) (by Gavin-Niederman): Random number generator which collects entropy from various system metrics.
- [autons](https://lib.rs/crates/autons) (by Tropical): Autonomous selection & routing library for vexide.
- [shrewnit](https://lib.rs/crates/shrewnit) (by Gavin-Niederman): Unit-aware math library.

## Graphics (UI)

Libraries for displaying messages, buttons, and more on the VEX V5's display.

> [!Tip]
> Many graphics libraries considerably increase the size (and upload time) of vexide programs. If you want something lightweight, you can use the [`vexide::display`](https://docs.rs/vexide/latest/vexide/display/index.html) module to draw rectangle, circles, and various styles of text.

- [vexide-embedded-graphics](https://lib.rs/crates/vexide-embedded-graphics) (by vexide): embedded-graphics driver for vexide.
- [vexide-slint](https://lib.rs/crates/vexide-slint) (by vexide): Slint driver for vexide.

## Developer Tools

Programs and libraries which make it easier to develop for the VEX V5 platform.

- [Symbolizer for VEX V5](https://marketplace.visualstudio.com/items?itemName=vexide.symbolizer-for-vex-v5) (by lewisfm): VS Code extension which analyzes a segfault (data/prefetch abort) error message to find the line of code it occurred on.
- [v5gdb](https://github.com/vexide/v5gdb#readme) (by lewisfm): A port of the GNU Debugger (gdb) to VEX V5.

## Simulation

Libraries for running and testing vexide programs without a physical robot.

### Desktop SDKs

vexide is a cross-platform library: if your project includes a VEX SDK, you can just type `cargo run` to build and run your project directly on your own computer. The following desktop-compatible implementations of the VEX SDK allow you to configure what happens when you do platform-specific actions like moving a motor or reading a sensor.

- [vex-sdk-mock](https://lib.rs/crates/vex-sdk-mock) (by vexide): vexide's **default desktop SDK**, which ignores any requests to read from sensors or control devices.

### Emulators

If your project uses low-level features that require it to run in a more accurate environment, we've also developed some additional simulation tools you can try.

- [vex-v5-qemu](https://github.com/vexide/vex-v5-qemu) (by vexide) is a limited emulator for the VEX V5 robot controller itself. It can run vexide and PROS programs that are already compiled for the V5 Brain, sometimes without any modification.

## Hardware access

Libraries which let you directly access low-level system features of the VEX V5 robot controller. These libraries should be used with care because they don't have the same safety checks or ease-of-use as higher-level libraries like vexide.

- [vex-sdk](https://lib.rs/crates/vex-sdk) (by vexide): Raw C-level bindings to VEX's system APIs.
- [zynq7000](https://lib.rs/crates/zynq7000) (by robamu): Peripheral Access Crate (PAC) for the Zynq 7000 family of SoCs.
- [aarch32-cpu](https://lib.rs/crates/aarch32-cpu) (by Rust Embedded Working Group): Access to CPU registers and common peripherals for AArch32 Arm Processors.
