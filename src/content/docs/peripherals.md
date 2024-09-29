---
title: Peripherals
category: 02. Hardware
page: 9
---

Up until now, everything we've covered has to do with the Brain itself, but what about external devices? What about controllers? How can we control our motors and sensors with vexide?

# The `Peripherals` Struct

A brain often has many external devices attached to it. We call these devices *peripherals*. You might have noticed from earlier examples that your `main` function takes an argument:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
//            (                      )
async fn main(peripherals: Peripherals) {
       //    ^
       // [What is this deal with this?]
}
```

This is the `Peripherals` struct, and it's the gateway to all of your brain's available I/O — ports, hardware, and devices. If you want to create a device like a sensor or motor or read from a controller, you are going to need something off of this struct.

The `Peripherals` struct in vexide contains a public field for every smart port, every ADI port, the screen, and both controllers.

![Chart showcasing the different items in the Peripherals struct](/docs/peripherals.png)

Let's create our first device. We'll make a motor on port 1 of the brain by moving `port_1` out of `peripherals` and into our new motor.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
                           // (                )
    let my_motor = Motor::new(peripherals.port_1, Gearset::Blue, Direction::Forward);
                       //    ^
                       // [Here is where we pass in our port from peripherals.]
    
    // Do whatever you want with the motor...
}
```

What we have just done is:
- Moved the `port_1` field out of `peripherals`. This field is an instance of `SmartPort` (there are similar fields for ports 2-21).
- We passed the `SmartPort` instance into `Motor::new` which creates a motor from the port.
- We also told `Motor::new` that the motor uses the blue gearset and spins in the positive direction.

# Limitations on Peripherals

The `Peripherals` system works in ways you might not expect in order to incur as little runtime overhead as possible and maintain simplicity/consistency. In some cases, this changes the way a lot of code would be traditionally written.

## Thou shalt not copy

This is a big one. The `Peripherals` given to you in your `main` function is the one you get. One `Peripherals` instance per program. You aren't going to get one again (unless you sin and use `unsafe`), so you better make good use of it.

`Peripherals` uses move semantics and none of its fields may be copied or cloned.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
//                                                   (error )
    let peripherals_2_electric_boogaloo = peripherals.clone();
//                                                  ^
//                                     [Unable to clone peripherals!]
}
```

By extension, this also means you can only have one device per `SmartPort`.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
//                            (                )
    let my_motor = Motor::new(peripherals.port_1, Gearset::Blue, Direction::Forward);
//                           ^
//                  [Value is moved here.]

//                                  (error           )
    let my_other_motor = Motor::new(peripherals.port_1, Gearset::Blue, Direction::Forward);
//                                 ^
//                 [Attempted to use after move here!]
}
```

and since devices own `SmartPort`s, they also cannot be cloned or copied.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let my_motor = Motor::new(peripherals.port_1, Gearset::Blue, Direction::Forward);
    //                           (error )
    let my_other_motor = my_motor.clone();
//                              ^
//                       [Unable to clone my_motor!]
}
```

> Okay, but why? What if i'm halfway through my program and suddenly decide I need another device?

We do this because we are treating our hardware like data. You only have a single "Port 1" on your robot, so why should you be able to have two in your code? By treating our hardware like data, we get some compile-time safety guarantees. The main benefit here is in **thread safety** — by guaranteeing that only one device per port is used, we also guarantee though the borrow checker at compile time that only one running task currently has access to modify a piece of hardware.

If you had two structs controlling a single piece of hardware at once, you could run into race conditions or worse. This pattern of `Peripherals` as a singleton is fairly common in the Rust embedded scene and you can read more about it [here](https://docs.rust-embedded.org/book/peripherals/singletons.html).

> [!TIP]
> Think of it this way — in Rust you have the borrow checker, which establishes certain invariants about data access checked at compile time. One of those fundamental rules is that [you cannot create more than one mutable reference to a single piece of data at the same time](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html#the-rules-of-references). We are doing the same here by treating access to a device like access to a piece of data. It also makes it clear which operations on devices change hardware state and which ones don't.

> Well, rules were meant to be broken and frankly, I'd like to be able to share my motor across two tasks that run at the same time. How can I do that?

Despite the restrictions placed on passing around peripherals, they can be circumvented through both safe and unsafe methods.

# Stealing

> Screw the memory safety! Give me another `Peripherals` instance! This is a robbery.

If you *absolutely* need another instance of `Peripherals`, you can get one with [`Peripherals::steal`](https://docs.rs/vexide-devices/latest/vexide_devices/peripherals/struct.Peripherals.html#method.steal). This is an unsafe operation and will need to be marked as such:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    // @highlight
    let peripherals_the_sequel = unsafe { Peripherals::steal() };

    let my_motor = Motor::new(peripherals.port_1, Gearset::Blue, Direction::Forward);
    let also_my_motor = Motor::new(peripherals_the_sequel.port_1, Gearset::Blue, Direction::Forward);
}
```

As you can see, we now have two instances of `Peripherals` — the one given to us and the one we stole, which allows us to create two `Motor`s on one port.

If we don't want a whole other `Peripherals` instance, we can also unsafely create new ports from thin air:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let my_motor = Motor::new(peripherals.port_1, Gearset::Blue, Direction::Forward);
    let also_my_motor = Motor::new(
//      (                           ) 
        unsafe { SmartPort::new(1) },
//     ^
// [Right here, we create a new SmartPort with a number of 1.]
        Gearset::Blue,
        Direction::Forward
    );
}
```

This is effectively the same as stealing `Peripherals` and results in the same potential footguns. In fact, `SmartPort::new(n)` is arguably less safe because it performs no checks on what number you give it. You can make a port 30 and vexide would no know better, leaving it to VEXos to decide what to do with your made up non-existent port. Use this with great caution.

> [!CAUTION]
> I'm being serious, please don't do this. This isn't really a workaround, it's a footgun. Stealing peripherals and creating new ports is an escape hatch, and an unsafe one at that. It's intended for cases where it is *literally impossible* to pass an existing owned device, such as with [panic handlers](https://doc.rust-lang.org/nomicon/panic-handler.html). If you are using `Peripherals::steal`, you should probably be using one of the safer solutions that I'm about to cover or be seriously questioning what you are doing.

# Multiple Ownership

Well, theft isn't very nice and memory is best served safe, so let's take another approach here.

So let's say you want to access a device *mutably* from multiple data structures or tasks. This is a pretty common pattern you'll run into when dealing with a controls library:
- Some `Drivetrain` struct has mutable ownership of some motor.
- An `Odometry` struct also needs to read data off of that same motor while its being controlled and modified by `Drivetrain`.

or:

- I need to access a device from a background task without permanently moving it into that task.

> ...what do?

Turns out, Rust has a solution for this baked right into its core library — [interior mutability](https://doc.rust-lang.org/book/ch15-05-interior-mutability.html) and [shared-state concurrency](https://doc.rust-lang.org/beta/book/ch16-03-shared-state.html)! Those are some pretty big words, so let's go over each one.

## Interior Mutability

## Shared-state Concurrency

Shared-state concurrency is the multithreaded big brother of interior mutability. That is, it allows you to share mutable, owned data across multiple running tasks.