---
title: Screen and Graphics
category: 02. Devices
page: 10
---

Since there is only one screen on a Brain and it is always connected, you can take a `Screen` directly from `Peripherals`.
```rust
let mut screen = peripherals.screen;
```
Great! Now we have a screen, but how do we draw to it?

# Drawing to the Screen

Currently, there are three options for drawing to the screen:
- vexide's `Screen` API
- [Slint](https://crates.io/crates/slint)
- [embedded-graphics](https://crates.io/crates/embedded-graphics)

Each option has some drawbacks and advantages so I'll give a description of all three.

## `Screen`

The `Screen` API is the simplest to setup and is similar to embedded-graphics in some ways.

Here is some example code:
```rust
use vexide::devices::screen::*;
use vexide::devices::color::Rgb;

let mut screen = peripherals.screen;

let rectangle = Rect::from_dimensions((50, 50), 25, 25);
let text = Text::new("Hello, World!", (100, 50));

screen.stroke(&rectangle, Rgb::WHITE);
screen.fill(&text, Rgb::LIME);
```

The basic flow is creating shapes and text which you then draw using the `fill` and `stroke` functions.

## Slint

Slint is a fully fledged ui library that you can use with vexide. If you are coming from PROS, you can think of it as similar to LVGL.
Slint is by far the most powerful option out of the three choices. 

To use Slint you have to enable the `slint` feature on the vexide crate. In your main function you have to call the `initialize_slint_platform` function for Slint to function properly.
```rust
use vexide::graphics::slint::initialize_slint_platform;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let screen = peripherals.screen;
    initialize_slint_platform(screen);

    // ...
}
```

If you want to learn more about using Slint, you can find their documentation [here](https://releases.slint.dev/).

## embedded-graphics

embedded-graphics is a simple library for drawing to screens on embedded-hardware. embedded-graphics has many existing supporting libraries and is easy to setup and use.

In order to use embedded-graphics you have to enable the embedded-graphics feature on the vexide crate and then turn your `Screen` into a `BrainDisplay`.

```rust
use vexide::graphics::embedded_graphics::BrainDisplay;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let screen = peripherals.screen;
    let display = BrainDisplay::new(screen);
}
```