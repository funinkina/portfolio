---
title : "Building OCR in Plasma's Spectacle using C++"
subtitle: 'An overview of how I wrote a c++ program to extract text from KDE Plasma Spectacle'
date : '2025-03-12T13:10:15+05:30'
draft : false
tags : ['linux', 'kde', 'ocr', 'cpp']
toc: true
next: true
---

![Header](/blog-assets/spectacle-ocr-header.png)

## 🔍 The Why?
A while ago I made a python script that achieved the same goal but in GNOME desktop environment. You can read more about it [here](https://funinkina.xyz/blog/enhancing-screenshots-in-gnome-with-ocr/). That also uses *Tesseract* to extract the text and displays a GTK window to copy or save. But recently, I switched to KDE Plasma and I wanted to have the same functionality in Spectacle, the default screenshot tool in KDE Plasma. So I decided to write one for KDE Plasma too. 

The GNOME desktop environment is based on GTK and it provides a native python keybindings. That means I can easily to `import GTK4.0` and create a window that displays the text extracted from the screenshot. But KDE Plasma is based on Qt and it does not provide a native python keybindings. Since I wanted to make a program that would use minimal external dependencies, I decided to write it in C++. Since doing it in python would require me to use a lot of external libraries and I wanted to avoid that. Admittedly, I am not very good at C++ but I wanted to give it a try. I mean these days with all the LLM's, I can give it a try.


{{< box info >}}
- The code is available here with MIT license: [github.com/funinkina](https://github.com/funinkina/spectacle-ocr-screenshot)
- You can get the precompiled binary from the [releases page](https://github.com/funinkina/spectacle-ocr-screenshot/releases).
{{< /box >}}

This projects involved a lot of learning and unlearning. I had to learn how to use Qt, how to use C++, how to use cmake, makefile, how to use KDE libraries, how to use Tesseract. And realizing how so many things I took for granted in python. But it was a fun project and I am happy to share that I have successfully enhanced KDE Plasma Spectacle with OCR. In this article, I will share how I did it and how you can also use it. You can find the installation instructions and usage instructions in the github repo.

## 💡 Overview
This C++ program is a GUI application built using the [Qt framework](https://www.qt.io/product/framework) that takes screenshots on KDE Plasma using Spectacle and performs OCR (Optical Character Recognition) using [Tesseract OCR](https://github.com/tesseract-ocr/tesseract). You can also pass command line arguments to specify the language for OCR. The extracted text can be copied to the clipboard, saved as a text file, or stored as an image. The program is designed to be executed using a keyboard shortcut, so you can take a screenshot and extract the text from the image with just a single key press.

![Screenshot](/blog-assets/spectacle_ocr_screenshot.png)

## ⚙️ Dependencies
Mainly the heavy-lifting is done by the Qt libraries and Tesseract Ocr. So you need to have them installed. You can find the building and installation instructions in the github repo.
### 1. Qt Libraries

Qt provides the core GUI and utility functions for this application. The following Qt modules are used:

- `QApplication` – Manages the GUI event loop.
- `QWidget`, `QVBoxLayout`, `QHBoxLayout`, `QLabel`, `QPushButton`, `QTextEdit` – Used to create and structure the GUI.
- `QCommandLineParser`, `QCommandLineOption` – Parses command-line arguments, specifically for OCR language selection.
- `QProcess` – Executes external commands (Spectacle) to capture screenshots.
- `QClipboard` – Allows copying text to the clipboard.
- `QFileDialog` – Provides file save dialogs for exporting extracted text and screenshots.
- `QMessageBox` – Displays error messages or success notifications.
- `QTemporaryFile`, `QDir`, `QDateTime`, `QFile`, `QTextStream` – Handles file paths and file operations.

### 2. Tesseract OCR (Leptonica and Tesseract)

- Leptonica (`leptonica/allheaders.h`) – A helper library for image processing, needed by Tesseract.
- Tesseract OCR (`tesseract/baseapi.h`) – The OCR engine that extracts text from images.

### 3. Spectacle (External KDE Utility)

Spectacle is used to take screenshots in KDE Plasma.
It is executed via `QProcess::execute("spectacle", QStringList() << "-b" << "-r" << "-n" << "-o" << outputPath);`

- -b: Background mode (no GUI).

- -r: Capture the entire screen.

- -n: Skip confirmation dialogs.

- -o outputPath: Save the screenshot to the given path.

### 4. CMake and Qmake (Build Dependencies)
Working on this project also required me to learn how to use CMake and Makefile. I had to write a `CMakeLists.txt` file to compile the project. I also had to write a Makefile to compile the project. I had to learn how to use these tools and how to write them. But after some more research, I realized I can used `qmake` to simplify the process. So I used `qmake` to compile the project.

Compiling the program using `qmake` gave the binary that was slightly off looking because it was using Qt5. But I was using Qt6. So I had to use `qmake6` to compile the project. Using `qmake6` gave me the binary that was looking as expected as it was using Qt6. Instead of using `CMakeLists.txt` and `Makefile`, `simple.pro` file was used to compile the project which is much more concise and easy to use for Qt projects.

## 🏗️ Architecture Breakdown
### 1. Screenshot Capture (`takeScreenshot`)
* **Function**: `takeScreenshot(const QString& outputPath)`
* Calls Spectacle via QProcess::execute to take a screenshot and save it to a temporary file.
* Returns true if the screenshot is successfully taken, otherwise false.

### 2. OCR Processing (`extractText`)
* **Function**: `extractText(const QString& imagePath, const QString& language)`
* Initializes Tesseract OCR with the specified language (eng by default).
* Loads the image using `pixRead()`.
* Extracts text using `GetUTF8Text()` and returns it as a string.
* Cleans up resources (`pixDestroy, ocr->End()`).

### 3. Graphical User Interface (GUI)
- **Main Window** (`QWidget`):
    - Displays the extracted text in a QTextEdit widget.
    - Status messages shown using a QLabel.
- **Buttons**:
    - Copy Text (`copyButton`): Copies the extracted text to the clipboard.
    - Save Text (`saveButton`): Opens a file dialog to save the text to a file.
    - Save Image (`saveImageButton`): Allows saving the screenshot to a user-defined location.

### 4. Event Handling and User Interaction
- Button clicks are connected to their respective functions using Qt’s signal-slot mechanism (`QObject::connect`).
- Status messages are updated dynamically based on user actions (copying, saving).

## ✨ Key Features
- **Automated Screenshot OCR:** Captures a screenshot instantly and performs OCR without user intervention.

- **Multi-Language OCR Support:** Users can specify the OCR language(s) using the --lang command-line option (e.g., --lang eng+hin).

- **Clipboard Integration:** Extracted text can be copied directly to the clipboard for quick use.

- **File Export Options:** Saves OCR-extracted text as a .txt file or the screenshot as .png images.

- **Simple and Minimal GUI:** A straightforward UI that displays extracted text and allows basic operations.

## 🔑 Key Considerations
### 1. Minimal External Dependencies
- The program is designed to use minimal external dependencies to ensure easy installation and portability.
- The only external dependency required is Tesseract OCR, which can be installed using package managers (e.g., apt, pacman).
- Qt and Spectacle is preinstalled on KDE Plasma, so no additional installation is needed.

### 2. Multi-Language Support
- Users can specify the OCR language(s) using the --lang command-line option to support different languages.
- This can be predefined when setting the keyboard shortcut to execute the program.
- All you need is the relevant Tesseract language data files installed and pass it as an argument.
- For example, --lang eng+hin for English and Hindi OCR.

### 3. Portability
- Currently designed for KDE Plasma due to its dependence on Spectacle.
- A single binary is all you need to run the program, making it easy to share and use on other KDE systems.

### 4. One-Click Quick Actions
- The program can be executed using a keyboard shortcut for quick access.
- Buttons can be used to copy text, save text, or save the screenshot with a single click.
- The extracted text can even be edited before saving or copying to fix any OCR errors.

## 📝 Closing Thoughts
This project was a great learning experience for me. I got to learn a lot of new things and I am happy to share that I have successfully enhanced KDE Plasma Spectacle with OCR. I hope this project will be useful to others as well. This was my first time working with c++ so the code might not be up to the standards. You can find the code on my [github](https://github.com/funinkina) and you can also download the precompiled binary from the releases page. I am also planning to release this as an AUR package soon.

If you have any questions or suggestions, feel free to reach out to me. I would be happy to help. Thank you for reading.

## 📚 References
- [Qt Documentation](https://doc.qt.io/qt-6/)
- [Tesseract OCR Documentation](https://tesseract-ocr.github.io/tessdoc/)
- [CMake Documentation](https://cmake.org/documentation/)
- [Qmake Documentation](https://doc.qt.io/qt-6/qmake-manual.html)
- [Leptonica Documentation](http://www.leptonica.org/)
- [Running external executable in Qt using QProcess](https://stackoverflow.com/questions/31174173/running-external-executable-in-qt-using-qprocess)