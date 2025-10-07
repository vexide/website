---
title: Inertial Sensor
category: 02. Devices
page: 12
---

<img height="200" alt="inertial sensor sketch" align="center" src="/docs/inertial-sensor.svg" />

The V5 Inertial Sensor combines a gyroscope and accelerometer to measure a robot's orientation, angular velocity, and acceleration on three axes. The Inertial Sensor is more formally called the [IMU (Inertial Measurement Unit)](https://en.wikipedia.org/wiki/Inertial_measurement_unit).

Inertial Sensors are one of the most widely used VEX sensors in competition, because they allow a robot to accurately determine its absolute heading on the field. This is an important step in robot localization (position tracking) and motion control for accurate turns. Inertial sensors can also be used to measure collisions, detect tips, and measure actions that involve tilting the robot (such as driving up a ramp or climbing).

> [!TIP]
> For more information on the specific features/hardware details of Inertial Sensors, see [VEX's knowledge base page](https://kb.vex.com/hc/en-us/articles/360037382272-Using-the-Inertial-Sensor-with-VEX-V5) and the [Purdue SIGBots Wiki](https://wiki.purduesigbots.com/vex-electronics/vex-sensors/smart-port-sensors/imu).

# Creating an Inertial Sensor

Using the `Peripherals` struct passed to our `main` function, we can create an Inertial Sensor from any one of the 21 `SmartPort` fields on it.

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    // @focus
    //                                   (                )
    let mut sensor = InertialSensor::new(peripherals.port_1);
    //                                  ^
    //                [Create an Inertial Sensor on port 1.]
}
```

## Calibration

Before we can use the Inertial Sensor, we have to calibrate it first. Calibration ensures that the gyroscope and accelerometer readings are accurate by having the sensor measure its baseline while completely still.

To calibrate the sensor, call the `calibrate()` method and `await` it:

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut sensor = InertialSensor::new(peripherals.port_1);
    // @highlight
    sensor.calibrate().await;
}
```

Calibration usually takes around 1-3 seconds, but may take longer in cases where the sensor fails to calibrate the first time and retries. During this time, the robot should remain **completely still**.

> [!WARNING]
> Any disturbances or motion during the calibration process will cause the sensor to think it's spinning while at rest. It is **strongly recommended** to not move the robot after the Inertial Sensor has been calibrated before the autonomous period starts.

> [!NOTE]
> It's important to note that VEXos will calibrate all connected Inertial Sensors plugged into the Brain automatically at the start of the program in the background *regardless* of if you called `calibrate().await`.
> 
> This automatic calibration should *never* be relied on, and you should *always* use `sensor.calibrate().await` in your program. This ensures that the robot doesn't start moving before the sensor finishes calibration. Additionally, vexide's `calibrate` function handles errors better than the automatic calibration done by VEXos, and will retry if it fails the first time.

# Measurements