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
//                                                   (err )
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

//                                  (err           )
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
    //                           (err )
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

If you *absolutely* need another instance of `Peripherals`, you can get one with [`Peripherals::steal`](https://docs.rs/vexide-devices/latest/vexide_devices/peripherals/struct.Peripherals.html#method.steal). This is an `unsafe` operation and will need to be marked as such:

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

> Well, theft isn't very nice and memory is best served safe, so let's take another approach here.

# Interior Mutability

So let's say you want to access a device *mutably* from multiple data structures or tasks. This is a pretty common pattern you'll run into when dealing with a controls library:
- Some `Drivetrain` struct has mutable ownership of some motor.
- An `Odometry` struct also needs to read data off of that same motor while its being controlled and modified by `Drivetrain`.

> ...what do?

Turns out, Rust has a solution for this baked right into its core library — [interior mutability](https://doc.rust-lang.org/book/ch15-05-interior-mutability.html)!

*Interior mutability* is a pattern that allows many mutable references to be made on a single piece of data. This is done through a natural combination of Rust's `Rc` and `RefCell` smart pointer types, and effectively allows mutation of a variable declared as immutable as well as multiple owners of a single piece of data! Let's have a look at the types we'll be working with:

- `Rc<T>` or "Reference Counted `T`" is a smart pointer that enables multiple owners over the same piece of data.
- `RefCell<T>` is a wrapper that moves mutable borrow checking rules from compile-time to run-time, allowing us to mutably borrow an immutable piece of data.

> [!TIP]
> In other words, `Rc` lets many variables own one piece of data and `RefCell` lets us modify that data without having mutable ownership of it.

Combining these two types together gives us a powerful pattern that allows us to "sneak around the borrow checker". Take this piece of code for example, Rust refuses to let us mutably borrow our owned value `x` twice:
```rs
let mut x = 1;

let y = &mut x;
//      (err )
let z = &mut x;
//     ^
// [cannot borrow `x` as mutable more than once at a time]

*y = 2;
*z = 3;

println!("{x}");
//        ^
// [We are trying to get x to equal 3 here.]
```

...but we can get around this by wrapping `x` in an `Rc` and `RefCell`.

```rs
extern crate alloc;

use core::cell::RefCell;
use alloc::rc::Rc;

let x = Rc::new(RefCell::new(1));

//       (      )
let y = x.clone();
//       (      )
let z = x.clone();
//       ^
// [cloning here does not clone the data in x, but rather the `Rc` smart pointer around x.]
// [y and z are still referencing the underlying data in x!]

//(           )
*y.borrow_mut() = 2;
//(           )
*z.borrow_mut() = 3;
//^
// [Notice how y and z are both declared as immutable, yet we can get mutable references to them.]<<<
// [This is the power of RefCell. It gives us interior mutability of the data without actually borrowing mutably.]<<<

println!("{:?}", x);
// ^<<<
// [RefCell { value: 3 }]<<<
```

Cool. Let's apply this power to some devices. We're going to use the `Drivetrain`/`Odometry` example from before, so let's make some structs:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
pub struct Drivetrain {
    pub left_motor: Motor,
    pub right_motor: Motor,
}

pub struct Odometry {
    pub left_motor: Motor,
    pub right_motor: Motor,
}
```

Both of these structs want to own the same two motors, but Rust won't allow this. We need to wrap these in `Rc<RefCell<T>>` to allow for interior mutability:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
// @diff + start
extern crate alloc;

use core::cell::RefCell;
use alloc::rc::Rc;
// @diff + end

pub struct Drivetrain {
    // @diff - start
    pub left_motor: Motor,
    pub right_motor: Motor,
    // @diff - end
    // @diff + start
    pub left_motor: Rc<RefCell<Motor>>,
    pub right_motor: Rc<RefCell<Motor>>,
    // @diff + end
}

pub struct Odometry {
    // @diff - start
    pub left_motor: Motor,
    pub right_motor: Motor,
    // @diff - end
    // @diff + start
    pub left_motor: Rc<RefCell<Motor>>,
    pub right_motor: Rc<RefCell<Motor>>,
    // @diff + end
}
```

Now we can pass both structs a shared `Rc<RefCell<Motor>>` smart pointer, allowing them to both access the same two motors.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

extern crate alloc;

use core::cell::RefCell;
use alloc::rc::Rc;

pub struct Drivetrain {
    pub left_motor: Rc<RefCell<Motor>>,
    pub right_motor: Rc<RefCell<Motor>>,
}

pub struct Odometry {
    pub left_motor: Rc<RefCell<Motor>>,
    pub right_motor: Rc<RefCell<Motor>>,
}

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let left_motor = Rc::new(RefCell::new(Motor::new(
        peripherals.port_1,
        Gearset::Blue,
        Direction::Forward
    )));
    let right_motor = Rc::new(RefCell::new(Motor::new(
        peripherals.port_2,
        Gearset::Blue,
        Direction::Reverse
    )));

    let drivetrain = Drivetrain {
        left_motor: left_motor.clone(),
        right_motor: right_motor.clone(),
    };

    let odometry = Odometry {
        left_motor: left_motor.clone(),
        right_motor: right_motor.clone(),
    };
}
```

Keep in mind — we haven't cloned a `Motor` at all here, just cloned a *smart pointer to the Motor*. Pretty neat, huh?

Each struct can then internally access the inner motor and modify its state:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::{devices::smart::motor::MotorError, prelude::*};

extern crate alloc;

use core::cell::RefCell;
use alloc::rc::Rc;

pub struct Odometry {
    pub left_motor: Rc<RefCell<Motor>>,
    pub right_motor: Rc<RefCell<Motor>>,
}

// @fold end
pub struct Drivetrain {
    pub left_motor: Rc<RefCell<Motor>>,
    pub right_motor: Rc<RefCell<Motor>>,
}

impl Drivetrain {
    pub fn run(&mut self, voltage: f64) -> Result<(), MotorError> {
        self.left_motor.get_mut().set_voltage(voltage)?;
        self.right_motor.get_mut().set_voltage(voltage)?;
    }
}
// @fold start

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let left_motor = Rc::new(RefCell::new(Motor::new(
        peripherals.port_1,
        Gearset::Blue,
        Direction::Forward
    )));
    let right_motor = Rc::new(RefCell::new(Motor::new(
        peripherals.port_2,
        Gearset::Blue,
        Direction::Reverse
    )));

    let drivetrain = Drivetrain {
        left_motor: left_motor.clone(),
        right_motor: right_motor.clone(),
    };

    let odometry = Odometry {
        left_motor: left_motor.clone(),
        right_motor: right_motor.clone(),
    };
}
// @fold end
```

> [!WARNING]
> Interior mutability comes with one **massive** limitation, however. You cannot, under any circumstances share an `Rc<RefCell<T>>` across tasks or threads. Rust simply wont let you, because `Rc<RefCell<T>>` is not a thread-safe type. For that, you need its threadsafe counterpart - [Shared State Concurrency](todo)