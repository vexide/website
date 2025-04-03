---
title: Program Structure
category: 01. Getting Started
page: 3
---

# Hello World!

Here's one of the simplest vexide programs that can be written, printing a short message to the terminal:

```rs title="main.rs"
#![no_std]
#![no_main]

use vexide::prelude::*;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    println!("Hello World!");
}
```

Let's go through this one part at a time.

## `#![no_std]` and `#![no_main]`

These two declarations at the top of our file tell the rust compiler two things:
- We don't want the Rust standard library (the `std` crate), since it requires an operating system.
- We don't want a regular Rust `main` function, since that requires a [C runtime](https://os.phil-opp.com/freestanding-rust-binary/#the-start-attribute), which we also do not have.

Both of these declarations are necessary for programs to run on the V5's embedded hardware. Rather than `std` we will be using the `core` crate (which provides most functionality of `std`), and vexide implements its own entrypoint and startup process that doesn't require a C runtime.

## The vexide Prelude

```rs
#![no_std]
#![no_main]

// @focus
use vexide::prelude::*;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    println!("Hello World!");
}
```

This piece of code brings vexide's *prelude* module into scope. All that this does is import a bunch of commonly used types for you, so you don't have to type their full name every time. For example, you can simply use `Motor` rather than `vexide::devices::smart::motor::Motor`.

## The Program Entrypoint

All vexide programs begin and end at the `main` function, which must have the `#[vexide::main]` attribute on it.

```rs
#![no_std]
#![no_main]

use vexide::prelude::*;

// @focus start
#[vexide::main]
async fn main(peripherals: Peripherals) {
	// @focus end
    println!("Hello World!");
// @focus start
}
```

If you're familiar with Rust, you might notice some key differences in vexide's version of the `main` function compared to a normal `main` function in Rust:
1. **`main` is an `async fn`.** vexide ships with its own async runtime that serves as the basis for its multitasking features. In order to run other async functions, `main` itself must also be async.
2. **`main` takes a `peripherals` argument.** This is an instance of the [`Peripherals` struct](https://docs.rs/vexide-devices/latest/vexide_devices/peripherals/struct.Peripherals.html) that allows you to create devices and interact with hardware. You can read more about that [here](../peripherals/).
3. **`main` is annotated with `#[vexide::main]`.** This is a special *attribute macro* that sets up the real program entrypoint. Behind the scenes, it performs some low level startup and sets up vexide's async executor running your code.