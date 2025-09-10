---
title: Async Rust
category: 03. Multitasking
page: 11
---

`async` is a feature of the Rust language that allows you to express when code *waits for things to happen*. By doing this, we write code that cooperates with other parts of our program to multitask, or do more than one thing concurrently.

<iframe style="margin: 0 auto; display: block;" width="560" height="315" src="https://www.youtube.com/embed/Tw-GGT6900s?si=1-WMb-PkwIWFtw1N" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Multitasking is a common thing that you might want to do when programming your robot — much of the code that you write will be `async` in vexide. That being said, `async` is one of the most poorly taught aspects of the Rust ecosystem, so we'll start simple.

# Computers and shopping lists

CPUs are *great* at doing exactly as they're told — their sole purpose is to execute a list of sequential instructions. To illustrate this, we'll use the analogy of a *shopping list*.

Let's say you're at the store and need to grab a few things from some different aisles.

![shopping list with five items - "eggs", "milk", "chicken", "bread", "cereal"](/docs/shopping-list.svg)

When finding these items, you can't be in two different aisles at once, so you seek out each item on the list individually. CPUs largely work in the same way. On a system with one *logical core* you can only execute one instruction at a time.

When we run one function after another like this, we are executing them *synchronously*, where each function blocks the next from running until it has finished executing.

![a CPU labeled "CPU1" executing three functions labeled "A", "B", and "C" synchronously](/docs/sync-execution.svg)

## Scheduling and Concurrency

> Back in the [dark ages](https://www.youtube.com/watch?v=DgJS2tQPGKQ), I heard people used to only have one CPU core. How did we manage? How did people run multiple apps at the same time?

Believe it or not, single-core systems can still run code concurrently! In fact, the V5 Brain runs all of *your* code on a single CPU core. Let's look into how that's possible.

Going back to the shopping list — you're at the bakery and the man at the counter tells you to come back in 20 minutes to pick up your order. Rather than simply waiting at the bakery for 20 minutes, it'd be far more efficient to go do something else while your bread is being made. Applying this analogy, you are now doing two things *concurrently* - waiting for your bread *and* continuing your shopping list.

![two tasks being performed at once - "wait for bread" and "pick up cereal"](/docs/concurrent-groceries.svg)

Computers can do this too. They often need to perform long-running operations that involve some kind of waiting. For example, when you download a file, you're just waiting on data from the server and still want to be able to do other things like listen to music in the background or run your 37 chrome tabs.

> Hey! Our poor single-core CPU can only execute one thing at a time. How do we run two concurrent tasks on a single core?

Well, what if we had the ability to *yield* the execution of a function while it waits for something to happen and go do something else? This is done through a practice called *cooperative scheduling*, and it's what `async` Rust models.

![two tasks - "A" and "B" rapidly switching between each other](/docs/context-switch.svg)

With asynchronous code, we can split the job of function execution into tiny pieces split up by *`await` points* (the "yields") and overlap running these pieces on top of each other, giving the *appearance* of two things actually happening in parallel. We are still only executing one instruction at a time, but we rapidly switch contexts between different tasks allowing them to be run *concurrently*.

CPUs are *very* fast, so this approach ends up looking like we're doing two things exactly at the same time, while also allowing us to efficiently wait for stuff to happen while still running other tasks in the background.

# Cooperative multitasking with `async` & `await`

## The `async` function

Alright, let's write some actual code.

```rs
async fn wow() {
    println!("wow!");
}
```

This is an `async` function. It's exactly like a normal function, but we've tacked the `async` keyword before it. Astounding, right?

> Oooookay. What does that do?

Well, let's try treating it like a normal function and calling it.

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

// @fold end
async fn wow() {
    println!("wow!");
}

#[vexide::main]
async fn main(_peripherals: Peripherals) {
    wow();
}
```

**If we run this, literally *nothing* happens.** We don't get any `wow!` in our terminal. The function never runs and our program exits.

## Running an `async fn`

In order to actually execute our `wow` function, we need to `await` it.


```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

async fn wow() {
    println!("wow!");
}

// @fold end
#[vexide::main]
async fn main(_peripherals: Peripherals) {
    //   (    )
    wow().await;
}
```

> Why doesn't the function run without the `.await`? What is it even doing?

An `async fn` under the hood is transformed into a regular function that returns something implementing the `Future` trait. You'll learn more `Future`s and exactly what they do in a later page, but for now you should remember one important thing about them — `Future`s do nothing until they are **polled**, and awaiting a `Future` passes it to an *async runtime* (like vexide) for it to be polled.


> [!IMPORTANT]
> `async` functions, blocks, and any other kinds of `Future`s will do nothing until they are `await`ed!

To demonstrate this behavior, we can store the return value (the "future") of our `wow` call and `await` it at a different time:

```rs
// @fold start
#![no_std]
#![no_main]

use vexide::prelude::*;

async fn wow() {
    println!("wow!");
}

// @fold end
#[vexide::main]
async fn main(_peripherals: Peripherals) {
    let wow_future = wow(); // Does nothing yet

    // Do other stuff.

    wow_future.await;
    //       ^
    //     [wow!]
}
```

When we `await` our `wow_future` returned by `wow()`, we toss it over to vexide's async runtime which will poll it along with any other running futures at the time, letting it run to completion.

We also **cannot** `await` futures *outside* of an `async` function. **In order to `await`, you have to be `async` yourself!**

```rs
async fn wow() {
    println!("wow!");
}

fn not_async() {
//  (err       )
    wow().await;
    //    ^
    // [`await` is only allowed inside `async` functions and blocks]
}
```

> [!WARNING]
> This has some pretty drastic implications regarding when you should or shouldn't make a function `async`. Generally your function should only be async if you **absolutely have to `await` something**, because anyone calling your function will also have to make their function `async` as well. `async` is effectively a signal that your function will take some time waiting for something to happen. In our example, `wow` does *not* need to be async because it doesn't `await` anything else.

## Waiting with the `sleep` function

So far, we've just made a regular function `async` for seemingly no reason. Since we're just printing a string to the terminal in `wow` then returning, there's no real reason why the function should need to be `async`, since printing is done almost instantly. Let's look at something that actually *can* take up time.

`sleep` is an important `async` function builtin to vexide that simply pauses execution for a given duration. While we are awaiting the sleep duration, vexide's async runtime puts the task that called it "to sleep", letting other tasks run in its place.

```rs
// @fold start
use vexide::prelude::*;
use core::time::Duration;

// @fold end
#[vexide::main]
async fn main(_peripherals: Peripherals) {
    println!("See you in 5 years, nerd.");
    
    // @highlight
    sleep(Duration::from_secs(157784630)).await;
    
    println!("Wow, you're pretty patient.");
}
```

> [!TIP]
> `sleep` can be thought of as a delay, except rather than halting all execution of the CPU, we just halt the current task.

## Running *two* functions at the same time

With async Rust, we're able to express when code `await`s stuff. Let's look into the actual use of this by running two functions at once concurrently. We do this by spawning some **tasks**.

![ferris spawner](/docs/ferris-spawner.svg)

Here are two `async fn`s named `a` and `b` that print some text to the terminal at a fixed interval when called. They continue to do this forever (hence the `loop {}` block).

```rs
use vexide::prelude::*;

/// Prints "hello" every second.
async fn a() {
    loop {
        println!("hello");

        sleep(Duration::from_secs(1)).await;
    }
}

/// Prints "hiii" every two seconds.
async fn b() {
    loop {
        println!("hiii");

        sleep(Duration::from_secs(2)).await;
    }
}
```

If we call and `await` these functions directly in `main` we would only ever run the first function since it loops forever.

<div class="code-split">

```rs
// @fold start
use vexide::prelude::*;
use core::time::Duration;

async fn a() {
    loop {
        println!("hello");

        sleep(Duration::from_secs(1)).await;
    }
}

async fn b() {
    loop {
        println!("hiii");

        sleep(Duration::from_secs(2)).await;
    }
}

// @fold end
#[vexide::main]
async fn main(_peripherals: Peripherals) {
    a().await;
//    ^
// [Runs forever!]
    b().await;
}
```

```
hello
hello
hello
hello
hello
hello
hello
hello
```

</div>

!["a" function runs forever](/docs/infinite-loop.svg)

But we want to run these at the same time! To do this, let's make some *tasks* that we can run in the background.

We can do this with vexide's `spawn` function. This will poll a future in a background task without forcing our `main` function to wait until it's complete. Rather than `await`ing `a` and `b`'s futures, we instead pass them to `spawn()` to run them in a task.

<div class="code-split">

```rs
// @fold start
use vexide::prelude::*;
use core::time::Duration;

async fn a() {
    loop {
        println!("hello");

        sleep(Duration::from_secs(1)).await;
    }
}

async fn b() {
    loop {
        println!("hiii");

        sleep(Duration::from_secs(2)).await;
    }
}

// @fold end
#[vexide::main]
async fn main(_peripherals: Peripherals) {
    let a_task = spawn(a());
    let b_task = spawn(b());

    // Since our tasks are running in the background now, we don't want
    // our program to exit, so we do nothing in a loop here by sleeping.
    loop {
        sleep(Duration::from_secs(1)).await;
    }
}
```

```
hello
hiii
hello
hiii
hello
hello
hiii
hello
hello
hiii
hello
hello
```

</div>

![two tasks, "a_task" and "b_task" running at the same time](/docs/async-tasks-ab.svg)

It works! And notice how we don't `await` `a()` or `b()`, as `spawn` does that for us in the background.

## `async` Blocks

The *`async` block* is a syntax feature that allow us to concisely create a `Future` that can be awaited at a later time.

```rs
// The code within this block will not run until we `await` it.
let wait_one_second_future = async {
    sleep(Duration::from_millis(1000)).await;
};

wait_one_second_future.await; // Wait one second.
```

This is useful because it allows us to spawn tasks without needing entirely separate `async` functions. Using the previous example with our `a` and `b` tasks, we can replace our functions with `async {}` blocks to keep everything defined in one place at `main`.

```rs
// @fold start
use vexide::prelude::*;
use core::time::Duration;

// @fold end
#[vexide::main]
async fn main(_peripherals: Peripherals) {
    let a_task = spawn(async {
        loop {
            println!("hello");

            sleep(Duration::from_secs(2)).await;
        }
    });
    let b_task = spawn(async {
        loop {
            println!("hiii");

            sleep(Duration::from_secs(2)).await;
        }
    });

    // Since our tasks are running in the background now, we don't want
    // our program to exit, so we do nothing in a loop here by sleeping.
    loop {
        sleep(Duration::from_secs(1)).await;
    }
}
```

This also let's us demonstrate a fact we discussed earlier.

Recall that `async fn`s are desugared into regular functions that return a `Future`. With that in mind, we can demonstrate that these two functions are the same:

<div class="code-split">

```rs
async fn multiply(a: f64, b: f64) {
    sleep(Duration::from_millis(500)).await;
    println!("{a} * {b} = {}", a * b);
}
```

```rs
use core::future::Future;

fn multiply(a: f64, b: f64) -> impl Future {
    async {
        sleep(Duration::from_millis(500)).await;
        println!("{a} * {b} = {}", a * b);
    }
}
```

</div>

Above is an `async fn`, and below we have a regular function returning an `async` block (a struct implementing the `Future` trait).

> [!TIP]
> Even though the function on the right is not marked as `async`, we can still `await` it as if it was, because in both cases we are awaiting a `Future`.

## `await` points and *yielding*

In the past examples with tasks, it wasn't very clear exactly *how* Rust is able to simply give control of the CPU to the other task. After all, our CPU is just executing what we tell it to... When and where are we telling it to go run other stuff?

Let's have a second look at our two tasks:
```rs
let a_task = spawn(async {
    loop {
        println!("hello");

        // @highlight
        sleep(Duration::from_secs(2)).await;
    }
});

let b_task = spawn(async {
    loop {
        println!("hiii");

        // @highlight
        sleep(Duration::from_secs(2)).await;
    }
});
```

The answer is pretty straightforward — **whenever `async` code `await`s something, the runtime is free to go and run other tasks**. When we `await` things, we are telling the runtime that it's okay to go off and do other things. We're still waiting on our bread to bake, but we are free to continue our shopping list.

> [!TIP]
> In other words, whenever you `await`, you are effectively *yielding* back control of the CPU to the scheduler.

![await points along the execution of a and b](/docs/await-points.svg)

All of the places where our code "context switches" to running another task or future are at `await` points along our functions where we are `sleep`ing to yield execution to someone else.

## Blocking

The fact that context switches occur at `await` points has some important implications. First and foremost, it means that our `a` and `b` functions *must* explicitly yield back to the scheduler for other tasks to run in the background.

![mom! it's my turn on the CPU!](/docs/my-turn.svg)

> [!TIP]
> This is why it's called a *cooperative* scheduler. Different tasks must *cooperate* with each other, where every task gives another some CPU time to run. Otherwise, one task would be hogging all of the CPU time to itself and nothing could run!

A function that runs for a long time without an `await` point is said to be **blocking**, because it *blocks* the runtime from running other tasks. This is particularly bad in vexide's case, since a function that fully blocks the runtime prevents some important OS-level background operations from occurring such as:

- Communicating with devices like motors and sensors to get updated information.
- Flushing data from serial buffers (what you write to when using `println!`).
- Handling user input.
- Updating competition state.

> [!CAUTION]
> Needless to say, it is important that you do not block the scheduler for extended periods of time.

## Tight Loops

It's important to recognize cases where we can unintentionally create code that blocks without `await` points. The most common example of this is the **tight loop**.

*Tight loops* are long-running infinite loops with no `await` points in them. Here's an example of one:

```rs
async fn scary_bad_dont_do_this() {
    loop {
        println!("🤪");
    }
}
```

This function runs forever and never yields to the scheduler by `await`ing inside the loop. As such, it will eat up all of our CPU time and nothing else will ever be able to run in the background. In fact, we won't even see our emoji in the terminal since vexide can't flush the serial buffers in its background task!

![other tasks cannot run while being blocked](/docs/corro-blocking.svg)

Fixing this issue is easy — we can add a small `sleep()` after each loop iteration to yield to other tasks between our looping. This frees up some time for other things to run and *cooperates* with everything else in your program.

```rs
async fn better() {
    loop {
        println!("🤪");
        // @diff +
        sleep(Duration::from_millis(10)).await;
    }
}
```

Tight loops are by far the most common way to accidentally create blocking code. We'll cover some other cases (such as deadlocks) in future pages.