---
title : 'Contributing to the Linux Kernel'
subtitle: 'How trying to fix a small issue on my laptop led me to contribute to the Linux kernel.'
date : '2026-05-10T23:27:20+05:30'
draft : true
tags : ['Linux', 'Kernel Development']
toc: true
next: true
image: '/blog-assets/kernel-contribution-header.png'
---

# How trying to fix a small issue on my laptop led me to contribute to the Linux kernel

![Header](/blog-assets/kernel-contribution-header.png)

I have been running Linux on my HP Pavilion Plus Laptop 14-eh0xxx since 2022, and inevitably, as with most Linux installations, some things will not work perfectly with your hardware.

Initially there were a few rough edges, like the fingerprint scanner and the mute LED on the function key. The mute button itself worked, but the small orange LED that should indicate the muted state did not. My knowledge on how to fix these kinds of issues was very limited back then, so I just decided to live with it.

Over the years, the fingerprint scanner started working, thanks to the maintainer who worked on it. The only issue remaining was the mute LED, and with nothing better to do with my time, I decided to fix it myself.

## The main issue

So the F5 key on my laptop is also the mute button. It has an orange LED that lights up based on the mute state. Muted -> orange light.

But for some reason, on my Linux machine, the F5 key was muting and unmuting audio as expected, while the LED would never turn on regardless of the audio state.

## Beginning the search

The first obvious thing to do while debugging: do a web search. That led me to this forum page: [Enabling Mute Fn Key LED on HP Laptop](https://bbs.archlinux.org/viewtopic.php?id=282568), where other people with HP laptops had a similar issue: the mute LED was not working.

This forum post has everything I needed to fix this issue.

## LEDs in the Linux Kernel

Many kernel-managed devices are exposed through files under `/dev`, `/proc`, or `/sys`. LEDs specifically are exposed through the LED class at `/sys/class/leds/`.

Checking `/sys/class/leds/` shows the hardware LEDs that the kernel knows about on your system. This is an abstraction that lets any driver register a logical LED, regardless of what physically drives it. It could be a GPIO pin, a USB device, a PWM controller, or, in my case, a bit in an audio codec's register. Any LED registered here gets:

- A sysfs entry at `/sys/class/leds/<name>/brightness` *(write 0/1 to turn it off/on from userspace)*
- A trigger attribute: a named event source that drives the LED automatically. `audio-mute` is a built-in trigger that fires whenever the kernel's HDA layer reports a mute state change on the associated codec.

When the driver registers the LED with the `audio-mute` trigger, the LED subsystem takes full ownership. Now I never need to write to `brightness` myself, because the kernel does it every time the mute state flips.

Since my mute LED was not working, my system did not have an `hda::mute` LED device under `/sys/class/leds/`. I only had entries like `input20::capslock` and `phy0-led`.

For the mute LED to work as expected, the kernel needs to know that this LED exists, how to control it, and that it should be connected to the audio mute state. Let's get started on that.

## Step 1: Brute Forcing the LED Values

On the forum post mentioned above, I came across this script, which tests possible values that may toggle the state of the LED.

```bash
#!/bin/bash

read -p "What's your sound card? Format /dev/snd/hwCxDx: " card

echo "Testing GPIO pins, polarity 0"
for i in 0x01 0x02 0x04 0x08 0x10 0x20 0x40;
do
  sudo hda-verb "$card" 0x01 0x716 $i
  sudo hda-verb "$card" 0x01 0x717 $i
  sudo hda-verb "$card" 0x01 0x715 $i
  sleep 0.2
done
echo "Testing GPIO pins, polarity 1"true
for i in 0x01 0x02 0x04 0x08 0x10 0x20 0x40;
do
  sudo hda-verb "$card" 0x01 0x716 $i
  sudo hda-verb "$card" 0x01 0x717 $i
  sudo hda-verb "$card" 0x01 0x715 0x00
  sleep 0.2
done
echo "Testing COEF and INDEX"
start=0x1
end=0xff
for (( i=$start; i <=$end; ++i));
do
  for j in 0x1 0x2 0x4 0x8 0x10 0x20 0x40 0x80 0x100 0x200 0x400 0x800 0x1000 0x2000 0x4000 0x8000;
  do
    sudo hda-verb "$card" 0x20 0x500 $i
    sudo hda-verb "$card" 0x20 0x400 $j
    sleep 0.2
  done
done
```

This is a very simple bash script with three for loops. The most important command here is `hda-verb`.

### What the hell is HDA?

HDA (High Definition Audio) is an Intel specification from 2004. It defines a controller (the PCH chip, mine: `8086:51c8`) and one or more codecs connected to it over a dedicated serial link running at 6 or 12 MHz. In my laptop:

```bash
$ lspci | grep -i audio
00:1f.3 Multimedia audio controller: Intel Corporation Alder Lake PCH-P High Definition Audio Controller (rev 01)
```

You can read more about HDA at [Intel's High Definition Audio Specification](https://www.intel.com/content/dam/www/public/us/en/documents/product-specifications/high-definition-audio-specification.pdf)

This means that the laptop motherboard has an Intel PCH (Platform Controller Hub). You can think of it as the "hub" chip that manages everything that is not the CPU itself: USB, storage, audio, etc.

It has a small dedicated piece of silicon inside it specifically for audio. That piece is identified as `8086:51c8` (`8086` = Intel's manufacturer ID, `51c8` = this specific audio controller model). But that Intel chip cannot produce sound on its own. It is just a controller, and it manages data flow and communication.

The actual audio work (converting digital signals to analog, amplifying the headphone output, routing signals to the right jacks) is done by a completely separate chip: the Realtek ALC245. We can check that with:

```bash
$ cat /proc/asound/card0/codec#0 | head -5
Codec: Realtek ALC245
Address: 0
AFG Function Id: 0x1 (unsol 1)
Vendor Id: 0x10ec0245
Subsystem Id: 0x103c8a36
```

So the audio pipeline is: **CPU** → **Intel PCH (controller)** → **Realtek ALC245 (codec)** → speakers/headphones/LED

The `Vendor Id` tells us that this is a Realtek ALC245 codec. The `Subsystem Id` is also important. `0x103c` is HP's vendor ID, and `0x8a36` identifies this specific HP board/model combination. This value becomes the key to the final kernel patch later.

### Communication between controller and codec

The Intel controller and the Realtek codec are physically connected on the motherboard by a small dedicated serial bus called the HDA link, running at around 6-12 MHz.

They communicate using 32-bit commands called verbs. The controller sends a verb, the codec executes it, and optionally sends a response back. That's the communication protocol: verb → response pairs over the physical connection.

You can think of it like sending text commands to a microcontroller over a serial port. `hda-verb` is literally a tool that lets you type those commands manually:

```bash
$ sudo hda-verb /dev/snd/hwC0D0 0x20 0x500 0x0b
nid = 0x20, verb = 0x500, param = 0xb
value = 0x0
```

### Inside the Codec: Nodes

The ALC245 is a collection of small functional blocks, each doing a different job. The HDA spec calls these nodes, or widgets, and each one has a number called its Node ID (NID).
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
- **NID 0x12, 0x13**: Pin complex nodes. These represent the physical jacks on your laptop, like the headphone jack, the speakers, etc. Each pin node is wired to a physical connector on the board.
- **NID 0x20**: this one is special. It's not in the HDA spec at all.

Now that we have a basic understanding of the chips and codecs, let's analyse what the brute force script actually does.

## Step 2: Analysing the Brute Force Script

The script first asks for the hardware device node of your sound card. In my case it was `/dev/snd/hwC0D0`, which means card 0 (`C0`), codec 0 (`D0`).

The script works in two phases. The first two for loops are Phase 1, GPIO registers. The last loop is Phase 2, COEF registers.

The script tests each candidate bit/value for 0.2 seconds, and I had to hover my fingers above Ctrl-C to stop the script the instant my LED turned on.

### Phase-1: GPIO Registers

*(verbs `0x715`, `0x716`, `0x717`)*

These are standard HDA verbs defined in the Intel spec for controlling physical GPIO pins directly on the codec. The script cycled through the enable mask (`0x716`), direction (`0x717`), and data (`0x715`) registers for each possible GPIO bit.

On some HP models this is exactly how the LED works. On my system it had no effect, which means the LED is not wired to a standard HDA GPIO. It is behind the Realtek vendor circuitry instead.

### Phase-2: COEF Registers

*(verbs `0x500` and `0x400`)*

This swept every COEF index (`0x01` through `0xFF`) and, for each index, tried every single bit position. The verb `0x500` (`SET_COEF_INDEX`) moves the codec's internal register pointer to a specific index. The verb `0x400` (`SET_PROC_COEF`) writes a value into whichever register the pointer is currently on.

These two verbs always have to be sent as a pair: index first, then write. The codec has one read/write port shared across all COEF registers, and `SET_COEF_INDEX` is what steers that port to the register we want.

When it hit COEF index `0x0b` and wrote `0x08` (bit 3), **the LED turned on**. That tells me that inside the ALC245's vendor logic, COEF register 11 has at least one bit that's wired into the LED driver circuit. The register is likely a general-purpose control register, and bit 3 is mapped in Realtek's internal gate array to whatever transistor drives the LED.

## Step 3: Putting the Values to Work

As I mentioned above, **NID `0x20`** is not part of the standard HDA spec. It is a Realtek vendor-defined node, and it is not documented in any public Realtek datasheet.

Inside it is a bank of coefficient registers (COEFs): 256 numbered slots (`0x00` through `0xFF`), each holding a 16-bit value. What the kernel community has built up over years is a table of empirically discovered mappings: "for codec X with subsystem Y, COEF index Z bit W controls feature V."

The brute-force process is exactly how many entries in the kernel's audio driver mute LED table were originally discovered and mapped.

These registers control all kinds of vendor-specific behavior that Realtek does not expose through standard HDA mechanisms: internal equalizer settings, noise cancellation, analog circuit biasing, GPIO pin routing, and most importantly what we need right now: LED control.

The way we access them is always a two-step process, because there's only one read/write port into the whole register bank:

- **Step 1**: point the cursor at the register you want (verb `0x500` = `SET_COEF_INDEX`):

```bash
sudo hda-verb /dev/snd/hwC0D0 0x20 0x500 0x0b
# "on node 0x20, set the COEF cursor to index 11 (0x0b)"
```

- **Step 2**: write a value into it (verb `0x400` = `SET_PROC_COEF`):

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

Always cursor first, then read/write. If you skip the cursor step, you are reading or writing whatever register was last pointed at, which is not what we want.

When we write `0x08`, we are setting bit 3 (0-indexed) and clearing all others. The Realtek hardware reads this register and routes bit 3 to whatever internal logic drives the LED. Writing `0x00` clears bit 3, turning the LED off.
The raw assembly on the HDA link for `hda-verb /dev/snd/hwC0D0 0x20 0x500 0x0b` is a single 32-bit word:

```text
(codec_addr=0 << 28) | (nid=0x20 << 20) | (verb=0x500 << 8) | (param=0x0b)
= 0x0000_0000 | 0x0200_0000 | 0x0005_0000 | 0x0000_000b
= 0x0205_000b
```

And for the write: `0x02040008`. These two 32-bit words go over the serial link one after the other, and the ALC245's firmware interprets them as "set COEF cursor to index 11, then write 0x08 there."

![HDA Verb Format](/blog-assets/hda_verb_format.svg)

At this point I knew the hardware-level control path:

- Codec: Realtek ALC245
- Vendor node: `0x20`
- COEF index: `0x0b`
- LED bit/value: `0x08`
- Off value: `0x00`
- Subsystem ID: `0x103c8a36`

The remaining problem was not discovering the LED anymore. It was teaching the kernel that my specific laptop model should use the already-existing ALC245 mute LED fixup.

## Step 4: Finding Where the Kernel Handles This

The Linux kernel's HDA driver has two broad pieces involved here:

- `snd-hda-intel`: the generic Intel HDA controller driver
- `snd-hda-codec-realtek`: the Realtek codec driver

The Intel controller driver knows how to talk over the HDA link, but it does not know every strange Realtek laptop-specific wiring detail. Those details live in the Realtek codec driver, mainly in:

```text
sound/hda/codecs/realtek/alc269.c
```

That file contains the Realtek-specific fixups. A fixup is basically a small correction the kernel applies for a specific codec, laptop, or board. This is needed because the same Realtek ALC245 codec can be used in many laptops, and each manufacturer can wire LEDs, amplifiers, microphones, and speakers differently.

To find my codec and subsystem ID, I used:

```bash
$ cat /proc/asound/card0/codec#0 | head -5
Codec: Realtek ALC245
Address: 0
AFG Function Id: 0x1 (unsol 1)
Vendor Id: 0x10ec0245
Subsystem Id: 0x103c8a36
```

Briefly:

- `0x10ec0245` means Realtek ALC245.
- `0x103c8a36` means HP subsystem `0x8a36`.
- `0x103c` is HP's vendor ID.

Then I searched inside `alc269.c` for existing ALC245 mute LED fixups:

```bash
grep -n "ALC245_FIXUP_HP_MUTE_LED\|alc245_fixup_hp_mute\|8a36" alc269.c
```

This showed that the kernel already had a function named `alc245_fixup_hp_mute_led_coefbit`, and it already knew how to control the mute LED using the same COEF mechanism I discovered manually.

So the kernel did not need a brand new driver. It only needed one more entry saying: "this HP laptop also uses that existing fixup."

### How `SND_PCI_QUIRK` and the quirk table work

`SND_PCI_QUIRK` is a macro that initializes a struct snd_pci_quirk:

```c
/* from include/sound/core.h */
struct snd_pci_quirk {
    unsigned short subvendor;  /* PCI subsystem vendor ID */
    unsigned short subdevice;  /* PCI subsystem device ID */
    const char *name;          /* human-readable, appears in dmesg */
    int value;                 /* which fixup to apply (enum value) */
};

#define SND_PCI_QUIRK(vend, dev, name, val) \
    { .subvendor = (vend), .subdevice = (dev), \
      .name = (name), .value = (val) }
```

So the patch line:

```c
SND_PCI_QUIRK(0x103c, 0x8a36, "HP Pavilion Plus 14-eh0xxx", ALC245_FIXUP_HP_MUTE_LED_COEFBIT),
```

expands to a struct literal `{ .subvendor=0x103c, .subdevice=0x8a36, .name="HP Pavilion Plus 14-eh0xxx", .value=ALC245_FIXUP_HP_MUTE_LED_COEFBIT }` inserted into the `alc245_fixup_tbl[]` array. The array is terminated by an entry with subvendor=0.
At boot, `snd_pci_quirk_lookup()` in `sound/core/misc.c` does a linear scan:

```c
const struct snd_pci_quirk *snd_pci_quirk_lookup(struct pci_dev*pci,
                                                   const struct snd_pci_quirk *list)
{
    const struct snd_pci_quirk*q;
    for (q = list; q->subvendor; q++) {
        if (q->subvendor != pci->subsystem_vendor)
            continue;
        if (!q->subdevice || q->subdevice == pci->subsystem_device)
            return q;
    }
    return NULL;
}
```

The `pci->subsystem_vendor` and `pci->subsystem_device` fields come from the PCI configuration space (offsets `0x2C` and `0x2E`), which the BIOS populates with the values HP programmed into the device at the factory. That's where 0x103c:0x8a36 lives — burned into the PCI config space of the Intel PCH audio controller on my laptop's board. The lookup returns the first matching struct, and the value field (the enum index) is used to look up the actual fixup function.

## Step 5: The Actual Patch

The patch was just one line:

```c
SND_PCI_QUIRK(0x103c, 0x8a36, "HP Pavilion Plus 14-eh0xxx", ALC245_FIXUP_HP_MUTE_LED_COEFBIT),
```

This line goes into the ALC245 quirk table in `sound/hda/codecs/realtek/alc269.c`, sorted among the other HP subsystem IDs.

Breaking it down:

- `0x103c`: HP's PCI subsystem vendor ID
- `0x8a36`: my laptop's subsystem device ID
- `"HP Pavilion Plus 14-eh0xxx"`: a human-readable model name
- `ALC245_FIXUP_HP_MUTE_LED_COEFBIT`: the existing kernel fixup that knows how to control this mute LED

The macro expands into a small table entry. During boot, the HDA driver checks the subsystem ID of the audio device. If it sees `0x103c:0x8a36`, it now selects `ALC245_FIXUP_HP_MUTE_LED_COEFBIT`.

That fixup tells the Realtek driver:

- use vendor node `0x20`
- use COEF index `0x0b`
- use mask/value `0x08`
- register the LED as an HDA mute LED
- connect it to the kernel's audio mute trigger

So before the patch, the kernel could mute and unmute audio, but it did not know that this laptop had a mute LED connected through that Realtek COEF bit.

After the patch, the kernel recognizes the laptop, registers the proper LED device under `/sys/class/leds/`, and automatically updates the LED when the mute state changes.

## Step 6: Testing the Result

After rebuilding and booting into the patched kernel, I checked whether the LED appeared:

```bash
$ ls /sys/class/leds/ | grep -i mute
hda::mute
```

Then I toggled mute:

```bash
pactl set-sink-mute @DEFAULT_SINK@ toggle
```

And finally, the tiny orange LED on F5 did exactly what it was supposed to do.

No background script. No polling. No manually writing `hda-verb` values. The kernel now owns it properly.

## Wrapping it up

### The fixup chain: from boot to a working LED

Here's the sequence that happens every time the kernel loads the driver:

1. The HDA core enumerates the codec, reads Vendor ID `0x10ec0245`, and calls `patch_realtek()` in `patch_realtek.c`.

2. `patch_realtek()` identifies this as an ALC245 and calls `alc245_parse_auto_config()`, which among other things calls `snd_pci_quirk_lookup()` against the `alc245_fixup_tbl[]` table using the PCH's PCI subsystem IDs.

3. The lookup matches `0x103c:0x8a36` and returns the entry with value `ALC245_FIXUP_HP_MUTE_LED_COEFBIT`.

4. The fixup system calls the associated function `alc245_fixup_hp_mute_led_coefbit()` at action `HDA_FIXUP_ACT_PRE_PROBE`. This function does:

    ```c
    static void alc245_fixup_hp_mute_led_coefbit(struct hda_codec *codec,
                                                const struct hda_fixup *fix,
                                                int action)
    {
        struct alc_spec *spec = codec->spec;
        if (action == HDA_FIXUP_ACT_PRE_PROBE) {
            spec->mute_led_coef.nid  = 0x20;   /* vendor node */
            spec->mute_led_coef.idx  = 0x0b;   /* COEF index 11 */
            spec->mute_led_coef.mask = 0x0008; /* bitmask for LED bit */
            spec->mute_led_coef.on   = 0x0008; /* value when muted (LED on) */
            spec->mute_led_coef.off  = 0x0000; /* value when unmuted (LED off) */
            snd_hda_gen_add_mute_led_cdev(codec, coef_mute_led_set);
        }
    }
    ```

5. `snd_hda_gen_add_mute_led_cdev()` calls `devm_led_classdev_register()`, which creates `/sys/class/leds/hda::mute` and attaches the `audio-mute` trigger to it. The `coef_mute_led_set` function pointer is stored as the LED's `brightness_set` callback.

6. From this point on: when PipeWire or any audio stack toggles the mute state, the HDA core updates its internal mute flag and notifies the `audio-mute` trigger. The trigger calls `brightness_set` → `coef_mute_led_set` → which sends exactly the two verbs you discovered by hand:

```text
SET_COEF_INDEX(0x0b) then SET_PROC_COEF(0x0008 or 0x0000)
```

![Mute Signal Path](/blog-assets/mute_led_signal_path.svg)

The kernel now owns this entirely. No daemon, no polling, no race conditions.
