---
layout: ../../../layouts/BlogPostLayout.astro
title: vexide v0.1.0
description: All about the first version of vexide
author: gavin-niederman
thumbnail: "https://images.unsplash.com/photo-1704895390342-b52a2f45786c?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
thumbnail_alt: "Thumbnail Image"
tag: blog
date: 2024-05-11
---

vexide has now officially been released!

# What is vexide
vexide is a library that allows you to run code on VEX V5 Brains.
Unlike the two other V5 Brain libraries (VEXCode and PROS), vexide is written in Rust instead of C++.
This allows for quite a few improvements.
- vexide uses Rust async/await instead of an RTOS.
- vexide binaries are small, like, *really small* compared to PROS.
- All device errors need to be explicitly handled or ignored. This prevents footguns.
- vexide gives you complete control over what runs in your programs. Don't want a banner to print on startup? Disable the feature.
- vexide programs are built and linked with LLVM instead of the bulky ARM GNU Toolchain. 
  
Every single line of code in vexide is open source and 100% Rust. 
vexide doesn't depend on any external C libraries (even libv5rt).
This means that anyone can build and contribute to vexide with ease.
It is impossible to contribute to VEXCode and you very rarely see anyone outside of Purdue contribute to PROS for a good reason.
It's almost impossible to contribute to a project that you literally cannot build.