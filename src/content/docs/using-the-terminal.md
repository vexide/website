---
title: Using The Terminal
category: 01. Getting Started
page: 5
---

One of the most useful debugging tools available to you is the serial terminal, which allows you to view live data from a VEX brain on your computer as your program runs.

# `print` and `println`

The easiest way to send some data to the terminal is through the `print` family of macros. You might recall `println` from our "Hello World" example:

```rs
use vexide::prelude::*;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    // @focus
    println!("Hello World!");
}
```

That will send `Hello World!` followed by a newline to your computer over a USB or bluetooth connection. This is useful in cases where you need to quickly view or debug a value on the brain, or send some logs over for future use.

We also have a `print` macro, which is the same as `println` except it won't end your message in a newline.

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    print!("Hello");
    print!("Hello");
}
```

That will send the data `HelloHello` to your computer.

# Reading the Terminal

> That's cool and all but... where am I supposed to be seeing all this?

Simply running all of this code with no connection to a computer won't visibly do anything, so let's change that.

![Connect the brain to your computer using a USB cable](/docs/connect-brain.svg)

Terminal data can be read over a USB connection to a V5 brain or controller using `cargo-v5` (one of the [prerequisites](../prerequisites/) that you should already have installed). To open a terminal connection with the brain, we'll simply run the following command:

```sh
cargo v5 terminal
```

When you run your program, you should be greeted by vexide's startup banner along with the output of `print`/`println`.

<div style="margin-block-start: 16px; text-align: center">
  <video width="600" controls>
    <source src="/docs/terminal-demo.mp4" type="video/mp4">
  </video>
</div>

# Disabling the vexide Banner

In the video above, vexide printed a startup banner along with your `Hello world!` message. If you don't want this banner to be printed, you can disable this in your program:

```rs
// @fold start
use vexide::prelude::*;

// @fold end
//             (                    )
#[vexide::main(banner(enabled = false))]
async fn main(_peripherals: Peripherals) {
    println!("Look ma! No banners!");
}
```

# Advanced Logging Solutions

If you need a more advanced logging solution, crates in the rust ecosystem such as [`log`](https://crates.io/crates/log) may be of interest to you.
