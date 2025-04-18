---
title: Peripherals
category: 01. Getting Started
page: 7
---

Until this point, everything we've done with vexide has focused on doing things with the brain itself rather than the whole robot. In this section, we'll learn how to interact with the devices on our robot.

# Devices and Peripherals

We refer to external hardware connected to the brain as *peripherals*. These can be motors, sensors, or other devices on the robot. In vexide, access to peripherals is provided to you through an instance of the [`Peripherals`](https://docs.rs/vexide/latest/vexide/devices/peripherals/struct.Peripherals.html) struct passed to your `main` function.

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
       // [This thing.]
}
```

This `peripherals` argument is the gateway to all of your brain’s available I/O — ports, hardware, and devices. If you want to create a device like a sensor or motor or read from a controller, you are going to need something off of this struct.

## Smart Ports

![smart ports on a brain](/docs/smart-ports.svg)

The brain has 21 accessible smart ports (numbered 1-21 on the brain) for connecting V5 devices to. Let's explore how to use these ports through vexide.

The `Peripherals` struct provided to you has 21 fields each corresponding to a port on the brain. These fields are named `port_1`, `port_2`, ..., `port_21` respectively. You can access these fields using dot notation, like `peripherals.port_1`.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
async fn main(peripherals: Peripherals) {
    //            (                )
    let my_port = peripherals.port_1;
    //           ^
    // [Move port_1 out of our peripherals instance.]
}
```

We can then pass this port to a device's `new` function to create a device. Let's create a [motor](/docs/motor/) on port 1!

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    //                            (                )
    let mut my_motor = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);
    //                            ^
    //                [Pass port_1 to Motor::new to make a motor.]
}
```

## ADI Ports

In addition to smart ports, the brain also features eight three-wire ports (labeled A-H) for compatibility with older sensors and simple devices such as solenoids or LEDs. These ports are called *ADI (Analog-Digital Interface) ports*.

![adi ports on a brain](/docs/adi-ports.svg)

ADI devices work very similarly to smart devices in vexide. Your `Peripherals` struct has eight fields for each port named `adi_a` through `adi_h` alphabetically. In order to create a device, we can move these ports out of `peripherals` and into a device's `new` function.

Let's make a solenoid for controlling pneumatics on ADI port F.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    //                                    (               )
    let mut solenoid = AdiDigitalOut::new(peripherals.adi_f);
    //                                   ^
    //             [Pass adi_f to AdiDigitalOut::new to control a solenoid.]
}
```

Some ADI devices such as encoders and range finders require two wires connected to two separate ADI ports. In that case, you will pass two ADI ports to the `new` function.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    //                                     (          )
    let mut solenoid = AdiRangeFinder::new(adi_a, adi_b);
    //                                    ^
    //             [AdiRangeFinder::new takes both adi_a and adi_b.]
}
```

## Controllers

Both the primary and partner controller are accessed through `peripherals`.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    //               (                            )
    let controller = peripherals.primary_controller;
    //                     (                            )
    let other_controller = peripherals.partner_controller;
}
```

> [!TIP]
> See the [controller docs](/docs/controller/) for further information on how to use the controller.

## Display

Finally, the brain's integrated display can also be accessed through `peripherals`.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    //           (                 )
    let screen = peripherals.display;
}
```

> [!TIP]
> See the [display docs](/docs/display/) for further information on how to use the display.

# Ownership of Peripherals

Something that you'll quickly notice when using the Peripherals API is that `peripherals` and all of its fields are what we call *singletons*. We'll look a little deeper into what that means.

## Thou shalt not copy.

> What even is a singleton?

*Simply put, a singleton is piece of data that you can only have one instance of.* vexide uses singletons to model our data around our real-life hardware (we'll elaborate more on this sentence later).

This means a few (important) things:

- The `Peripherals` struct passed to your `main` function is the only one you will get.
- Once you move a port out of `peripherals`, that is the only instance of it you can (safely) have.
- By extension, you may only (safely) have one device on a port at a given point in time.
- **vexide will not allow you to safely clone or copy a device, port, or peripheral!**

These rules are best demonstrated when we try to break them. Let's try to create two motors on port 1 of our brain.

<div class="code-split error">

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let motor_1 = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);
//                           (err             )
    let motor_2 = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);
}
```

```ansi
[0m[1m[38;5;9merror[E0382][0m[0m[1m: use of moved value: `peripherals.port_1`[0m
[0m [0m[0m[1m[38;5;12m--> [0m[0mexamples/motor.rs:9:30[0m
[0m  [0m[0m[1m[38;5;12m|[0m
[0m[1m[38;5;12m8[0m[0m [0m[0m[1m[38;5;12m|[0m[0m [0m[0m    let motor_1 = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);[0m
[0m  [0m[0m[1m[38;5;12m|[0m[0m                              [0m[0m[1m[38;5;12m------------------[0m[0m [0m[0m[1m[38;5;12mvalue moved here[0m
[0m[1m[38;5;12m9[0m[0m [0m[0m[1m[38;5;12m|[0m[0m [0m[0m    let motor_2 = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);[0m
[0m  [0m[0m[1m[38;5;12m|[0m[0m                              [0m[0m[1m[38;5;9m^^^^^^^^^^^^^^^^^^[0m[0m [0m[0m[1m[38;5;9mvalue used here after move[0m
[0m  [0m[0m[1m[38;5;12m|[0m
[0m  [0m[0m[1m[38;5;12m= [0m[0m[1mnote[0m[0m: move occurs because `peripherals.port_1` has type `SmartPort`, which does not implement the `Copy` trait[0m
```

</div>

The compiler's error message is pretty helpful here. `peripherals.port_1` is a [`SmartPort`](https://docs.rs/vexide/latest/vexide/devices/smart/struct.SmartPort.html), which does not implement the `Copy` trait. This means that after we move `peripherals.port_1` into `motor_1`, we cannot use it again to create `motor_2`. In other words, `motor_1` is now the *sole owner* of port 1.

Alright, back to the drawing board. The next step that many people might try is to `clone` the port before creating the second motor. Let's give that a try.

<div class="code-split error">

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    //                                         (err   )
    let motor_1 = Motor::new(peripherals.port_1.clone(), Gearset::Green, Direction::Forward);
    let motor_2 = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);
}
```

```ansi
[0m[1m[38;5;9merror[E0599][0m[0m[1m: no method named `clone` found for struct `SmartPort` in the current scope[0m
[0m [0m[0m[1m[38;5;12m--> [0m[0mexamples/motor.rs:8:49[0m
[0m  [0m[0m[1m[38;5;12m|[0m
[0m[1m[38;5;12m8[0m[0m [0m[0m[1m[38;5;12m|[0m[0m [0m[0m    let motor_1 = Motor::new(peripherals.port_1.clone(), Gearset::Green, Direction::Forward);[0m
[0m  [0m[0m[1m[38;5;12m|[0m[0m                                                 [0m[0m[1m[38;5;9m^^^^^[0m[0m [0m[0m[1m[38;5;9mmethod not found in `SmartPort`[0m
```

</div>

Unfortunately, the compiler won't let this fly either. Similarly to `Copy`, smart ports do not implement the `Clone` trait either, meaning it won't let us create multiple instances of a motor from the same port.

Alright, this is a bit of a problem. Our two motors are similar enough, so maybe we can try cloning the motor rather than the port?

<div class="code-split error">

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let motor_1 = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);
    //                   (err   )
    let motor_2 = motor_1.clone();
}
```

```ansi
[0m[1m[38;5;9merror[E0599][0m[0m[1m: no method named `clone` found for struct `vexide::prelude::Motor` in the current scope[0m
[0m [0m[0m[1m[38;5;12m--> [0m[0mexamples/motor.rs:9:27[0m
[0m  [0m[0m[1m[38;5;12m|[0m
[0m[1m[38;5;12m9[0m[0m [0m[0m[1m[38;5;12m|[0m[0m [0m[0m    let motor_2 = motor_1.clone();[0m
[0m  [0m[0m[1m[38;5;12m|[0m[0m                           [0m[0m[1m[38;5;9m^^^^^[0m[0m [0m[0m[1m[38;5;9mmethod not found in `Motor`[0m
```

</div>

Nope. Because `motor_1` takes complete ownership of the port (which isn't copyable or cloneable), we can't clone or copy motors either. That would require cloning the `SmartPort` instance now owned by the motor, which is something the compiler already yelled at us for earlier.

## Model your data around your hardware.

> Okay, what gives? This seems kind of arbitrary...

There are two important reasons why vexide enforces these rules.

1. **Representation**: By modeling our code around our hardware, we're able to better represent how our robot is structured. This allows us to catch invalid configurations *at compile time*. Using our attempts from earlier as an example, it isn't possible to plug two motors into the same port at the same time in real life, therefore it isn't possible in vexide.
2. **Safety**: By enforcing these rules, we ensure that our peripherals are safe when used concurrently. If we were to allow cloning or copying devices, we could end up with multiple mutable references to the same underlying resources which can lead to data races or undefined behavior when sharing devices across tasks.

In most cases, you can (and should) write your code around this idea that a device has a single owner. For example, a simple two-motor intake struct might look like this:

```rs
pub struct Intake {
    bottom_motor: Motor,
    top_motor: Motor,
}
```

...or a standard 6-motor drivetrain struct with left and right motors and an inertial sensor:

```rs
pub struct Drivetrain {
    left_motors: [Motor; 3],
    right_motors: [Motor; 3],
    imu: InertialSensor,
}
```

Finally, you would have a `Robot` struct that owns instances of all of these subsystems:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

pub struct Intake {
    bottom_motor: Motor,
    top_motor: Motor,
}

pub struct Drivetrain {
    left_motors: [Motor; 3],
    right_motors: [Motor; 3],
    imu: InertialSensor,
}

// @fold end
pub struct Robot {
    controller: Controller,
    intake: Intake,
    drivetrain: Drivetrain,
}

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let my_robot = Robot {
        controller: peripherals.primary_controller,
        intake: Intake {
            top_motor: Motor::new(peripherals.port_1, Gearset::Blue, Direction::Forward),
            bottom_motor: Motor::new(peripherals.port_2, Gearset::Blue, Direction::Reverse),
        },
        drivetrain: Drivetrain {
            left_motors: [
                Motor::new(peripherals.port_3, Gearset::Blue, Direction::Forward),
                Motor::new(peripherals.port_4, Gearset::Blue, Direction::Forward),
                Motor::new(peripherals.port_5, Gearset::Blue, Direction::Reverse),
            ],
            right_motors: [
                Motor::new(peripherals.port_6, Gearset::Blue, Direction::Reverse),
                Motor::new(peripherals.port_7, Gearset::Blue, Direction::Reverse),
                Motor::new(peripherals.port_8, Gearset::Blue, Direction::Forward),
            ],
            imu: InertialSensor::new(peripherals.port_9),
        },
    };
}
```

In most cases, this system of structuring our robot where each device has a single owner works without issue.

![Ownership hierarchy of the robot](/docs/ownership-hierarchy.svg)

## Problems with Device Ownership

On the other hand, devices having a single owner can sometimes cause us problems. You'll most commonly run into ownership issues when working with multiple complicated systems that both need access to the same devices.

So let's say you're writing a cool new drivetrain control library called **LemonLib**. In this library, you want a standard `Drivetrain` structure for moving the robot around and a separate `Odometry` struct for tracking the drivetrain's position through motor encoders and an IMU as it moves. To keep things simple, we'll only support 6 motor drives for now.

The two structs would look something like this, where we keep an array of 3 motors for each side of the drive:

```rs
use vexide::prelude::*;

pub struct Drivetrain {
    left_motors: [Motor; 3],
    right_motors: [Motor; 3],
}

pub struct Odometry {
    left_motors: [Motor; 3],
    right_motors: [Motor; 3],
    imu: InertialSensor,
}
```

Unfortunately, we hit a brick wall almost immediately. The motors that we need to access in `Odometry` are the same motors that are owned by `Drivetrain`. This setup requires multiple subsystems (both `Drivetrain` and `Odometry`) to have ownership of the same devices.

![Ownership diagram of Drivetrain and Odometry structs](/docs/drivetrain-ownership.svg)

> Darn. Could we use uhhh... references or something?

Okay let's try that. We'll adjust our motor arrays to store references (`&Motor`) rather than owned `Motor`s. Since `Drivetrain` needs to set the motor's voltages (which is a mutable operation), it will need to take mutable references (`&mut Motor`).

```rs
use vexide::prelude::*;

pub struct Drivetrain<'a> {
    // @diff - start
    left_motors: [Motor; 3],
    right_motors: [Motor; 3],
    // @diff - end
    // @diff + start
    left_motors: [&'a mut Motor; 3],
    right_motors: [&'a mut Motor; 3],
    // @diff + end
}

pub struct Odometry<'a> {
    // @diff - start
    left_motors: [Motor; 3],
    right_motors: [Motor; 3],
    // @diff - end
    // @diff + start
    left_motors: [&'a Motor; 3],
    right_motors: [&'a Motor; 3],
    // @diff + end
    imu: InertialSensor,
}
```

This ends up looking pretty nasty, since we've had to introduce lifetime annotations into our structs to store references, but even worse — it won't compile when we try to use it!

<div class="code-split error">

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

pub struct Drivetrain<'a> {
    left_motors: [&'a mut Motor; 3],
    right_motors: [&'a mut Motor; 3],
}

pub struct Odometry<'a> {
    left_motors: [&'a Motor; 3],
    right_motors: [&'a Motor; 3],
    imu: InertialSensor,
}

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    // Make our six motors.
    let mut m1 = Motor::new(peripherals.port_3, Gearset::Blue, Direction::Forward);
    let mut m2 = Motor::new(peripherals.port_4, Gearset::Blue, Direction::Forward);
    let mut m3 = Motor::new(peripherals.port_5, Gearset::Blue, Direction::Reverse);
    let mut m4 = Motor::new(peripherals.port_6, Gearset::Blue, Direction::Reverse);
    let mut m5 = Motor::new(peripherals.port_7, Gearset::Blue, Direction::Reverse);
    let mut m6 = Motor::new(peripherals.port_8, Gearset::Blue, Direction::Forward);

    // Here's the drive.
    let mut drive = Drivetrain {
        //           (err                      )
        left_motors: [&mut m1, &mut m2, &mut m3],
        //            (err                      )
        right_motors: [&mut m4, &mut m5, &mut m6],
    };

    // Here's the odom.
    let odom = Odometry {
        //           (err          )
        left_motors: [&m1, &m2, &m3],
        //            (err          )
        right_motors: [&m4, &m5, &m6],
        imu: InertialSensor::new(peripherals.port_9),
    };

    // Spin the left side of the drive at 12 volts.
    for motor in drive.left_motors {
        _ = left_motor.set_voltage(12.0);
    }
}
```

```ansi
[0m[1m[38;5;9merror[E0502][0m[0m[1m: cannot borrow `m1` as immutable because it is also borrowed as mutable[0m
[0m  [0m[0m[1m[38;5;12m--> [0m[0mexamples/lemonlib.rs:35:23[0m
[0m   [0m[0m[1m[38;5;12m|[0m
[0m[1m[38;5;12m29[0m[0m [0m[0m[1m[38;5;12m|[0m[0m [0m[0m        left_motors: [&mut m1, &mut m2, &mut m3],[0m
[0m   [0m[0m[1m[38;5;12m|[0m[0m                       [0m[0m[1m[38;5;12m-------[0m[0m [0m[0m[1m[38;5;12mmutable borrow occurs here[0m
[0m[1m[38;5;12m...[0m
[0m[1m[38;5;12m35[0m[0m [0m[0m[1m[38;5;12m|[0m[0m [0m[0m        left_motors: [&m1, &m2, &m3],[0m
[0m   [0m[0m[1m[38;5;12m|[0m[0m                       [0m[0m[1m[38;5;9m^^^[0m[0m [0m[0m[1m[38;5;9mimmutable borrow occurs here[0m
[0m[1m[38;5;12m...[0m
[0m[1m[38;5;12m41[0m[0m [0m[0m[1m[38;5;12m|[0m[0m [0m[0m    for motor in drive.left_motors {[0m
[0m   [0m[0m[1m[38;5;12m|[0m[0m                  [0m[0m[1m[38;5;12m-----------------[0m[0m [0m[0m[1m[38;5;12mmutable borrow later used here[0m
```

</div>

The borrow checker is angry with us because we tried to immutably borrow our motors in `Odometry` after we've already mutably borrowed them in `Drivetrain`. The compiler won't let us do this, because you are only allowed either ONE mutable reference or MANY immutable references to an owned piece of data, but not both at the same time.

> [!TIP]
> This called the [aliasing rule](https://doc.rust-lang.org/nomicon/aliasing.html), and it's one of the foundational invariants of the Rust borrow checker.

## Breaking the Rules with Shared Ownership

Okay final attempt, I promise. The solution that we're looking for can be found through combining two special types provided by Rust. One of these types provides *shared ownership* while the other provides *interior mutability*.

- **Shared Ownership** allows a piece of data to have more than one distinct owner even if it's type isn't `Copy` or `Clone`. This is achieved through the [`Rc<T>` type](https://doc.rust-lang.org/book/ch15-04-rc.html), which is a **R**ereference **C**ounted smart pointer. Whenever we clone the pointer, we create a new distinct owner of the underlying data and the `Rc`'s internal counter is increased by 1. If the reference counter drops to 0, this means that owners of the data have gone out of scope and the memory held by the `Rc` is cleaned up.
- **Interior Mutability** lets us mutate a value even when we only have an immutable reference to it. This is done through the [`RefCell<T>` container](https://doc.rust-lang.org/book/ch15-05-interior-mutability.html), which enforces the aliasing rule at runtime rather than compile time. If we break the aliasing rule and mutably borrow our data while another borrow already exists, our program will panic rather than refuse to compile.

Combining these two types together gives us an `Rc<RefCell<T>>`, a fairly common wrapper type used to share data across two owners in Rust. Let's wrap our motor arrays in this.

```rs
// @diff + start
extern crate alloc;

use alloc::rc::Rc;
use core::cell::RefCell;
// @diff + end
use vexide::prelude::*;

pub struct Drivetrain<'a> {
    // @diff - start
    left_motors: [Motor; 3],
    right_motors: [Motor; 3],
    // @diff - end
    // @diff + start
    left_motors: Rc<RefCell<[Motor; 3]>>,
    right_motors: Rc<RefCell<[Motor; 3]>>,
    // @diff + end
}

pub struct Odometry<'a> {
    // @diff - start
    left_motors: [Motor; 3],
    right_motors: [Motor; 3],
    // @diff - end
    // @diff + start
    left_motors: Rc<RefCell<[Motor; 3]>>,
    right_motors: Rc<RefCell<[Motor; 3]>>,
    // @diff + end
    imu: InertialSensor,
}
```

Now when we create our motor arrays, we will wrap them in `Rc<RefCell<T>>`. This allows us to clone them before moving them into `Drivetrain`.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

pub struct Drivetrain {
    left_motors: Rc<RefCell<[Motor; 3]>>,
    right_motors: Rc<RefCell<[Motor; 3]>>,
}

pub struct Odometry {
    left_motors: Rc<RefCell<[Motor; 3]>>,
    right_motors: Rc<RefCell<[Motor; 3]>>,
    imu: InertialSensor,
}

// @fold end
extern crate alloc;

use alloc::rc::Rc;
use core::cell::RefCell;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let left_motors = Rc::new(RefCell::new([
        Motor::new(peripherals.port_3, Gearset::Blue, Direction::Forward),
        Motor::new(peripherals.port_4, Gearset::Blue, Direction::Forward),
        Motor::new(peripherals.port_5, Gearset::Blue, Direction::Reverse),
    ]));
    let right_motors = Rc::new(RefCell::new([
        Motor::new(peripherals.port_6, Gearset::Blue, Direction::Reverse),
        Motor::new(peripherals.port_7, Gearset::Blue, Direction::Reverse),
        Motor::new(peripherals.port_8, Gearset::Blue, Direction::Forward),
    ]));

    // @highlight
    let cloned_left_motors = left_motors.clone();
    // @highlight
    let cloned_right_motors = right_motors.clone();
    //                                    ^
    // [And now, we are able to `clone` our motors!]

    // Here's the drive.
    let mut drive = Drivetrain { left_motors, right_motors, };

    // Here's the odom.
    let odom = Odometry {
        //           (                )
        left_motors: cloned_left_motors,
        //            (                )
        right_motors: cloned_right_motors,
        imu: InertialSensor::new(peripherals.port_9),
    };
}
```

> [!NOTE]
> Note that when we call `left_motors.clone()` there is still only *one* instance of each motor. What we are actually cloning is the `Rc<T>` smart pointer *referencing* the underlying motors. Every time we clone the smart pointer, another shared owner of our motors is created by incrementing the reference count.

In order to access our motors from the smart pointer, we can use the `borrow` and `borrow_mut` methods. Let's use `borrow_mut` to spin the left motors in our `Drivetrain` struct.

```rs
// @fold start
#![no_std]
#![no_main]

extern crate alloc;

use alloc::rc::Rc;
use core::cell::RefCell;
use vexide::prelude::*;

pub struct Drivetrain {
    left_motors: Rc<RefCell<[Motor; 3]>>,
    right_motors: Rc<RefCell<[Motor; 3]>>,
}

pub struct Odometry {
    left_motors: Rc<RefCell<[Motor; 3]>>,
    right_motors: Rc<RefCell<[Motor; 3]>>,
    imu: InertialSensor,
}

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let left_motors = Rc::new(RefCell::new([
        Motor::new(peripherals.port_3, Gearset::Blue, Direction::Forward),
        Motor::new(peripherals.port_4, Gearset::Blue, Direction::Forward),
        Motor::new(peripherals.port_5, Gearset::Blue, Direction::Reverse),
    ]));
    let right_motors = Rc::new(RefCell::new([
        Motor::new(peripherals.port_6, Gearset::Blue, Direction::Reverse),
        Motor::new(peripherals.port_7, Gearset::Blue, Direction::Reverse),
        Motor::new(peripherals.port_8, Gearset::Blue, Direction::Forward),
    ]));

    let mut drive = Drivetrain {
        left_motors: left_motors.clone(),
        right_motors: right_motors.clone(),
    };

    let odom = Odometry {
        left_motors,
        right_motors,
        imu: InertialSensor::new(peripherals.port_9),
    };

    // Spin the left motors.
    // @highlight
    for motor in drive.left_motors.borrow_mut().iter_mut() {
        _ = motor.set_voltage(12.0);
    }
}
```

> [!WARNING]
> When using `RefCell::borrow` and `RefCell::borrow_mut`, the aliasing rule will still be enforced. If you attempt to mutably borrow the data while it's already immutably borrowed, your program will panic. The difference between a `RefCell` and a regular reference is *when* the aliasing rules are enforced. With a regular reference, the borrow checker enforces the rule at compile time, whereas a `RefCell` enforces the rule at runtime.

Cool. What we've just done is safely circumvented the restriction that a device must have one owner. We did this by sharing ownership of the device between `Drivetrain` and `Odometry` through the use of reference-counted smart pointers. We still have only one instance of each device and port, but ownership of the instance is *shared*.

![ownership diagram of Drivetrain and Odometry when sharing motors](/docs/rc-refcell-ownership.svg)

## Breaking the Rules with Dark Magic and Theft

For the completeness of this tutorial, we're going to go over the various cursed ways that you can completely ignore the rules of ownership through the use of `unsafe` code.

> [!CAUTION]
> **DO NOT DO THIS!** Seriously. If you are considering doing any of the things below this point of the page, it's a sign that your code should be structured in a different way. `unsafe` circumvents the guarantees of device validity and soundness provided by vexide. These methods are intended for cases where it is *literally impossible* to pass an existing owned device, such as in a [panic handler](https://doc.rust-lang.org/nomicon/panic-handler.html). They are *NOT* intended as an escape hatch to get around ownership rules.

`Peripherals` is a singleton type, meaning we are only allowed one instance of it per-program. But what if we could get another? Well, we can unsafely **steal** a new instance of `Peripherals` to get an instance separate from the one given to us in `main`.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(first_peripherals: Peripherals) {
    // @highlight
    let second_peripherals = unsafe { Peripherals::steal() };
}
```

We now have two instances of `Peripherals` and therefore two instances of every port. This means we can unsafely create two motors on the same port.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(first_peripherals: Peripherals) {
    let second_peripherals = unsafe { Peripherals::steal() };

    //                       (                      )
    let motor_1 = Motor::new(first_peripherals.port_1, Gearset::Green, Direction::Forward);
    //                       (                       )
    let motor_2 = Motor::new(second_peripherals.port_1, Gearset::Green, Direction::Forward);
}
```

Or even two different devices on the same port.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(first_peripherals: Peripherals) {
    let second_peripherals = unsafe { Peripherals::steal() };

    let motor = Motor::new(first_peripherals.port_1, Gearset::Green, Direction::Forward);
    //  ^
    // [Motor on port 1.]
    let optical = OpticalSensor::new(second_peripherals.port_1);
    //  ^
    // [Optical sensor on port 1.]
}
```

## Unsafe Peripheral Construction

Along with stealing new instances of `Peripherals`, you can *(but really shouldn't)* also unsafely create new `SmartPort`s separate from the ones provided to you through the `Peripherals` struct.

```rs
use vexide::devices::smart::SmartPort;

//           (                          )
let port_1 = unsafe { SmartPort::new(1) };
//                    ^
//          [Make a new port 1.]
```

Note that this is *particularly bad* because it has no bounds checking, meaning we are able to create completely nonsensically-numbered ports that don't exist in real life.

```rs
use vexide::devices::smart::SmartPort;

// Sure, why not.
let port_32 = unsafe { SmartPort::new(32) };
```

> [!CAUTION]
> If you used this port to create a device, you could potentially run into unexpected behavior or bugs.

We are also able to do this with other peripherals such as `AdiPort`, `Display`, and `Controller`.

```rs
use vexide::prelude::*;
use vexide::devices::controller::ControllerId;

let smart_port = unsafe { SmartPort::new(1) };
let adi_port = unsafe { AdiPort::new(1, None) };
let display = unsafe { Display::new() };
let primary_controller = unsafe { Controller::new(ControllerId::Primary) };
let partner_controller = unsafe { Controller::new(ControllerId::Partner) };
```
