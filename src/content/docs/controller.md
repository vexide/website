---
title: Controller
category: 02. Hardware
page: 11
---

Controllers are the basis of how you control the V5 Brain remotely. You can upload programs and communicate with the competition switch using the controller. The controller has a screen, buttons, and joysticks that you can program to interact with the V5 Brain and its peripherals. The controller is also used to control the robot during the driver control period (opcontrol).

During a match, one or two controllers can be used to control the robot. We'll refer to these controllers as the _primary controller_ and the _partner controller_. Having a partner controller is optional, but it can be useful for controlling additional functions of your robot. These two controllers are connected together with a smart cable.

# Getting a reference to a `Controller`

We already talked about the [peripherals API](/docs/peripherals) earlier as providing a safe way to interact with the V5 Brain's peripherals. Using it, you can access the controller as follows:

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
    //                               ^
    //         [Get the primary controller. Note that since we moved the controller out of `peripherals`, we can no longer access it there.]
    //                                   (                )
    let partner_controller = peripherals.partner_controller;
}
```

# Reading the controller's state

<!-- TODO: add one of those fancy illustrations that look cool here. -->

Reading the controller's state is simple through the `Controller::state` method. This method returns a `ControllerState` struct that contains the state of the controller's buttons and joysticks.

You can read each button's state through the `button_x` properties and the joysticks' state through the `y_stick` properties on the `ControllerState` struct.

Here's an example of how you can read the controller's state in a loop:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;
// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
  let mut controller = peripherals.primary_controller;

  loop {
    //          (                )
    let state = controller.state();

    // Now you can use the state of the controller:
    if state.button_a.is_pressed() {
      // Do something repeatedly when the A button is pressed
    } else {
      // Do something else repeatedly when the A button is not pressed
    }

    sleep(Controller::UPDATE_INTERVAL).await;
    // Use the state of the controller here
  }
}
```

Button states can be checked using:

-   `button_a`/`button_b`/`button_x`/`button_y`
-   `button_up`/`button_down`/`button_left`/`button_right`
-   `button_l1`/`button_l2`/`button_r1`/`button_r2`
-   `button_power` (note that while you can use this in your program, holding this button down _will_ stop the program (and eventually turn off the controller), which you probably don't want to happen in a match.)

Joystick states can be checked using:

-   `left_stick` (for the left joystick)
-   `right_stick` (for the right joystick)

## Button states

To check whether a button is _currently pressed down_, you can use the `is_pressed` method on the button. This method returns `true` if the button is pressed and `false` otherwise.

> Wait, but I want to know when a button was _just_ pressed!

Don't worry! In VEXCode, you may have had to declare a separate variable just to keep track of the previous state of a button. In vexide, we do this for you!

You can use the `is_now_pressed` method to check if a button was just pressed. This method returns `true` if the button was pressed in the last update (i.e., it was released the last time `Controller::state` was called and is now pressed) and `false` otherwise. This is quite useful for implementing actions like toggling a pneumatic piston or changing the state of a subsystem.

> [!NOTE]
> If a button was quickly pressed and released in between two updates, the press will not be detected by `is_now_pressed` and will be dropped. Additionally, the controller's update interval is 25ms, so the minimum time between two updates is 25ms.

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
    //                             ^
    // [If the controller is disconnected or there's a problem, we'll just use the default state.]

    //                (              )
    if state.button_a.is_now_pressed() {
    //                ^
    //         [Returns true if the A button was just pressed]
      piston.toggle();
    }

    sleep(Controller::UPDATE_INTERVAL).await;
  }
}
```

## Joystick states

The VEX controller has two joysticks: one on the left and one on the right. You can access the state of these joysticks using the `left_stick` and `right_stick` properties on the `ControllerState` struct, respectively.

For fun, let's try implementing a simple tank drive program using the controller's joysticks. We'll map the y-axis of the left joystick to the left motor and the y-axis of the right joystick to the right motor. Notice that `JoystickState::x` and `JoystickState::y` return values in the interval `[-1, 1]`, and not a percentage like VEXCode does.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
  let mut controller = peripherals.primary_controller;
  let mut left_motor = Motor::new(peripherals.port1);
  let mut right_motor = Motor::new(peripherals.port2);

  loop {
    let state = controller.state().expect("Failed to get controller state");

    // Map the y-axis of the left joystick to the left motor
    //                     (                  )
    left_motor.set_voltage(state.left_stick.y() * left_motor.max_voltage());
    //                     ^
    //         [Get the y-axis of the left joystick, in the interval [-1, 1]]

    // Map the y-axis of the right joystick to the right motor
    //                     (                    )
    right_motor.set_voltage(state.right_stick.y() * right_motor.max_voltage());
    //                     ^
    //         [Get the y-axis of the right joystick, in the interval [-1, 1]]

    sleep(Controller::UPDATE_INTERVAL).await;
  }
}
```

# Using the screen

The VEX controller also has a screen that you can use to display text. Setting the text on the screen is straightforward with the `set_text` method. This method allows you to specify the text, the row, and the column where the text should be displayed.

Here's how you can use the `set_text` method:

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

Similarly to video game controllers, the VEX controller has a feature that allows you to vibrate it programmatically to provide feedback to the driver.

You can use the `rumble` method to make the controller vibrate. It accepts a string composed of `.`, `-`, and ` ` characters, where:

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
