---
title: The Life of a User Program
description: A deep-dive into how VEXos executes user code. 
author: tropix126
tags: ["blog"]
date: 2024-07-16
thumbnail: {
    url: /images/thumbnails/life-of-a-user-program.png,
    alt: Cat staring at a memory permission error on a V5 brain sreen.
}
---

I'm writing this post to hopefully serve as a basic introduction to low-level development on the V5 Brain for those wanting to hack around in the PROS kernel or vexide (or even make their own thing!). Information about this is kind of spread thin across random forums and discords, so it felt necessary to put this all in once place.

Hopefully you can take *something* away from these ramblings.

> [!TIP]
> If you want some more technical documentation, check out the [vexide internals docs](https://internals.vexide.dev/) too!

# Where to start?

For those who aren't caught up, we're going to be writing some programs for the [V5 Robot Brain](https://www.vexrobotics.com/276-4810.html), an embedded device made by [VEX Robotics](https://www.vexrobotics.com/) for controlling competition and classroom robots. The catch? We aren't going to be using any existing libraries or external code (unless I end up feeling like it later).

A quick look through the product page tells us we're working with an [ARM Cortex-A9](https://en.wikipedia.org/wiki/ARM_Cortex-A9) processor of some sort:

![V5 Processor Info](https://i.imgur.com/leJB5y1.png)

Notice how they specify that there's a "User Processor" and a "VEXos Processor". That's because the code that you upload and run on the Brain runs on a separate CPU core from the actual operating system. This architecture is used because their main SOC (the Xilinx ZYNQ XC7Z010) is already a dual-core system and running code this way serves as a security boundary preventing people from ignoring/tampering with competition control or directly communicating with peripherals (cheating).

> [!NOTE]
> For the rest of this post, we're going to call the core that runs VEXos **CPU0** and the core that runs user code **CPU1**.

So uh, what can we take away from this?
- User code runs on a Cortex-A9 core separate from VEXos (which is also a Cortex-A9, but like - a different one).
- We are targetting a platform on the ARM architecture (specifically `armv7a-none-eabi`).
- From our perspective, VEXos is only an "operating system" in a loose sense. It's more of a broker between our ARM user code and the peripherals we're communicating with (motors, sensors, etc...)

# Program Binaries

Before we write anything ourselves, let's look at what's being actually uploaded to our Brain when we build using some official tools. Check out my sick VEXcode program:

```cpp
/*----------------------------------------------------------------------------*/
/*                                                                            */
/*    Module:       main.cpp                                                  */
/*    Author:       tropical                                                  */
/*    Created:      8/30/2024, 4:55:26 PM                                     */
/*    Description:  V5 project                                                */
/*                                                                            */
/*----------------------------------------------------------------------------*/

#include "vex.h"

void main() {
  printf("Hello World!");
}
```

Goundbreaking stuff, I know.

When I click the "build" button, VEXcode will run its C++ compiler and spit and out a bunch of files in my project's `build` folder:

<div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
<div style="flex: 1 1 auto; overflow: hidden;">

```ansi
windows build for platform vexv5
"CXX src/main.cpp"
"LINK build/vexcode-test.elf"
   text    data     bss     dec     hex filename
   1256    1076 1062948 1065280  104140 build/vexcode-test.elf

Finished
```
</div>

<figure>

![VEXCode's build output](/blog/vexcode-build-output.png)

<figcaption>Our build output</figcaption>

</figure>
</div>

Looking at the log left by our build suggests that the linker left us with `vexcode-test.elf`. [ELF](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format) is a pretty standard binary executable format for both embedded and non-embedded devices, so it makes sense that it'd be used on the V5.

> Hey what's the deal with that `vexcode-test.bin` file?

Well the brain actually doesn't run ELFs in their unmodified state. It expects programs to be uploaded as raw binary, so after compiling that ELF file, VEX tosses it through a tool called `objcopy` that strips out all of the ELF metadata stuff leaving only the loadable sections containing instructions and data.

![VEXCode's build process](/blog/vexcode-build-process.png)

> [!TIP]
> BIN files are the Brain's concept of an "executable". They contain your user program's compiled CPU instructions that will be executed on CPU1 once loaded by VEXos.

## Digging a little deeper...

Just for fun, I am going to throw that `vexcode-test.bin` file into a [hex editor](https://hexed.it/). [Here's the file if you want to follow along.](/blog/vexcode-test.bin)

This is what we see ([HEX](https://en.wikipedia.org/wiki/Hexadecimal) on the left, [UTF-8](https://en.wikipedia.org/wiki/UTF-8) on the right):

![vexcode-test.bin in a hex editor](/blog/hex-editor-binary.png)

If we scroll down, we can even find our "Hello World!" (and some other internal strings). Cool.

![Hex editor displaying "Hello World" on the right](/blog/hex-editor-strings.png)

Of course, most of what we're seeing looks like a garbled mess because we're looking at ARM CPU instruction opcodes here and not readable text. If I were to toss this binary into a decompilation tool like [Ghidra](https://ghidra-sre.org/) we could view the assembly that those opcodes actually represent. Maybe another day.

## Code Signatures

I want to draw your attention to that 32-byte block at the very start of our program. The one that starts with "XVX5". That doesn't look like CPU instructions to me... What's it's deal?

![First 32 bytes of vexcode-test.bin](/blog/hex-editor-code-signature.png)

This is actually a very important part of the program binary. It's called the **code signature** (or `vcodesig`). It's a 32-byte header at the start of every program that tells VEXos that we are indeed a user program, as well as having a few flags relating to startup behavior. As a fun fact, if you open up any program binary in a text viewer (could be VEXcode, PROS, or vexide) it will **always** start with `"XVX5"`.

I don't see anything like that in my hello world source code though, so at what point *was* it added? Digging around in that `vex.h` include eventually gives us our answer:
```cpp
#define V5_CODE_SIG( type, owner, options ) \
vcodesig  vexCodeSig  __attribute__ ((section (".boot_data"))) = \
 { V5_SIG_MAGIC, type, owner, options };
```

Alright, so a `vcodesig` struct instance is inserted in the `.boot_data` section of our binary (which is positioned before anything else) and contains a `magic`, `type`, `owner`, and `options` field (each being 32 bits in this packed struct respectively).

- `magic` is always `"VXV5"` in little endian ASCII (that's why we're reading it as `"XVX5"` in our hex editor).
- `type` to my knowledge is always `0`, which means the "program type" is a user program.
- `owner` is a number representing the *originator* of this program binary.
  - `0` denotes a "system binary" that was shipped with firmware, such as the default clawbot "Drive" program.
  - `1` denotes a binary that originates from VEX like Battery Medic, motorcheck, or the smart field controller programs.
  - `2` denotes a binary that originates from a partner developer like PROS, MathWorks, or RobotMesh.
- `flags` is a set of bitflags that change some startup behavior. There are a few flags kindly documented for us by VEX:
  - Bit 0 (least sigificant) will invert the default graphics colors of the screen on this program if set.
  - Bit 1 will terminate the `V5_Main` scheduler task when the program is exited if set.
  - Bit 2 will invert the default graphics colors, but only if the brain's theme is set to light mode if set.

> [!NOTE]
> And before you ask, none of these fields really do anything particularly special or exciting. Nothing aside from `flags` even visibly affects program behavior. They're basically just the program's metadata.

So this is what the first 32 bytes of a program binary end up looking like:

![Memory layout of the first 32 bytes of a user program](/blog/boot-data-layout.png)

## Peak Embedded Development — Writing a valid binary in Windows Notepad

Who needs an IDE or syntax highlighting or line numbers or a programming language? What the HELL is C? I'll let you in on a secret — REAL 10xers type their CPU instructions directly into notepad.

![Windows 1.01](https://i.imgur.com/jmtScOd.png)

...anyone up for a game of Reversi after this?

All jokes aside, what we've just written is the smallest theoretical program binary, containing just the first four bytes of the code signature (the "magic" sequence) and nothing else. This is *just* enough to get VEXos to recognize our binary as a program and start execution of it on CPU1 ("it" being nothing, since our program contains no instructions).

Let's run this thing onto a brain just to confirm.
And success! Nothing happens!

That's pretty boring so let's make something happen!

# The Fun Bit — Getting code running

This is where we really start to get into the weeds of embedded development.

The first thing we need to decide is what language and toolchain we will be using. We saw the vexcode stack earlier, but what we'll make in this blog will use the same stack as vexide:

![vexide's build process](/blog/vexide-build-process.png)