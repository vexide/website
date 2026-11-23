---
title: Program Structure
---

# Hello, world!

Here's one of the simplest vexide programs. It just prints a short message to the [terminal](../using-the-terminal/):

```rs title="main.rs"
use vexide::prelude::*;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    println!("Hello, world!");
}
```

We'll go through what's happening here one part at a time.

## The vexide Prelude

```rs
// @focus
use vexide::prelude::*;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    println!("Hello, world!");
}
```

This line of code brings vexide's *prelude* module into scope. All that this does is import a bunch of commonly used stuff, so you don't have to type out their full name every time. For example, you can simply use `Motor` rather than `vexide::smart::motor::Motor`.

> [!TIP]
> For a full list of what's imported by the `prelude`, see the [module docs](https://docs.rs/vexide/latest/vexide/prelude/index.html).

## The Program Entrypoint

All vexide programs begin and end at the `main` function, which must be annotated with the `#[vexide::main]` macro.

```rs
use vexide::prelude::*;

// @focus start
#[vexide::main]
async fn main(peripherals: Peripherals) {
	// @focus end
    println!("Hello, world!");
// @focus start
}
```

If you're familiar with Rust, you might notice some key differences in vexide's version of the `main` compared to Rust's normal `main` function:

1. **`main` is an `async fn`.** vexide ships with its own async runtime that serves as the basis for its multitasking features. In order to run other async functions, `main` itself must also be async.
2. **`main` takes a `peripherals` argument.** This is an instance of the [`Peripherals` struct](https://docs.rs/vexide-devices/latest/vexide_devices/peripherals/struct.Peripherals.html) that allows you to create devices and control your robot's hardware. You can read more about that [here](../peripherals/).
3. **`main` is annotated with `#[vexide::main]`.** This is a special *attribute macro* that sets up the real program entrypoint. Behind the scenes, this macro runs some additional low-level startup code and sets up vexide's async runtime.

## The `println!` Macro

This line does all of the work in our little program.

```rs
use vexide::prelude::*;

#[vexide::main]
async fn main(peripherals: Peripherals) {
    // @focus
    println!("Hello, world!");
}
```

`println!` simply prints some text for us to read. We'll learn how to read this as it runs [in a few pages](../using-the-terminal). This macro isn't a feature of vexide, but rather a part of Rust's standard library.

If you've used Rust before, you should hopefully be [familiar](https://doc.rust-lang.org/book/ch01-02-hello-world.html#anatomy-of-a-rust-program) with this.

# Analyzing the Rest of the Code

Async main is the entry point of the code, but as you have probably seen, in your new project, there are other functions in the code. In order to fully utilize the Vexide runtime, it's important to understand the purpose of these functions.

## Struct Robot

In rust, a struct will create a new datatype. Inside, a struct, there are contents we call fields. Inside these fields, there are two parts:

1. A name (for future use)
2. A datatype (what the field is (a number, a boolean, or even a string)

Struct Robot creates a new datatype named (you guessed it) robot. Inside this struct, you add everything that is in your robot. Here is a following example containing a piston and four motors:

```rs
struct Robot {
//@focus start
	solenoid: AdiDigitalOut,
	motor1: Motor,
	motor2: Motor,
	motor3: Motor,
	motor4: Motor,
//@focus end
}
```
> This is all great, but how can I define the ports of these devices in my robot? The robot doesn't automatically know, does it?

No. Unfortunately, it isn't that simple. Our robot datatype contains what it has, but we actually have to create an instance of this robot, containing all of the information this datatype needs (4 motor and 1 solenoid instance). We need the function previously explained in the upper part of this documentation, that is the entry point of our code: the async main fn.

Later on, in the devices subsection of this document, we'll go over all of the different devices in the rust ecosystem and how to create instances for them which can be used to read inputs and power outputs. In this case, we'll just assume that we've created motor instances and a solenoid instance for all of the fields of our robot, containing port numbers (incredibly important). We can now create a new instance, named egrobot, of our robot datatype with these parts (In the code, the instances are named Piston, leftside1, leftside2, rightside1, rightside2). Make sure to have .await();, which is vital for async functions (go to multitasking section to read more).

```rs
async fn main () {
	egrobot = Robot {
		solenoid: Piston,
		motor1: leftside1,
		motor2: leftside2,
		motor3: rightside1,
		motor4: rightside2,
	}
	.compete()
	.await();
```

> What's the .compete() thing for?

The .compete() calls the trait method called compete for our robot. This trait will need to be edited by you, and will contain what the bot needs to do depending on the state of competition (autonomous, driver). This can be edited in the impl Compete for Robot. Please refer to the competition section of getting started to learn more.

> I looked in the devices section, and it turns out I can use the instances inside our robot instance without it, so why is it important to put everything in the Robot {}?

Inside the Impl Compete for Robot trait, you can only use things that are part of your Robot. For example, if I tried to set leftside1 to 12.7 volts inside async inside the compete trait with this command:

```rs
leftside1.set_voltage(12.7).ok();
```
You will get an error saying there is no such thing as leftside1. That's because inside the compete, driver and autonomous functions take Robot as the arguement. It basically means that the only things that are pre-existing and that can be used are the contents of Robot itself. Instead, use this:

```rs
self.motor1.set_voltage(12.7).ok(); //self refers to the Robot datatype
```




