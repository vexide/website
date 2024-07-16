---
title: Prerequisites
category: 01. Getting Started
page: 2
---

Before we setup a project, there are some tools you'll need to have installed to build and upload vexide projects. Have a command-line of your choice ready, since we'll be running some terminal commands.

# Tooling

> Before we start, make sure you have rustc and cargo installed on your machine. You can get that [here](https://www.rust-lang.org/tools/install) from the official Rust website.

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

To make a new project, we recommend using [vexide-template](https://github.com/vexide/vexide-template/), which provides a basic `no_std` Rust project with vexide's stuff setup for you. If you have [git](https://git-scm.com/), then you can simply clone the repo from a command line:

```sh
git clone https://github.com/vexide/vexide-template
```

> If you don't have git, you can download the project as a zip archive using [this link](https://github.com/vexide/vexide-template/archive/refs/heads/main.zip).

This will leave you with a folder containing a barebones vexide project. Open that folder in an editor of your choice (if you aren't sure what to use, it's hard to go wrong with [VSCode](https://code.visualstudio.com/)).

![vexide-template folder structure](/docs/vexide-template-structure.png)

If you've worked in a rust project before, this folder structure should be somewhat familiar to you. If not, that's okay too! There are two files of relevance we'll worry about right now:
- The contents of `src` contain your project's actual source code. All of the program you will write will be in this folder. In this case `main.rs` is your program's main source file.
- `Cargo.toml` contains your project's package information, including its dependencies.
