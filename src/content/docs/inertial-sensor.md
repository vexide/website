---
title: Inertial Sensor
category: 02. Devices
page: 12
---

<img height="200" alt="inertial sensor sketch" align="center" src="/docs/inertial-sensor.svg" />

The V5 Inertial Sensor combines a gyroscope and accelerometer to measure a robot's orientation, angular velocity, and acceleration on three axes. The Inertial Sensor is more formally called the [IMU (Inertial Measurement Unit)](https://en.wikipedia.org/wiki/Inertial_measurement_unit).

Inertial Sensors are one of the most widely used VEX sensors in competition, because they allow a robot to accurately determine its absolute heading on the field. This is an important step in robot localization (position tracking) and motion control for accurate turns. Inertial sensors can also be used to detect collisions, tips, and measure actions that involve tilting the robot (such as driving up a ramp or climbing).

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

To perform calibration, call the `calibrate()` method and `await` it:

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

Calibration usually takes around 1-3 seconds, but can take longer if the sensor fails to calibrate on the first attempt and retries. During this process, the robot should remain **completely still**.

> [!WARNING]
> Any movement or vibration during calibration will cause the sensor to think it's spinning while at rest. It is **strongly recommended** to avoid moving the robot after calibration before the autonomous period begins.

# Frame of Reference

The Inertial sensor takes measurements on three axes — called X, Y, and Z.

![The Inertial Sensor's frame of reference](/docs/imu-frame-of-reference.svg)

The sensor uses the [north, east, down (NED)](https://en.wikipedia.org/wiki/Local_tangent_plane_coordinates) coordinate system, where the Z-axis points downwards in the direction of the earth's gravity. While this system is common in the aerospace industry, it's less typical in ground vehicles, since it has some implications for how we use the sensor's orientation readings (we'll discuss this further down).

## Mounting Orientation

During calibration, the Inertial Sensor determines which direction is “up” by detecting which axis experiences gravity through its accelerometer. This allows the sensor to align its axes consistently regardless of how it's mounted. In other words, the Z-axis will always point downward, even if the sensor is installed upside-down or sideways.

> [!WARNING]
> The Inertial Sensor should always be mounted flat and level. Mounting it at an incline relative to gravity will lead to inaccurate readings. **Don't do that.**

After calibration, you can check the orientation the sensor detected using the `physical_orientation()` method:

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut sensor = InertialSensor::new(peripherals.port_1);
    sensor.calibrate().await.unwrap();

    println!("Sensor was calibrated while facing: {:?}", status.physical_orientation());
}
```

This method returns one of six possible orientations, based on how the sensor is mounted relative to the axis labels printed on its casing. For example, an orientation of `XDown` indicates that the direction labeled "X" on the top of the sensor is facing downward toward gravity.

> [!TIP]
> The axis labels on the sensor shouldn't be confused with axes we measure from after calibration, though. The Z-axis will still always point downwards, regardless of if the *physical orientation* is `XDown`.

![Inertial sensor mounting orientations](/docs/imu-orientations.png)

# Measurements

As mentioned earlier, the Inertial Sensor combines a *gyroscope* and an *accelerometer*.
- The accelerometer measures acceleration on the three axes.
- The gyroscope measures angular velocity on the three axes.
- The sensor integrates these readings over time to measure the robot's **absolute orientation** (yaw, pitch, and roll).

## Acceleration

To measure the robot's raw acceleration with the IMU's accelerometer, we can use the `acceleration` method.

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut sensor = InertialSensor::new(peripherals.port_1);
    sensor.calibrate().await.unwrap();

    if let Ok(acceleration) = sensor.acceleration() {
        println!(
           "x: {}G, y: {}G, z: {}G",
           acceleration.x,
           acceleration.y,
           acceleration.z,
        );
    }
}
```

The `acceleration.x`, `acceleration.y`, and `acceleration.z` values give us the robot's measured acceleration on each axis in units of [G-force](https://en.wikipedia.org/wiki/G-force).

## Angular Velocity ("Gyro Rate")

We can use the sensor's gyroscope to measure the robot's angular velocity (how fast it is rotating) on each axis using the `gyro_rate` function.

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut sensor = InertialSensor::new(peripherals.port_1);
    sensor.calibrate().await.unwrap();

    if let Ok(rates) = sensor.gyro_rate() {
        println!(
            "x: {}°/s, y: {}°/s, z: {}°/s",
            rates.x,
            rates.y,
            rates.z,
        );
    }
}
```

This gives us values for each axis in *degrees per second*. For example, positive rotational velocity about the Z-axis implies that the robot is rotating *clockwise*.

## Heading & Rotation

## Euler Angles & Quaternions

# Troubleshooting

Although the Inertial Sensor is one of the most common and useful sensors in competition, it is also extremely finnicky and prone to failure. This section covers the most common failure modes of the sensor and how to mitigate them.

## Loss of Power, "Micro-disconnects"

When the Inertial Sensor loses power — even momentarily — its readings become useless until it is re-calibrated. Poor wiring may cause the sensor to briefly lose connection with the Brain without the Brain registering that a disconnect occurred. This is especially problematic because the sensor will automatically try to recalibrate itself when power is restored. Since the robot is often in motion when this happens, the calibration will fail and the sensor will report bad data for the remainder of the match.

This is fundamentally a hardware problem. The first thing that you should do is ensure a secure connection between the Brain and the sensor by wiggling the wire at both ends. If either side is intermittent, start by replacing the wire. If the issue persists, you may need to use a different port on the Brain or use a new sensor.

This issue can be detected in software by periodically checking if the sensor has started calibration again without you explicitly telling it to:

```rs
// @fold start
use vexide::prelude::*;
// @fold end
use std::time::Duration

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut sensor = InertialSensor::new(peripherals.port_1);
    sensor.calibrate().await.unwrap();

    loop {
        let sensor_failure_occurred = sensor.is_calibrating().unwrap_or(true);
        if sensor_failure_occurred {
            panic!("Disconnect occurred");
        }

        sleep(Duration::from_millis(InertialSensor::UPDATE_INTERVAL)).await;
    }
}
```

In the event that the sensor disconnects, you may wish to switch to a backup source for your readings. For example, if you were using the sensor to measure heading, you could switch to a secondary sensor or swap to measuring wheel travel for a less accurate approximation.

## Calibration Failure

During calibration, there are several things that can go wrong. By far the most common cause of calibration failure is movement or vibrations during the calibration period. If the robot is not at rest when `sensor.calibrate().await` is called, the sensor will believe that it is rotating while the robot is sitting still.

## Vibrations

## Inclined Mounting

## Housing Pressure

## Static Electricity
