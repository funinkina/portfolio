---
title : 'Enhancing Screenshots in GNOME with OCR'
subtitle: 'A simple Python script to directly extract text from GNOME native screenshot menu.'
date : '2025-02-06T22:57:22+05:30'
draft : false
tags : ['Linux', 'Python', 'Machine Learning', 'Project']
description : 'Python script enhancing GNOME Screenshot with OCR with Tesseract'
toc: true
image:
    - '/blog-assets/gnome-ss-enhance-header.png'
next: true
---

![Enhancing Screenshots in GNOME with OCR](/blog-assets/gnome-ss-enhance-header.png)

A while ago, I was working on a project, and the way error was being displayed, I could not copy the text directly to paste it in ChatGPT. I had to type the whole error message manually, which was a bit frustrating. I thought, what if I could just take a screenshot and extract the text from the image directly? That's when I decided to enhance GNOME Screenshot with OCR. I mean windows snipping tool has this feature, why not GNOME Screenshot?

That's one the perks of using Linux, I can just make something for my needs and share with others, someone who needs can also use, someone who doesn't need can just ignore it. So, I started working on this project, and I am happy to share that I have successfully enhanced GNOME Screenshot with OCR. In this article, I will share how I did it and how you can also use it.

{{< box info >}}
The code is available here with MIT license: [github.com/funinkina](https://github.com/funinkina/Gnome-OCR-Screenshot/)
{{< /box >}}

## 📋 Prerequisites
I had strict requirements for this project, I wanted to use only open-source tools and libraries, with minimal dependencies, so other's don't have to install a lot of things to use this. Also it needed to simple and single file, so it can be executed easily. Here are the tools and libraries I used for this project:
- Python 3.13
- Tesseract OCR *(Only thing you need to install)*
- GTK 4.0
- Adwaita 1.0
- XDP

## 🎨 Design Overview
The design of the project is simple, I have used Python to create a script that takes a screenshot using XDP (xdg-desktop-portal), then it extracts the text from the image using Tesseract OCR, and then it displays the extracted text in a dialog box using Adwaita and GTK. The script is designed to be executed using a keyboard shortcut, so you can take a screenshot and extract the text from the image with just a single key press.

The script follows a modular and event-driven design with the following components:

- **Graphical Interface** – Uses GTK 4 for the text display and user interactions.
- **Screenshot Handling** – Utilizes Xdp.Portal to capture screenshots interactively.
- **OCR Processing** – Uses pytesseract (Tesseract OCR) to extract text from the image.
- **File Management** – Saves extracted text to a file if requested.
- **Clipboard Integration** – Copies the extracted text to the clipboard.

## 🏗️ Architecture Breakdown

The script is object-oriented, with the following key classes:
### 🖥️ 1. TextDialog (UI for Extracted Text)

Displays the recognized text in a `Gtk.TextView` inside a scrollable window.
Provides "Save to File" and "Copy to Clipboard" buttons for user actions.
Uses `Adw.ToastOverlay` for improved UI experience.

### 🚀 2. GnomeOCRApp (Main Application)

Handles the application lifecycle and integrates:

Screenshot capture via `Xdp.Portal.take_screenshot()`.
OCR text extraction via `pytesseract.image_to_string()`.
GUI window management using GTK 4.

### ⚙️ 3. argparse (CLI Arguments)

Supports optional flags:

- `--enablesaving`: Keeps the screenshot after extraction.
- `--nocloseonaction:` Prevents the app from quitting after copying or saving.
- `--lang <languages>`: Specifies OCR language(s).
- `--save-location <path>`: Defines a default save directory.

## ✨ Key Features & Design Considerations

✔ **Minimal UI Footprint** – The main window is invisible, and only the extracted text is displayed.

✔ **Flexible Text Handling** – Users can edit the extracted text before saving/copying.

✔ **Language Support** – The OCR language can be customized via --lang.

✔ **Clipboard & File System Integration** – Text can be saved or copied seamlessly.

✔ **Automatic Cleanup** – The script deletes temporary files unless explicitly saved.

## 🌟 Here's a demo screenshot of the script in action:
![Gnome Screenshot with OCR](/blog-assets/gnome-ss-demo.png)

## 🛠️ Installation & Usage
You can find the installation instructions and usage guide in the README file of the project repository: [Gnome-OCR-Screenshot](https://github.com/funinkina/Gnome-OCR-Screenshot)

Please star the repository if you find the project useful and feel free to contribute to the project by creating issues or pull requests.
