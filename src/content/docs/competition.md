---
title: Competition
category: 01. Getting Started
page: 6
---

There's a pretty good chance that you're using vexide for competition purposes. When programming for a competition robot, we need to have a way to hook into the different *competition modes* (such as driver and autonomous) and run different pieces of code depending on what mode we are in.

# The `Compete` Trait

The `Compete` trait allows us to do just that - you can implement it on a data structure containing your robot's devices and have vexide run a function corresponding to the current competition mode.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
struct MyRobot {}

//   (     )
impl Compete for MyRobot {
    async fn autonomous(&mut self) {
        println!("Running in autonomous mode!");
    }

    async fn driver(&mut self) {
        println!("Running in driver mode!");
    }
}

#[vexide::main]
async fn main(_peripherals: Peripherals) {
    let my_robot = MyRobot {};
//  (                       )
    my_robot.compete().await;
}
```

Calling `my_robot.compete().await;` in `main` will poll a future that polls the functions we have in our `Compete` implementation depending on the current phase of the competition lifecycle.

The full list of mode functions on `Compete` is:

- `driver`, which is the default state of `Compete` when completely disconnected from field control. No restrictions on motors or sensors are placed in this mode.
- `autonomous`, which runs during the autonomous period of the match. While in this mode, any attempts to read data from a controller will result in an error (this is enforced in firmware).
- `disabled`, which runs between modes when on field control and before/after matches. While in this mode, motors cannot be driven (this is enforced in firmware).
- `connected`, which runs once when a competition controller has been physically plugged in.
- `disconnected`, which runs once when a competition controller has been physically unplugged.

```rs
impl Compete for MyRobot {
    async fn connected(&mut self) {}
    async fn disconnected(&mut self) {}
    async fn disabled(&mut self) {}
    async fn driver(&mut self) {}
    async fn autonomous(&mut self) {}
}
```

# The Competition Lifecycle

Understanding how competition control interacts with your robot is of great importance when writing fault-tolerant code. Many teams in the past have gotten this wrong and made assumptions where they shouldn't, resulting in unpredictable behavior.

## Execution of Competition Functions

The first and **most important** thing to understand is that the **only function guaranteed to run once and only once is `main`!**

> [!WARNING]
> Every function in `Compete` can and will run any number of times in a single match. Your code should be designed around this fact. For example, you should **NEVER** assume that a function like `driver` or `connected` only runs once. You also cannot assume modes like `autonomous` will always run before `driver`.

Here is an example of some bad code that assumes `driver` only runs once, resulting in a panic if it were to ever run twice.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
struct MyRobot {
    some_data: Option<i32>,
}

impl Compete for MyRobot {
    async fn driver(&mut self) {
//      (err                                     )
        let data = self.some_data.take().unwrap();
        //                             ^
        // [called `Option::unwrap()` on a `None` value]
    }
}

#[vexide::main]
async fn main(_peripherals: Peripherals) {
    let my_robot = MyRobot {
        some_data: Some(3),
    };
    my_robot.compete().await;
}
```

> Wait, what's going on here? Why did we panic again?

In this case, since the default state of the robot when not plugged into field control is `driver`, running this program before connecting to field control will start the program in `driver`, meaning `driver` will run a second time in the match and panic the program. The program panics since we already took out `Some(3)` from `self.some_data` in the first run of `driver`. When we try to take it a second time, we get `None` and panic when trying to call `unwrap` on that.

To visualize what happened, let's look at the order of competition functions throughout a theoretical match with this program:


![Possible chain of competition modes: main, driver, connected, disabled, autonomous, disabled, driver, disabled, disconnected](https://i.imgur.com/NWIHvxx.png)

Or the TM could get bored and start randomly flicking switches on the field controller causing a situation like this:

![Rapid switches between autonomous and driver many times](https://i.imgur.com/chVRJn1.png)

> That'd be a fun match.

## Cancellation of Competition Functions

The second important thing to understand about the competition lifecycle is that competition functions other than `connected` and `disconnected` can have their execution cancelled at any time. If you are in the middle of `autonomous` and the field controller decides to disable you, execution *will* jump to `disabled` at the next opportunity the async runtime gets and any local context in `autonomous` will be lost, since its future will simply stop being polled.

> [!TIP]
> In other words, if `autonomous` ever runs a second time, execution will not pick up where it left off. `autonomous` will instead just run again from the start.

# Competition Information

vexide also offers some functions for getting information about the current state of the competition. These are available through the [`competition` module of `vexide::core`](https://docs.rs/vexide-core/latest/vexide_core/competition/index.html).

This includes:

- [Whether or not a competition system is connected.](https://docs.rs/vexide-core/latest/vexide_core/competition/fn.is_connected.html)
- [The type of competition system being used (Field Controller vs. Competition Switch).](https://docs.rs/vexide-core/latest/vexide_core/competition/fn.system.html)
- [The current competition mode (Driver, Autonomous, Disabled).](https://docs.rs/vexide-core/latest/vexide_core/competition/fn.mode.html)
- [The raw status flags returned by VEXos about the competition state.](https://docs.rs/vexide-core/latest/vexide_core/competition/fn.status.html)

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*
// @fold end
use vexide::core::competition::{
    self,
    CompetitionMode,
    CompetitionSystem,
};

#[vexide::main]
async fn main(_peripherals: Peripherals) {
//     (                         )
    if competition::is_connected() {
//                 ^
//     [Check if we are currently controlled by a competition controller.]
        println!("We are connected to a competition controller!");
    }

//                        (                   )
    if let Some(system) = competition::system() {
//                                    ^
//     [Get the type of competition controller we are connected to.]
        match system {
            CompetitionSystem::FieldControl => {
                println!("We are tethered to a field controller.");
            }
            CompetitionSystem::CompetitionSwitch => {
                println!("We are tethered to a competition switch.");
            }
        }
    } else {
        println!("Not connected to competition control.");
    }

//        (                 )
    match competition::mode() {
//                    ^
//     [Get the current that mode we are in.]
//     [This will always be Driver if we are disconnected from competition control.]
        CompetitionMode::Disabled => {
            println!("Currently running disabled.");
        },
        CompetitionMode::Autonomous => {
            println!("Currently running autonomous.");
        }
        CompetitionMode::Driver => {
            println!("Currently running driver.");
        }
    }

//                                               (                   )
    println!("Competition status flags are: {}", competition::status());
//                                                           ^
//                          [Get the current competition-related bitflags returned by VEXos.]
}
```

# Edge-cases

There are some edge cases associated with the Competition API. These are simply a side-effect of VEXos behavior and not really something we can control. They're useful to know about, regardless.

- When running in the "Timed Run" mode through the controller, the Brain will be tricked by the controller into thinking it's running on a competition switch. `competition::system` will be `Some(CompetitionSystem::CompetitionSwitch)`.
- When on field control, if a radio disconnect occurs, `is_connected` will still return `true` and you will remain in your current mode, but your motors will be disabled. VEXos will essentially give you the restrictions of `disabled` without actually placing you into `disabled`.
    - This is done to prevent robots from completely restarting their autonomous routines halfway through a match if heavy radio interference is present. It also prevents teams from bypassing the restrictions of the current mode if a radio disconnect occurs.
    - `Compete::disconnected` and `Compete::connected` will NOT run in this scenario. Recall that they only run if a wire is *physically unplugged*, not if there is a radio issue.