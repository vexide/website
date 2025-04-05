---
title: Controller
category: 02. Devices
page: 10
---

![controller sketch](/docs/controller.svg)

The V5 Controller enables remote operation of a robot during the driver control period. It has two joysticks, a screen, and 13 buttons that you can program to interact with a V5 Brain and its peripherals. During a match, one or two controllers may be used to control the robot. We'll refer to these two controllers as the _primary controller_ and the _partner controller_.

# Getting a controller

We covered the [`Peripherals` API](/docs/peripherals/) earlier as a safe way to interact with the V5 Brain's peripherals. Using the `peripherals` instance passed to our main function, we can access our two controllers controllers like this:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    //                           (                )
    let controller = peripherals.primary_controller;
    //                                   (                )
    let partner_controller = peripherals.partner_controller;
}
```

# Reading the controller's state

Every 25 milliseconds or so, the controller will update the brain with new information about what buttons on it are pressed, as well as its current joystick values. To access this state, we use the [`Controller::state`](https://docs.rs/vexide/latest/vexide/devices/controller/struct.Controller.html#method.state) method.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let controller = peripherals.primary_controller;

    //                            (                  )
    let state = controller.state().unwrap_or_default();
    //                           ^
// [When handling controller errors, you almost always want to unwrap_or_default here.]

    println!("{:?}", state);
}
```

This function returns an instance of the [`ControllerState`](https://docs.rs/vexide/latest/vexide/devices/controller/struct.ControllerState.html) struct, containing fields for each button and joystick on the controller. Here's each of those fields and what they map to on a real controller:

![controller state](/docs/controller-state.svg)

> [!CAUTION]
> When using `button_power`, you will STILL turn off your program and eventually your controller if you hold it down!

When reading data from a controller, we almost always want to do so repeatedly so we can constantly get new updates from the controller. After all, getting the controller's state once at only one point in time wouldn't be very useful.

To do this, we can use an infinite loop:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let controller = peripherals.primary_controller;

    loop {
        let state = controller.state().unwrap_or_default();

        // Do stuff here!

        sleep(Controller::UPDATE_INTERVAL).await;
    }
}
```

Or if we're in a [competition environment](/docs/competition/), we'll put this loop inside our `driver` function.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
struct MyRobot {
    controller: Controller,
}

impl Compete for MyRobot {
    async fn driver(&mut self) {
        loop {
            let state = self.controller.state().unwrap_or_default();

            // Do stuff here!

            sleep(Controller::UPDATE_INTERVAL).await;
        }
    }
}

#[vexide::main]
async fn main(_peripherals: Peripherals) {
    let my_robot = MyRobot {
        controller: peripherals.primary_controller,
    };

    my_robot.compete().await;
}
```

## Buttons

To check whether a button is _currently pressed down_, you can use the `is_pressed` method on the button we want to check. This method returns `true` if the button is pressed and `false` otherwise.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let controller = peripherals.primary_controller;

    loop {
        let state = controller.state().unwrap_or_default();

        // Use an if-statement to spam out prints depending
        // on if the "A" button is being pressed or not.
        //               (           )
        if state.button_a.is_pressed() {
          println!("A is being pressed :>");
        } else {
          println!("A is not being pressed :c");
        }
        sleep(Controller::UPDATE_INTERVAL).await;
    }
}
```

> Wait, but I want to know when a button was _just_ pressed!

This is a pretty common scenario. Rather than repeatedly running code if a button is *currently being pressed*, we want to run code *once* when the button is pressed and *once* when the button is released. This is useful for things like toggles.

You can use the [`is_now_pressed`](https://docs.rs/vexide/0.5.1/vexide/devices/controller/struct.ButtonState.html#method.is_now_pressed) and [`is_now_released`](https://docs.rs/vexide/0.5.1/vexide/devices/controller/struct.ButtonState.html#method.is_now_released) methods for this exact purpose. These method returns `true` if the button was pressed in the last update (i.e., it was released the last time [`Controller::state`](https://docs.rs/vexide/latest/vexide/devices/controller/struct.Controller.html#method.state) was called and is now pressed) and `false` otherwise. This is quite useful for implementing actions like toggling a pneumatic piston or changing the state of a subsystem.

> [!WARNING]
> Do note that if a button was pressed and released quickly enough between two updates in our loop, the event will not be picked up by `is_now_pressed`.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut controller = peripherals.primary_controller;
    let mut piston = DigitalOut::new(peripherals.port1);

    loop {
        let state = controller.state().unwrap_or_default();

        //                (              )
        if state.button_a.is_now_pressed() {
            //               ^
            //         [Returns true if the A button was just pressed.]
            piston.toggle();
        }

    sleep(Controller::UPDATE_INTERVAL).await;
}
```

## Joysticks

The VEX controller has two joysticks: one on the left and one on the right. You can access the state of these joysticks using the [`left_stick`](https://docs.rs/vexide/latest/vexide/devices/controller/struct.ControllerState.html#structfield.left_stick) and [`right_stick`](https://docs.rs/vexide/latest/vexide/devices/controller/struct.ControllerState.html#structfield.right_stick) fields in our state, respectively.

For fun, let's try implementing a simple tank drive program using the controller's joysticks. We'll map the y-axis of the left joystick to the left motor and the y-axis of the right joystick to the right motor. Note that our joystick functions ([`JoystickState::x`](https://docs.rs/vexide/latest/vexide/devices/controller/struct.JoystickState.html#method.x) and [`JoystickState::y`](https://docs.rs/vexide/latest/vexide/devices/controller/struct.JoystickState.html#method.y)) return values in the interval `[-1.0, 1.0]`, and *not* a percentage out of 100 or value out of 127.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let controller = peripherals.primary_controller;
    let mut left_motor = Motor::new(peripherals.port1, Gearset::Green, Direction::Forward);
    let mut right_motor = Motor::new(peripherals.port2, Gearset::Green, Direction::Forward);

    loop {
        let state = controller.state().unwrap_or_default();

        // Map the y-axis of the left joystick to the left motor
        //                     (                  )
        left_motor.set_voltage(state.left_stick.y() * left_motor.max_voltage());
        //                     ^
        //         [Get the y-axis of the left joystick, in the interval [-1.0, 1.0]]

        // Map the y-axis of the right joystick to the right motor
        //                     (                    )
        right_motor.set_voltage(state.right_stick.y() * right_motor.max_voltage());
        //                     ^
        //         [Get the y-axis of the right joystick, in the interval [-1.0, 1.0]]

        sleep(Controller::UPDATE_INTERVAL).await;
    }
}
```

# Printing to the screen

The VEX controller also has a screen that you can use to display text. Setting the text on the screen is straightforward with the [`set_text`](https://docs.rs/vexide/0.5.1/vexide/devices/controller/struct.ControllerScreen.html#method.set_text) method. This method allows you to specify the text, the row, and the column where the text should be displayed.

Here's how you can use the [`set_text`](https://docs.rs/vexide/0.5.1/vexide/devices/controller/struct.ControllerScreen.html#method.set_text) method:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut controller = peripherals.primary_controller;
    //                    (                             )
    _ = controller.screen.set_text("Hello, world!", 1, 1).await;
    //                                              ^
    //         [Display Hello, world! on the screen at row 1, column 1]
    //                    (                           )
    _ = controller.screen.set_text("Hello, VEX!", 2, 1).await;
}
```

# Shaking the controller

Similarly to video game controllers, the VEX controller has builtin vibration motor that allows you to vibrate it programmatically to provide feedback to the driver.

You can use the [`rumble`](https://docs.rs/vexide/latest/vexide/devices/controller/struct.Controller.html#method.rumble) method to make the controller vibrate. It accepts a string composed of `.`, `-`, and ` ` characters, where:

-   `.` represents a short vibration
-   `-` represents a long vibration
-   and ` ` represents a pause

> [!NOTE]
> Only up to 8 characters can be passed at a time.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut controller = peripherals.primary_controller;
    let _ = controller.rumble(". -. -.").await;
}
```
