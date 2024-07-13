---
title: Using The Terminal
category: 01. Getting Started
page: 5
---

One of the most useful debugging tools available to you is the terminal, which allows you to print live data from the brain to your computer.

# `print` and `println`

The easiest way to send some data to the terminal in a vexide program is through the `print` family of macros. You might recall `println` from our "Hello World" example:

```rs
println!("Hello World!"); // same thing as print!("Hello World!\n");
```

Simply running this code with no connection to a computer won't visibly do anything, so let's change that.

# Reading the Terminal

Terminal data can be read over a USB connection to a V5 brain or controller using `cargo-v5` (one of the [prerequisites](../prerequisites/) that you should already have installed). To open a terminal connection with the brain, we'll simply run the following command:

```sh
cargo v5 terminal
```

<div style="margin-block-start: 16px; text-align: center">
  <video width="600" controls>
    <source src="/docs/terminal-demo.mp4" type="video/mp4">
  </video>
</div>

# Disabling the vexide Banner

You might have noticed that in the video above, vexide printed a startup banner along with your `Hello world!` message. If you don't want this banner to be printed, you can disable this in your program:

```rs
#[vexide::main(banner = false)]
async fn main(_peripherals: Peripherals) {
    println!("Look ma! No banners!");
}
```

# Low-level Standard I/O: `Stdin` and `Stdout`

`print!` and `println!` are *macros*, meaning they expand to some larger block of code at compile-time. If you're familiar with Rust, you've probably used them before in other programs to print out some program output. There are a few subtle differences in the behavior of vexide's printing macros from what you'd encounter in `std`'s versions though.

To understand this behavior, lets look into what underlying APIs these macros actually expand to:

<div class="code-split">

```rs
println!("Hello world!");
```

```rs
{
    use ::vexide::core::io::{Write, stdout};
    if let Err(e) = stdout().write_fmt(format_args!("Hello world!") {
        panic!("failed printing to stdout: {e}");
    }
}
```

</div>

The brain communicates with your computer through two buffers: [`Stdin`](https://docs.rs/vexide-core/latest/vexide_core/io/struct.Stdin.html) and [`Stdout`](https://docs.rs/vexide-core/latest/vexide_core/io/struct.Stdout.html). `Stdout`, or "standard output" is what's being used to print our "Hello world!" message here, as it represents the outgoing message from the brain to your computer.

`Stdout` is part of vexide's [`io`](https://docs.rs/vexide-core/latest/vexide_core/io/index.html) API.

## Example: Printing Without Macros

To manually print to `Stdout` we can write to its buffer by obtaining a *lock*, which will give us exclusive access to the buffer until we release the lock.

```rs
use vexide::core::io::stdout;

let lock = stdout().lock();

// Beautiful poem goes here...

core::mem::drop(lock);
```

[`StdoutLock`](https://docs.rs/vexide-core/latest/vexide_core/io/struct.StdoutLock.html) implements the [`Write`](https://docs.rs/vexide-core/latest/vexide_core/io/trait.Write.html) trait, which provides some methods for writing to the buffer:

```rs
use vexide::core::io::Write;

lock.write(b"some bytes")?;
```

# Advanced Logging Solutions

vexide takes a fairly unopinionated approach on how you should use the terminal, providing a similar API surface to what's given to you in normal rust programs in a `std`-enviornment through macros and writers. If you need a more advanced logging solution, crates in the rust ecosystem such as [log](https://crates.io/crates/log) may be of interest to you.