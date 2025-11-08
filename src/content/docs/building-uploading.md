---
title: Building & Uploading
---

# Uploading with `cargo v5`

Let's get our "Hello World" program onto a brain.

![BIN file being uploaded to the brain](/docs/upload.svg)

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

Upload behavior can be configured through either your project's `Cargo.toml` file or by providing command-line arguments to cargo-v5.

## Cargo Metadata

cargo-v5 will attempt to locate `Cargo.toml` files with the following structure for providing defaults to some upload options (these should already be included for you if you use [vexide-template](https://github.com/vexide/vexide-template)):

```toml title="Cargo.toml"
[package.metadata.v5]
upload-strategy = "differential"
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

> [!TIP]
> For a full list of options you can provide to `cargo-v5`, try running `cargo v5 upload --help`

# Uploading Strategies

When programming robots, being able to quickly iterate and adjust your code is very important. This requires fast and consistent wireless uploads to do. Since this is such a high priority to most programmers, we have some dedicated features to ensure fast wireless uploads.

![Uploading can take a long time if done incorrectly!](/docs/ferris-madupload.svg)

## Differential Uploading

*Differential uploading* is a strategy used by vexide and cargo-v5 to ensure fast upload times — even on very large projects. Rather than uploading your whole program every time, we upload a small *patch file* containing only the changes you have recently made to the older version of your program. This patch is then combined with the older file on the brain at runtime to build your new and updated version.

![new = old + patch](/blog/patching-diagram.svg)

Differential uploads should be enabled by default on all new vexide projects, but you can check that `upload-strategy` is set to `differential` in your `Cargo.toml` file to make sure.

```toml title="Cargo.toml"
[package.metadata.v5]
# @highlight
upload-strategy = "differential"
slot = 1
icon = "cool-x"
compress = true
```

## Cold Uploads

Patches created by differential uploads will gradually become larger as more changes are made from the original base binary. If patches start to take a while, you can re-sync the base binary to the current build with a *cold upload*. This performs complete reupload of the program so that future patches won’t take as long.

```sh
#               (    )
cargo v5 upload --cold --release
```

> [!TIP]
> Keep in mind that differential uploads are most effective when you make small adjustments to your code. Cold uploading effectively trades a single slower upload in exchange for making future uploads fast again.

# Building Without Uploading

If you just wish to build your program without uploading anything to the brain, you can use `cargo v5 build` (or `cargo v5 build --release` if building with release mode).

```sh
cargo v5 build
```

```sh
cargo v5 build --release
```

This will output a .bin file in your project's `target` folder that can be manually uploaded or used at a later time.