---
title: Building & Uploading
category: 01. Getting Started
page: 4
---


# Uploading with `cargo v5`

Let's get our Hello World program onto a brain.

To build and upload vexide programs, we use the [`cargo v5` command line tool](https://github.com/vexide/cargo-v5/). If you went through the [prerequisites](../prerequisites/) you should already have it installed. To build and upload our project in one simple command, we'll use the `cargo v5 upload` command in the root directory of our project.

Before running the command, ensure that the brain or a tethered controller is connected to your machine over USB and no other programs are using the brain's serial port.

```sh
cargo v5 upload --release
```

<div style="margin-block-start: 16px; text-align: center">
  <video width="600" controls>
    <source src="/docs/upload-demo.mp4" type="video/mp4">
  </video>
</div>

The first time you do this, it might take a while to build! That's normal though, and it should only take that long on the first build.

# Configuring Uploads

Upload behavior can be configured through either your project's Cargo.toml file or by providing command-line arguments to cargo-v5.

## Cargo Metadata

cargo-v5 will attempt to locate `Cargo.toml` files with the following structure for providing defaults to some upload options (these should already be included for you if you use [vexide-template](https://github.com/vexide/vexide-template)):

```toml
[package.metadata.v5]
slot = 1
icon = "cool-x"
compress = true
```

cargo-v5 will also use your project's `name` and `description` fields for program name/description if nothing is explicitly provided to the command through arguments.

## Command Line Arguments

You can override your project's default upload options, as well as configure a lot of manual behavior through passing arguments to `cargo v5 upload`. For example, we can specify that we want to upload to program slot 3:

```sh
cargo v5 upload --slot 3 --release
```

> For a full list of options you can provide to `cargo-v5`, try running `cargo v5 upload --help`

# Building Without Uploading

If you just wish to build your program without uploading anything to the brain, you can use `cargo v5 build` (or `cargo v5 build --release` if building with release mode).

```sh
cargo v5 build
```

```sh
cargo v5 build --release
```

This will output a .bin file in your project's `target` folder that can be manually uploaded or used at a later time.