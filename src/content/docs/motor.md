---
title: Motor
category: 02. Hardware
page: 10
---

![Sketch of two different V5 motors](/docs/motors.svg)

Motors serve as the foundation for most robot subsystems, and are very likely the most common device you'll be interacting with in vexide.

V5 motors are rather special in that they are both fairly fault-tolerant and provide extra features such as builtin velocity/position control, temperature sensors, and encoders. This is why they're commonly referred to as **Smart Motors**.

> [!NOTE]
> For more information on the specific features/hardware details of V5 motors, [see VEX's knowledge base page](https://kb.vex.com/hc/en-us/articles/360035591332-V5-Motor-Overview).


# Creating Motors

On the [previous page](/docs/peripherals), we briefly skimmed over creating motors as an example of a device, but let's look at that a little closer.

Motors can be created from any one of the 21 `SmartPort` instances in `peripherals`, along with a provided `Gearset` and `Direction`:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    //                            (                )  (            )  (                )
    let mut my_motor = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);
    //            ^
    //         [Create a motor on port 1 that spins forwards using the green gearset.]
}
```

## Gearset

Gearsets are the interchangeable colored "gear cartridges" that are physically inserted into a motor to gear it down from the motor's raw 3600RPM to a specific base speed. You can determine the color of your motor's gearset by looking at the colored slot on the front of it.

| Red (100RPM) | Green (200RPM) | Blue (600RPM) |
| -- | -- | -- |
| ![Motor with red cartridge](/docs/red-motor.svg) | ![Motor with green cartridge](/docs/green-motor.svg) | ![Motor with blue cartridge](/docs/blue-motor.svg) |
| `Gearset::Red` | `Gearset::Green` | `Gearset::Blue` |

> [!WARNING]
> The variant of `Gearset` that you specify to `Motor::new` must match the color of the one physically in the motor. If the gearset does not match, your velocity commands and position readings will be thrown off!

Here's an example where we create three motors on ports 1, 2, and 3. Each one has a different gearset respectively (red, green, and blue).

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    //                                                 (          )
    let mut red_motor = Motor::new(peripherals.port_1, Gearset::Red, Direction::Forward);
        //                                               (            )
    let mut green_motor = Motor::new(peripherals.port_2, Gearset::Green, Direction::Forward);
        //                                              (           )
    let mut blue_motor = Motor::new(peripherals.port_3, Gearset::Blue, Direction::Forward);
}
```

## Direction

The third argument that we pass to `Motor::new` is a `Direction`. This determines which way the motor considers to be "forwards". You can use the marking on the back of the motor as a reference:

![Marking on the back of a motor with a counterclockwise arrow.](/docs/motor-direction.svg)

Note how the arrow with the plus in its center is pointing in the **clockwise** direction when the motor is facing **right-side up**.

- When `Direction::Forward` is specified, positive velocity/voltage values will cause the motor to rotate **with the arrow**. Position will **increase** as the motor rotates with the arrow.
- When `Direction::Reverse` is specified, positive velocity/voltage values will cause the motor to rotate **against the arrow**. Position will **increase** as the motor rotates against the arrow.

> How do I know if my motor should be reversed or not?

Whether or not a motor should be reversed is ultimately in the eye of the beholder. If it *feels* like whatever mechanism you're controlling should spin a certain way when giving it positive values, then feel free to adjust the `Direction` of your `Motor` as you see fit.

There are also some cases (such as in drivetrains), where you want lots of motors in different orientations to all spin together in the same direction when given the same velocity or voltage values. This is another usecase for direction, where some of your motors may need to be reversed in order to all spin together in the same direction given the same value.

## 5.5W Smart Motors

In 2023, VEX legalized the [Smart Motor (5.5W)](https://www.vexrobotics.com/276-4842.html) for competition as a lightweight and less powerful alternative to the standard 11W smart motors. These motors come with a few notable differences internally, but use the same `Motor` API under the hood. As a result, most of what you will see on this page is also applicable to these less powerful motors.

> [!NOTE]
> 5.5W motors are effectively the same as an **11W motor with a green (200RPM) cartridge** from the perpspective of VEXos. As such, you should always specify `Gearset::Green` when creating a 5.5w motor.

# Controlling Motors

Now that we have a motor, what should we do with it? Let's go over some basic methods of spinning motors.

## Voltage Control

*Voltage control* is one of the simplest methods of controlling a motor. By adjusting the amount of voltage we send to the motor, we can roughly control the output speed and torque of a motor. The more voltage we give to the motor, the faster and stronger it will spin. 

We can control the voltage sent into the motor using the [`set_voltage`](https://docs.rs/vexide/latest/vexide/prelude/struct.Motor.html#method.set_voltage) method:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut my_motor = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);
    //                ^
    // [Create a green motor on port 1.]

    //      (               )
    my_motor.set_voltage(6.0).ok();
    //      ^
    // [Run the motor at 6 volts.]
}
```

We can also run the motor in reverse by passing in a negative voltage:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut my_motor = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);

    //                   (  )
    my_motor.set_voltage(-6.0).ok();
    //                  ^
    // [Run the motor in reverse at 6 volts.]
}
```

> [!TIP]
> The maximum voltage that can be sent to a V5 Smart Motor (11W) is **±12.0 volts**. The maximum voltage for an V5 Smart Motor (5.5W) is **±10.0 volts**. Any higher or lower values will simply cap to the maximum/minimum.

> [!CAUTION]
> 5.5W motors and 11W motors use different DC motor drivers internally. You should generally try to *avoid* using voltage control in a system where a 5.5W motor is geared to an 11W motor, as applying the same voltage to each motor doesn't necessarily equate to the same output speed due to differences in driver performance. Prefer using [velocity control](#velocity-control) in this case (which has feedback to ensure an actual consistent velocity) or a custom tuned solution like a PID velocity controller.

## Velocity Control

*Velocity control* is very similar to voltage control, but it allows us to run the motor at an actual specified *speed*. Rather than directly controlling the input voltage to the motor, we can instead instruct the motor to spin at a certain number of **rotations per minute (RPM)**.

Smart motors have their own onboard velocity controller (using PID + FeedForward + filtering) that measures the actual velocity of the motor from an internal encoder and adjusts voltage as needed to maintain a target RPM. This is what makes velocity control possible.

Let's tell our motor to spin at 200RPM (the maximum rated speed for the `Green` gearset):

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut my_motor = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);

    //      (                )
    my_motor.set_velocity(200).ok();
    //                   ^
    //      [Spin the motor at 200RPM.]
}
```

As with `set_voltage`, `set_velocity` can also accept negative values to spin the motor backwards:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut my_motor = Motor::new(peripherals.port_1, Gearset::Green, Direction::Forward);

    //      (                 )
    my_motor.set_velocity(-200).ok();
    //                   ^
    //   [Spin the motor backwards at 200RPM.]
}
```

> Velocity and voltage control seem really similar. Which one should I use?

Great question!
- **Voltage control** is ideal in situations where you need to run the motor at its maximum speed no matter what. For example, nothing can make an 11W motor run faster than spinning it at `12.0` volts. Since velocity control is using an actual measurement of the motor's speed, setting a motor to its maximum rated velocity might not actually be using all of the motor's potential voltage (and thus waste speed and torque).
- **Voltage control** is also useful if you are implementing your own kind of velocity controllers and need to bypass VEX's builtin velocity control. The builtin velocity control on the motor is often far from perfect and isn't tuned for every case (it can perform poorly with very fast drivetrains, for example).
- **Velocity control** is useful if you need a quick and easy way to run a motor at a consistent speed. For example, a lift might need to spin at exactly 50RPM regardless of the load applied to the motor. If the lift encounters a load that slows it down, the velocity controller will see this and try to compensate by putting more voltage into the motor to reach that target 50RPM.

## Position Control

## Braking

## Current Limiting

# Motor Telemetry

Motors record a lot of information about themselves and their state as they run. vexide exposes this information through methods on `Motor`.

This data includes:

- [The position of the motor measured by its encoder.](#todo)
- [The velocity of the motor measured by its encoder.](#todo)
- [The estimated efficiency of the motor.](#todo)
- [The electrical current draw of the motor.](#todo)
- [The internal temperature of the motor.](#todo)
- [Any internal errors or damage to the motor.](#todo)

As an example, let's read out a bunch of this data and log it to the [terminal](/docs/using-the-terminal):


```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    // todo
}
```