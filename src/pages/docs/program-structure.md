---
title: Program Structure
category: 01. Getting Started
layout: layouts/DocsLayout.astro
page: 3
---

# Hello World!

Here's one of the simplest vexide programs that can be written, printing a simple message to the terminal:

```rs
#![no_main]
#![no_std]

use vexide::prelude::*;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    println!("Hello World!");
}
```

Let's go through this one part at a time.

# `#![no_std]` and `#![no_main]`

These two declarations at the top of our file tell the rust compiler two things:
- We don't want the Rust standard library (`std` crate), since `std` operates under the assumption of an operating system enviornment.
- We don't want a Rust program entrypoint, since that assumes the existence of a [C runtime](https://os.phil-opp.com/freestanding-rust-binary/#the-start-attribute) (something we don't have).

Both of these are necessary for programs to run on the V5's embedded hardware. Rather than `std` we will be using the `core` crate (which provides most functionality of `std`), and vexide implements its own entrypoint and startup process that doesn't require a C runtime.

# The vexide Prelude

```rs
use vexide::prelude::*;
```

This piece of code brings vexide's *prelude* module into scope. All that this does is import a bunch of commonly used types for you, so you don't have to type their full name every time. For example, you can simply use `Motor` rather than `vexide::devices::smart::motor::Motor`.

# The Program Entrypoint

All vexide programs begin and end at the `main` function. That looks something like this, and can be found in your project's `main.rs` file:

```rs
#[vexide::main]
async fn main(peripherals: Peripherals) {
	...
}
```

You'll see three key differences in this version of the `main` function compared to a normal `main` function in Rust:
1. `main` is an `async fn`. vexide ships with its own async runtime that serves as the basis for its multitasking features. In order to run other async functions, `main` itself must also be async.
2. `main` takes a `peripherals` argument. This is an instance of the [`Peripherals` struct](https://docs.rs/vexide-devices/latest/vexide_devices/peripherals/struct.Peripherals.html) that allows you to create devices and interact with hardware. You can read more about that [here](../peripherals/).
3. `main` is annotated with `#[vexide::main]`. This is actually a macro that sets up the real program entry. Behind the scenes, it starts up vexide's async executor and handles the [startup process](https://github.com/vexide/vexide/blob/main/packages/vexide-startup/src/lib.rs#L62) before running your code.

# Returning Errors from `main`

vexide's `main` functions can also return certain types for error handling purposes:

```rs
// Typical main functions
async fn main(peripherals: Peripherals) { ... }
async fn main(peripherals: Peripherals) -> () { ... }

// Main can never return
async fn main(peripherals: Peripherals) -> ! { ... }
async fn main(peripherals: Peripherals) -> core::convert::Infallible { ... }

// Main returns a [`Result`] type
async fn main(peripherals: Peripherals) -> Result<(), E> {
	...
	Ok(())
}
```

> NOTE: The valid return types for `main` are dictated by `vexide_core`'s [`Termination`](https://docs.rs/vexide-core/latest/vexide_core/program/trait.Termination.html) trait.

All of these forms of `main` technically do the same thing. The only difference at runtime is that entries returning `Result` will print out an error message if the `Result::Err` variant is returned.

In practice though, being able to return an error from `main` can be useful due to allowing the [`?` operator](https://doc.rust-lang.org/reference/expressions/operator-expr.html#the-question-mark-operator) to be used with `Result` directly in `main` for more concise error handling.