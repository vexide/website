---
title: Competition
category: 01. Getting Started
page: 6
---

There's a pretty good chance that you're using vexide for competition purposes. When programming for a competition robot, we need a way to run different code depending on the current state of the match.

# Competition Modes

As a quick recap, there are three possible *modes* that your robot can be in at any given point in time during a match:

- **Disabled**: This is the default state of your robot before or after a match. You are unable to move motors while your robot is disabled (this is enforced in firmware).
- **Autonomous**: In the autonomous state, you are able to move motors but cannot read data from controllers.
- **Driver**: In the driver control phase, no restrictions are placed on motors or controllers. This is the default state of your robot when disconnected from field control.

# The `Compete` Trait

The `Compete` trait allows us to run different code depending on the state of the match. You can implement it on a struct containing some shared state and have vexide run a function corresponding to the current competition mode.

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

All methods on the `Compete` trait are optional. If we only wanted to provide a `driver` function, then we can omit `autonomous` and `disabled`, for example.

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

When the robot is disabled or running autonomously, it will now do nothing here since we provided no implementation of `disabled` or `autonomous`.

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

> What's it's deal?

This method call that we make in our `main` function is what actually starts your robot's competition lifecycle. When we call `.compete().await;` on our robot struct, we are essentially transferring control of our code to vexide's competition state handler. If this method isn't called and `.await`ed, then nothing will happen and the program will simply exit by returning from `main`.

This means that `.compete().await;` is essentially our *last chance* to do work in our `main` function before we jump into our competition functions. Any initialization code that you want to *always* run at the start of the program should be done *before* calling `compete` (for example, calibrating a sensor).

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

> [!WARNING]
>
> The `connected` and `disconnected` functions implemented in the `Compete` trait are only guaranteed to run if a controller is *physically* unplugged from field control. This does NOT include the Robot's radio losing connection with the controller. If a radio fails during a match, the state of your robot is considered undefined and its motors may or may not be disabled. **This is NOT treated as a field disconnect.**

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

## Bad Assumptions

A common misconception that many competitors have is that `driver` or `autonomous` will only run once during a match. While this may be true in many scenarios, **it is not always the case, assuming this can lead to catastrophic failures**.

> [!WARNING]
> Any method in `Compete` may or may not run any number of times in a single match in any order! Your code should be designed around this. For example, you should **NEVER** assume that a function like `driver` will only run once after `autonomous`.

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

In our `driver` function, we move `Some(3)` out of `self.some_state` (by setting it to `None` with `.take()`) and move it into our `state` variable. The first time our `driver` runs, this will cause no problems, but if `driver` ever runs a second time the program will panic because `self.some_state` will be `None` since we already took the value out the first time.

`driver` running twice is actually a very common occurrence. Since the default state of your robot is `driver` when not plugged into field control, running this program before connecting to field control will run `driver` once, then a second time when the match properly begins.

Here's a diagram illustrating the different methods on `Compete` that will be called in this scenario.

![Possible chain of competition modes: main, driver, connected, disabled, autonomous, disabled, driver, disabled, disconnected](https://i.imgur.com/NWIHvxx.png)

Or in a worst-case-scenario, the TM could get really bored and start randomly flicking switches on the field controller causing a situation like this:

![Rapid switches between autonomous and driver many times](https://i.imgur.com/chVRJn1.png)

> That'd be a fun match.

# Accessing Competition State

Sometimes it may be useful to retrieve information about the state of the match programmatically. Maybe a library needs to know if the robot is disabled, or maybe you want to know the type of field controller your robot is connected to. Fortunately, vexide provides a set of APIs for doing exactly this.

## Checking the Current Match Mode

