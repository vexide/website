---
title: Distance Sensor
category: 02. Devices
page: 12
---

<img height="200" alt="distance sensor sketch" align="center" src="/docs/distance-sensor.svg" />

The V5 Distance Sensor is a [Time of Flight (ToF) sensor](https://en.wikipedia.org/wiki/Time-of-flight_camera) that measures an object's distance, relative size, and approach speed using a [VCSEL Class 1 Laser](https://en.wikipedia.org/wiki/Vertical-cavity_surface-emitting_laser) that reflects off of nearby objects. Distance sensors are commonly used for object detection and robot localization (position tracking).

> [!NOTE]
> For more information on the specific features/hardware details of Distance Sensors, [see VEX's knowledge base page](https://kb.vex.com/hc/en-us/articles/360050696511-Using-the-Distance-Sensor-with-VEX-V5).

# Creating a Distance Sensor

Distance Sensors can be created from any one of the 21 `SmartPort` instances in `peripherals`.

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    // @focus
    //                               (                )
    let sensor = DistanceSensor::new(peripherals.port_1);
    //                              ^
    //             [Create a Distance Sensor on port 1.]
}
```

# Object Measurements

If a distance sensor is within range of an object, it will report four things:
- The object's distance from the front of the sensor in millimeters.
- The object's approach velocity in meters per second.
- A guess at the object's "relative size". This value is a unitless score from 0-400, where an 18“ x 30“ grey card will return a value of approximately 75 in typical room lighting.
- A "confidence score" of how accurate its measurements are from 0.0 to 1.0.

> [!NOTE]
> Distance Sensors will report new readings once every 33 milliseconds, and have a maximum specified range of 2000mm (78.74in). When in close range of an object (less than 8 inches), they have an FOV of roughly ±18°. At ranges farther than 8 inches, the distance sensor switches to an alternative algorithm with a smaller FOV (roughly ±12°).

To read data about an object from a distance sensor, we can use the [`object` method](https://docs.rs/vexide/latest/vexide/devices/smart/distance/struct.DistanceSensor.html#method.object).

```rs
// @fold start
use vexide::prelude::*;

//@fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut sensor = DistanceSensor::new(peripherals.port_1);

    //                        (             )
    if let Ok(Some(object)) = sensor.object() {
        println!("Found an object!");
        println!("Distance: {}mm", object.distance);
        println!("Velocity: {}m/s", object.velocity);
        println!("Relative Size: {}", object.relative_size);
        println!("Confidence in readings: {}%", object.confidence * 100.0);
    } else {
        println!("No object found :(");
    }
}
```

## Error Handling

The `object` method returns a `Result<Option<DistanceObject>>`, so there are two cases where we won't get a [`DistanceObject`](https://docs.rs/vexide/latest/vexide/devices/smart/distance/struct.DistanceObject.html) back when calling this method:
- `Err(DistanceError)`: An error occurred that caused the sensor to be unavailable. This can happen when the sensor gets unplugged, the wrong type of device is in the port, or the sensor is still initializing itself.
- `Ok(None)`: There is no object in range. Presumably, the distance sensor is too far from whatever it needs to see.

If we want to handle these cases separately, we can instead use a nested `match` expression or similar:

```rs
// @fold start
use vexide::prelude::*;

//@fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let sensor = DistanceSensor::new(peripherals.port_1);

    match sensor.object() {
        Ok(object) => match object {
            // We got an object reading back!
            Some(data) => println!("Found an object! {data:?}"),
            
            // Object was not in range.
            None => println!("No object found."),
        },

        // Something went wrong with the sensor.
        Err(error) => println!("An error occurred. {error}"),
    }
}
```