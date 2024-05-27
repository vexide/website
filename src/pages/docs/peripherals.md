---
title: Creating Devices
category: 02. Devices
layout: layouts/DocsLayout.astro
page: 9
---

Devices are constructed differently than you might expect in vexide. In vexide, devices must be created through the `Peripherals` type. You might remember `Peripherals` from the argument in your main function.

# What is `Peripherals`?

Peripherals are a concept in many embedded Rust libraries. In short, peripherals, *at compile time*, ensure that only one mutable reference to a device can exist at one time.
The `Peripherals` struct in vexide contains a field for every Smart port, every ADI port, the screen, and both controllers.
If you want to learn more about peripherals, I recommend reading the [peripherals chapter in the rust-embedded book](https://docs.rust-embedded.org/book/peripherals/index.html).

# Creating Devices

Now that you know what peripherals are, we can get to constructing devices!

Every device has a `new` function, the only exception being `RadioLink`. Lets look at the `Motor` new function as an example.
```rust
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let motor = Motor::new(peripherals.port_1, GearSet::Green, Direction::Forward);
    ...
}
```
First off, it takes the smart port that the motor is plugged into. After that, It takes some device specific configuration. Here it takes the motor gearset and direction. You may also notice that it doesn't return a `Result`. This is true for most, unfortunately not all, devices. Device errors are handled after the device has already been created.

# Dynamic Peripherals

There are some rare use cases where `Peripherals` cannot be used. Specifically, if you need to construct a device by moving a `SmartPort` out of peripherals and then pass the `Peripherals` to another function, you will notice that you get compile errors. `DynamicPeripherals` gets around this issue by checking for device access at runtime instead of compile time. It is recommended to use `Peripherals` whenever possible. `Peripherals` should be sufficient almost all of the time.