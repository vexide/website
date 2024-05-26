---
title: Prerequisites
category: 01. Getting Started
layout: layouts/DocsLayout.astro
page: 2
---

Before we setup a project, there are some tools you'll need installed to build and upload vexide projects.

# The Rust Stuff

> First, ensure you have Rust and Cargo installed on your machine. You can get that [here](https://www.rust-lang.org/tools/install) from the official Rust website.

vexide relies on some features that are only availble in Rust's nightly release channel, so you'll need to switch to that before we start:

```sh
rustup default nightly
```

We also need some additional build tooling in order to properly build for the V5's platform target. You can install those components with the following terminal command:

```sh
rustup component add rust-src llvm-tools-preview
cargo install cargo-pros cargo-binutils
```

# Installing pros-cli

At this time of this tutorial being written, vexide's tooling currently relies on the [PROS CLI](https://github.com/purduesigbots/pros-cli/releases). You'll need that installed on your system in order to upload to the brain.

## Windows

```sh
winget install -s msstore "Python 3.9"
pip3.9 install --user pros-cli
```

## macOS

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install rustup python@3.10
pip3.10 install pros-cli
```

## Debian/Ubuntu Linux

```sh
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.9 python3-pip python3.9-distutils

python3.9 -m pip install --user pros
```

## Fedora Linux

```sh
sudo dnf install rustup python3-pip
pip install --user pros-cli
```