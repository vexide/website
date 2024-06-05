---
title: Synchronization
category: 03. Async Multitasking
page: 13
---

# What is Synchronization

Synchronization is what allows you to coordinate and communicate between multiple async tasks.
The types that allow for this are called synchronization primitives.

Some primitives allow for variables to be shared between tasks, and others allow for multiple tasks to reach the same point in code before continuing. You can find all of vexide's synchronization primitives in our [vexide-core::sync module](https://docs.rs/vexide-core/0.2.0/vexide_core/sync/index.html).

# Mutex

A mutex is one of the most common synchronization primitives. Mutexes allow you to share variables between tasks.

# RwLock

# Barrier

# OnceLock

# LazyLock

# Once

# Condvar