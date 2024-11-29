---
title: "Thanksgiving Updates: vexide 0.5.0, AI Vision, Java/Kotlin on V5, evian"
description: Happy thanksgiving everyone!
author: tropix126
tags: ["blog"]
date: 2024-11-28
thumbnail: {
    url: "/images/thumbnails/oscilloscope.png",
    alt: "Oscilloscope displaying the vexide logo."
}
---

Happy Thanksgiving everyone! we've got some exciting releases to announce. Let's recap the progress that's been made over the last few months.

# `vexide` 0.5.0

We've published the next major release of vexide—version 0.5.0—to crates.io today. As always, the full changelog can be found [here](/blog/posts/vexide-050).

0.5.0 is a very significant update to the vexide runtime, being likely the largest update yet. This version heavily focuses on polishing vexide's **device APIs** (think motors, sensors, etc...) as well as the surrounding documentation with them. It also introduces several new devices and fixes some bugs in the existing ones. 

> [!TIP]
> In order to use `vexide` 0.5.0, you will need to update to `cargo-v5` 0.8.2. You can do that by re-running `cargo install cargo-v5`.

> [!IMPORTANT]
> Because of the scale of this release, there are *many* breaking changes in our APIs made in an effort to hopefully finalize these interfaces. We'll try to go over the main ones in this post, but there will be some migration needed.

## Massive Improvements in API Documentation

A large amount of time on this release was spent improving our [API documentation](https://docs.rs/vexide). In fact, [nearly half](/blog/vexide-linecount.png) of vexide's line count is comments now. Most rustdoc methods and modules in the `vexide-devices` crate have been completely rewritten with updated and detailed information. Our end goal (which we haven't reached yet!) is matching the documentation standards found in the Rust standard library.

To start, almost all device methods now have examples showcasing how they can be used, as well as a section describing any causes of possible errors that can be returned by the method. Here's an example:

| 0.4.0 | 0.5.0 |
| -- | -- |
| ![method documentation in vexide 0.4.0](/blog/0.4.0-method.png) | ![method documentation in vexide 0.5.0](/blog/0.5.0-method.png) <small> (this goes down further) </small> |

These efforts combine information gathered from many sources, including VEX's official docs, the BLRS wiki, random jpearman posts from 5 years ago, and word-of-mouth from discord servers nobody's ever heard of. Our hope is that having all this information in one place will make it less of a headache for you to find compared to the rather scattered state of things right now.

## New Controller API

The `Controller` API has recieved a facelift. Controller state is now all gathered through a single `state` method, which avoids the mess of handling individual errors for each controller button.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

async fn main(peripherals: Peripherals) {
    let robot = Robot {
        controller: peripherals.primary_controller,
        intake: Motor::new(peripherals.port_1, Gearset::Blue, Direction::Forward),
    };

    robot.compete().await;
}

struct Robot {
    controller: Controller,
    intake: Motor,
}

// @fold end
impl Compete for Robot {
    async fn driver(&mut self) {
        loop {
            // @highlight
            let state = self.controller.state().unwrap_or_default();

            if state.button_l1.is_pressed() {
                _ = self.intake.set_voltage(12.0);
            } else if state.button_l2.is_pressed() {
                _ = self.intake.set_voltage(-12.0);
            } else {
                _ = self.intake.brake(BrakeMode::Coast);
            }

            sleep(Motor::UPDATE_INTERVAL).await;
        }
    }
}
```

We've also introduced new ways to handle press/release events on buttons with the `is_now_pressed` and `is_now_released` getters. These let you easily implement toggle buttons in your driver control code.

```rs
let state = self.controller.state().unwrap_or_default();

//               (               )
if state.button_a.is_now_pressed() {
    _ = self.clamp.toggle();
}

//               (               )
if state.button_b.is_now_released() {
    println!("Button B was just released!");
}
```

Furthermore, you can now get the current state of the controller's power button (for whatever reason you might want to do that.) This isn't especially practical, since the power button will still kill the program when held for a short period of time, but hey, we support it anyways!

```rs
    //   (          )
if state.button_power.is_now_pressed() {
    println!("Power button on primary controller was pressed!");
}
```

## SDCard & Filesystem

vexide **finally** has a filesystem API! You can now read and write to the Brain's micro-SDCard slot. Our `vexide::core::fs` module provides a limited subset of the standard library's `std::fs` API for this.

```rs
// @fold start
#![no_main]
#![no_std]

extern crate alloc;

use alloc::string::String;

use vexide::prelude::*;
use vexide::core::fs::File;

// @fold end
#[vexide::main]
async fn main(_peripherals: Peripherals) {
    // Create a new file and write some data to it.
    let mut file = File::create("foo").unwrap();
    file.write_all(b"bar").unwrap();
    file.flush().unwrap();

    // Reopen that file in read mode to read the data we just wrote to it.
    let mut file = File::open("foo").unwrap();
    let mut buf = [0; 3];
    file.read(&mut buf).unwrap();

    // Print out the data we just got off the SDCard.
    let buf = String::from_utf8(buf.to_vec()).unwrap();
    println!("{buf}");
}
```

Do note that this API is not fully featured due to (intentional) limitations in how VEXos handles its filesystem. Notably:

- Files cannot be opened as **read and write** at the same time (only one). To read a file that you've written to, you'll need to drop your written file descriptor and reopen it as readonly.
- Files can be created, but not deleted or renamed.
- Directories cannot be created or enumerated from the Brain, only top-level files.

> [!NOTE]
> There isn't really much we can do about these limitations, as they are fundamentally restrictions placed on user code by VEXos. Sorry!

## AI Vision Support


The first of our new devices is VEX's new [AI Vision Sensor](https://www.vexrobotics.com/276-8659.html), which is an upgrade over their older Pixy2-based vision sensor with added support for onboard AI and [AprilTag](https://april.eecs.umich.edu/software/apriltag) detection models.

<iframe style="display: block; margin: 0 auto; max-width: 100%;" width="560" height="315" src="https://www.youtube.com/embed/61SxToiTqo8?si=efdqE_vQ6wdwiPbS" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Here's an example of its API in use on vexide 0.5.0:

```rs
// @fold start
#![no_main]
#![no_std]

use vexide::prelude::*;

//@fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut ai_vision = AiVisionSensor::new(peripherals.port_1);

    // Configure the sensor to detect green colors.
    ai_vision
        .set_color(
            1,
            AiVisionColor {
                rgb: Rgb::new(55, 125, 70),
                hue_range: 10.0,
                saturation_range: 0.2,
            },
        )
        .unwrap();

    loop {
        for object in ai_vision.objects().unwrap() {
            println!("{:?}", object);
        }

        sleep(AiVisionSensor::UPDATE_INTERVAL).await;
    }
}
```

And here it is detecting an AprilTag from the `tag16h5` family during our testing.

<div style="width: 480px; max-width: 100%;">

![tag16h5 detection](/blog/aivision-tag16h5.png)

</div>

> [!THANKS]
> We'd like to give special thanks to [Alex](https://github.com/alexDickhans) from team 2654E for helping us test and debug on his sensor when none of us had access to the hardware. Thanks for your help!

## V5 Electromagnet Support

![workcell electromagnet mounted on an arm](/blog/workcell-electromagnet.png)

For all two of you people on this planet who has one of these, vexide now supports the [V5 Workcell](https://kb.vex.com/hc/en-us/sections/360011729652-Setting-Up-the-V5-Workcell)'s electromagnet device. Note that this device is not competition legal at all, and is also impossible to obtain without buying a discontinued kit for several thousand dollars.

```rs
// @fold start
#![no_main]
#![no_std]

use vexide::prelude::*;
use core::time::Duration;

//@fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut electromagnet = Electromagnet::new(peripherals.port_1);
    
    _ = electromagnet.set_power(1.0, Duration::from_millis(500));
    //              ^
    // [Set the magnet to full power for half a second.]
}
```

## New ADI Devices (and old ADI fixes!)

We've added support for two new ADI devices — [`AdiGyro`](https://docs.rs/vexide/latest/vexide/devices/adi/struct.AdiGyro.html) and [`AdiServo`](https://docs.rs/vexide/latest/vexide/devices/adi/struct.AdiServo.html) for controlling the old [Yaw Rate Gyroscope](https://wiki.purduesigbots.com/vex-electronics/vex-sensors/3-pin-adi-sensors/gyroscope) and [Three-wire Servo](https://www.idesignsol.com/3-Wire-Servo-276-2162) hardware.

| `AdiGyro` | `AdiServo` |
| --------- | ---------- |
| <div style="width: 200px">![Three-wire gyro](/blog/adi-gyro.jpeg)</div> | <div style="width: 200px">![Three wire servo](/blog/adi-servo.webp)</div> |

The old gyro is even still competition legal! (though you should probably just use an `InertialSensor`...)

> [!IMPORTANT]
> We've also fixed a pretty serious bug where ADI devices would not update if they were written to at intervals faster than 11 milliseconds.

## EXP (5.5W) Smart Motors

![Sketch of an 11W and 5.5W Smart Motor](/docs/motors.svg)

vexide's `Motor` API now has explicit support for 5.5W smart motors. You can create one using the `Motor::new_exp` method:

```rs
let motor = Motor::new_exp(peripherals.port_1, Direction::Reverse);
```

You can also get a motor's type using `Motor::motor_type` and maximum voltage with `Motor::max_voltage`:

```rs
fn what_motor(motor: Motor) {
    match motor.motor_type() {
        MotorType::V5 => println!("This motor is an 11W Smart Motor."),
        MotorType::Exp => println!("This motor is an 5.5W Smart Motor."),
    }

    // 8.0 on 5.5W, 12.0 on 11W
    println!("Maximum voltage:" motor.max_voltage());
}
```

## Panic Hooks

vexide now supports registering a *hook* for its program panic handler. If your program crashes for whatever reason, you can register code to run before vexide exits your program. This can be useful for logging purposes and error reporting.

Here's an example hook that writes the last panic message to a `panic.log` file on the SDCard using our new `fs` API:

```rs
// @fold start
#![no_main]
#![no_std]

use vexide::prelude::*;
use vexide::core::fs::File;

use core::time::Duration;

// @fold end
#[vexide::main]
async fn main(_peripherals: Peripherals) {
    vexide::panic::set_hook(|info| {
        if let Ok(mut file) = File::create("panic.log") {
            writeln!(file, "{:?}", info).unwrap();
        }
        // Call the default panic hook to print the panic message to the serial
        // console and put it on the display
        vexide::panic::default_panic_hook(info);
    });
    println!("Hook set. Crashing in one second.");

    sleep(Duration::from_secs(1)).await;

    panic!("AHHHHH!");
}
```

## New Display Drawing Features

vexide's `Display` API now supports basic font customization and sizing options. You can also now specify a background color for the text.

<div style="display: flex; gap: 16px; flex-wrap: wrap;">
    <div style="flex: 1">
        <img style="min-width: 240px;" src="/blog/display-font-1.png" alt="brain display showcasing various font sizes" />
    </div>
    <div style="flex: 1">
        <img style="min-width: 240px;" src="/blog/display-font-2.png" alt="brain display showcasing various fonts in VEXos" />
    </div>
</div>


```rs
// @fold start
#![no_main]
#![no_std]

use core::{fmt::Write, time::Duration};

use vexide::{
    devices::display::{Font, FontFamily, FontSize, Rect, Text},
    prelude::*,
};

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    // We can get the screen directly from peripherals because it is always connected to the Brain.
    let mut display = peripherals.display;

    let text = Text::new("Nice to see you!", Font::default(), [80, 40]);

    // Draw the text on the display in cyan with a yellow background color.
    display.draw_text(&text, Rgb::new(0, 255, 255), Some(Rgb::new(255, 255, 0)));

    // You can use varying text sizes and fonts.
    let text = Text::new(
        "This is vexide.",
        Font::new(FontSize::new(2, 3), FontFamily::Proportional),
        [21, 84],
    );
    // Draw the text white, with a transparent background.
    display.draw_text(&text, Rgb::new(255, 255, 255), None);

    // Font sizes can be created with a fraction or a float
    let size = FontSize::from_float(0.333).unwrap();
    println!("Font Size: {:?}", size);
    let size = FontSize::try_from(1.4).unwrap();
    println!("Font Size: {:?}", size);
}
```

# evian

[evian](http://evian.vexide.dev/) is an experimental autonomous controls library for vexide that I (Tropical) been working on.

<a href="https://evian.vexide.dev">

![evian banner](/blog/evian-banner.png)

</a>


The idea behind evian is that it will serve as a basis for further controls work in vexide. The library is *highly* extensible and makes full use of the Rust type system, allowing you to write motion algorithms that are generic across both drivetrain configurations and localization algorithms. The idea behind evian is not to offer a "free odometry and auton library", but rather to provide a basis for people to develop their own cool things on top of it.

> [!WARNING]
> evian is currently in its alpha stages and is not something that is at all recommended for competition use yet. That being said, if you are interested or experienced in drivetrain control and want to contribute something, let me know in the [#evian channel](https://discord.gg/9EuzzM2tcR) of our discord server.

evian's architecture is designed around extensibility. The base `Drivetrain` struct is very simple:

```rs
/// A mobile robot capable of measuring data about itself.
#[derive(Default, Debug, Eq, PartialEq, Hash)]
pub struct Drivetrain<D, T> {
    pub motors: D,
    pub tracking: T,
}
```

It holds a collection of motors and a system that track's *some* kind of data about the robot (could be position, heading, wheel travel, anything really...) For example, if I had a tank drivetrain with tracking wheels and an IMU, i'd have a `Drivetrain<Differential, PerpendicularWheelTracking>`. We have a `Differential` (left/right) motor setup, and a `PerpendicularWheelTracking` system capable of tracking position, heading, and forward travel.

Motion algorithms are simply functions that take a mutable reference to our drivetrain struct and control it. For example, if we wanted to write a motion for our aformentioned differential drive robot, we can do this:

```rs
//                             (                            )
pub async fn my_cool_motion<T: TracksPosition + TracksHeading>(
    &mut self,
    //               (                         )
    drivetrain: &mut Drivetrain<Differential, T>,
    some_input: f64,
) {
}
```

We could then move the robot using this function we just wrote:

```rs
my_cool_motion(&mut my_drivetrain, 10.0).await;
```

This is a motion that takes in a `Drivetrain<Differential, T>`, where `T` is any tracking system that happens to track the robot's *position* and *heading*. This system is powerful, because motions specify *exactly* what they want through Rust's type system. They can be extremely abstract (even abstract across drivetrain types), or extremely specific in their needs, which allows people to do things like write their own unique tracking systems and motion algorithms while remaining compatible with evian's ecosystem.

Work is also being put into a high-performance 2D trajectory generator (2D motion profiling), with planned support for a RAMSETE trajectory follower.

![trajectory generated by evian](/blog/evian-trajectory.png)

This is largely a port of [Cooper's `Real-Time-Motion-Profiling` project](https://github.com/cooper7196/Real-Time-Motion-Profiling/blob/main/src/main.cpp), with initial results showing extremely promising performance (sub-3 millisecond trajectory generation).


# Hydrozoa

[Hydrozoa](https://github.com/vexide/hydrozoa) is a WebAssembly interpreter that runs on the Brain. [Tons of programming languages](https://github.com/appcypher/awesome-wasm-langs) can be compiled to WASM and then run on the Brain using Hydrozoa. [Lewis](https://github.com/doinkythederp) made Hydrozoa and is currently working on [Kotlin and Java](https://github.com/vexide/Hydrozoa-Java) tooling and libraries for Hydrozoa. In the future, languages like Java, Kotlin, Javascript, Typescript, Go, C#, Lua, and many more might be usable for VRC!

![3 billion devices run java (including V5)](/blog/3-billion-devices-run-java.png)

Although it's not fully complete, you can already try running Java on your Brain right now! To get started, clone our [Hydrozoa Java template](https://github.com/vexide/Hydrozoa-Java-Template). Next, install the Hydrozoa CLI tool:

```
cargo install --git https://github.com/vexide/hydrozoa-cli.git
```

Finally, connect to your Brain and upload your program with gradle:

```
./gradlew upload
```

And that's it! Java is now running on your Brain!

# New Contributors

> [!THANKS]
> vexide is a community project maintained for free by open-source contributors. We'd like to thank the following new contributors to the project:

- [zabackary](https://github.com/zabackary) (VRC team 99484) for their excellent work on implementing Panic Hooks, fixes to our synchronization primitives, various API cleanups, and help testing our new `AdiGyro` device.
- **Jace**, for their patch submission via email (!!) fixing a bug in our `InertialSensor` and `GpsImu` APIs.

Thanks again for your contributions!