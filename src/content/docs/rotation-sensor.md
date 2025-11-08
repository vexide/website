---
title: Rotation Sensor
links: {
    "API Reference": "https://docs.rs/vexide/latest/vexide/devices/smart/rotation/struct.RotationSensor.html",
    "SIGBots Wiki": "https://wiki.purduesigbots.com/vex-electronics/vex-sensors/smart-port-sensors/rotation-sensor",
    "VEX Library":  "https://kb.vex.com/hc/en-us/articles/360051368331-Using-the-Rotation-Sensor-with-VEX-V5",
}
---

<img width="400" alt="rotation sensor sketch" align="center" src="/docs/rotation-sensor.svg" />

The V5 rotation sensor is a through-bore [rotary encoder](https://en.wikipedia.org/wiki/Rotary_encoder) that uses the [hall effect](https://en.wikipedia.org/wiki/Hall_effect_sensor) to measure the position, angle, and angular velocity of a rotating shaft passing through it.

Rotation sensors provide data with more accuracy and higher resolution compared to the integrated encoders in [Motors](/docs/motor), which makes them ideal for measuring rotating mechanisms like lifts, flywheels, and tracking wheels.

# Creating a Rotation Sensor

Using the `Peripherals` struct passed to our `main` function, we can a Rotation Sensor from any one of the 21 `SmartPort` fields on it.

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    // @focus
    //                                   (                )
    let mut sensor = RotationSensor::new(peripherals.port_1);
    //                                  ^
    //                 [Create a Rotation Sensor on port 1.]
}
```

# Measurements

## Position

## Angle

## Velocity