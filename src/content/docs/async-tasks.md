---
title: Async Tasks
category: 03. Async Multitasking
page: 12
---

Async tasks are what allow you to run code... asynchronously!
The most important thing to remember about async tasks is that they **voluntarily** give up execution.
What this means is that you cannot have a tight loop (a loop that never yields to the async executor with a `.await`) because it will starve other tasks of execution time.

# Creating Tasks

In vexide, tasks can be created through the `spawn` function. `spawn` takes a `Future<Output = T>` as an argument and returns a `Task<T>`. When awaited, the `Task` will wait until the task has completed and then return the output of the future. `spawn` is re-exported by the prelude module so you don't have to worry about importing it. From now on I will refer to `Task`s as task handles for clarity.
Let's look at an example.
```rust
let handle = spawn(async {
    println!("Hello, World!");
    true
});

// Do some stuff.

// Wait for the task to finish and take the output.
let result = handle.await;
``` 
In this simple example, we spawn an async task that prints to the terminal and then returns a `bool`.
In order to make sure that the task runs to completion and also get the returned value, we await the task handle.
This forces the async executor to not let our task resume until the spawned task completes.

# Detached Tasks

Sometimes it's useful to allow tasks to run in the background indefinetly and by default you can't do that. Fortunately, task handles have a `detach` function which allows them to run in the background indefinetly.
```rust
spawn(async {
    println!("Hello, Detached Tasks!");
}).detach();
```

You may notice that we don't keep a task handle in this code. This is because `detach` consumes the task handle. This means that you can't control a task *through a task handle* once detached. There are still a variety of ways to interact with detached tasks as you will learn later.


# Tight Loops and Cooperation

As I said earlier, tasks have to give up execution on their own by awaiting a future. This is called cooperative multitasking. One side effect of this is that you cannot have infinite tight loops. Let's break down this broken code:
```rust
spawn(async {
    loop {
        println!("Hello, Tight Loops!");
    }
}).detach();

loop {
    // Do something super duper important here...
    sleep(Duration::from_millis(10)).await;
}

```
This code may look ok, but the tight loop causes a huge issue!
The code in the loop outside of the spawned task will run only once, if even that.
When the sleep future is awaited, the async executor will give execution to the task with the tight loop and will never be able to give execution back to the super important loop. 
Here is a fixed version of the code:
```rust
spawn(async {
    loop {
        println!("Hello, Not So Tight Loops!");
        sleep(Duration::from_millis(1)).await;
    }
}).detach();

// ...

```
All that needed to change was for a future to be awaited in the tight loop.

## Note

You don't have to use a sleep future! All of our examples use a sleep future, but basically any code with a `.await` is safe. If you run into issues similar to what we discussed, try adding a sleep to be safe.

## Common Tight Loop Symptoms

Here is a list of common symptoms caused by tight loops:
- No terminal output. If printing to the terminal has stopped working, you either have a tight loop or some connection issue to the brain.
- Broken device communication. Communication with devices can be negatively affected by tight loops.
