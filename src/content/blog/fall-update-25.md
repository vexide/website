---
title: "Fall Updates: Standard Library Support with vexide 0.8.0!"
description: "vexide 0.8.0 brings support for the Rust Standard Library, an improved development experience, and various API improvements."
author: {
    name: "Tropical",
    github: "tropix126",
}
tags: ["news"]
date: 2025-09-30
thumbnail: {
    url: "/images/thumbnails/twilight.png",
    alt: "vexide logo drawn over a night sky"
}
---

Hi everyone, we're excited announce the largest update to vexide yet. This release introduces support for the Rust Standard Library, unit testing, running programs without a robot, improved error reporting, and much more!

> [!TIP]
> vexide is a Rust library for programming VEX robots, empowering you to write safe and efficient code for your robot in the Rust programming language. [Learn more.](/docs/#what-is-vexide)

vexide programs have historically required that Rust's Standard Library (the `std` crate) be disabled. This forces us to use the stripped down `core` and `alloc` libraries instead, and limits the packages we can use on [crates.io](https://crates.io/). This is because the `std` crate depends on features provided by an operating system, and nobody had bothered to write a port of the standard library for VEXos in the Rust compiler.

# Rust Standard Library Support

![pull request adding standard library support for armv7a-vex-v5](/blog/libstd-pr.png)

...until now! Over the last year we've been working on upstreaming support for VEX brains as an official compilation target and standard platform in the Rust language. You can now use the `std` crate and compile to a V5 brain using the [`armv7a-vex-v5` target](https://doc.rust-lang.org/nightly/rustc/platform-support/armv7a-vex-v5.html) in Rust!

```rs title="main.rs"
// This runs on a brain now.
fn main() {
    println!("Hello, World!");
}
```

This unlocks a huge portion of the Rust ecosystem. Most libraries that require `std` now “just work”. You can use the `std::fs` API to write to the brain's SDCard and use the *real* `println!` macro to print to the terminal. I've even managed to run [Tokio](https://tokio.rs/) on a V5 brain!

<div style="display: block; text-align: center; margin: 0 auto; width: 60%;">

![Tokio's single-threaded executor running on a V5 brain (real hardware).](/blog/tokio.png)

<small>
Please don't try this at home.
</small>
</div>

> [!WARNING]
> Due to platform limitations, some parts of the standard library will return errors. Notably, `std::thread::spawn` will not work, filesystem access through `std::fs` is limited, and networking with `std::net` is unsupported. For a full list of what works and doesn't work, see the [target docs](https://doc.rust-lang.org/nightly/rustc/platform-support/armv7a-vex-v5.html#requirements).

## Slimming Down

In the past, vexide attempted to "fill in the gaps" left by our lack of a standard library with equivalent APIs. Now that we have the real thing, these APIs are redundant and have been removed.

| Removed `vexide` 0.7.0 API | Equivalent `std` API |
| -- | -- |
| [`vexide::io::*`](https://docs.rs/vexide/0.7.0/vexide/io/index.html) | [`std::io::*`](https://doc.rust-lang.org/stable/std/io/index.html) |
| [`vexide::fs::*`](https://docs.rs/vexide/0.7.0/vexide/fs/index.html) | [`std::fs::*`](https://doc.rust-lang.org/stable/std/fs/index.html) |
| [`vexide::path:*`](https://docs.rs/vexide/0.7.0/vexide/path/index.html) |[`std::path:*`](https://doc.rust-lang.org/stable/std/path/index.html) |
| [`vexide::program::{exit, abort}`](https://docs.rs/vexide/0.7.0/vexide/program/index.html) | [`std::process::{exit, abort}`](https://doc.rust-lang.org/stable/std/process/index.html) |
| [`vexide::time::Instant`](https://docs.rs/vexide/0.7.0/vexide/time/struct.Instant.html) | [`std::time::Instant`](https://doc.rust-lang.org/stable/std/time/struct.Instant.html) |
| [`vexide::panic::*`](https://docs.rs/vexide/0.7.0/vexide/panic/index.html) | [`std::panic::*`](https://doc.rust-lang.org/stable/std/panic/index.html) |
| [`vexide::float::*`](https://docs.rs/vexide/0.7.0/vexide/float/index.html) | [`std::f32::*`](https://doc.rust-lang.org/stable/std/primitive.f32.html), [`std::f64::*`](https://doc.rust-lang.org/stable/std/primitive.f64.html) |

# SDK Shenanigans

Before we go further, I should explain a major internal overhaul that we've been working towards for a while.

vexide and the standard library need some way to make calls to VEXos to control devices and handle I/O on the brain. This is traditionally done through the **VEX SDK** — a proprietary library shipped by VEX for VEXcode and partner developers (such as PROS). When vexide was first created, we made the decision to *not* use an SDK provided by VEX and instead implement our own version from scratch.

![VEXos system architecture](/blog/vex-sdk.svg)

However, this posed a challenge when we were porting the standard library. Shipping proprietary code in Rust itself wasn't an option, but forcing people to use our own SDK wasn't ideal either and could pose challenges down the road.

## Bring Your Own SDK

Instead, we picked a third option — if you use the standard library, you are expected to link your own SDK. If you use vexide, it will provide one for you. This led to us completely modularizing how vexide links to its SDK. You can now pick from three different "backends" (providers) for an SDK that vexide can run on:

- [`vex-sdk-jumptable`](https://crates.io/crates/vex-sdk-jumptable) is the custom reimplementation of the SDK used by previous vexide versions.
- [`vex-sdk-vexcode`](https://crates.io/crates/vex-sdk-vexcode) will download the official proprietary SDK from VEX themselves, and link your project to it. This is downloaded from VEX's servers, and not directly distributed with vexide due to licensing restrictions.
- [`vex-sdk-pros`](https://crates.io/crates/vex-sdk-pros) will use the partner SDK inside of the [PROS kernel](http://pros.cs.purdue.edu/) as a provider for vexide's SDK functions.

You can specify which backend to use in your `Cargo.toml` file by editing vexide's feature flags:

```toml title="Cargo.toml"
# @diff -
vexide = "0.7.0"
# @diff + start
vexide = { version = "0.8.0", features = ["full", "vex-sdk-jumptable"] }
```

All of these options should provide equivalent functionality, but this setup ensures vexide remains future-proof.

# Host Compilation & Unit Testing 

Another advantage of modularizing the SDK in vexide is that we can now fake the underlying platform that vexide runs on. With vexide 0.8.0, you can now *natively compile and run* your robot's codebase on your own computer. Here's a screenshot of me running the [clawbot example](https://github.com/vexide/vexide/blob/main/examples/clawbot.rs) on my laptop without a robot:

![clawbot example](/blog/native-compilation.png)

To natively compile your robot code, enable the `vex-sdk-mock` feature on vexide in your `Cargo.toml` along with your existing SDK provider, and simply use `cargo run` instead of `cargo v5 run`:

```toml title="Cargo.toml"
# @diff -
vexide = { version = "0.8.0", features = ["full", "vex-sdk-jumptable"] }
# @diff + start
vexide = { version = "0.8.0", features = ["full", "vex-sdk-jumptable", "vex-sdk-mock"] }
```

## Unit Tests

Being able to run our robot code on an actual host system means we can also support Rust's testing features. You can now write and run unit tests against your robot logic without needing hardware on hand, integrate with CI pipelines, and catch bugs in your code earlier.

> [!WARNING]
> At this point in time, devices won't do anything and will simply be disconnected at all times when using host compilation. This will change in the future, and we hope to add the ability to mock robot devices and entire subsystems in unit tests soon. We also hope to support emulating your robot's brain screen, for testing GUIs and autonomous selectors without physical access to a brain.

```rs
use vexide::prelude::*;

#{vexide::main}
async fn main(peripherals: Peripherals) {
    println!("Hello, world!");
}

#[cfg(test)]
mod tests {
    use vexide::prelude::*;
    use std::time::Duration;

    #[test]
//  ^
// [The test attribute can now be used in vexide projects.]
    fn one_plus_one_equals_two() {
        assert!(1 + 1 == 2);
    }

    #[vexide::test]
//  ^
// [Use the vexide::test macro to run tests with async code.]
    async fn async_test(_p: Peripherals) {
        sleep(Duration::from_millis(5)).await;
        println!("Hello");
        assert!(4 + 4 == 8);
    }
}
```

# Error Reporting Improvements

If you've ever encountered this screen, you know you're in for a fun time:

![memory permission error](/blog/memory-permission-error.png)

This is a [data abort exception](https://developer.arm.com/documentation/ddi0406/b/System-Level-Architecture/The-System-Level-Programmers--Model/Exceptions/Data-Abort-exception). It can happen when your program accesses memory in some way that the brain's CPU doesn't allow, and it often indicates that your program has undefined behavior. Think of it as the VEX equivalent of a [segfault](https://en.wikipedia.org/wiki/Segmentation_fault). These types of errors *really suck* to debug, and the error that VEXos throws up on screen often doesn't give you all of the necessary information you need to find what caused it.

As of vexide 0.8.0, we'll now optionally provide a more detailed report of many different CPU faults including data aborts, prefetch aborts, and undefined instruction exceptions.

![improved abort handler](/blog/abort-handler.png)

<div class="code-split error">

```sh
cargo v5 run --release
```

```ansi
    Finished `release` profile [optimized] target(s) in 0.19s
     [1;92mObjcopy[0m /home/tropical/Documents/GitHub/vexide/target/armv7a-vex-v5/release/examples/basic.bin
     [1;92mRunning[0m `slot_1.bin`
go go gadget null pointer dereference

Data Abort exception at 0x3800ed0:
Permission fault (MMU) while writing to 0x0

registers at time of fault:
 r0: 0x0
 r1: 0x0
 r2: 0x0
 r3: 0x0
 r4: 0x1
 r5: 0x0
 r6: 0x0
 r7: 0x7a00024
 r8: 0x7a00034
 r9: 0x7a0001c
r10: 0x380fba8
r11: 0x132
r12: 0x3692594
 sp: 0x79ffe60
 lr: 0x3800e8c
 pc: 0x3800ed0

stack backtrace:
  0: 0x3800ecf
  1: 0x3801a83
  2: 0x38003f7

help: this CPU fault indicates the misuse of unsafe code.
      Use a symbolizer tool to determine the location of the crash.
      (e.g. llvm-symbolizer -e ./target/armv7a-vex-v5/release/program_name 0x3800ed0)
```

</div>

This new error reporting system (which is enabled by default with the `abort-handler` feature flag) provides more helpful information for debugging and finding the location of these types of crashes, including:

- The full cause of the CPU exception (including the type of operation that caused the fault).
- A stack backtrace leading up to the function causing the exception. The addresses in this trace can be passed to a symbolizer program like [`llvm-symbolizer`](https://llvm.org/docs/CommandGuide/llvm-symbolizer.html) to find the exact line of code causing the abort.
- For undefined instruction exceptions, the invalid instruction that caused the abort.
- The CPU's registers at the time of the fault.
- The ability to print this data to the terminal and re-print it if your terminal wasn't open when the program crashed.

> [!TIP]
> As a reminder, vexide is designed to [explicitly prevent these kinds of errors  from happening](http://localhost:4321/docs/#safety-predictability-and-fault-tolerance) and it should be impossible to trigger these using only safe Rust code. That being said, if or when you do encounter them, we want to make the problem as easy to diagnose as possible.