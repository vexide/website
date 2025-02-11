---
title: vex-libunwind 0.1.0
project: vex-libunwind
date: 2024-09-18
---

Initial release of the `vex-libunwind` library.

## Overview

This library provides idiomatic Rust bindings for LLVM's libunwind library on VEX V5 robots. It is used by the vexide runtime since version `0.4.0` to provide stack backtraces in `vexide-panic`.

Documentation for LLVM-flavored libunwind: https://github.com/llvm/llvm-project/blob/main/libunwind/docs/index.rst