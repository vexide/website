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

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
//(err                   )<<
use std::time::Duration;
// ^<<<
// [error[E0433]: failed to resolve: use of unresolved module or unlinked crate `std`]<<<


#[vexide::main]
async fn main(peripherals: Peripherals) {
    let three_seconds = Duration::from_secs(3);
}
```

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
// @fold start
#![no_std]
#![no_main]

extern crate alloc;

use vexide::prelude::*;

// @fold end
use alloc::vec::Vec;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let mut my_vec = Vec::new();
    my_vec.push(1);
    my_vec.push(2);
}
```

## Operating System APIs in vexide

Combined together, the `core` and `alloc` crates fill up almost all of the gaps left by our lack of a standard library. `core` and `alloc` are still missing many OS-specific features that you might want to use like I/O, timekeeping, filesystem access, threads, program control, and floating-point math.

Luckily, vexide itself fills in most of these remaining gaps! For example, `vexide` provides its own `Instant` type that mirrors the one in `std` for measuring time.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;
// @fold end
use vexide::core::time::Instant; // rather than std::time::Instant

#[vexide::main]
async fn main(peripherals: Peripherals) {
    let start = Instant::now();
    sleep(Duration::from_secs(5)).await;
    let elapsed = start.elapsed();

    println!("Took {start:?} seconds to sleep.");
}
```

Most of these "`std`-equivalent" APIs live in the [`vexide::core` module](https://docs.rs/vexide-core/latest/vexide_core/). This module provides APIs for interacting with VEXos like you would in a `libstd`-enabled environment.

- I/O types and traits are provided by `vexide::core::io`.
- Timekeeping is provided by `vexide::core::time::Instant`.
- Synchronization primitives are provided by `vexide::core::sync`.
- Program control is provided by `vexide::core::program`.
- Filesystem access to SDCards is provided by `vexide::core::fs`.
- Synchronization primitives are provided by `vexide::core::sync`.
- Panicking features are provided by `vexide::panic`.
- Threads don't exist in vexide, but we do have multitasking using [`async` rust](/docs/async-introduction/).

Most of these modules should look familiar if you've worked with their equivalents in `std` before.

# Recap

- vexide projects are `no_std` environments, meaning we cannot use Rust's `std` crate.
- Instead, we have the `core` and `alloc` crates. These are subsets of the standard library that aren't dependent on a specific operating system.
- Most of the remaining OS-specific features missing from `core` are provided by vexide itself in `vexide::core`.