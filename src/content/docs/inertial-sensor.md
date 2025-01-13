---
title: Inertial Sensor
category: 02. Hardware
page: 10
---

The **Inertial Sensor**, also known as the **Inertial Measurement Unit (IMU)** is a sensor that measures a robot's orientation and acceleration on 3 axes. It contains a 3-axis gyroscope and a 3-axis accelerometer.

![Sketch of an inertial sensor](/docs/inertial-sensor.svg)

These sensors are useful for autonomous robot control. They give you an accurate reading of your robot's heading and can be used for executing precise turns when paired with a control loop such as a [PID controller](https://en.wikipedia.org/wiki/Proportional%E2%80%93integral%E2%80%93derivative_controller). They can also detect if a robot has tipped or collided with something.

# Creating Inertial Sensors

Using the `Peripherals` struct passed to our `main` function, we can create our sensor from any one of the 21 `SmartPort` fields on it.

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    //                                (                )
    let mut imu = InertialSensor::new(peripherals.port_1);
    //                               ^
    //                  [Create a sensor on port 1.]
}
```

For this example, we'll assume that the sensor is plugged into port 1 on the brain, but you can create a sensor from any unused port. For example, to create one on port 2 you would replace `peripherals.port_1` with `peripherals.port_2`.

# Calibration & Mounting