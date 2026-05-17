---
title : 'Reverse Engineering A Printer Driver For Linux'
subtitle: 'How I made a printer whose driver was exclusively for windows work on Linux.'
date : '2026-05-17T02:40:34+05:30'
draft : true
tags : []
toc: true
next: true
image: '/blog-assets/printer_driver_header.png'
---

## Context

I have this **Ricoh SP 200** printer — a simple, affordable black-and-white laser printer. The issue is that the official drivers are only available for Windows. CUPS on Linux is excellent and supports most printers out of the box, so naturally I tried everything: foo2zjs, OpenPrinting, HPLIP, Gutenprint. Nothing. This printer is truly one of a kind in the worst possible way.

My only option was a Windows VM with USB passthrough, which worked but required booting into a VM just to print something. So I decided to take matters into my own hands and write the driver myself. How hard could it be?

## The Approach

Since the printer only connects over USB, I had two paths:

- **Capture USB traffic** while the Windows driver prints, and reverse-engineer the protocol from the wire.
- **Disassemble the Windows driver** with something like Ghidra.

A signed, packaged Windows driver might be obfuscated, and decompiling a large driver binary is a significant effort. USB traffic, on the other hand, is plaintext on the wire — the printer speaks some protocol, and the driver is just sending bytes. I decided to start with capture.

## Capturing the Traffic

On Windows, there's a tool called **USBPcap** that hooks into the USB stack and captures all transfers to and from a selected device. It's CLI-based: run it, pick the USB host controller that your printer is on, start capture, print something, stop. It hands you a `.pcap` file that Wireshark understands natively.

I booted the Windows VM, attached the printer, installed USBPcap, and printed a single-page PDF — my own resume. Then I pulled the capture file over to my Linux machine and opened it in Wireshark.

## First Look: The Single-Page Capture

The raw capture has a lot of noise — USB control transfers, device enumeration, interrupt transfers for status polling. I only care about bulk transfers going *to* the printer (host → device direction). In Wireshark's filter bar:

```
usb.transfer_type == 0x03 && usb.endpoint_address.direction == 0
```

`transfer_type == 0x03` means bulk, and `direction == 0` (OUT) means host-to-printer. Running the same filter with `tshark` on the command line gives a clean view:

```
$ tshark -r ricoh.pcap -Y "usb.transfer_type == 0x03 && usb.endpoint_address.direction == 0"

  19  58.923040  host → 1.3.1  USB 65563 URB_BULK out
  20  59.151066  1.3.1 → host  USB    27 URB_BULK out
  21  59.151359  host → 1.3.1  USB 59703 URB_BULK out
  22  59.189228  1.3.1 → host  USB    27 URB_BULK out
```

Frames 20 and 22 are the printer's ACK responses (27-byte URB headers, no data). The real action is in frames **19** and **21**: **two bulk OUT transfers, 65,536 and 59,676 bytes** of actual payload, respectively. One page of printing produces about 125 KB of data over USB.

## Decoding the First Packet

The first thing to do with an unknown binary format is run `strings` on it and see what comes out. Extracting the raw payloads from both transfers:

```
$ tshark -r ricoh.pcap \
    -Y "usb.transfer_type == 0x03 && usb.endpoint_address.direction == 0" \
    -T fields -e usb.capdata \
    | while read hex; do echo "$hex" | xxd -r -p | strings; done
```

Output (printable strings extracted from binary):

```
%-12345X@PJL
@PJL SET TIMESTAMP=2026/05/14 12:54:44
@PJL SET FILENAME=Aryan Kushwaha Resume - AryanKushwaha_Resume.pdf
@PJL SET COMPRESS=JBIG
@PJL SET USERNAME=archputer
@PJL SET COVER=OFF
@PJL SET HOLD=OFF
@PJL SET PAGESTATUS=START
@PJL SET COPIES=1
@PJL SET MEDIASOURCE=TRAY1
@PJL SET MEDIATYPE=PLAINRECYCLE
@PJL SET PAPER=A4
@PJL SET PAPERWIDTH=4961
@PJL SET PAPERLENGTH=7016
@PJL SET RESOLUTION=600
@PJL SET IMAGELEN=65556
[binary data ...]
@PJL SET DOTCOUNT=2168280
@PJL SET PAGESTATUS=END
@PJL EOJ
%-12345X
```

That's immediately recognizable. `%-12345X` is the **Universal Exit Language (UEL)** sequence — it's the standard "wake up the printer" prefix used by HP-derived print protocols. `@PJL` is **Printer Job Language**, a text-based meta-layer that wraps print data and carries job settings. The printer is speaking PJL.

This is a much better starting point than I expected. No proprietary binary format, no obfuscation — just text commands followed by compressed image data.

## What the PJL Header Tells Us

Working through the commands one by one:

| Command | Meaning |
|---|---|
| `ESC%-12345X@PJL\r\n` | UEL + enter PJL mode |
| `TIMESTAMP=2026/05/14 12:54:44` | Job timestamp |
| `FILENAME=...pdf` | Source filename |
| `COMPRESS=JBIG` | Compression format used for image data |
| `USERNAME=archputer` | Submitting user |
| `COVER=OFF`, `HOLD=OFF` | Job options (cover sheet, secure hold) |
| `PAGESTATUS=START` | Begin page 1 |
| `COPIES=1` | Print one copy |
| `MEDIASOURCE=TRAY1` | Paper from tray 1 |
| `MEDIATYPE=PLAINRECYCLE` | Media type |
| `PAPER=A4` | Paper size name |
| `PAPERWIDTH=4961` | Width in pixels at 600 dpi (A4 = 210 mm → 4961 px) |
| `PAPERLENGTH=7016` | Height in pixels at 600 dpi (A4 = 297 mm → 7016 px) |
| `RESOLUTION=600` | 600 dpi |
| `IMAGELEN=65556` | Compressed image data size that follows |

The `COMPRESS=JBIG` line was the key discovery. **JBIG** (Joint Bi-level Image Experts Group) is an international standard for compressing binary images — ITU-T T.82, finalized in 1993. It's designed precisely for this: monochrome laser printer output at high resolution. I had initially guessed the printer might use **HBPL2** (used by many other Ricoh printers in foo2zjs), but grepping for `HBPL` in the raw stream finds nothing. This is pure PJL + JBIG1.

## The JBIG BIE Header

Immediately after the `IMAGELEN=65556\r\n` text, the binary image data begins. Looking at those bytes in the hex dump:

```
$ tshark -r ricoh.pcap -Y "frame.number == 19" -x | grep -A1 "65556"

01d0  36 35 35 35 36 0d 0a 00 00 01 00 00 00 13 61 00   65556.........a.
01e0  00 1b 68 00 00 00 80 00 00 03 48 04 c0 32 87 e8   ..h.......H..2..
```

After the `\r\n` terminator of the IMAGELEN command, the 20-byte **JBIG1 BIE (Bi-level Image Entity) header** starts:

```
00 00 01 00  00 00 13 61  00 00 1b 68  00 00 00 80  00 00 03 48
```

The JBIG1 BIE header format (ITU-T T.82, §6.2.1):

| Bytes | Value | Field | Meaning |
|---|---|---|---|
| 0 | `00` | DL | Lowest resolution layer = 0 |
| 1 | `00` | D | Number of differential layers = 0 (direct single-resolution) |
| 2 | `01` | P | Number of image planes = 1 (monochrome) |
| 3 | `00` | — | Reserved |
| 4–7 | `00 00 13 61` | Xd | Image width = **4961 px** (A4 at 600 dpi) |
| 8–11 | `00 00 1b 68` | Yd | Image height = **7016 px** (A4 at 600 dpi) |
| 12–15 | `00 00 00 80` | L0 | Stripe height = **128 lines** |
| 16 | `00` | Mx | Adaptive template pixel offset = 0 |
| 17 | `00` | Dmax | Maximum number of differential layers = 0 |
| 18 | `03` | order | JBIG ordering flags |
| 19 | `48` | options | JBIG encoding options |

I initially assumed those 20 bytes were a proprietary Ricoh header on top of the JBIG stream. They're not — it's a completely standard BIE header. The 4961 and 7016 values confirmed it: A4 paper at 600 dpi is exactly 210 mm × (600/25.4) = 4961 pixels wide, and 297 mm × (600/25.4) = 7016 pixels tall.

Bytes 18 and 19 — the `order` and `options` flags — turned out to be important later. I noted their exact values: `0x03` and `0x48`.

## My Initial Hypothesis Was Wrong

My first assumption before even looking at the capture was that this printer used the same protocol as other Ricoh/Gestetner printers supported by foo2zjs — specifically the **HBPL2** (Host-Based Printer Language 2) format. HBPL2 is what `foo2hbpl2` implements.

After extraction I grepped the entire raw binary stream for `HBPL`:

```
$ tshark -r ricoh.pcap -T fields -e usb.capdata | xxd -r -p | grep -a "HBPL"
(no output)
```

Nothing. And searching the jbigkit source, the JBIG compression algorithm is documented in ITU-T T.82 — a public standard with publicly available implementations. The `jbigkit` library (`libjbig`) implements it exactly. So I had a complete picture: **PJL header → JBIG1 BIE → implement with jbigkit → done**. Or so I thought.

## Building the First Driver

Armed with the protocol understanding, I started writing a CUPS filter. A CUPS filter reads a raster page stream from stdin (provided by CUPS) and writes the printer's native format to stdout. The filter chain is:

```
PDF/PostScript → ghostscript → CUPS raster → [our filter] → PJL+JBIG1 → USB
```

The filter needs:
1. `libcups` / `libcupsimage` — to read the CUPS raster stream
2. `libjbig` (jbigkit) — to JBIG-encode each page's raster bitmap

The basic structure:

```c
cups_raster_t *ras = cupsRasterOpen(0, CUPS_RASTER_READ);
cups_page_header2_t hdr;

write_job_header(copies);

while (cupsRasterReadHeader2(ras, &hdr)) {
    unsigned char *bmp = malloc(hdr.cupsBytesPerLine * hdr.cupsHeight);
    for (unsigned y = 0; y < hdr.cupsHeight; y++)
        cupsRasterReadPixels(ras, bmp + y * hdr.cupsBytesPerLine, hdr.cupsBytesPerLine);
    encode_and_send_page(bmp, hdr.cupsWidth, hdr.cupsHeight);
    free(bmp);
}

fputs("@PJL EOJ\r\n\x1b%-12345X\r\n", stdout);
```

I registered the printer with CUPS using `lpadmin`, set up a minimal PPD file, and tried to print.

The printer made no sound whatsoever. No motor spin, no LED activity. The job silently disappeared.

## Bug 1: The Missing Bare `@PJL` Line

I stared at the hex dump of my driver's output versus the captured Windows driver output for a while before spotting the difference. My driver emitted:

```
ESC%-12345X@PJL SET TIMESTAMP=...
```

The Windows driver emitted:

```
ESC%-12345X@PJL\r\n
@PJL SET TIMESTAMP=...
```

Notice the `@PJL\r\n` *on its own line*, immediately after the UEL. This is a bare PJL "enter PJL mode" command with no arguments. Without it, the printer's firmware apparently never transitions into PJL command-parsing mode and drops the entire job silently.

After looking it up, this appears to be a quirk of the Ricoh firmware's PJL parser: the UEL and the first PJL command must be on separate lines. Most PJL documentation mentions the bare `@PJL` as optional, but for this firmware it's required.

Fix:

```c
fputs("\x1b%-12345X@PJL\r\n", stdout);
// Now emit the actual SET commands
```

After the fix: the printer's motor spun up, the LED flashed, the page feed mechanism started... and then stopped. The printer initialised but never pulled the paper.

## Bug 2: The Missing `PAPERLENGTH`

I went back to the hex dump. My driver's PJL header included `PAPERWIDTH=4961` — I had that. But I had omitted `PAPERLENGTH=7016`, thinking width alone would be enough to define A4.

The Windows capture has both:

```
@PJL SET PAPERWIDTH=4961
@PJL SET PAPERLENGTH=7016
```

Without `PAPERLENGTH`, the printer's print engine initialises (it has enough to set its page buffer width) but never gets the page *length* it needs to know when to stop pulling paper. The firmware just sits there waiting for a length it will never receive.

Fix: emit both dimensions every page.

After the fix: the motor ran, the paper fed all the way through, and I got a page out of the printer. It was completely blank.

## Bug 3: The Wrong JBIG Options Byte

A blank output page means the printer received and understood the job structure, but the image data itself was malformed or misinterpreted. I had my JBIG encoding wrong somewhere.

The jbigkit API requires setting encoding options before calling `jbg_enc_out()`:

```c
jbg_enc_init(&enc, w, h, 1, planes, callback, &buf);
jbg_enc_options(&enc, order, options, l0, mx, dmax);
jbg_enc_out(&enc);
```

Looking at the captured BIE header: byte 18 = `0x03` (order), byte 19 = `0x48` (options). My first attempt had used `jbg_enc_options(&enc, 0x03, 0x08, 128, 0, 0)`, guessing `0x08` for options because that's a common JBIG option for "no TPDON" (typical prediction disabled).

The jbigkit 2.1 source reveals that `jbg_enc_options()` stores the `options` argument **directly** into BIE byte 19, with no bit translation. So whatever value I pass for options is what appears verbatim in the BIE header. Passing `0x08` produces byte 19 = `0x08`. The Windows driver produces `0x48`.

`0x48` in binary is `0100 1000`. The JBIG1 options byte bits are:
- Bit 6 (`0x40`): `LRLTWO` — use two-line template for low-resolution layer
- Bit 3 (`0x08`): `TPDON` — typical prediction for differential layers

The Windows driver uses `LRLTWO | TPDON = 0x40 | 0x08 = 0x48`. My driver was sending `0x08` (TPDON only, no LRLTWO). The printer's decoder expected `0x48` and produced no output when the options byte didn't match what it anticipated.

Fix:

```c
jbg_enc_options(&enc, 0x03, 0x48, 128, 0, 0);
```

After the fix: the printer produced a page with *something* on it, but the image was scrambled — misaligned stripes, random black bands. Wrong data, not wrong format.

## Bug 4: CUPS Delivering 8-bit Grayscale Instead of 1-bit Packed

My PPD file at this point was minimal — just enough to register the printer. It didn't tell CUPS what pixel format to deliver to my filter. CUPS defaulted to **8-bit grayscale** (one byte per pixel).

My filter read `hdr.cupsBitsPerPixel` but then calculated the row stride as `(width + 7) / 8`, assuming 1-bit packed data. With 8-bit grayscale, the actual row is `width` bytes wide — eight times what I expected. I was reading every 8th pixel's byte and passing a far-too-narrow bitmap to jbigkit. The JBIG stream was internally valid but encoded the wrong slice of the image.

For a laser printer filter, the correct format is `CUPS_CSPACE_K` (black channel), 1 bit per pixel, packed 8 pixels per byte. The PPD must declare this explicitly:

```ppd
*cupsBitsPerColor: 1
*cupsColorSpace: 3
*cupsCompression: 0
```

`ColorSpace 3` is `CUPS_CSPACE_K` — the black channel, where `1` means black and `0` means white (the opposite of typical grayscale). The filter also needed to use `hdr.cupsBytesPerLine` from the raster header (the actual stride as CUPS computed it) rather than manually calculating `(bpp * w + 7) / 8`, which can diverge due to row padding.

After adding the PPD directives and fixing the stride:

**First successful page print.** A clean, readable printout from Linux, no VM required.

I sent a test page with `echo "Hello from Linux" | lpr -P Ricoh_SP_200_DDST` and watched a printed page come out. A single page. Now let me try a multi-page document.

## The Multi-Page Problem

I printed a two-page PDF. The first page came out fine. The second page never arrived. The printer sat idle, then eventually printed nothing and went back to ready. Job complete according to CUPS, but only one page on the tray.

No error messages. No LED codes. The printer just... dropped page 2 silently.

My first assumption: maybe the JBIG stream for page 2 was malformed. I added debug logging and verified the JBIG encoding was running correctly for both pages — jbigkit encoded two valid BIE streams. Both had correct dimensions and the right options bytes. The data looked fine.

My second assumption: maybe the loop wasn't iterating for page 2. I added a `fprintf(stderr, "PAGE: %d\n", page)` and saw both pages being processed. The filter was reading and encoding both pages correctly. But only one was printing.

The problem had to be in the *protocol* — something in the PJL framing between pages. I needed another capture.

## Second Capture: A Multi-Page Job

I went back to the Windows VM and printed a two-page document, this time capturing with USBPcap from the start. Importing the capture and running the same tshark filter:

```
$ tshark -r ricoh_capture.pcap \
    -Y "usb.transfer_type == 0x03 && usb.endpoint_address.direction == 0"

  19  10.184667  host → 1.3.1  USB 65563 URB_BULK out
  20  10.429456  1.3.1 → host  USB    27 URB_BULK out
  21  10.430073  host → 1.3.1  USB 65563 URB_BULK out
  22  10.481597  1.3.1 → host  USB    27 URB_BULK out
  23  10.482111  host → 1.3.1  USB 24937 URB_BULK out
  24  10.504719  1.3.1 → host  USB    27 URB_BULK out
```

Three bulk OUT transfers (frames 19, 21, 23), each followed by a printer ACK. The single-page job used two transfers totalling ~125 KB. This two-page job uses three transfers: **65,536 + 65,536 + 24,910 = 155,982 bytes**.

## Extracting the Full Multi-Page Protocol

Running the same strings extraction on the three-frame sequence reveals the complete two-page protocol, with binary JBIG data replaced by `[... N bytes JBIG ...]` for readability:

```
$ tshark -r ricoh_capture.pcap \
    -Y "usb.transfer_type == 0x03 && usb.endpoint_address.direction == 0" \
    -T fields -e usb.capdata \
    | while read hex; do echo "$hex" | xxd -r -p | strings -n 6; done
```

```
%-12345X@PJL
@PJL SET TIMESTAMP=2026/05/15 01:07:17
@PJL SET FILENAME=Guide to Finding Articles_Books.pdf
@PJL SET COMPRESS=JBIG
@PJL SET USERNAME=archputer
@PJL SET COVER=OFF
@PJL SET HOLD=OFF
@PJL SET PAGESTATUS=START
@PJL SET COPIES=1
@PJL SET MEDIASOURCE=TRAY1
@PJL SET MEDIATYPE=PLAINRECYCLE
@PJL SET PAPER=A4
@PJL SET PAPERWIDTH=4961
@PJL SET PAPERLENGTH=7016
@PJL SET RESOLUTION=600
@PJL SET IMAGELEN=65556
[... 65556 bytes JBIG — page 1, chunk 1 ...]
@PJL SET IMAGELEN=13451
[... 13451 bytes JBIG — page 1, chunk 2 ...]
@PJL SET DOTCOUNT=1477935
@PJL SET PAGESTATUS=END
@PJL SET PAGESTATUS=START
@PJL SET COPIES=1
@PJL SET MEDIASOURCE=TRAY1
@PJL SET MEDIATYPE=PLAINRECYCLE
@PJL SET PAPER=A4
@PJL SET PAPERWIDTH=4961
@PJL SET PAPERLENGTH=7016
@PJL SET RESOLUTION=600
@PJL SET IMAGELEN=65556
[... 65556 bytes JBIG — page 2, chunk 1 ...]
@PJL SET IMAGELEN=10550
[... 10550 bytes JBIG — page 2, chunk 2 ...]
@PJL SET DOTCOUNT=1266291
@PJL SET PAGESTATUS=END
@PJL EOJ
%-12345X
```

This was the missing puzzle. My single-page driver was fundamentally wrong in its understanding of the page lifecycle. Let me walk through what the capture reveals.

## What the Multi-Page Capture Taught Me

### Discovery 1: `PAGESTATUS=END` Is the Page Eject Trigger

The most critical finding: `@PJL SET PAGESTATUS=END` is what tells the firmware to eject the page. Without it, the printer keeps the current page open — waiting for more `IMAGELEN` chunks.

My single-page driver had never sent `PAGESTATUS=END` after the JBIG data. For a single-page job, this didn't matter: when the job ended (EOJ + UEL), the firmware ejected whatever was buffered. But for multi-page jobs, every subsequent `IMAGELEN` was treated as another chunk of the *still-open page 1*. The printer accumulated all pages' JBIG data as one gigantic page 1, then when the job ended, it ejected it — as a single mangled page, or not at all because it became too large for the buffer.

Looking at how the DOTCOUNT and PAGESTATUS sequence work:

```
[65556 bytes of JBIG — page 1 chunk 1]
@PJL SET IMAGELEN=13451          ← "here comes 13451 more bytes for this same page"
[13451 bytes of JBIG — page 1 chunk 2]
@PJL SET DOTCOUNT=1477935        ← "page 1 had 1,477,935 black pixels"
@PJL SET PAGESTATUS=END          ← "page 1 is done, eject it"
```

`PAGESTATUS=END` closes page 1. Only then does the firmware feed the paper through and return ready for page 2.

### Discovery 2: Multiple `IMAGELEN` Chunks Per Page

For page 1, the Windows driver sends two separate `IMAGELEN` blocks: one of 65,556 bytes and one of 13,451 bytes. Total JBIG stream for page 1: **79,007 bytes**.

This is chunking. The Windows driver splits any JBIG stream that would exceed the USB bulk transfer limit into consecutive `@PJL SET IMAGELEN` blocks, each followed by that exact number of bytes of JBIG data. All blocks before the next `PAGESTATUS=END` belong to the same page.

The 65,536-byte (65,508 usable after USB framing overhead) limit is the USB full-speed bulk transfer maximum that the Windows driver appears to respect. Page 1 needed 79,007 bytes → chunk 1 is 65,556 bytes → chunk 2 is the remaining 13,451 bytes.

My Linux filter produces smaller JBIG streams — typically small enough to fit in a single chunk — but the firmware accepts both chunked and unchunked delivery as long as the framing is correct.

### Discovery 3: Every Page Except the First Gets Its Own Full Header

Looking at what comes between `PAGESTATUS=END` for page 1 and the first `IMAGELEN` for page 2:

```
@PJL SET PAGESTATUS=END          ← closes page 1
@PJL SET PAGESTATUS=START        ← opens page 2
@PJL SET COPIES=1
@PJL SET MEDIASOURCE=TRAY1
@PJL SET MEDIATYPE=PLAINRECYCLE
@PJL SET PAPER=A4
@PJL SET PAPERWIDTH=4961
@PJL SET PAPERLENGTH=7016
@PJL SET RESOLUTION=600
@PJL SET IMAGELEN=65556          ← page 2 data begins
```

Every page from page 2 onwards needs its own `PAGESTATUS=START` plus the full media block (`COPIES`, `MEDIASOURCE`, `MEDIATYPE`, `PAPER`, `PAPERWIDTH`, `PAPERLENGTH`, `RESOLUTION`). Page 1 gets the media block from the job header. Pages 2+ must declare it themselves.

My driver omitted all of this for pages after the first. Without `PAGESTATUS=START`, the firmware apparently doesn't initialise its page buffer for the next page, so the incoming JBIG data has nowhere to go.

### Discovery 4: `DOTCOUNT` Is Required Per Page

`@PJL SET DOTCOUNT=N` appears immediately before every `PAGESTATUS=END`. It reports the total number of black pixels on the page. The printer uses this for toner life estimation — it tracks how many dots it has printed to estimate when toner will run out.

Looking at the values from the capture:
- Page 1 DOTCOUNT: `1477935` — a relatively text-heavy page
- Page 2 DOTCOUNT: `1266291` — slightly lighter page

My driver was sending no `DOTCOUNT` at all. From testing, omitting `DOTCOUNT` in some cases causes the firmware to reject the `PAGESTATUS=END` that follows it, leaving the page open indefinitely.

## Bug 5: `cupsBytesPerLine` vs Manual Stride Calculation

While fixing the multi-page protocol, I also hit a subtler bug. My filter calculated the row stride as:

```c
unsigned stride = (hdr.cupsBitsPerPixel * hdr.cupsWidth + 7) / 8;
```

For page 1 this worked fine. But `cupsRasterReadHeader2()` failed on page 2 — it returned 0 and the loop exited after one page.

The cause: CUPS's internal row stride (`cupsBytesPerLine` in the header) can include padding bytes that align rows to word boundaries. My manual calculation didn't account for this padding. When reading the raster stream, if you use the wrong stride, you consume too few or too many bytes per row, misaligning the stream for the next page's header. `cupsRasterReadHeader2` then reads garbage instead of a valid header and returns failure.

Fix: always use `hdr.cupsBytesPerLine` as the stride, never compute it manually:

```c
unsigned stride = hdr.cupsBytesPerLine;  // not (bpp * w + 7) / 8
```

CUPS guarantees that `cupsBytesPerLine` bytes per row are in the stream regardless of actual pixel data width. Trust the header.

## The Complete Protocol Structure

With all five bugs found and fixed, the complete PJL+JBIG1 protocol for the Ricoh SP 200 is:

```
── Job header (once) ──────────────────────────────────────────────────
ESC%-12345X@PJL\r\n
@PJL SET TIMESTAMP=YYYY/MM/DD HH:MM:SS\r\n
@PJL SET FILENAME=...\r\n
@PJL SET COMPRESS=JBIG\r\n
@PJL SET USERNAME=...\r\n
@PJL SET COVER=OFF\r\n
@PJL SET HOLD=OFF\r\n
@PJL SET PAGESTATUS=START\r\n      ← covers page 1
@PJL SET COPIES=N\r\n
@PJL SET MEDIASOURCE=TRAY1\r\n
@PJL SET MEDIATYPE=PLAINRECYCLE\r\n

── Per-page block (repeat for every page) ─────────────────────────────
  [pages 2+ only:]
  @PJL SET PAGESTATUS=START\r\n
  @PJL SET COPIES=N\r\n
  @PJL SET MEDIASOURCE=TRAY1\r\n
  @PJL SET MEDIATYPE=PLAINRECYCLE\r\n

  @PJL SET PAPER=<A4|LETTER>\r\n
  @PJL SET PAPERWIDTH=<px>\r\n
  @PJL SET PAPERLENGTH=<px>\r\n
  @PJL SET RESOLUTION=600\r\n
  @PJL SET IMAGELEN=<N>\r\n
  <N bytes: JBIG1 BIE data>
  [repeat IMAGELEN+data if page needs multiple chunks]
  @PJL SET DOTCOUNT=<black_pixel_count>\r\n
  @PJL SET PAGESTATUS=END\r\n       ← triggers paper ejection

── End of job (once) ──────────────────────────────────────────────────
@PJL EOJ\r\n
ESC%-12345X\r\n
```

Every line is terminated with `\r\n` (CRLF). The printer is strict about this — `\n` alone breaks parsing on some firmware versions.

## Building the CUPS Filter

The final filter (`rastertoricohjbig.c`) is about 200 lines of C. The core page-encoding function:

```c
static void write_page(unsigned char *bmp, unsigned w, unsigned h,
                       const char *paper, int first_page,
                       unsigned dpi, int copies)
{
    Buf buf = { malloc(1 << 17), 0, 1 << 17 };
    struct jbg_enc_state enc;
    unsigned char *planes[1] = { bmp };

    if (!first_page) {
        fprintf(stdout,
            "@PJL SET PAGESTATUS=START\r\n"
            "@PJL SET COPIES=%d\r\n"
            "@PJL SET MEDIASOURCE=TRAY1\r\n"
            "@PJL SET MEDIATYPE=PLAINRECYCLE\r\n",
            copies);
    }

    fprintf(stdout,
        "@PJL SET PAPER=%s\r\n"
        "@PJL SET PAPERWIDTH=%u\r\n"
        "@PJL SET PAPERLENGTH=%u\r\n"
        "@PJL SET RESOLUTION=%u\r\n",
        paper, w, h, dpi);

    jbg_enc_init(&enc, w, h, 1, planes, buf_cb, &buf);
    jbg_enc_options(&enc, 0x03, 0x48, 128, 0, 0);
    jbg_enc_out(&enc);
    jbg_enc_free(&enc);

    fprintf(stdout, "@PJL SET IMAGELEN=%zu\r\n", buf.size);
    fwrite(buf.data, 1, buf.size, stdout);

    unsigned long dots = count_dots(bmp, w, h);
    fprintf(stdout,
        "@PJL SET DOTCOUNT=%lu\r\n"
        "@PJL SET PAGESTATUS=END\r\n",
        dots);
    fflush(stdout);
    free(buf.data);
}
```

The `Buf` structure is a growable buffer that acts as the jbigkit output callback target. jbigkit calls `buf_cb()` with encoded chunks, which get appended to the buffer. After encoding, we know the total size, so we can emit `IMAGELEN=N` followed by the exact bytes. The Linux-generated JBIG streams are small enough that a single `IMAGELEN` block per page is sufficient — no chunking needed — but the firmware handles both.

The dot count function uses `__builtin_popcount` to count set bits in the 1-bit packed bitmap:

```c
static unsigned long count_dots(const unsigned char *bmp, unsigned w, unsigned h)
{
    unsigned stride = (w + 7) / 8;
    unsigned long n = 0;
    for (unsigned y = 0; y < h; y++)
        for (unsigned x = 0; x < stride; x++)
            n += __builtin_popcount(bmp[y * stride + x]);
    return n;
}
```

## The PPD File

The PPD (PostScript Printer Description) tells CUPS how to handle this printer. The key directives:

```ppd
*cupsFilter: "application/vnd.cups-raster 0 rastertoricohjbig"
```

This registers our filter: for `application/vnd.cups-raster` input (CUPS's internal raster format), with priority 0, run `rastertoricohjbig`.

```ppd
*ColorDevice: False
*DefaultColorSpace: Gray
```

Tells CUPS this is a monochrome device. CUPS will convert colour documents to grayscale before they reach our filter.

The paper size definitions use PostScript point dimensions (1/72 inch):

```ppd
*PageSize A4/A4:     "<</PageSize[595 842]>>setpagedevice"
*PageSize Letter/Letter: "<</PageSize[612 792]>>setpagedevice"
```

595 × 842 pt = 210 × 297 mm (A4). 612 × 792 pt = 216 × 279 mm (Letter).

The filter uses `hdr.PageSize[0]` to distinguish paper sizes at runtime:

```c
const char *paper = (hdr.PageSize[0] > 610) ? "LETTER" : "A4";
```

Letter's width in points (612) is above the 610 threshold; A4's (595) is below it.

## Installation and Testing

```bash
# Compile
gcc -O2 -o rastertoricohjbig rastertoricohjbig.c \
    $(cups-config --libs) -lcupsimage -ljbig

# Install
sudo install -m 755 rastertoricohjbig /usr/lib/cups/filter/rastertoricohjbig
sudo install -m 644 ricoh-sp200.ppd   /usr/share/ppd/cupsfilters/

# Register
sudo lpadmin -p Ricoh_SP_200_DDST \
    -v "$(lpinfo -v | grep -i ricoh | awk '{print $2}' | head -1)" \
    -P /usr/share/ppd/cupsfilters/ricoh-sp200.ppd \
    -E

# Print
echo "Hello from Linux" | lpr -P Ricoh_SP_200_DDST
```

Multi-page test with `lpr -P Ricoh_SP_200_DDST document.pdf` now correctly prints all pages in sequence. The printer ejects each page as its `PAGESTATUS=END` arrives, then pulls the next sheet for the following page.

## Sharing Over the Network (Android Printing)

A nice side-effect of running a CUPS-managed printer: any IPP-capable device on the same network can print to it without any special app. Android has had native IPP support since 4.4. On the Linux host:

```bash
# Allow network access in /etc/cups/cupsd.conf:
# Change "Listen localhost:631" to "Port 631"
# Add "ServerAlias *" and "Allow @LOCAL" to Location blocks

sudo systemctl restart cups
sudo lpadmin -p Ricoh_SP_200_DDST -o printer-is-shared=true
sudo cupsctl --share-printers
sudo ufw allow 631/tcp
```

Android sees the printer via mDNS auto-discovery. The phone sends a standard IPP job to CUPS on the Linux machine; CUPS runs `rastertoricohjbig`; the filter emits PJL+JBIG1 over USB to the physical printer. The phone has no idea it's talking to a reverse-engineered driver — from its perspective it's just an IPP printer.

## Summary

The Ricoh SP 200 speaks a completely standard protocol: **PJL (Printer Job Language)** wrapping **JBIG1 (ITU-T T.82)** compressed monochrome raster. No proprietary formats, no obfuscation. Everything needed to implement the driver is in public standards documents.

The five bugs discovered along the way, in order:

| Bug | Symptom | Root Cause |
|---|---|---|
| 1 | Silent job drop | Missing bare `@PJL\r\n` after UEL |
| 2 | Motor runs, no paper | Missing `@PJL SET PAPERLENGTH` |
| 3 | Blank page out | Wrong JBIG options byte (`0x08` → `0x48`) |
| 4 | Scrambled image | CUPS delivering 8-bit grayscale, filter assuming 1-bit packed |
| 5 | Only first page prints | Missing `PAGESTATUS=END` / `PAGESTATUS=START` per page, no `DOTCOUNT`, wrong stride from manual calculation |

Bugs 1–4 were found by comparing my driver's output byte-for-byte against the single-page capture. Bug 5 required a second capture specifically of a multi-page job — the single-page capture gave no hint of the page lifecycle protocol that the firmware required.

The complete source is on GitHub. If you have a Ricoh SP 200 and have been running a Windows VM just to print, you no longer have to.
