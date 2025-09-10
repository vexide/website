---
title: Prerequisites
category: 01. Getting Started
page: 2
---


Before you start programming, you'll need to install install some tools in order to build and upload your code. Get a command-line of your choice ready, since we'll be running some terminal commands.

<div style="display: block; text-align: center; margin: 0 auto;">
<iframe width="560" height="315" src="https://www.youtube.com/embed/8lf5uh8Se2g?si=yXhixtAme-q_FIpo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<small>
    If you're on Windows and prefer to follow along with a video tutorial, we have one of those too!
</small>
</div>

# Installing Rust

In order to use vexide, you'll need a Rust toolchain (`cargo`, `rustc`, etc...) installed on your computer. To install Rust on your system, follow the instructions [here](https://www.rust-lang.org/tools/install). If you use a Windows computer, the installer may also prompt you to install Visual Studio Build Tools.

# Tooling

vexide uses on some unstable features that are currently only available in Rust's nightly release channel, so you'll need to switch to that:

```sh
rustup default nightly
```

We also need some additional tools to help us properly build/upload to VEX brains. You can install those components with the following terminal commands:

```sh
rustup component add rust-src
cargo install cargo-v5
```

# Setting up a Project

To make a new vexide project, we'll use the `cargo v5 new <NAME>` command. This will create a project in the current directory containing a barebones template that we can start out with.

```sh
cargo v5 new my-project
```

After running this, you should have a new folder named `my-project` (or whatever you named your project). Open that folder in a code editor of your choice. If you don't have a code editor, we recommend starting with [VSCode](https://code.visualstudio.com/).

![vexide-template folder structure](/docs/vexide-template-structure.png)

If you've worked in a rust project before, this project structure should be somewhat familiar to you. If not, that's okay too! There are two files of relevance we'll worry about right now:
- The contents of `src` contain your project's actual source code. All of the program you will write will be in this folder. In this case `main.rs` is your program's main source file.
- `Cargo.toml` contains your project's package information, including its dependencies.

![rocketship with ferris on it](/docs/blastoff.svg)
