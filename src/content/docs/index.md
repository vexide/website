---
title: Introduction
category: 01. Getting Started
page: 1
---


# Welcome!

These resources serve as an introduction and set of tutorials for the vexide project's runtime and tooling, allowing you to write programs for VEX robots in Rust. If you're already somewhat familiar with vexide or prefer references over tutorials we also have complete [API documentation on docs.rs](https://docs.rs/vexide).

![ferris the crab pointing to a chalkboard with the vexide logo on it](/docs/professor-ferris.svg)

> [!TIP]
> It should be stated that this is NOT a Rust tutorial, so it's recommended for you to go through at least the first half of the [Rust Book](https://doc.rust-lang.org/book/) or some other learning resource if you aren't familiar with Rust. We'll try to keep things as simple as possible, but this documentation assumes that you have a basic understanding of [variables](https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html), [functions](https://doc.rust-lang.org/book/ch03-03-how-functions-work.html), [data types](https://doc.rust-lang.org/book/ch03-02-data-types.html), [control flow](https://doc.rust-lang.org/book/ch03-05-control-flow.html), [ownership/borrowing](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html), and [traits](https://doc.rust-lang.org/book/ch10-00-generics.html).

# What is vexide?

vexide is a `no_std` Rust runtime for VEX V5 robots. It allows the code that you write to run on the V5 Brain and control devices like motors and sensors. You can think of it as an alternative to [PROS](https://pros.cs.purdue.edu/) or [VEXcode](https://www.vexrobotics.com/vexcode), but for the Rust programming language (rather than C or C++). vexide handles low-level features like task scheduling, memory allocation, competition state, etc... that allows your code to run seamlessly on the Brain.

![Diagram of vexide's architecture. Boxes labeled "VEXos interfaces", "Devices", "Async Runtime", and "Startup code" are connected to a single "vexide" box](/docs/vexide-overview.svg)

The V5 Brain is an *embedded platform*, meaning the code that you write runs without a traditional operating system like Windows or Linux. Your code runs closer to the underlying hardware (the "bare metal"), giving you more control over many aspects of your program at a low level.

# Why should I use this?

<ins>vexide is not for everyone</ins>, and is particularly not geared towards beginner programmers. That being said, it offers many unique benefits to users hoping to safely utilize the full potential of their robot's systems when programming.

## Rust is pretty cool!

![ferris standing next to some crates](/docs/crates.svg)

Rust is a modern language that is growing in popularity every year. It has many applications, from networking to embedded systems. If you've been looking for a chance to learn and use it in a project also enjoy robotics, then vexide is the perfect opportunity for you to pick it up! vexide's API takes heavy inspiration from widely used packages such as [`tokio`](https://crates.io/crates/tokio), [`embassy`](https://embassy.dev/), and [`cortex-m`](https://github.com/rust-embedded/cortex-m), offering you a realistic look into the embedded and async Rust ecosystem.

vexide projects are just regular Rust projects. By using vexide, you gain full access to the entirety of the [crates.io](https://crates.io/) ecosystem's 150,000+ packages to use in your code. [Cargo](https://doc.rust-lang.org/cargo/), Rust's package manager makes it extremely easy to install third-party dependencies and integrate them into your code. In fact, `vexide` itself is just a regular library that's installed through Cargo!

## Safety, Predictability, and Fault Tolerance

![message boxes depicting various memory errors](/docs/aborts.svg)

Rust as a language aims to make make it very difficult to write software that fails in unpredictable ways. This is especially important when programming robots. Many competitors can attest to the truth of [Murphy's law](https://en.wikipedia.org/wiki/Murphy%27s_law). **If something works 99.5% of the time, but very rarely fails unexplainably, then it isn't worth using at all.**

Likewise, programming in an environment that makes it exceedingly easy to shoot yourself in the foot isn't much better either. vexide promotes safe programming practices like error handling and memory safety, while also preventing common pitfalls like race conditions and undefined behavior. **This decreases the risk of something going wrong when it matters the most, while also making you a better programmer in the process.**

vexide also takes [undefined behavior](https://en.wikipedia.org/wiki/Undefined_behavior) very seriously. **It should not be possible to cause memory errors in vexide when only using safe Rust.** If you ever encounter anything along the lines of a `Memory Permission Error`, `Prefetch Error`, or `Undefined Error` in your program with no `unsafe` code, then this is immediately considered a serious and high-priority bug in vexide itself.

> [!TIP]
> TL;DR — if something goes terribly wrong in your program, you should ideally have only yourself to blame.

## vexide is *actually* Open Source

![hearts](/docs/hearts.svg)

vexide is one of the only VEX programming environments that is *fully* open source. This means that anyone is free to contribute to, research, modify, or build vexide themselves from [its source code on GitHub](http://github.com/vexide/vexide). vexide and its associated tools are [MIT licensed](https://github.com/vexide/vexide/blob/main/LICENSE) and do not link to any proprietary code or SDKs.

vexide's development is entirely community-driven, meaning it is not maintained by a single person or entity and is developed entirely in the open. Many active VRC and VEX U competitors from around the world have submitted bug reports and patches to vexide. This model of development promotes a level of transparency and community involvement that isn't seen anywhere else.

## Hardware APIs and Documentation

![A sketch of a motor, an inertial sensor, and a radio](/docs/smart-devices.svg)

vexide's goal regarding hardware is to support as many devices as possible with as much functionality as possible while providing consistent and reliable interfaces for programmers. For example, vexide provides support for many rarely-used legacy sensors and the [V5 Electromagnet](https://docs.rs/vexide-devices/latest/vexide_devices/smart/electromagnet/struct.Electromagnet.html), despite it being illegal in competition use.

We also aim to be as consistently well-documented as possible. Our [API reference](https://docs.rs/vexide) contains detailed descriptions and examples of every type, function, and constant you can use. In some cases, vexide's documentation can be more detailed than official documentation. Information has been collected from multiple sources, including the [BLRS Wiki](https://wiki.purduesigbots.com/), first-party testing, and fragmented sources such as comments made on [VEXforum](https://www.vexforum.com/).