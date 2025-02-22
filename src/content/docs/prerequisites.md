---
title: Prerequisites
category: 01. Getting Started
page: 2
---


Before we setup a project, there are some tools you'll need to have installed to build and upload vexide projects. Have a command-line of your choice ready, since we'll be running some terminal commands.

<div style="display: block; text-align: center; margin: 0 auto;">
<iframe width="560" height="315" src="https://www.youtube.com/embed/8lf5uh8Se2g?si=yXhixtAme-q_FIpo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<small>
    If you're on Windows and prefer to follow along with a video tutorial, we have one of those too!
</small>
</div>

# Tooling

> [!NOTE]
> Before we start, make sure you have rustc and cargo installed on your machine. You can get that [here](https://www.rust-lang.org/tools/install) from the official Rust site.

vexide relies on some features that are only availble in Rust's nightly release channel, so you'll need to switch to using nightly:

```sh
rustup default nightly
```

We also need some additional build tooling in order to properly build/upload to the V5's platform target. You can install those components with the following terminal commands:

```sh
rustup component add rust-src
cargo install cargo-v5
```

# Setting up a Project

To make a new vexide project, we'll use the `cargo v5 new <NAME>` command. This will create a project in the current directory containing a barebones template that we can start with.

```sh
cargo v5 new my-project
```

This will leave you with a folder named `my-project`. Open that folder in an editor of your choice (if you aren't sure what to use, it's hard to go wrong with [VSCode](https://code.visualstudio.com/)).

![vexide-template folder structure](/docs/vexide-template-structure.png)

If you've worked in a rust project before, this project structure should be somewhat familiar to you. If not, that's okay too! There are two files of relevance we'll worry about right now:
- The contents of `src` contain your project's actual source code. All of the program you will write will be in this folder. In this case `main.rs` is your program's main source file.
- `Cargo.toml` contains your project's package information, including its dependencies.

![rocketship with ferris on it](/docs/blastoff.svg)
