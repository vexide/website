---
title: Inertial Sensor
category: 02. Devices
page: 10
---

<img height="200" alt="inertial sensor sketch" align="center" src="/docs/inertial-sensor.svg" />

The V5 Inertial Sensor combines a gyroscope and accelerometer to measure a robot's orientation, angular velocity, and acceleration on three axes. The Inertial Sensor is more formally called the [IMU (Inertial Measurement Unit)](https://en.wikipedia.org/wiki/Inertial_measurement_unit).

Inertial Sensors are one of the most widely used VEX sensors in competition, because they allow a robot to accurately determine its absolute heading on the field. This is an important step in robot localization (position tracking). Inertial sensors can also be used to measure collisions, detect tips, and measure actions that involve tilting the robot (such as driving up a ramp or climbing).

> [!NOTE]
> For more information on the specific features/hardware details of Inertial Sensors, see VEX's knowledge base page.

# Creating an Inertial Sensor

Inertial Sensors can be created from any one of the 21 `SmartPort` instances in `peripherals`.

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    // @focus
    //                               (                )
    let sensor = InertialSensor::new(peripherals.port_1);
    //                              ^
    //             [Create a Inertial Sensor on port 1.]
}
```

## Calibration

Before an inertial sensor can be used, it must be calibrated.