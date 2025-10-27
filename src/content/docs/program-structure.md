---
title: Program Structure
category: 01. Getting Started
page: 3
---

# Hello, world!

Here's one of the simplest vexide programs. It just prints a short message to the [terminal](../using-the-terminal/):

```rs title="main.rs"
use vexide::prelude::*;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    println!("Hello, world!");
}
```

We'll go through what's happening here one part at a time.

## The vexide Prelude

```rs
// @focus
use vexide::prelude::*;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    println!("Hello, world!");
}
```

This line of code brings vexide's *prelude* module into scope. All that this does is import a bunch of commonly used stuff, so you don't have to type out their full name every time. For example, you can simply use `Motor` rather than `vexide::smart::motor::Motor`.

> [!TIP]
> For a full list of what's imported by the `prelude`, see the [module docs](https://docs.rs/vexide/latest/vexide/prelude/index.html).

## The Program Entrypoint

All vexide programs begin and end at the `main` function, which must be annotated with the `#[vexide::main]` macro.

```rs
use vexide::prelude::*;

// @focus start
#[vexide::main]
async fn main(peripherals: Peripherals) {
	// @focus end
    println!("Hello, world!");
// @focus start
}
```

If you're familiar with Rust, you might notice some key differences in vexide's version of the `main` compared to Rust's normal `main` function:

1. **`main` is an `async fn`.** vexide ships with its own async runtime that serves as the basis for its multitasking features. In order to run other async functions, `main` itself must also be async.
2. **`main` takes a `peripherals` argument.** This is an instance of the [`Peripherals` struct](https://docs.rs/vexide-devices/latest/vexide_devices/peripherals/struct.Peripherals.html) that allows you to create devices and control your robot's hardware. You can read more about that [here](../peripherals/).
3. **`main` is annotated with `#[vexide::main]`.** This is a special *attribute macro* that sets up the real program entrypoint. Behind the scenes, this macro runs some additional low-level startup code and sets up vexide's async runtime.

## The `println!` Macro

This line does all of the work in our little program.

```rs
use vexide::prelude::*;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    // @focus
    println!("Hello, world!");
}
```

`println!` simply prints some text for us to read. We'll learn how to read this as it runs [in a few pages](../using-the-terminal). This macro isn't a feature of vexide, but rather a part of Rust's standard library.

If you've used Rust before, you should hopefully be [familiar](https://doc.rust-lang.org/book/ch01-02-hello-world.html#anatomy-of-a-rust-program) with this.
