---
title : 'Spectacle Ocr Screenshot'
subtitle: 'A simple Qt application that integrates KDE Spectacle screenshot tool with Tesseract OCR to extract text from screenshots as well QR codes.'
date : '2025-03-11T20:13:54+05:30'
draft : false
tags : ['tesseract', 'qt', 'linux']
toc: true
next: true
---

Spectacle OCR Screenshot is a straightforward Qt application designed for the KDE desktop environment. It integrates seamlessly with KDE's native Spectacle screenshot tool to enable users to quickly extract text and decode QR codes directly from captured screen regions.

### GitHub Repository: [funinkina/spectacle-ocr-screenshot](https://github.com/funinkina/spectacle-ocr-screenshot)
![Screenshot](https://github.com/funinkina/spectacle-ocr-screenshot/raw/main/screenshot.png)

## Why I made this?
Oftentimes I needed to copy a error or debug message from the screen but it won't be in a nice text box, so i decided to make this simple utility to do that for me. Basically the same tool as [funinkina/Gnome-OCR-Screenshot](https://github.com/funinkina/Gnome-OCR-Screenshot) but for KDE desktop.

## How it is built
This project is primarily built using **Qt 6**, a robust C++ framework often used for creating desktop applications, especially within the KDE ecosystem. It leverages **KDE Spectacle** for the screenshot capture functionality, and **Tesseract OCR** along with its dependency **Leptonica** for the optical character recognition. **Zxing** is used specifically for the QR code decoding capability. The use of these libraries allows for native integration with KDE and powerful text/QR analysis. The build process supports both `qmake6` and `cmake`.

## Current features
The Spectacle OCR Screenshot application offers the following features:
*   Captures screenshots using the built-in KDE Spectacle tool (in region selection mode).
*   Extracts text from the captured screenshot using Tesseract OCR.
*   Decodes QR codes found within the screenshot using Zxing.
*   Presents the extracted text and QR code data in a user-friendly interface.
*   Supports OCR for multiple languages based on installed Tesseract language packs.
*   Allows users to edit the extracted text before saving or copying.
*   Enables copying the extracted text to the clipboard.
*   Provides the option to save the extracted text to a file.
*   Allows saving the original screenshot as a `.png` file.
*   Includes command-line options to specify OCR language and disable QR detection.
