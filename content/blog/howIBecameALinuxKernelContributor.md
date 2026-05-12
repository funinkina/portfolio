---
title : 'Contributing to the Linux Kernel'
subtitle: 'How trying to fix a small issue on my laptop led me to contribute to the Linux kernel.'
date : '2026-05-10T23:27:20+05:30'
draft : true
tags : []
toc: true
next: true
image: ''
---

## How trying to fix a small issue on my laptop led me to contribute to the Linux kernel

I have been running Linux on my HP Pavilion Pro since 2022, and inevitably as with most Linux installations, somethings will not work well with your hardware. Initially there were a few things like the fingerprint scanner, and the mute LED on the function key gives a visual indication that the system audio has been muted. My knowledge on how to fix these kinds of issues were very limited back then, so I just decided to live with it. Over the years, the fingerprint scanner started working, thanks to the maintainer who worked on it. The only issue remaining was the mute LED, and with nothing better to do with my time, I decided to fix it myself.

## The main issue

So the F5 key on my laptop is also the volume button, it has an orange LED, that lights up based on mute state. Muted -> Orange Light. But due to some reason, on my Linux machine, the F5 key was muting/un-muting audio as expected, but the LED would never turn on regardless of the audio state.

## Beginning the search

The first obvious thing to do while debugging - do a web search. Which led to to this forum page: [Enabling Mute Fn Key LED on HP Laptop](https://bbs.archlinux.org/viewtopic.php?id=282568). Where other people with HP laptops had similar issue - the mute LED was not working.

This forum post has everything I needed to fix this issue.

## LEDs in the Linux Kernel

Every hardware on your machine is represented by a file by the Linux kernel, and that includes the mute LED as well. Checking the `/sys/class/leds/` shows all the available hardware LEDs on your system. This is an abstraction that lets any driver register a logical LED, regardless of what physically drives it — it could be a GPIO pin, a USB device, a PWM controller, or in my case a bit in an audio codec's register. Any LED registered here gets:

- A sysfs entry at `/sys/class/leds/<name>/brightness` *(write 0/1 to turn it off/on from userspace)*
- A trigger attribute — a named event source that drives the LED automatically. audio-mute is a built-in trigger that fires whenever the kernel's HDA layer reports a mute state change on the associated codec.

When the driver registers the LED with the `audio-mute` trigger, the LED subsystem takes full ownership. Now I never need to write to `brightness` myself — the kernel does it every time the mute state flips.

Now since my mute LED wasn't working, meaning I was missing the proper `mute` sysfs since I only had `input20::capslock` or `phy0-led`. For the mute led to work as expected, we have to define it as a proper device with the proper attributes. Let's get started on that.

## **Step 1**: Brute Forcing all the possible values

On the forum post mentioned above, I came accross this script, that will test each and every possible values that can be used to toggle the state of the LED.

```bash
#!/bin/bash

read -p "What's your sound card? Form /dev/snd/hwCxDx": card

echo "Testing GPIO pins, polarity 0"
for i in 0x01 0x02 0x04 0x08 0x10 0x20 0x40;
do
  sudo hda-verb $card 0x01 0x716 $i
  sudo hda-verb $card 0x01 0x717 $i
  sudo hda-verb $card 0x01 0x715 $i
  sleep 0.2
done
echo "Testing GPIO pins, polarity 1"
for i in 0x01 0x02 0x04 0x08 0x10 0x20 0x40;
do
  sudo hda-verb $card 0x01 0x716 $i 
  sudo hda-verb $card 0x01 0x717 $i
  sudo hda-verb $card 0x01 0x715 0x00
  sleep 0.2
done
echo "Testing COEF and INDEX"
start=0x1
end=0xff
for (( i=$start; i <=$end; ++i)); 
do
  for j in 0x1 0x2 0x4 0x8 0x10 0x20 0x40 0x80 0x100 0x200 0x400 0x800 0x1000 0x2000 0x4000 0x8000;
  do
    sudo hda-verb $card 0x20 0x500 $i
    sudo hda-verb $card 0x20 0x400 $j
    sleep 0.2
  done
done
```

This is a very simple bash script with 3 for loops, the most important command here is the hda-verb.

### What the hell is HDA?

HDA (High Definition Audio) is an Intel specification from 2004. It defines a controller (the PCH chip, mine: 8086:51c8) and one or more codecs connected to it over a dedicated serial link running at 6 or 12 MHz. In my laptop:

```bash
$ lspci | grep -i audio
00:1f.3 Multimedia audio controller: Intel Corporation Alder Lake PCH-P High Definition Audio Controller (rev 01)
```

This means that the laptop motherboard has an Intel PCH (Platform Controller Hub). You can think of it as the "hub" chip that manages everything that isn't the CPU itself: USB, storage, audio, etc. It has a small dedicated piece of silicon inside it specifically for audio. That piece is identified as 8086:51c8 (8086 = Intel's manufacturer ID, 51c8 = this specific audio controller model). But that Intel chip cannot produce sound on its own. It's just a controller, it manages data flow and communication. The actual audio work (converting digital signals to analog, amplifying the headphone output, routing signals to the right jacks) is done by a completely separate chip: the Realtek ALC245. Which we can check via:

```bash
$ cat /proc/asound/card0/codec#0 | head -3
Codec: Realtek ALC245
Address: 0
AFG Function Id: 0x1 (unsol 1)
```

So the audio pipeline is: **CPU** → **Intel PCH (controller)** → **Realtek ALC245 (codec)** → speakers/headphones/LED

### Communication between controller and codec

The Intel controller and the Realtek codec are physically connected on the motherboard by a small dedicated serial bus called the HDA link, running at around 6–12 MHz.
They communicate using 32-bit commands called verbs. The controller sends a verb, the codec executes it and optionally sends a response back. That's the entire communication protocol — there's nothing else. No shared memory, no DMA between them, just verb → response pairs over the physical connection.

You can think of it like sending text commands to a microcontroller over a serial port. `hda-verb` is literally a tool that lets you type those commands manually:

```bash
$ sudo hda-verb /dev/snd/hwC0D0 0x20 0x500 0x0b
nid = 0x20, verb = 0x500, param = 0xb
value = 0x0
```

### Inside the Codec: Nodes

The ALC245 is a collection of small functional blocks, each doing a different job. The HDA spec calls these nodes (or widgets), and each one has a number called its Node ID (NID).
To dump the full node map of the codec:

```bash
$ cat /proc/asound/card0/codec#0 | grep "Node\|wcaps"
Node 0x02 [Audio Output] wcaps 0x41d: Stereo Amp-Out
Node 0x03 [Audio Output] wcaps 0x41d: Stereo Amp-Out
Node 0x04 [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x05 [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x06 [Audio Output] wcaps 0x411: Stereo
Node 0x07 [Audio Input] wcaps 0x10051b: Stereo Amp-In
Node 0x08 [Audio Input] wcaps 0x10051b: Stereo Amp-In
Node 0x09 [Audio Input] wcaps 0x10051b: Stereo Amp-In
Node 0x0a [Audio Input] wcaps 0x10051b: Stereo Amp-In
Node 0x0b [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x0c [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x0d [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x0e [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x0f [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x10 [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x11 [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x12 [Pin Complex] wcaps 0x40040b: Stereo Amp-In
Node 0x13 [Pin Complex] wcaps 0x40040b: Stereo Amp-In
Node 0x14 [Pin Complex] wcaps 0x40058d: Stereo Amp-Out
Node 0x15 [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x16 [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x17 [Pin Complex] wcaps 0x40058d: Stereo Amp-Out
Node 0x18 [Pin Complex] wcaps 0x40048b: Stereo Amp-In
Node 0x19 [Pin Complex] wcaps 0x40048b: Stereo Amp-In
Node 0x1a [Pin Complex] wcaps 0x40048b: Stereo Amp-In
Node 0x1b [Pin Complex] wcaps 0x40058f: Stereo Amp-In Amp-Out
Node 0x1c [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x1d [Pin Complex] wcaps 0x400400: Mono
Node 0x1e [Pin Complex] wcaps 0x400501: Stereo
Node 0x1f [Vendor Defined Widget] wcaps 0xf00000: Mono
Node 0x20 [Vendor Defined Widget] wcaps 0xf00040: Mono
Node 0x21 [Pin Complex] wcaps 0x40058d: Stereo Amp-Out
Node 0x22 [Audio Mixer] wcaps 0x20010b: Stereo Amp-In
Node 0x23 [Audio Mixer] wcaps 0x20010b: Stereo Amp-In
Node 0x24 [Audio Selector] wcaps 0x300101: Stereo
Node 0x25 [Audio Selector] wcaps 0x300101: Stereo
```

**Some examples of what nodes do:**

- **NID 0x01**: the root node. Called the Audio Function Group. Every codec has exactly one. It's the entry point; you talk to it to reset the codec or get global info.
- **NID 0x02, 0x03**: DAC nodes (Digital to Analog Converter). They take the digital audio data from the controller and convert it into an analog signal.
- **NID 0x12, 0x13**: Pin complex nodes. These represent the physical jacks on your laptop — the headphone jack, the speakers, etc. Each pin node is wired to a physical connector on the board.
- **NID 0x20**: this one is special. It's not in the HDA spec at all.

Now that we have a basic understanding of the chips and codecs, let's analyse what the brute force script actually does.

## **Step 2**: Analysing the brute force script

The script first asks the sysfs location of your sound card, in my case it was `/dev/snd/hwC0D0`. The device file for card 0 (`C0`), codec 0 (`D0`)

The the script works in two phases, the first two 'for loops' are Phase - 1, GPIO registers. The last loop belongs to Phase - 2, COEF registers.
The script tests every possible combination for 0.2 seconds, and I had to hover my fingers above ctrl-c to stop the script the instant my LED turned on.

### Phase-1: GPIO Registers

*(verbs 0x715, 0x716, 0x717)*  
These are standard HDA verbs defined in the Intel spec for controlling physical GPIO pins directly on the codec. The script cycled through the enable mask (0x716), direction (0x717), and data (0x715) registers for each possible GPIO bit. On some HP models this is exactly how the LED works. On my system it had no effect, which means the LED isn't wired to a standard HDA GPIO, it's behind the Realtek vendor circuitry instead.

### Phase-2: COEF Registers

*(verbs 0x500 and 0x400)*  
This swept every COEF index (0x01 through 0xFF) and for each index tried every single bit position. The verb 0x500 (`SET_COEF_INDEX`) moves the codec's internal register pointer to a specific index. The verb 0x400 (`SET_PROC_COEF`) writes a value into whichever register the pointer is currently on. These two verbs always have to be sent as a pair — index first, then write — because the codec has only one read/write port shared across all COEF registers, and `SET_COEF_INDEX` is what steers it.

When it hit COEF index `0x0b` and wrote `0x08` (bit 3), **the LED turned on**. That tells me that inside the ALC245's vendor logic, COEF register 11 has at least one bit that's wired into the LED driver circuit. The register is likely a general-purpose control register, and bit 3 is mapped in Realtek's internal gate array to whatever transistor drives the LED.

## **Step 3**: Putting the values to work

As I mentioned above **NID 0x20** is not in the HDA spec, is a used propreiteraly by Realtek and is not even documented in any public Realtek datasheet.What the kernel community has built up over years is a table of empirically discovered mappings: "for codec X with subsystem Y, COEF index Z bit W controls feature V." Inside it is a bank of coefficient registers (COEFs): 256 numbered slots (index 0x00 through 0xFF), each holding a 16-bit value. The brute-force process is exactly how every entry in kernel's audio driver mute LED table was originally discovered and mapped.

These registers control all kinds of vendor-specific behavior that Realtek doesn't expose through standard HDA mechanisms: internal equalizer settings, noise cancellation, analog circuit biasing, GPIO pin routing, and most importantly what we need right now - LED control.

The way we access them is always a two-step process, because there's only one read/write port into the whole register bank:

- **Step 1** — point the cursor at the register you want (verb 0x500 = SET_COEF_INDEX):

```bash
sudo hda-verb /dev/snd/hwC0D0 0x20 0x500 0x0b
# "on node 0x20, set the COEF cursor to index 11 (0x0b)"
```

- **Step 2** — write a value into it (verb 0x400 = SET_PROC_COEF):

```bash
sudo hda-verb /dev/snd/hwC0D0 0x20 0x400 0x08
# "on node 0x20, write 0x08 into whatever index the cursor is pointing at"
```

Or read it back (verb `0x900` = `GET_PROC_COEF`):

```bash
sudo hda-verb /dev/snd/hwC0D0 0x20 0x500 0x0b  # set cursor first
sudo hda-verb /dev/snd/hwC0D0 0x20 0x900 0x00  # read it back
# value = 0x0  (or whatever is currently stored)
```

Always cursor first, then read/write. If you skip the cursor step, you're reading/writing whatever register was last pointed at — undefined behavior.

When we write `0x08` you're setting bit 3 (0-indexed) and clearing all others. The Realtek hardware reads this register and routes bit 3 to whatever internal logic drives the LED. Writing `0x00` clears bit 3, de-asserting the LED.
The raw assembly on the HDA link for `hda-verb /dev/snd/hwC0D0 0x20 0x500 0x0b` is a single 32-bit word:

```text
(codec_addr=0 << 28) | (nid=0x20 << 20) | (verb=0x500 << 8) | (param=0x0b)
= 0x0000_0000 | 0x0200_0000 | 0x0005_0000 | 0x0000_000b
= 0x0205_000b
```

And for the write: `0x02040008`. These two 32-bit words go over the serial link one after the other, and the ALC245's firmware interprets them as "set COEF cursor to index 11, then write 0x08 there."

![HDA Verb Format](/blog-assets/hda_verb_format.svg)
