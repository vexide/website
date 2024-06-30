---
title: vexide Project Summer Update
description: A update on our plans for the summer!
author: gavin-niederman
tags: ["blog"]
date: 2024-06-28
thumbnail: {
    url: "/images/thumbnails/vaporwave.png",
    alt: "Thumbnail Image"
}
# draft: true
---

The vexide team has big plans for over the summer!

# Our Plans

Over the summer, the vexide team hopes to:
1) Completely remove `pros-cli` from our tooling. To do this, we are working on a complete reimplementation of the V5 serial protocol. See [`vex-v5-serial`](https://github.com/vexide/vex-v5-serial) and [`v5d/v5ctl`](https://github.com/vexide/v5ctl).
2) Create in depth docs and tutorials for vexide. There are already some docs [here](/docs/) (in the learn page).
3) Fully implement a QEMU simulator backend that can simulate any program that runs on a real V5 Brain. Along with this, we will also revamp the simulator GUI. Both of these changes will make debugging programs easier than ever before.
4) TODO add all of the plans

You can follow development through the [vexide discord server](https://discord.gg/y9mcGuQRYz), or the [vexide Github project](https://github.com/orgs/vexide/projects/1)

Just as a reminder, everyone is welcome to contribute to any of these goals, even if its not what the vexide team is focused on!

# What are we doing right now

Currently, we are working on our goal of removing pros-cli from out toolchain.
Since tooling for vexide was created, we have depended on pros-cli for uploading programs. Our new cli which will be called ``cargo-v5`` will remove that dependency.
This will make upload times marginally faster, when uploading over serial. However, the biggest improvement will be the improved ease of installation of ``cargo-v5``. 
