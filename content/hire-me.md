---
title: "Aryan Kushwaha"
subtitle: "Backend & Systems Engineer"
type: "resume"
date: '2026-06-01T00:00:00+05:30'
draft: false
---

[funinkina.co.in](https://funinkina.co.in) · [hello@funinkina.co.in](mailto:hello@funinkina.co.in) · [github.com/funinkina](https://github.com/funinkina) · [linkedin.com/in/funinkina](https://linkedin.com/in/funinkina)

---

Backend and systems engineer in **Go, Python, and C/C++**, with production experience across **real-time LLM infrastructure**, **voice agent backends**, and low-level systems work including **device drivers** and **Linux kernel** contributions. Track record of measurable impact: **80%** voice latency reduction, **5× inference speedup**, and **60% cost savings**. Also writes technical blogs on **Linux**, **open source**, and **computer science** with **1000+** monthly readers.

## Experience

### Backend AI Intern — Zyka AI
*Remote · April 2026 – July 2026*

- Built and designed an **audio/image annotation platform** (**Next.js, React**) for annotators to tag large-scale multimedia datasets, architecting the **UX/UI** for high-throughput tagging workflows.
- Developed an **API aggregator backend** unifying multiple **LLM inference providers**, implementing **credit-based usage metering**, request routing, and rate limiting for cost-tracked inference access.

### Backend Engineer Intern — Superdash
*Bengaluru (Onsite) · June 2025 – April 2026*

- Optimized and deployed **edge ML models** for voice interruption detection, audio de-noising, and forced word alignment, plus **self-hosted TTS** (5× speedup, 1000ms → sub-200ms); served via **WebAssembly, vLLM, and ONNX Runtime**, sustaining **sub-100ms** inference across concurrent live calls.
- Engineered **scalable voice agent backend systems** in **Go and Python**, owning full lifecycle from API design through production deployment; refactored WebSocket layer to cut **voice call latency by 80% (500ms → 100ms)**.
- Designed and shipped an **event-driven automation pipeline** (akin to n8n) as a core product feature, fully owning the initiative from client co-design and architecture through testing and production rollout; directly drove **new client acquisition and revenue growth**.

### Python Developer Intern — Weya AI
*Noida (Remote) · Dec 2024 – Feb 2025*

- Built a **real-time voice agent backend** (**FastAPI**, **WebSockets**) scaling to **100+ concurrent connections**; profiled **10+ system metrics** to diagnose and resolve **LLM inference and speech pipeline bottlenecks**, improving **streaming responsiveness** and **p99 latency** under sustained load.

### Summer Research Intern — NIT Jalandhar
*Jalandhar, Punjab (Onsite) · May 2024 – July 2024*

- Designed and trained **neural network models** achieving **~95% predictive accuracy** via **hyperparameter tuning** and feature engineering; co-authored a **peer-reviewed paper** on model architecture and experimental validation, accepted and published in an indexed journal.

## Projects

### [OpenEffects](https://github.com/funinkina/openeffects) ★ 60 · 2K+ users

- Built a **Linux-native webcam effects engine in Rust** with a **GTK4/libadwaita GUI**, a **headless daemon architecture** (`openeffectsd`, `openeffectsctl`, CLI), and a **PipeWire/GStreamer** media pipeline; inference via **ONNX Runtime** with automatic hardware dispatch (**CUDA, ROCm, Vulkan**) achieving **sub-50ms latency**.
- Published as a **Flatpak** on Flathub with **systemd**-managed daemon lifecycle and **D-Bus IPC**, bringing macOS-like **portrait blur**, **center stage** auto-tracking, **studio light**, **background replacement**, and gesture-triggered **reaction effects** to any Wayland Linux desktop.

### [DeadEnv](https://github.com/funinkina/dead-env)

- Built a **cross-platform CLI secrets manager in Go** replacing plaintext `.env` files with **OS-native keychain storage** (cgo on macOS, libsecret on Linux, WinCred on Windows) behind biometric authentication.
- Designed an **AES-256-GCM + Argon2id** encrypted export format with deliberate wrong-password/tamper error collapsing to prevent oracle attacks; backed by a **git audit log** and interface-driven architecture enabling full unit and fuzz test coverage.

### [Ricoh SP 200 Linux Driver](https://github.com/funinkina/Ricoh-SP200-Linux)

- Reverse-engineered the **Ricoh SP 200 proprietary print protocol** from USB captures of the Windows driver, implementing a native **CUPS filter in C** using libcups, libcupsimage, and **JBIG1 compression** (ITU-T T.82).
- Captured and decoded **USB traffic** between the Windows driver and hardware through systematic **binary protocol analysis**, reconstructing the full print job lifecycle to enable correct **multi-page printing support** on a device with no official Linux driver.

## Skills

- **Languages:** Python, Go, TypeScript, C, C++, Rust, Bash
- **Frameworks & Tools:** FastAPI, Node.js, Next.js, React, WebSockets, REST APIs, Qt, Textual, WebAssembly
- **Cloud & DevOps:** AWS (EC2, S3, SQS, EventBridge), GCP APIs, Docker, GitHub Actions, CI/CD, Linux, Git
- **Core Expertise:** Distributed Systems, Backend Architecture, Systems Programming, LLM Systems, Machine Learning

## Education

**JSS Academy of Technical Education** — Noida, Uttar Pradesh  
B.Tech in Computer Science and Engineering · CGPA: 7.9 · 2022 – 2026

## Activities & Achievements

- **Technical Contributor, Letscode.in** (Feb–May 2025): Authored technical blogs on backend systems, Linux, ML, and GenAI; built and shipped an **AI interview simulator** and **resume analyzer** — both deployed and actively used by the platform's user base.
- **Amazon ML Summer School 2024** — Selected from over **1,000,000 applicants** nationwide for the competitive machine learning program.
- **Linux Kernel Contributor** (ALSA/HDA subsystem): Diagnosed a hardware mute LED bug on HP Pavilion Plus by manually probing **Realtek ALC245 COEF registers** with `hda-verb`; submitted a **patch merged into mainline Linux** (`sound/hda/codecs/realtek/alc269.c`) adding the missing PCI quirk for this laptop model.
