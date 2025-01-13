---
title: Display
category: 02. Hardware
page: 11
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

The `Screen` API is the simplest to use, and carries no additional runtime cost or external libraries. It's also the most limited, however.

Here is some example code:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;
// @fold end
use vexide::devices::{screen::*, color::Rgb};

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut screen = peripherals.screen;
    
    let rectangle = Rect::from_dimensions((50, 50), 25, 25);
    let text = Text::new("Hello, World!", (100, 50));
    
    screen.stroke(&rectangle, Rgb::WHITE);
    screen.fill(&text, Rgb::LIME);
}
```

The basic flow is creating shapes and text which you then draw using the `fill` and `stroke` functions. A few basic drawables are supported, such as:
- Rectangles
- Circles
- Lines
- Individual Pixels
- Monospace Text (in three different sizes)

## Slint

Slint is a fully fledged third-party UI library that you can use with vexide. If you are coming from PROS, you can think of it as being equivalent to LVGL. Slint is by far the most powerful option out of the three choices, but also the heaviest.

To use Slint you have to enable the `slint` feature on the vexide crate. This can be done by editing your `Cargo.toml`:

```toml title="Cargo.toml"
[dependencies]
# @diff -
vexide = "0.3.0"
# @diff + start
vexide = { version = "0.3.0", features = ["slint"] }
slint = { version = "1.5.1", default-features = false, optional = true, features = [
    "compat-1-2",
    "unsafe-single-threaded",
    "libm",
    "renderer-software",
] }
# @diff + end
```

...then in your main function you have to call the `initialize_slint_platform` function for Slint to function properly.

```rust
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;
// @fold end
use vexide::graphics::slint::initialize_slint_platform;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    initialize_slint_platform(peripherals.screen);
}
```

> [!TIP]
> If you want to learn more about using Slint from this point on, you can find their documentation [here](https://releases.slint.dev/). These docs aren't really meant to be a full Slint tutorial.

## embedded-graphics

[`embedded-graphics`](https://crates.io/crates/embedded-graphics) is a simple crate for drawing graphics to LCD screens on embedded hardware. It has many existing supporting libraries and is easy to setup and use.

In order to use embedded-graphics you have to enable the `embedded-graphics` feature on the vexide crate.

```toml title="Cargo.toml"
[dependencies]
# @diff -
vexide = "0.3.0"
# @diff + start
vexide = { version = "0.3.0", features = ["embedded-graphics"] }
embedded-graphics = "0.8.1"
# @diff + end
```

From there we can create a `BrainDisplay` from our `Screen` peripheral, which acts as a display driver implementing [`DrawTarget`](https://docs.rs/embedded-graphics-core/latest/embedded_graphics_core/draw_target/trait.DrawTarget.html) in the `embedded_graphics` crate.

```rust
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;
// @fold end
use vexide::graphics::embedded_graphics::BrainDisplay;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let display = BrainDisplay::new(peripherals.screen);
}
```