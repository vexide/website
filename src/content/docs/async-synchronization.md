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

A mutex is one of the most common synchronization primitives. Mutexes allow you to share mutable access to a variable between tasks. Lets look at an example.
```rust
let motor = Motor::new(peripherals.port_1, Gearset::Green, Direction::Reversed);
let motor = Arc::new(Mutex::new(motor));

// Spawn a task that will log the velocity of the motor every 100ms.
spawn(
    {
        // Clone the Arc. This will not clone the motor.
        let motor = motor.clone();
        async move {
            loop {
                println!("motor is moving at {} RPM", motor.lock().await.velocity().unwrap_or_default());
                sleep(Duration::from_millis(100)).await;
            }
        }
    }
).detach();

// Move the motor around. This requires mutable motor access
let _ = motor.lock().await.set_voltage(12.0);
```

There two most important things in this code are the `Mutex` and the `Arc`.
In order to get the variable inside the `Mutex` you call and then await `.lock`. This will wait until all other tasks have unlocked mutex and then give you exclusive mutable access to the data inside. If you have used the Rust standard library `Mutex` implementation, you might be surprised that it doesn't return any kind of error. This is because, currently, a task cannot panic without the entire program exiting.
`Arc` is a type of smart pointer that allows you to share a variable between tasks. If you don't know what a smart pointer is, the [Smart Pointers chapter in the Rust Book](https://doc.rust-lang.org/stable/book/ch15-00-smart-pointers.html) is a great place to learn more. `Arc` is similar to `Rc` but can be sent across tasks.

# RwLock

`RwLock` is very similar to a `Mutex` with one exception, you can have multiple readers at a time. You are still limited to exclusive mutable access.

# Barrier

# OnceLock

# LazyLock

# Once

# Condvar