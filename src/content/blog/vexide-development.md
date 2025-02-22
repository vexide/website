---
title: The Development of vexide
description: The story of vexide's development
author: gavin-niederman
thumbnail: {
	url: "https://images.unsplash.com/photo-1704895390342-b52a2f45786c?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	alt: "Thumbnail Image"
}
tags: ["news"]
date: 2024-05-12
draft: true
---

vexide is a very complicated project and it has taken over a year to get to a functional state.
I'll be going over the development timeline and explaining the more important parts of vexide.
Lots of stuff wont be covered but you should be able to find some of the info that I am not covering on [our internal docs page](https://internals.pros.rs). 

# Origins

vexide started development under the name pros-rs and linked to libpros for most of its low level functionality.
pros-rs is pretty much just a high level API wrapping freeRTOS, libv5rt, and PROS.

The backend of pros-rs is the crate ``pros-sys``. pros-sys links with libpros at compile time and then used handwritten ``extern "C"`` blogs to export every function in libpros.
It also included copies of the PROS linkerscripts which allowed for programs depending on pros-sys to run on a brain.

The rest of the code in pros-rs is split up between multiple crates, but every crate did similar things.
They either created completely new APIs or reimplemented<sup>[[1]](#myfootnote1)</sup> APIs from PROS using pros-sys.
There were some more complicated complicated implementation that I won't go into here, but you can read about some of them in the archived pros-rs internal docs [here](https://internals.pros.rs/pros-rs/).

Despite being relatively simple in concept, pros-rs is over 7500 lines of code.

# The problems with pros-rs

Unfortunately, there were some issues with pros-rs.
There were a variety of reasons for this, but here are the major ones:
- PROS is buggy. We found several bugs in PROS while developing pros-rs.
Because it is hard to contribute to PROS, many of the bugs in pros-rs were actually bugs in PROS that were taking a long time to be fixed.
- We were for all intents and purposes stuck with the ARM GNU Toolchain for building.
- Many parts of the PROS API are blocking so async wasn't super useful.
- Generally, PROS and FreeRTOS aren't very good and we can do much better without them.

These issues and more led to our decision to switch away from PROS.

# How we switched away

The reason that vexide started out as pros-rs is because its not immediately clear how you would implement a library without libpros or, more accurately, libv5rt.
For example, how do you run code when the program is started? How do you get data from devices? <br />
Short answer: linker scripts and the jumptable.

Linker scripts allow us to run code on program startup.
The details of how this works are quite complicated, but it basically boils down to putting some magic numbers in the first 32 bytes of your program and then a function right after it.
If you are interested in learning more, I reccomend reading our internal [docs on program startup](https://internals.pros.rs/technical/startup).

Now for the jumptable.
VEXos loads a list of pointers to function pointers into a large block of memory starting at ``0x37fc000``.
We call this section of memory the jumptable.
These function pointers are what libv5rt uses internally to communicate with devices, draw to the screen, read and write to serial, and everything else that you can use in a program.
With this knowledge we can effectively reimplement libv5rt entirely in Rust.
So thats exactly what we did. You can view the source code for this crate [here](https://github.com/vexide/vex-sdk).

With that we have completely circumvented any external dependencies and created vexide.
Now we just need to reimplement every API.

Fortunately, we had figured out how much of the user facing API would look like once we switched development to vexide so all that had to do was reimplement them all, redo error handling, and occasionaly complete rework and API e.g. competition robot.

# Footnotes

<a name="myfootnote1">1</a>: Most APIs aren't ported 1 to 1 but are instead reimplemented with modifications and improvements.
