---
title: "Winter Updates: Instant wireless uploads on vexide 0.6.0 & cargo-v5"
description: vroom vroom
author: {
    name: "Tropical",
    github: "tropicaaal",
}
tags: ["news"]
date: 2025-01-26
thumbnail: {
    url: "/images/thumbnails/compression-hell.png",
    alt: "Glitched vexide logo banner."
}
---

Hey. Happy... uh... *not-quite-spring-but-also-still-really-winter*. Yeah, this time of year after the holidays is weird. Hope you're holding up alright. So fun fact — it's been almost a year since vexide first started development!

![ferris celebrates a first birthday](/blog/ferris-birthday.svg)

We've come a long way since then, and we're back here again to share some important updates.

# Uploading Woes

Alright, time for a mini-rant (and a bit of a history lesson). Since the early days when vexide was called `pros-rs`, we've been constantly fighting against our upload times. Simply put, wireless uploads really *suck*. Uploading a 60kB file to the brain takes up to 20 seconds which isn't acceptable when quickly iterating on robot code. Larger vexide codebases can easily grow to be over 150kB, even after gzip compression.

<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center;">

<img width="300" src="/blog/hailstorm_bin.png" />

![A member from our discord server talking about wireless uploads taking up to a minute.](/blog/gls-upload-times.png)

</div>

What's worse is that most of the file size is spent on uploading something the brain *already has*. The vast majority of uploads happen as follows:

- Programmer is making an autonomous route or something similar.
- Spends 20-30 seconds wirelessly uploading a file.
- Realizes that one number is wrong or slightly off, changes numbers.
- Spends 20-30 seconds wirelessly uploading a file.

Uploading the program in its entirety just to change one number is a huge time-waster, and was a major problem with vexide's developer experience in the past. Before we get into how we're going to solve this, let's look at some prior art.

## VEXcode's Solution — `stdlib_0.bin`

[VEXcode](https://www.vexrobotics.com/vexcode), VEX's official programming platform gets around the sluggishness of wireless uploads by storing most of what the program binary would use *in firmware*. All of the C++ standard library (the vast majority of what would take up program size) is loaded at runtime from a file stored in the Brain's firmware assets.

This saves around 450kB of binary size, which would take *ages* to upload wirelessly each time.

![stdlib_0.bin as part of MathWorks' VEX runtime](/blog/stdlib_0.png)

This solution succeeds in reducing upload times on VEXcode, but comes with a few major drawbacks:

- VEXcode will almost certainly be [stuck on C++11 for the rest of time](https://www.vexforum.com/t/vex-vs-extension-cpp-versions/123482/4?u=tropical).
- The solution scales poorly if users add their own libraries or assets that take up a lot of space in the upload. Beyond saving the space that the standard library takes up (which is a lot), VEXcode still suffers from the same issues that we do.

## Hot/Cold Linking

[PROS](https://pros.cs.purdue.edu/) took a different approach to this issue and solved it quite beautifuly a few years ago. [Hot/Cold linking](https://github.com/purduesigbots/pros/pull/89) is a strategy used by PROS C++ projects to split libraries and user code into two separate files to save on upload times. Libraries are uploaded once (or whenever they're changed) as the larger "cold" image, while user functions are uploaded every time in the "hot" image.

![Hot/cold package files](/blog/hotcold.png)

These are then linked together both at compile time through some linker tricks and at runtime using VEX's serial file protocol, which allows linking two files together in flash at runtime through memory offsets. This works great *almost* all of the time, and it's a good thing that it does considering PROS cold packages can **exceed 2 megabytes in size**!

This is fairly close to a perfect solution, but comes with a drawback that you can't have fine control over what goes in *hot* and what goes in *cold*. To quote the [PROS documentation](https://pros.cs.purdue.edu/v5/tutorials/topical/wireless-upload.html#wireless-upload-and-hot-cold-linking):

> [!NOTE]
> Projects with large codebases may still take some time to upload even with hot/cold linking. You may be able to reduce the size of your hot image by making part of your project a library so that some code is included in the cold image.

In other words, if you have something in your hot package that takes up a lot of space, but is also something that needs to be slightly changed very often (meaning it can't be stored as a library), you start to run into issues. This is a problem that the [LemLib team](https://lemlib.readthedocs.io/en/stable/) ran into when trying to upload path trajectory data.

The other issue is that we can't use this strategy in vexide due to [technical limitations](https://github.com/vexide/pros-rs/issues/104) of the Rust compiler and Rust's [lack of a stable ABI](https://internals.rust-lang.org/t/how-unstable-is-the-abi-in-practice/20280). There simply aren't many options available for controlling where/how `libcore` is linked to Rust programs. We'd probably have to write our own dynamic linker for the brain if we wanted to do something like this.

# Enter: Differential Uploads

Now that we're familiar with the problem being faced here, let's talk about how we're going to solve this in vexide. Our thought process was roughly: *"Rather than fussing about storing certain specific parts of the program on the brain ahead of time, what if were able to upload only exactly what we changed?"*

In practice this would mean that a small/simple change to one number or function would upload practically *nothing* new to the Brain. It would also mean that binaries could grow as large as they reasonably wanted without having any impact on future uploads.

## Binary Diffing & Patches

Believe it or not, this isn't exactly a new idea. Many software updaters (such as the one in [Chrome](https://www.chromium.org/developers/design-documents/software-updates-courgette/)) use this strategy to avoid wasting network bandwidth when distributing an update. Rather than sending the whole update over the network, they send a *patch*, then apply that patch over the older version of the software to get the newer version. This is commonly referred to as a [delta/differential update](https://en.wikipedia.org/wiki/Delta_update).

![new = old + patch](/blog/patching-diagram.svg)

In order to generate these patches, we use an existing tool written in Rust called [`bidiff`](https://docs.rs/bidiff/latest/bidiff/), which diffs two binary files to generate a patch that can be applied later. This is done automaticaly in [cargo-v5](https://github.com/vexide/cargo-v5), where we keep an older version of the program (the "base binary") as a reference point for generating these patch files.

## Actually Applying the Patch

Making the patch is the easy part. Applying the patch in a way that guarantees memory safety was the far harder portion of this project. Unlike a real software update, we aren't able to modify the old file on flash (VEXos only lets you add, replace, or remove files). Instead, we have to apply the patch by self-modifying the program *in memory, while it is currently running.* This means the older version of the program has to apply the patch over itself while running.

Self-modifying code is a pretty niche/uncommon thing to encounter in the wild, especially on embedded systems. Getting the patcher to correctly apply the patches in memory was a month-long struggle between me and the user processor's instruction cache.

![NXB disconnected on port 1](/blog/nxb.png)

Pretty sure we've discovered some errors that nobody even knew existed in the process of developing this. If you're interested, you can view a more detailed writeup of the work put into the patcher (as well as a record of my pain) in the [pull request on GitHub](https://github.com/vexide/vexide/pull/269).

## It really works!

This new uploading strategy works *extremely well* in testing. When testing over 8 hours of programming and likely 100+ changes to a program, uploads would rarely take over two seconds wirelessly.

<div style="margin-block-start: 16px; text-align: center">
  <video width="600" controls>
    <source src="/blog/patch-uploads.mp4" type="video/mp4">
  </video>
</div>

You can try this new uploading strategy on `vexide` 0.6.0 and `cargo-v5` 0.10.0 or above by adding this line to your project's `Cargo.toml` config:

```toml
[package.metadata.v5]
# @diff +
upload-strategy = "differential"
slot = 1
icon = "cool-x"
compress = true
```

## Cold Uploads

It's worth noting that the patches will gradually become larger as more changes are made from the original base binary. If patch uploads start to take a while, you can re-sync the base binary to the current build with a *cold* upload. This performs complete reupload of the program so that future patches won't take as long.

```sh
cargo v5 upload --cold --release
```

# Other Stuff

Alright, enough about uploading. Let's cover the other new additions to `vexide` and `cargo-v5`. As always, the full changelog for `vexide` 0.6.0 can be found [here](/releases/#vexide-060).

## Fixed builds on latest nightlies

A [breaking change to Rust's target specification schema](https://github.com/rust-lang/rust/commit/a0dbb37ebd7919df4b698deb356e024a741283ec) broke vexide builds on newer versions of Nightly Rust. That is now fixed in `cargo-v5` 0.10.0, along with some issues regarding file removals and the program terminal when connected through a controller.

## `pros-cli` and `vexcom` slot compatibility

`cargo-v5` used to not play well with PROS and VEXcode programs due to it using a slightly different file naming scheme when uploading. This could cause some bugs where vexide programs were seemingly uploaded to the wrong slot. That is now fixed.

> [!IMPORTANT]
> You may need to clear your brain's program catalog for this fix to take effect!

## OS Version Information

You can now get the current VEXos version that your program is running on through vexide's new [`system_version()`](https://docs.rs/vexide/latest/vexide/core/os/fn.system_version.html) function.

```rs
// @fold start
use vexide::prelude::*;
// @fold end
use vexide::core::os::{Version, system_version};

/// Latest VEXos version at the time of writing this.
const VEXOS_1_1_5_0: Version = Version {
    major: 1,
    minor: 1,
    build: 5,
    beta: 18,
};

#[vexide::main]
async fn main(peripherals: Peripherals) {
    assert_eq!(system_version(), VEXOS_1_1_5_0);
}
```

## Uptime Statistics

You can also now determine how long the brain has been powered on from `vexide` using the new [`uptime`](https://docs.rs/vexide/latest/vexide/core/time/fn.uptime.html) function.

```rs
// @fold start
use vexide::prelude::*;
// @fold end
use vexide::core::time::uptime;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    println!("Brain has been powered on for {:?}", uptime());
}
```

## Encoder & Range Finder Port Validation

The `AdiEncoder` and `AdiRangeFinder` structs were previously bugged, and would return errors even when using valid port pairings. That is now fixed.

In addition, these devices will now cause a panic if an *invalid port pairing* is passed to them rather than returning a `Result`:

```rs
// @fold start
use vexide::prelude::*;

// @fold end
#[vexide::main]
async fn main(peripherals: Peripherals) {
    let good = AdiEncoder::new(peripherals.adi_a, peripherals.adi_b);
//            (err                                                )
    let bad = AdiEncoder::new(peripherals.adi_c, peripherals.adi_e);
//                            ^
//      [Encoder ports must be placed directly next to each other!]
}
```

## Inertial Sensor Calibration

We discovered a bug that could cause the [Inertial Sensor](https://docs.rs/vexide/0.4.0/vexide/devices/smart/imu/struct.InertialSensor.html) to not calibrate correctly when using `calibrate()` at the very start of the program in some rare instances. That should now be fixed.

# cat

[cat](https://cat.vexide.dev/)

# New Contributors

> [!THANKS]
> vexide is a community project maintained for free by open-source contributors. We'd like to thank the following new contributors to the project:

- [ion098](https://github.com/ion098) for implementing the `system_version` and `uptime` functions and for improvements in `cargo-v5`.
- [Saylar27](https://github.com/Saylar27) for finding and fixing a bug a bug with ADI port validation.

Thanks again for your contributions!
