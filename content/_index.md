---
title: "funinkina's corner"
toc: false
---

{{< announcement >}}

I build fast, boring-to-operate backends in **Go, Python and C/C++**. Lately that means **real-time LLM infrastructure** and **voice agent backends**, with an 80% cut in voice latency and a 5× inference speedup along the way. Lower in the stack, I write device drivers and have a patch merged into mainline Linux.

I also write about Linux and open source for 1000+ readers a month on [my blog](/blog).

<!--more-->

## {{< icon "work" >}} Experiences so far

{{< experiences >}}

## {{< icon "code" >}} Highlighted Projects

*{{< icon "star" >}} 350+ stars, 2K+ users across GitHub - here are a few worth calling out.*

- **[OpenEffects](https://github.com/funinkina/openeffects)** {{< icon "star" >}} 60 • 2K+ users • Linux-native webcam effects engine in **Rust**  
  A **GTK4/libadwaita** GUI over a headless daemon (`openeffectsd`, `openeffectsctl`) with a **PipeWire/GStreamer** media pipeline. Inference runs through **ONNX Runtime** with automatic **CUDA/ROCm/Vulkan** dispatch for sub-50ms latency — portrait blur, center stage auto-tracking, studio light, background replacement, and gesture-triggered reaction effects, published as a **Flatpak** on Flathub.

- **[DeadEnv](https://github.com/funinkina/deadenv)** {{< icon "star" >}} 15 • Cross-platform CLI secrets manager in **Go**  
  Replaces plaintext `.env` files with OS-native keychain storage (cgo/macOS, libsecret/Linux, WinCred/Windows) behind biometric auth. Encrypted exports use **AES-256-GCM + Argon2id**, with deliberate error collapsing to prevent oracle attacks and a git audit log baked in.

- **[Ricoh SP 200 Linux Driver](https://github.com/funinkina/Ricoh-SP200-Linux)** • Native print driver for a printer with no official Linux support  
  Reverse-engineered the Ricoh SP 200's proprietary USB print protocol by capturing and decoding traffic from the Windows driver, then wrote a native **CUPS filter in C** (libcups, libcupsimage, **JBIG1/ITU-T T.82** compression) to reconstruct the full print job lifecycle and enable multi-page printing.

→ *[Explore more on GitHub](https://github.com/funinkina)*

## {{< icon "school" >}} Extra-Curricular

- **Blogger & Backend Developer** at [Let's Code](https://www.lets-code.co.in)  
  *Remote, Part Time · Feb 2025 – Oct 2025*  
  Writing technical blogs on backend systems, Linux, and GenAI. Also shipped an AI interview simulator and a resume analyzer that are both live and in use. Writing code and words, occasionally at the same time.

- **AIML Club** · *Google Developer Groups OnCampus*  
  *April 2023 – Present*

  - Mentored students in ML, AI, and Git, roughly in that order of how often things go wrong.
  - Led workshops on open-source contribution and version control.
  - Ran projects across NLP and finance.

## {{< icon "emoji_events" >}} Achievements

- **Linux Kernel Contributor (ALSA/HDA subsystem):** Diagnosed a hardware mute LED bug by manually probing **Realtek COEF registers** with `hda-verb`, then submitted a [patch merged into mainline Linux](https://lore.kernel.org/all/20260516144436.35022-1-aryankushwaha3101@gmail.com/) adding the missing PCI quirk for the machine.

- **Amazon ML Summer School 2024** Got selected from over **1,000,000 applicants** nationwide. Competitive ML program, non-trivial acceptance rate.

<!-- ## {{< icon "search" >}} Stuff that I have written -->
