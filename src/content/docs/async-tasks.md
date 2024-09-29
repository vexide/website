---
title: Async Tasks
category: 03. Concurrency & Multitasking
page: 12
---

# Tasks

Async tasks are what allow you to run code... asynchronously!
In other words, tasks allow you to execute multiple pieces of code concurrently.

The most important thing to remember about async tasks is that they **voluntarily** give up execution.
What this means is that you cannot have a tight loop (a loop that never yields to the async executor with a `.await`) because it will starve other tasks of execution time.

> "Wow, this really reminds me of [PROS Tasks](https://pros.cs.purdue.edu/v5/tutorials/topical/multitasking.html) and [VEXcode Threads](https://api.vex.com/v5/home/cpp/Thread.html)!" -- You, hopefully

# Creating Tasks

Let's look at a simple example of creating, and getting the output of a task:

```rs
/// Spawn a task
let handle = spawn(async {
    println!("Hello, World!");
    true
});

// Do some stuff concurrently...
sleep(Duration::from_millis(100)).await;

// Wait for the task to finish and take the output.
let result = handle.await;

// Prints "true"
println!("{result}");
```
This example spawns a task, waits 100ms and then prints the output of the async task.

To better understand this, We'll go over each section individually.

```rs
//@focus start
/// Spawn a task
let handle = spawn(async {
    println!("Hello, World!");
    true
});
//@focus end

// Do some stuff concurrently...
sleep(Duration::from_millis(100)).await;

// Wait for the task to finish and take the output.
let result = handle.await;

// Prints "true"
println!("{result}");
```

Here, a new async task is spawned.
Take note of the `async { ... }` syntax. This is what allows us to `.await` futures.

> [!NOTE]
> `async` blocks compile down to state machines implementing `Future`

```rs
/// Spawn a task
let handle = spawn(async {
    println!("Hello, World!");
    true
});

//@focus start
// Do some stuff concurrently...
sleep(Duration::from_millis(100)).await;
//@focus end

// Wait for the task to finish and take the output.
let result = handle.await;

// Prints "true"
println!("{result}");
```

This is where the magic of async begins!
Whenever we .await a future, here `sleep` returns a `SleepFuture`, we are allowing the async executor to switch tasks and run code in other tasks.

`SleepFuture`s are even more powerful than just letting the executor switch tasks, they tell the executor to **stop** polling the task for a given amount of time.

Because `.await` is needed for the executor to switch tasks, it is incredibly important that an infinite loop anywhere in your code .awaits some kind of future. If you do not do this, your entire program will break.

> [!NOTE]
> This kind of dangerous loop is referred to as a 'tight loop'.

```rs
/// Spawn a task
let handle = spawn(async {
    println!("Hello, World!");
    true
});

// Do some stuff concurrently...
sleep(Duration::from_millis(100)).await;

//@focus start
// Wait for the task to finish and take the output.
//                 (     )
let result = handle.await;
//                 ^
//[ Awaiting a task handle is similar to joining a Task in PROS or VEXcode, except that it can return a value. ]

// Prints "true"
println!("{result}");
//@focus end
```

Finally, we await the task handle and print the output value of the task.

# Detached Tasks

Sometimes it's useful to allow tasks to run in the background indefinitely, and by default you can't do that. Fortunately, task handles have a `detach` function which allows them to run in the background forever.
```rust
spawn(async {
    println!("Hello, Detached Tasks!");
}).detach();
```

You may notice that we don't keep a task handle in this code. This is because `detach` consumes the task handle. This means that you can't control a task *through a task handle* once detached. There are still a variety of ways to interact with detached tasks as you will learn later.


# A Deeper Look Into Tight Loops and Cooperation

As said earlier, tasks have to give up execution on their own by awaiting a future. This is called cooperative multitasking. One side effect of this is that you cannot have infinite tight loops. Let's break down this broken code:
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

> [!TIP]
> You don't have to use a sleep future! All of our examples use a sleep future, but basically any code with a `.await` is safe. If you run into issues similar to what we discussed, try adding a sleep to be safe.

## Common Tight Loop Symptoms

Here is a list of common symptoms caused by tight loops:
- No terminal output. If printing to the terminal has stopped working, you either have a tight loop or some connection issue to the brain.
- Broken device communication. Communication with devices can be negatively affected by tight loops.
