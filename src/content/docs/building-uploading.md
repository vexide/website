---
title: Building & Uploading
category: 01. Getting Started
page: 4
---


# Uploading with `cargo-pros`

Let's get our Hello World program onto a brain.

To build and upload vexide programs, we use the [`cargo pros` command line utility](https://github.com/vexide/cargo-pros/). If you went through the [prerequisites](../prerequisites/) you should already have it installed. To build and upload our project in one simple command, we use the `cargo pros upload` command in the root directory of our project.

Before running the command, ensure that the brain or a tethered controller is connected to your machine over USB and no other programs are using the brain's serial port. We'll upload to program slot 1 on the brain, but you can change that by simply adjusting the number passed to the `--slot` argument.

```sh
cargo pros upload --slot 1 -- --release
```

> When uploading, you should always specify `-- --release`, as it will result in much smaller build sizes and shorter upload times!

<div style="margin-block-start: 16px; text-align: center">
  <video width="600" controls>
    <source src="/docs/upload-demo.mp4" type="video/mp4">
  </video>
</div>

The first time you do this, it might take a while to build! That's normal though, and it should only take that long on the first build.


# Building Without Uploading

If you just want to build your program without uploading to the brain, you can simply use `cargo pros build` (or `cargo pros build -- --release` if building with release mode).

```sh
cargo pros build
```

```sh
cargo pros build -- --release
```

# Common Uploading Errors

## "`No v5 ports were found!`"

This error occurs when there is no USB connection to the brain available. Ensure that it's plugged in and powered on with a stable connection, then try again.

## "`could not open port 'COM4'`"

This occurs when `pros-cli` fails to open a serial port with the brain. This can happen for a few reasons, but by far the most common reason is that another running program hogging the communications port. Make sure you have no other editors or windows (like VEXCode) open that might be trying to communicate with the brain.

If you are using the VEX VSCode extension or the PROS extension, they may be clashing with `cargo pros` for control over the brain's COM port, so disabling those might also help.

If you are on **linux** and are still getting this error after verifying there are no other running programs using the port, then this may be due to missing dialout permissions on your user. You can fix that with this command:

```sh
sudo adduser $USER dialout
```

## "`Binary not found!`"

This happens when you try to upload, but your project failed to compile. Try scrolling up in the terminal for more information on why the build failed (there are probably other more helpful errors above).

## "`pros-rs requires Nightly Rust features, but you're using stable`"

You are trying to build a vexide project while using the stable release channel of Rust, which isn't currently supported. To resolve this error, switch to Nightly:

```sh
rustup override set nightly
```

## "`command 'pros' not found`"

It looks like you don't have `pros-cli` installed on your system (either that or the command isn't available or in `PATH`). Double check that you can run the `pros` command in a terminal. If you can't then look into reinstalling `pros-cli` for your platform.

## "`Device NACK'd with reason: ... <massive hexdump>`"

This is usually caused by an unstable or poor USB connection. You might want to check that your USB cable is working as intended and isn't physically damaged. Same goes for the ports on your device and brain.