---
title: Aborts and Panics
---

vexide is designed to be *fault-tolerant*, meaning it should be difficult for code to unintentionally fail in unexpected ways. Sometimes, that doesn't go to plan and you need to find out why. This page will cover how to troubleshoot and fix unrecoverable failures in vexide programs.

There are two forms of errors that will cause a program to crash — **panics** and **aborts** (also known as *exceptions*).

# Panics

A **panic** is an *intentional decision* made by the program to stop running due to some unrecoverable or unhandled error. Panics can occur for a variety of reasons, but typically happen when something goes wrong at the logic or runtime level. For example:

- Accessing an out-of-bounds index in an array.
- Unwrapping a `Result` or `Option` that contains an error or `None`.
- Failing an internal assertion (e.g. `assert!(condition)`).
- Calling a function that explicitly invokes `panic!()`.

When a panic occurs, vexide halts the program and prints a detailed message describing what happened to the Brain's display and terminal.

# Aborts
