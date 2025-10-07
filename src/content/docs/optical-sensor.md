---
title: Optical Sensor
category: 02. Devices
page: 15
---

<img height="200" alt="optical sensor sketch" align="center" src="/docs/optical-sensor.svg" />

The V5 Optical Sensor is a combination of an ambient light, color, proximity, and gesture sensor. Optical sensors report data about the light intensity, color, and proximity of a single point within their field of view. The sensor is also able to detect hand gestures in four directions.

Because of their color sensing capabilities, Optical Sensors are most often used in sorting mechanisms.

> [!TIP]
> For more information on the specific features/hardware details of Inertial Sensors, see [VEX's knowledge base page](https://kb.vex.com/hc/en-us/articles/360051005291-Using-the-Optical-Sensor-with-VEX-V5) and the [Purdue SIGBots Wiki](https://wiki.purduesigbots.com/vex-electronics/vex-sensors/smart-port-sensors/optical-sensor).


# Creating an Optical Sensor

Using the `Peripherals` struct passed to our `main` function, we can create an Optical Sensor from any one of the 21 `SmartPort` fields on it.

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    // @focus
    //                                 (                )
    let mut sensor = OpticalSensor::new(peripherals.port_1);
    //                                 ^
    //                [Create an Optical Sensor on port 1.]
}
```