---
title: A deep dive into Brain communications and vex-v5-serial
description: A look into the technical side of vex-v5-serial and the V5 Serial Protocol.
author: gavin-niederman
tags: ["blog"]
date: 2024-07-13
draft: false
---

As we announced in our [summer update blog](/blog/posts/summer-update-24), we have a completely new toolchain! `cargo-v5` is the replacement for `cargo-pros`. Instead of depending on pros-cli for uploading and terminal, `cargo-v5` uses our new crate [`vex-v5-serial`](https://crates.io/crates/vex-v5-serial) which is a complete reimplementation of the V5 Serial Protocol written in 100% Rust. It supports wired, controller, and direct Bluetooth (btle) connections.

Reimplementing the Brain's serial protocol was no small feat! It would have been much harder without amazing references like [`vexrs-serial`](https://github.com/vexrs/vexrs-serial) (`vex-v5-serial` was originally a fork of this repo but we slowly completely rewrote it), [`v5-serial-protocol`](https://github.com/Jerrylum/v5-serial-protocol), and, last but not least, [`pros-cli`](https://github.com/purduesigbots/pros-cli). I want to give a huge thanks to all of these projects for open sourcing their code.

This blog post should hopefully educate you on not only the inner workings of `vex-v5-serial`, but also the serial protocol itself. Think of it as a giant knowledge dump with a minor attempt to organize it into meaningful sections.

# How `vex-v5-serial` Works

`vex-v5-serial` is a complicated project so the code is split into several distinct sections that all handle separate things.
Not only does this improve code quality, but it also has the added benefit of allowing for features that enable all of these different sections. See the `connection` feature.

## Encoding and Decoding

We use two traits we use for encoding packets into bytes and decoding response packets. These two traits are [`Encode`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/encode/trait.Encode.html) and [`Decode`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/decode/trait.Decode.html). The `Decode` trait isn't perfect as it can struggle to decode arrays and strings that aren't null-terminated (the solution to this is the third, less commonly used, trait: [`SizedDecode`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/decode/trait.SizedDecode.html)), but for how simple it is you can make some surprisingly capable and speedy parsers in a really ergonomic way! Take the following basic parsing example based off of our real code:
```rust
// Decode is implemented for a variety of primitives,
// including most integer types and [D; N] where D implements Decode
struct ResponsePacket<Payload: Decode> {
    pub header: [u8; 2],
    pub payload: Payload,
}
impl<Payload: Decode> Decode for ResponsePacket<Payload> {
    fn decode(data: impl IntoIterator<Item = u8>) -> Result<Self, DecodeError> {
        let mut data = data.into_iter();
        let header = Decode::decode(&mut data)?;
        let payload = Payload::decode(&mut data)?;
        Ok(Self { header, payload })
    }
}

struct ExamplePayload {
    data: u8
}
impl Decode for ExamplePayload {
    fn decode(data: impl IntoIterator<Item = u8>) -> Result<Self, DecodeError> {
        let data = u8::decode(data)?;
        Ok(Self { data })
    }
}

// This is the type that users can use in functions like receive_packet.
type ExampleResponsePacket = ResponsePacket<ExamplePayload>
```

The beauty of this approach is that every packet only needs to implement decode for a payload type and the rest of the decoding is handled by higher level wrappers such as `ResponsePacket` in this example. This applies to the `Decode` implementations on primitives as well. All decoding eventually goes lower and lower level until you finally hit the `u8` `Decode` implementation which simply calls `next` on the `data` iterator and returns a [`DecodeError::PacketTooShort`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/decode/enum.DecodeError.html#variant.PacketTooShort) error if there is no byte to consume.

The `Encode` trait is intentionally similar in design to the `Decode` trait. Here is a simplified example of its usage:

```rust
struct CommandPacket<Payload: Encode> {
    pub header: [u8; 4],
    pub payload: Payload,
}
impl<Payload: Encode> CommandPacket<Payload> {
    pub fn new(payload: Payload) -> Self {
        Self {
            header: [1, 2, 3 ,4],
            payload
        }
    }
}
impl<Payload: Encode> Encode for CommandPacket {
    fn encode(&self) -> Result<Vec<u8>, EncodeError> {
        let mut encoded = Vec::new();
        encoded.extend_from_slice(self.header);
        encoded.extend(self.payload.encode()?);
        Ok(encoded)
    }
}

pub struct ExamplePayload {
    data: u8
}
impl Encode for ExamplePayload {
    fn encode(&self) -> Result<Vec<u8>, EncodeError> {
        Ok(vec![self.u8])
    }
}

// This type can be constructed to be sent to the brain like this
// ExampleCommandPacket::new(ExamplePayload { data: 10 })
type ExampleCommandPacket = CommandPacket<ExamplePayload>;
```
Encoding boils down to extending a vector at the end of the day, not super interesting. Here, encoding can never fail, but there are some cases where that isn't the case. Specifically in the case of `vex-v5-serial` encoding can fail when you attempt to encode a number larger than the 15bit integer limit as a [`VarU16`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/varint/struct.VarU16.html) or when you attempt to encode a `String` a string that is too large into one of the [many string types in the serial protocol](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/string/index.html).

## Packets

There are about 100 unique packets types, whether Brain or host bound. Because of that huge number, we keep all of our packets in submodules of a larger `packets` module. 

In the decoding and encoding example code, we saw the `ResponsePacket` and `CommandPacket` types. The equivalents of that type in `vex-v5-serial` for encoding and decoding are [`CdcReplyPacket`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/packets/cdc/struct.CdcReplyPacket.html), [`Cdc2ReplyPacket`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/packets/cdc2/struct.Cdc2ReplyPacket.html), [`CdcCommandPcket`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/packets/cdc/struct.CdcCommandPacket.html), and [`Cdc2CommandPacket`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/packets/cdc2/struct.Cdc2CommandPacket.html). The reason that there are 4 top level packet types is because of the two different packet categories in the serial protocol.

### CDC (simple) packets

Device bound CDC packets contain the device bound packet header (`[0xC9, 0x36, 0xB8, 0x47]`), a one byte ID unique to every CDC packet, and finally the payload data. Currently all supported CDC command packets do not have any payload data so they just end after the ID. One example of a CDC command packet is [`Query1Packet`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/packets/system/type.Query1Packet.html). It has an id of 33, so it would be encoded as `[0xC9, 0x36, 0xB8, 0x47, 0x21]`.

Host bound CDC packets contain a bit more info. They contain the host bound packet header (`[0xAA, 0x55]`), an ID, a variable width 15 bit integer (from now on I will refer to this type as a [`VarU16`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/varint/struct.VarU16.html)) storing the size of the payload, and the payload data. [`GetSystemVersionReplyPacket`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/packets/system/type.GetSystemVersionReplyPacket.html) is host bound CDC packet. This diagram shows the structure of the packet with reasonable byte values:

![GetSystemVersionReplyPacket structure](/blog/incoming_cdc.png)

`VarU16`s are stored in an interesting way. When the number stored in the `VarU16` is lower than 128, the number is stored as if it was a regular `u8`. However, when the number is larger than 128, it is stored in two bytes and the most significant bit is set to 1. The number 50 would be encoded in a `VarU16` as `0b00110010` taking up 8 bits, but 200 would be encoded as `0b1000000011001000` taking up 16 bits.

### CDC2 (extended) packets

CDC2 packets make up the vast majority of packet types. The biggest differences between CDC2 packets and CDC packets are that CDC2 packets include extended IDs and CRC16 checksums.

Device bound CDC2 packets contain the device bound packet header, a one byte ID which is the same for most CDC2 packets, a one byte 'extended' ID unique to each CDC2 packet type, a `VarU16` with the size of the payload, the payload bytes, and a CRC16 checksum of the entire packet. One simple CDC2 packet type is [`WriteKeyValuePacket`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/packets/kv/type.WriteKeyValuePacket.html). Its payload stores two strings, one for the key and the other for the value. This packet would look like this encoded:
| header           | ID   | Extended ID | Size | Key                 | Value         | CRC16    |
|------------------|------|-------------|------|---------------------|---------------|----------|
|`[C9, 36, B8, 47]`|`[56]`|`[2f]`       |`[08]`|`[f0, 9f, a4, 93, 0]`| `[68, 69, 00]`|`[a6, c0]`|

Host bound CDC2 packets are very similar with the addition of an ACK code just after the header.

## Connection

The connection module houses all of the low level communication with the brain over a serial or Bluetooth connection. The details of this code are not particularly interesting, but it's how we are able to send and receive bytes from the brain.
Currently we have a [`Connection`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/connection/trait.Connection.html) trait which provides a convenient API for communication with the Brain. You can send and receive packets, execute commands (see [the commands section](#commands)), and perform packet handshakes. A packet handshake is a convenient way to send a packet and receive a corresponding reply from the brain with a few added features like timeouts and retries.

You have three options when connecting to the Brain. You can find and open Bluetooth, serial, or generic connections. A generic connection represents a serial *or* Bluetooth connection.

## Commands

Commands are high level abstractions over common sequences of packet exchanges. A great example of this is the [`UploadProgram`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/commands/file/struct.UploadProgram.html) command. Uploading a program requires uploading two or three files depending on if you are uploading a monolith (uploading a file is a complicated task on its own), generating an INI config file with information about the program, compressing the program files with GZip, and finally sending multiple [`ExitFileTransferPacket`](https://docs.rs/vex-v5-serial/latest/vex_v5_serial/packets/file/type.ExitFileTransferPacket.html)s with different exit actions. Whew... Thats a lot.

Commands can save you a huge amount of time because all of that complicated logic is distilled down to a simple function call like this:
```rust
let mut connection = ...

connection
        .execute_command(UploadProgram {
            // Program upload configuration here ...
        })
        .await?;
``` 
That's certainly quite a bit easier than the several hundred lines of code that the `UploadProgram` and `UploadFile` commands take up.

# Future Plans

Right now we are only utilizing `vex-v5-serial` for `cargo-v5` but that will change soon!
We already have big plans for how we will use it in the future.

## `v5d` and `v5ctl`

In the future, we plan on using `vex-v5-serial` to implement a V5 Brain Daemon (`v5d`) which will allow sharing a connection with the brain. Multiple programs will be able to communicate with the brain even though only one program can connect to it at a time. `v5ctl` will be a general purpose CLI tool that supports most features of the V5 Serial protocol. Once `v5d` is finished, `cargo-v5` will be switched to using `v5d`. You can find the repo for both `v5d` and `v5ctl` [here](https://github.com/vexide/v5ctl).

## LemLink

LemLink is a project that is being developed by the LemLib and vexide teams. The current plan is for it to be backwards compatible with `pros-cli` but with better dependency management. It will also be implemented in terms of `v5d`. This will make it easier to run multiple LemLink commands simultaneously. The LemLink repo is [here](https://github.com/LemLib/LemLink).
