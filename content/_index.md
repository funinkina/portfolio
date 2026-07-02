---
title: "funinkina's corner"
toc: false
---

{{< social-links >}}
{{< social-button url="https://github.com/funinkina" text="funinkina" icon="github" >}}{{< /social-button >}}
{{< social-button url="https://x.com/funinkina" text="funinkina" icon="twitter" >}}{{< /social-button >}}
{{< social-button url="https://www.linkedin.com/in/funinkina" text="in/funinkina" icon="linkedin" >}}{{< /social-button >}}
{{< social-button url="mailto:hello@funinkina.co.in" text="hello@funinkina.co.in" icon="email" >}}{{< /social-button >}}
{{< social-button url="https://www.buymeacoffee.com/funinkina" text="Buy Me A Coffee" icon="coffee" >}}{{< /social-button >}}
{{< /social-links >}}

{{< announcement >}}

I'm a recent graduate, with ~2 years of experience engineering backend & systems at production level, working in **Go, Python, and C/C++**. I like building systems that are fast, boring to operate, and interesting to build, and most of my time goes writing code and shipping straight to production.

Lately that means **real-time LLM infrastructure** and **voice agent backends**, though I'm just as comfortable low in the stack with **device drivers** and **Linux kernel** work, including a patch merged into mainline. Along the way: an 80% cut in voice latency, a 5× inference speedup, and 60% in cost savings.

When I'm not shipping, I write about **Linux**, **open source**, and **computer science** for 1000+ readers a month. You can [read my blogs here](/blog).

**What I work with:**
- Backend Systems & Distributed Architecture
- Linux & Systems Programming
- LLMs, TTS and Voice/AI Agents
- AWS, GCP, Docker & CI/CD

## {{< icon "rocket_launch" >}} What I'm Up To

{{< experiences "current" >}}

## {{< icon "work" >}} Experiences so far

{{< experiences >}}

## {{< icon "code" >}} Highlighted Projects

*{{< icon "star" >}} 75+ stars, 2K+ users across GitHub - here are a few worth calling out.*

- **[OpenEffects](https://github.com/funinkina/openeffects)** {{< icon "star" >}} 60 • 2K+ users • Linux-native webcam effects engine in **Rust**  
  A **GTK4/libadwaita** GUI over a headless daemon (`openeffectsd`, `openeffectsctl`) with a **PipeWire/GStreamer** media pipeline. Inference runs through **ONNX Runtime** with automatic **CUDA/ROCm/Vulkan** dispatch for sub-50ms latency — portrait blur, center stage auto-tracking, studio light, background replacement, and gesture-triggered reaction effects, published as a **Flatpak** on Flathub.

- **[DeadEnv](https://github.com/funinkina/deadenv)** {{< icon "star" >}} 15 • Cross-platform CLI secrets manager in **Go**  
  Replaces plaintext `.env` files with OS-native keychain storage (cgo/macOS, libsecret/Linux, WinCred/Windows) behind biometric auth. Encrypted exports use **AES-256-GCM + Argon2id**, with deliberate error collapsing to prevent oracle attacks and a git audit log baked in.

- **[Ricoh SP 200 Linux Driver](https://github.com/funinkina/Ricoh-SP200-Linux)** • Native print driver for a printer with no official Linux support  
  Reverse-engineered the Ricoh SP 200's proprietary USB print protocol by capturing and decoding traffic from the Windows driver, then wrote a native **CUPS filter in C** (libcups, libcupsimage, **JBIG1/ITU-T T.82** compression) to reconstruct the full print job lifecycle and enable multi-page printing.

→ *[Explore more on GitHub](https://github.com/funinkina)*

## {{< icon "school" >}} Extra-Curricular

- **Blogger & Backend Developer** at [Let's Code](https://www.lets-code.co.in)  
  *Remote, Part Time · Feb 2025 – Present*  
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
