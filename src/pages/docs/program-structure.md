---
title: Program Structure
category: 01. Getting Started
layout: layouts/DocsLayout.astro
page: 2
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

There are a few things you might notice that are slightly different from a typical rust project:
- `main` is an `async fn`.
- `main` takes a `peripherals` argument.
- `main` is annotated with `#[vexide::main]`.