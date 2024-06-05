---
title: Async Tasks
category: 03. Async Multitasking
page: 12
---

Async tasks are what allow you to run code... asynchronously!
The most important thing to remember about async tasks is that they **voluntarily** give up execution.
What this means is that you cannot have a tight loop (a loop that never yields to the async executor with a `.await`) because it will starve other tasks of execution time.
