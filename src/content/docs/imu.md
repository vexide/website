---
title: IMU
category: 02. Hardware
page: 13
---

The inertial sensor -- A.K.A. IMU -- is a combined accelerometer and gyroscope. An inertial sensor can be very useful when implementing odemetry for your robot.

# Creating an Inertial Sensor

The inertial sensor's constructor is very simple. It only takes in a Smart Port from your peripherals and no other configuration. However, before data can be read from an inertial sensor without erroring, it must be calibrated.

```rs
//                               (                  )
let mut imu = InertialSensor::new(peripherals.port_1);
//                               ^
//             [ Create a new inertial sensor on port 1 ]
//                   (   )

imu.calibrate().await.ok();
//                   ^
// [ Explicitly ignore any calibration errors. ]
```
## Running Code While Calibrating

The calibrate method on the inertial sensor returns a future. This allows us to run other code while waiting for the IMU to calibrate.
Running code at the same time as calibrating the inertial sensor can be very useful, as it takes a few seconds to calibrate.

```rs
let mut imu = InertialSensor::new(peripherals.port_1);

// Spawn some code to run in the background
let handle = spawn(async {
    for _ in 0..3 {
        println!("Other code, running in the background...");
        sleep(Duration::from_millis(250)).await;
    }
});

imu.calibrate().await.ok();
println!("Calibration complete!");

// Wait for the task to complete if it hasn't already.
handle.await;
```

The output of this example is as expected:

```
Other code, running in the background...
Other code, running in the background...
Other code, running in the background...
Calibration complete!
```

# Using the Inertial Sensor

Now that we have created an intertial sensor, it's time for use to use it.

## Rotation vs Heading

There are two main ways of getting the IMU's yaw rotation: heading and rotation.
The rotation of the IMU is the total number of degrees it has rotated around.

![Heading vs Rotation Graphic](/docs/imu-heading-vs-rotation.svg)
