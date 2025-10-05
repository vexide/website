---
title: Competition
category: 01. Getting Started
page: 6
---

There's a pretty good chance that you're using vexide for competitive robotics. When programming for a competition robot, we need a way to run different code paths depending on the current state of the match.

# Competition Modes

From a programming standpoint, a typical competition match involves three possible *modes* that your robot can be in at any given point in time:

- **Disabled**: This is the default state of your robot before or after a match. You are unable to move motors while your robot is disabled (this is enforced in firmware).
- **Autonomous**: In the autonomous state, you are able to move motors but cannot read data from controllers.
- **Driver**: In the driver control phase, no restrictions are placed on motors or controllers. This is the default state of your robot when no field controller is connected (e.g. when you run your program normally).

The mode that your robot is placed into is determined by a *field controller*, which is a special piece of hardware that plugs into your controller during the match and communicates with the brain.

> [!TIP]
> You can test each mode using the **Timed Run** option on your controller. This will simulate a typical V5RC match cycle with a 3 second disabled period, a 15 second autonomous period, and a 1 minute 45 second driver period. Alternatively, a *VEXnet Competition Switch* (no longer sold) may be used to temporarily force the robot into a specific match mode.

# The `Compete` Trait

The `Compete` trait allows us to run different code depending on the state of the match. You can implement it on a struct containing some shared data (such as your robot's devices) and have vexide automatically call a function depending on the current competition mode.

```rs
// @fold start
use vexide::prelude::*;

// @fold end
struct MyRobot {}

//   (     )
impl Compete for MyRobot {
    async fn disabled(&mut self) {
        println!("Robot is disabled.");
    }

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

All methods on the `Compete` trait are optional. If we only wanted to provide a `driver` function, then we can omit `autonomous` and `disabled`, for example:

```rs
// @fold start
use vexide::prelude::*;

struct MyRobot {}

// @fold end
impl Compete for MyRobot {
    async fn driver(&mut self) {
        println!("Running in driver mode!");
    }
}

#[vexide::main]
async fn main(_peripherals: Peripherals) {
    let my_robot = MyRobot {};
    my_robot.compete().await;
}
```

> [!NOTE]
> In this case, when the robot is disabled or running autonomously, it will do nothing during that time period since we provided no implementation of `disabled` or `autonomous`.


## Robot Initialization

You may be wondering about this call that we made in our `main` function in the previous two examples.

```rs
#[vexide::main]
async fn main(_peripherals: Peripherals) {
    let my_robot = MyRobot {};

    // @focus
    my_robot.compete().await;
}
```

> What's its deal?

This call that we make in our `main` function is what actually starts your robot's competition lifecycle. When we call `.compete().await;` on our robot struct, we are transferring control of our code to vexide's competition state handler. This is what allows the methods in `Compete` to run.

> [!NOTE]
> If this method were not called and `.await`ed, then nothing would happen and the program would simply exit by returning from `main`.

This means that `.compete().await;` is our *last chance* to do work in our `main` function before we jump into our competition functions. Any initialization code that you want to *always* run at the start of your program (e.g. calibrating a sensor) should be run *before* calling `compete`.

```rs
// @fold start
use vexide::prelude::*;

struct MyRobot {}

impl Compete for MyRobot {
    async fn disabled(&mut self) {
        println!("Robot is disabled.");
    }

    async fn autonomous(&mut self) {
        println!("Running in autonomous mode!");
    }

    async fn driver(&mut self) {
        println!("Running in driver mode!");
    }
}

// @fold end
#[vexide::main]
async fn main(_peripherals: Peripherals) {
  // @highlight start
  calibrate_some_sensor();
  setup_gui_or_whatever();
  select_auton_route();
  do_more_stuff();
  // @highlight end
//  ^
// [This code will always run at the start of the program regardless of competition state.] 

    let my_robot = MyRobot {};
//  (                       )
    my_robot.compete().await;
//                   ^
// [At this point, control of the program is now in the hands of the competition runtime.]
}
```

## Event Methods

In addition to the three competition modes, the `Compete` trait also provides the `connected` and `disconnected` methods, which will be called when the robot is physically connected or disconnected from a field controller.

> [!NOTE]
>
> The `connected` and `disconnected` functions implemented in the `Compete` trait are only guaranteed to run if a controller is *physically* unplugged from field control. This does not include the Robot's radio losing connection with the controller. If a radio fails during a match, the state of your robot is considered undefined and its motors may or may not be disabled. **This is NOT treated as a field disconnect.**

Here is `Compete` implementation with every method implemented, including `connected` and `disconnected`:

```rs
// @fold start
use vexide::prelude::*;

struct MyRobot {}

// @fold end
impl Compete for MyRobot {
    async fn connected(&mut self) {
        println!("Connected to field control.");
    }

    async fn disconnected(&mut self) {
        println!("Disconnected from field control.");
    }

    async fn disabled(&mut self) {
        println!("Robot is disabled.");
    }

    async fn autonomous(&mut self) {
        println!("Running in autonomous mode!");
    }

    async fn driver(&mut self) {
        println!("Running in driver mode!");
    }
}
// @fold start

#[vexide::main]
async fn main(_peripherals: Peripherals) {
    let my_robot = MyRobot {};
    my_robot.compete().await;
}
// @fold end
```

## Dangerous Assumptions

A common misconception that many competitors have is that `driver` or `autonomous` will only run once during a match. While this may be true in many scenarios, it is not always the case.

> [!IMPORTANT]
> Any method in `Compete` may or may not run any number of times in a single match in any order. Your code should be designed around this. For example, you should **NEVER** assume that a function like `driver` will only run once, or that `autonomous` will always run *before* `driver`.

Let's look at a potential recipe for disaster. Can you spot the issue?

```rs
// @fold start
use vexide::prelude::*;

// @fold end
struct MyRobot {
    some_state: Option<i32>,
}

impl Compete for MyRobot {
    async fn driver(&mut self) {
        //          (err                          )
        let state = self.some_state.take().unwrap();
        println!("State is {}.", data);
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

In our `driver` function, we take `Some(3)` out of `self.some_state` and move it into our `state` variable. The first time our `driver` runs, this will cause no problems, but if `driver` ever runs a second time the program will panic. This is because `self.some_state` will be `None` the second time `driver` runs, since we already took the value out the first time.

> [!TIP]
> `driver` running twice is actually a very common occurrence. Since the default state of your robot is `driver` when not plugged into field control, running this program before connecting to field control will run `driver` once, then a second time when the match properly begins.

Here's a diagram illustrating the different methods on `Compete` that could be called in a scenario where the program is ran *before* the controller is connected to the field. Notice how `driver` runs twice in a single match?

![Possible chain of competition modes: main, driver, connected, disabled, autonomous, disabled, driver, disabled, disconnected](https://i.imgur.com/NWIHvxx.png)

Or in a worst-case-scenario, the TM could get really bored and start randomly flicking switches on the field controller causing a situation like this:

![Rapid switches between autonomous and driver many times](https://i.imgur.com/chVRJn1.png)

> That'd be a fun match.

# Accessing Competition State

Sometimes it may be useful to retrieve information about the state of the match programmatically. Maybe a library needs to know if the robot is disabled, or maybe you want to know the type of field controller your robot is connected to. Fortunately, vexide provides a set of APIs for doing exactly this.


## Checking the Current Match Mode

The `competition` module provides a simple set of functions that allow you to query the robot’s current match mode directly.
This can be useful if you want to behave differently based on whether the robot is disabled, running autonomously, or under driver control.

```rs
use vexide::competition::{self, CompetitionMode};

match competition::mode() {
    CompetitionMode::Disabled => println!("Robot is disabled."),
    CompetitionMode::Autonomous => println!("Autonomous period."),
    CompetitionMode::Driver => println!("Driver control."),
}
```

## Checking Connection State

To determine whether the robot is connected to any form of competition control, use [`competition::is_connected()`](https://docs.rs/vexide/latest/vexide/competition/fn.is_connected.html):

```rs
use vexide::competition;

if competition::is_connected() {
    println!("Connected to competition control.");
} else {
    println!("Running standalone.");
}
```

This function returns `true` if the robot is connected to a field controller, competition switch, or in a timed run, and `false` otherwise.

## Determining the Type of Control System

You can also determine *what kind* of system is currently controlling your robot's competition state using [`competition::system()`](https://docs.rs/vexide/latest/vexide/competition/fn.system.html):

```rs
use vexide::competition::{self, CompetitionSystem};

match competition::system() {
    Some(CompetitionSystem::FieldControl) => println!("Connected to field control."),
    Some(CompetitionSystem::CompetitionSwitch) => println!("Connected to competition switch."),
    None => println!("Not connected to competition control."),
}
```

This function returns an `Option<CompetitionSystem>`, which may contain either:

* `Some(CompetitionSystem::FieldControl)` - The robot is being controlled by a **VEX Field Control System**.
* `Some(CompetitionSystem::CompetitionSwitch)` - The robot is being controlled by a **VEXnet competition switch**.
* `None` – The robot is not connected to any competition control device.

## Getting the Full Competition Status

If you need complete access to all competition flags reported by VEXos at once, you can retrieve them with [`competition::status()`](https://docs.rs/vexide/latest/vexide/competition/fn.status.html):

```rs
let status = vexide::competition::status();

println!("Connected: {}", status.is_connected());
println!("Mode: {:?}", status.mode());
println!("System: {:?}", status.system());
```

This returns a [`CompetitionStatus`](https://docs.rs/vexide/latest/vexide/competition/struct.CompetitionStatus.html) bitflag structure, which contains all available information about the current match state.
It provides convenience methods such as `.is_connected()`, `.mode()`, and `.system()` that mirror the standalone functions shown above.

> [!TIP]
> Working with `CompetitionStatus` directly can be useful for debugging or for libraries that need to monitor match transitions at a lower level. This is how vexide's `Compete` trait works under the hood.
