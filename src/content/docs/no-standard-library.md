---
title: No Standard Library
category: 01. Getting Started
page: 6
---

In the [Program Structure](/docs/program-structure/) page, we briefly mentioned that vexide is a "`no_std`" environment, but what does that actually mean? In this page, we're going to look a little deeper into these two lines at the top of your `main.rs` file, as well as how they change the way we write our code in vexide.

```rs title="main.rs"
// @focus start
#![no_std]
#![no_main]
// @focus end

use vexide::prelude::*;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    println!("Hello World!");
}
```

# Bare Metal Environments

A platform is said to be "bare metal" if the code you write for it is ran outside of a traditional operating system. The VEX V5 Brain isn't quite a bare metal platform per se, but it comes close. From the perspective of user code, VEXos only loosely meets the definition of an operating system.

## The Rust Standard Library

Rust's standard library (also known as `libstd`) requires integration with an operating system to run in order to provide functionality like file system access, networking, threading, and other OS-dependent features. At the time of writing this, the standard library has not yet been ported to VEXos meaning that `vexide` programs must be written without using the `std` crate. This is what `#![no_std]` declares — that we don't want to use `libstd` in our project.

Attempting to use anything from the standard library in a `no_std` environment will throw a compiler error.

<div class="code-split error">

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
//(err                   )<<
use std::time::Duration;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let three_seconds = Duration::from_secs(3);
}
```

```ansi
[0m[1m[38;5;9merror[E0433][0m[0m[1m: failed to resolve: use of unresolved module or unlinked crate `std`[0m
[0m [0m[0m[1m[38;5;12m--> [0m[0mexamples/basic.rs:4:5[0m
[0m  [0m[0m[1m[38;5;12m|[0m
[0m[1m[38;5;12m4[0m[0m [0m[0m[1m[38;5;12m|[0m[0m [0m[0muse std::time::Duration;[0m
[0m  [0m[0m[1m[38;5;12m|[0m[0m     [0m[0m[1m[38;5;9m^^^[0m[0m [0m[0m[1m[38;5;9muse of unresolved module or unlinked crate `std`[0m
[0m  [0m[0m[1m[38;5;12m|[0m
[0m  [0m[0m[1m[38;5;12m= [0m[0m[1mhelp[0m[0m: if you wanted to use a crate named `std`, use `cargo add std` to add it to your `Cargo.toml`[0m
```

</div>

## The `core` and `alloc` crates

> I want my `Duration` struct! How do I get it without the standard library?

In a `no_std` environment, you aren't entirely on your own. Instead of `std` you have access to two smaller subsets of the standard library — `libcore` and `liballoc`. These are essentially the parts of `std` that aren't OS-dependent.

- [`core`](https://doc.rust-lang.org/stable/core/) provides us with all of the platform-agnostic features like primitives, macros, and familiar types like `Option`, `Result`, and `Duration`. `core` has no dependencies on the operating system and can run virtually anywhere.
- [`alloc`](https://doc.rust-lang.org/stable/alloc/) provides memory allocation capabilities and collection types that require allocation, such as `Vec`, `Box`, `String`, and other heap-based data structures. `alloc` doesn't require an OS, but it does need a memory allocator (which `vexide` provides for you).

To fix our previous code, we can simply import `Duration` from `core` rather than `std`.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;
// @fold end
// @diff -
use std::time::Duration;
// @diff +
use core::time::Duration;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let three_seconds = Duration::from_secs(3);
}
```

Likewise, if we wanted to create a `Vec` (which allocates memory on the heap), we can declare the `alloc` crate using `extern crate alloc` and use its `Vec` type in place of the standard library's `std::vec::Vec`.

```rs
#![no_std]
#![no_main]

// @diff +
extern crate alloc;

use vexide::prelude::*;
// @diff +
use alloc::vec::Vec;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut my_vec = Vec::new();
    my_vec.push(1);
    my_vec.push(2);
}
```

## Operating System APIs in `vexide`

Combined together, the `core` and `alloc` crates fill up almost all of the gaps left by our lack of a standard library. `core` and `alloc` are still missing many OS-specific features that you might want to use like I/O, timekeeping, filesystem access, threads, program control, and floating-point math.

Luckily, vexide itself fills in most of these remaining gaps! For example, `vexide` provides its own `Instant` type that mirrors the one in `std` for measuring time.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;
// @fold end
use vexide::time::Instant; // rather than std::time::Instant

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let start = Instant::now();
    sleep(Duration::from_secs(5)).await;
    let elapsed = start.elapsed();

    println!("Took {start:?} seconds to sleep.");
}
```

Most of these "`std`-equivalent" APIs live in vexide's [top-level modules](https://docs.rs/vexide). These modules provide APIs for interacting with VEXos like you would in a `libstd`-enabled environment.

- I/O types and traits are provided by `vexide::io`.
- Timekeeping is provided by `vexide::time::Instant`.
- Synchronization primitives are provided by `vexide::sync`.
- Program control is provided by `vexide::program`.
- Filesystem access to SDCards is provided by `vexide::fs`.
- Panicking features are provided by `vexide::panic`.
- Threads don't exist in vexide, but we do have multitasking using [`async` rust](/docs/async-introduction/).

Most of these modules should look familiar if you've worked with their equivalents in `std` before.

## Floating Point Math in `vexide`

`libcore` also lacks support for floating point arithmetic. This is because these math functions are typically implemented by the platform's `libm` library. In a `no_std` environment, Rust isn't able to make assumptions that such a library exists, so most floating-point functionality is missing.

<div class="code-split error">

```rs
#![no_std]

fn stuff() -> f64 {
//  (err        )
    f64::sin(3.0)
}
```

```ansi
[0m[1m[38;5;9merror[E0599][0m[0m[1m: no function or associated item named `sin` found for type `f64` in the current scope[0m
[0m [0m[0m[1m[38;5;12m--> [0m[0mexamples/basic.rs:4:10[0m
[0m  [0m[0m[1m[38;5;12m|[0m
[0m[1m[38;5;12m4[0m[0m [0m[0m[1m[38;5;12m|[0m[0m [0m[0m    f64::sin(3.0)[0m
[0m  [0m[0m[1m[38;5;12m|[0m[0m          [0m[0m[1m[38;5;9m^^^[0m[0m [0m[0m[1m[38;5;9mfunction or associated item not found in `f64`[0m
[0m  [0m[0m[1m[38;5;12m|[0m
[0m[1m[38;5;14mhelp[0m[0m: there is a method `min` with a similar name[0m
[0m  [0m[0m[1m[38;5;12m|[0m
[0m[1m[38;5;12m4[0m[0m [0m[0m[38;5;9m- [0m[0m    f64::[0m[0m[38;5;9msin[0m[0m(3.0)[0m
[0m[1m[38;5;12m4[0m[0m [0m[0m[38;5;10m+ [0m[0m    f64::[0m[0m[38;5;10mmin[0m[0m(3.0)[0m
[0m  [0m[0m[1m[38;5;12m|[0m
```

</div>

Fortunately, `vexide` provides its own implementation of floating point math functions through the `vexide::float::Float` trait. Bringing this trait into scope provides us with all of the math functions missing from `libcore`.

```rs
#![no_std]

// @diff +
use vexide::float::Float;

fn stuff() -> f64 {
    f64::sin(3.0)
}
```

> [!NOTE]
> By default, vexide's `Float` trait is implemented on top of [newlib's](https://sourceware.org/newlib/) `libm` library, which is the fastest implementation we could find for the V5's target platform.

The `Float` trait is also re-exported through vexide's `prelude` module, meaning you don't need to explicitly import it if using the prelude.

```rs
#![no_std]
#![no_main]

// @diff -
use vexide::float::Float;
// @diff +
use vexide::prelude::*;

fn stuff() -> f64 {
    f64::sin(3.0)
}
```

# Recap

- vexide projects are `no_std` environments, meaning we cannot use Rust's `std` crate.
- Instead, we have the `core` and `alloc` crates. These are subsets of the standard library that aren't dependent on a specific operating system.
- Most of the remaining OS-specific features missing from `core` are provided by vexide itself in `vexide::core`.
- To use floating point math, you must have the `vexide::float::Float` trait in scope.
