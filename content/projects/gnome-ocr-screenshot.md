---
title : 'Gnome OCR Screenshot'
subtitle: 'A simple OCR (Optical Character Recognition) tool for the GNOME desktop environment that allows you to extract text as well as scan QR codes directly automatically from screenshots.'
date : '2025-02-06T20:04:01+05:30'
draft : false
tags : ['python', 'gtk', 'tesseract', 'linux']
toc: true
next: true
---

GNOME Screenshot OCR is a simple, native tool for the GNOME desktop environment that allows users to instantly extract text or scan QR codes directly from a selected area of their screen via a screenshot.

### GitHub Repository: [funinkina/Gnome-OCR-Screenshot](https://github.com/funinkina/Gnome-OCR-Screenshot)
![Screenshot Demo](https://github.com/funinkina/Gnome-OCR-Screenshot/raw/main/screenshot.png)

## Why I made this?
Oftentimes I needed to copy a error or debug message from the screen but it won't be in a nice text box, so i decided to make this simple utility to do that for me.

## How it is built
This tool is primarily built using **Python 3**. It leverages `python-gobject` and `GTK 4` to integrate natively with the GNOME desktop environment, specifically utilizing the **GNOME screenshot portal** for capturing screen regions. The core functionality relies on **Python Tesseract OCR** (`pytesseract`) for the optical character recognition part, and `pyzbar` (optionally) for scanning QR codes. The project emphasizes **minimal dependencies** and a **single file structure** to make it easy to set up and integrate with keyboard shortcuts.

## Current features
The GNOME Screenshot OCR tool currently provides the following capabilities:
*   Uses the native GNOME screenshot portal for capturing.
*   Has minimal dependencies (`pytesseract`, `pyzbar`).
*   Is a single file for easy shortcut setup.
*   Can scan QR codes automatically without extra configuration.
*   Allows saving extracted text directly to a file.
*   Allows copying extracted text directly to the clipboard.
*   Supports multiple languages for OCR (based on installed Tesseract language packs).
*   Offers a customizable default save location for text files.
*   Supports customizable keyboard shortcuts for quick access.
