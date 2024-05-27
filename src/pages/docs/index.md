---
title: Introduction
category: 01. Getting Started
layout: layouts/DocsLayout.astro
page: 1
---

# Welcome!

These resources serve as an introduction and set of tutorials for the vexide project's runtime and tooling, allowing you to write programs for VEX robots in Rust. If you're already somewhat familiar with vexide or prefer references over tutorials we also have complete [API documentation on docs.rs](https://docs.rs/vexide).

It should be stated that this documentation isn't intended to be a Rust tutorial, so it's recommended for you to first go through the [Rust Book](https://doc.rust-lang.org/book/) (it's a great read!) or some other learning resource for the language if you aren't familiar with the syntax. Nevertheless, we'll try to keep things as simple as possible.

# What is vexide?

vexide is a `no_std` Rust runtime for VEX V5 robots. It allows the code that you write to run on the V5 Brain and control devices like motors and sensors. You can think of it as an alternative to [PROS](https://pros.cs.purdue.edu/) or [VEXcode](https://www.vexrobotics.com/vexcode), but for the Rust programming language (rather than C or C++). vexide handles the low-level stuff like task scheduling, memory allocation, competition state, etc... that allows user code to run seamlessly.

The V5 Brain is an *embedded platform*, meaning the code that you write runs without a traditional operating system like Windows or Linux. Your code runs closer to the underlying hardware ("bare metal"), giving you more control over things like memory allocation and program behavior. It also unfortunately means that Rust's `std` (standard library) crate cannot be used, as `std` expects some operating system features like threads, a filesystem, and I/O to be available on the target.

> Fortunately, this isn't as bad as it sounds, and vexide programs can still make use of most high level Rust features, as you'll learn later.

# Why should I use this?

Great question!