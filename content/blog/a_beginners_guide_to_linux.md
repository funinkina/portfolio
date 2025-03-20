---
title : "A beginner's guide to Linux"
subtitle: 'A look at some terminologies related to linux for newbies'
date : '2025-02-20T15:45:33+05:30'
draft : false
tags : ['linux', 'guide']
toc: true
next: true
---
![Header](/blog-assets/guide_to_linux.png)

# 📝 Why this guide?
When I first heard about Linux, I jumped headfirst into it. All I did was a few minutes of Googling about what it is, and how to install it. And for a short while, it works, but the moment you want to do more with it, you will use the things you learned from Windows or macOS and that has a high chance of breaking your system. This guide aims to help you understand the basics of linux and how to use it effectively. And more importantly, it will help you avoid common mistakes that can lead to system crashes or data loss. All those mistakes in the beginning broke my system so many times that I gave up on Linux for a while, then one day, I decided to do a good research and found out that Linux is not as hard as it seems. I started learning Linux again and now I can confidently say "I use Arch btw". My aim with this guide is to make people know how to use linux effectively that most YouTube tutorials or online posts won't tell you.

# 🚫 What this guide is not
This guide isn't an installation instruction. It is a guide to help you understand the basics of linux and how to use it effectively. It is not a guide to help you install linux, but rather get familiar with the terms you might encounter while using linux or in the online forums.

# 🤔 So what is Linux actually?
Linux is actually the kernel. A kernel is what sits between the operating system and the hardware. It is responsible for managing the system's resources and providing a platform for other software to run on. Linux (created by Linus Torvalds as a hobby project) is open-source software, which means that its source code is freely available for anyone to view, modify, and distribute. This has led to the development of a vast ecosystem of software and hardware that is compatible with Linux. A kernel manages the system's resources and provides a platform for other software to run on. It helps in allocating RAM and CPU resources efficiently, reducing the overhead of managing the system's resources by the individual programs also makes it more secure since programs have limited access to system resources constantly monitored by the kernel.

All the commands you use with linux such as `ls`, `cd` are part of GNU utilities. These utilities are part of the GNU project, which is a collection of free software tools that are designed to work together to provide a complete operating system. GNU is a collection of free software tools that are designed to work together to provide a complete operating system. So when you use a command like `ls`, you are actually using a GNU utility that is part of the GNU project.

Hence GNU/Linux is the proper term for the operating system that is commonly used. But for the sake of simplicity, we will call it Linux.

# 🆚 How is it different from windows?
Apart from being fully open source and free to use and distribute or do anything with it, Linux is modular. This means that you can choose which components you want to install on your system, and you can easily add or remove them as needed. This flexibility allows you to customize your system to your specific needs and preferences. Unlike Windows, which has everything garbeled up together, Linux is designed to be modular and flexible.

A modular system allows you to choose which components you want to install on your system, and you can easily add or remove them as needed. This flexibility allows you to customize your system to your specific needs and preferences.

In Linux, your web browser is not tied to the kernel (looking at you Edge), you can simply download one you like (including Edge) and set it as your default browser. This is just one example of the flexibility that Linux offers. You can also choose the fonts, icons, and anything you want of your liking.

Getting a bit technical, you can also choose the init system that will load up the actual OS, or the filesystem you want to use. For example, you can choose ext4 for simplicity or Btrfs for its snapshot capabilities.

It is true that there will be a learning curve, or to put it more accurately, unlearning curve. Since Linux follows a different philosophy, you may need to unlearn certain habits from Windows, many of which may feel inefficient in comparison. You will also learn how to use the command line, which is a powerful tool that can be used to automate tasks and manage your system more efficiently.

If you are also scared of the command line, linux will help you overcome that fear. Command line is nothing but what GUI does on the backend. Command line gives you more control over your system, and you can do things that are not possible with GUI. Command line is also faster and more efficient than GUI.

Learning how to efficiently work in Linux environments will make you more productive and comfortable with the system. You will be able to automate repetitive tasks, manage your system more efficiently, and customize your environment to your liking. It will also make you more comfortable with the command line, which is a powerful tool that can be used to automate tasks and manage your system more efficiently. Working on the cloud will also become easier as all the cloud providers run on linux only.

### 😡 A frustrating windows example
As a developer, you’ve probably installed Python on Windows—and there’s a high chance it didn’t work on the first try. The installation process can be frustrating: first, you have to find the correct website, then the right version of the installer. Next, you run the .exe file, grant permissions, answer a few questions, and wait for the installation to complete. Even after all that, Python might not work because Windows can't find the executable. Then, you need to manually add it to the system’s PATH variable through a confusing settings window.

![windows_example](https://media.geeksforgeeks.org/wp-content/uploads/20200402122327/download-51.png)

Now, compare this to Linux. Installing Python is as simple as running a single command or clicking a button in the package manager. The system automatically places the binaries in the right directory (/bin), ensuring they are recognized globally. Similarly, all system configurations are neatly organized under /etc. This streamlined approach is one of the many reasons Linux is favored by developers.

# 🐧 Why so many Linuxes?
You must have heard that linux comes in different distributions or flavors. These are called different linux [distros](https://distrowatch.com/). Each distro has its own package manager, desktop environment, and set of default applications. Some popular linux distros include Ubuntu, Fedora, Debian, and Arch Linux. The major difference between linux distros is what kind of packages they provide and what sort of hardware their kernel is tweaked for if any. Linux distros also have their own philosophy, which is often reflected in their design choices and community culture and their intended target audience. For example, Ubuntu is designed for beginners and has a user-friendly interface, while Arch Linux is more geared towards power users who want full control over their system.

{{<box info>}}
Packages in Linux are similar to software in windows or app in macOS. A package may or may not provide a desktop icon, but it always provides a command line interface. A package can also be installed as a dependency meaning it is required by another package to work properly.
{{</box>}}

![Linux Distros](https://preview.redd.it/linux-distro-family-chart-with-distros-based-derivatives-i-v0-0h0jbzn8ca2d1.png?auto=webp&s=ff1f9ec2eeba0937607aca2897e755195c16899d)

# 🏗️ Let's start with the basic architecture of linux

## 📁 Linux File System
In linux everything is represented as a file, and the filesystem is organised in a hierarchical manner. The root directory (`/`) is the top-level directory, and all other directories and files are nested within it. The filesystem is also case-sensitive, which means that `file.txt` and `File.txt` are two different files.

Everything is a file means literally everything, all the processes running in CPU, all the data in RAM, all the devices connected to the system is a file. They aren't actually files on your disc, but rather a representation of the system's resources. This way of representing everything as files makes it really easy to work with the system. Since everything is a file, you can use the same tools to manage and manipulate them. For example, you can use the `ls` command to list all the files in a directory, or the `cat` command to view the contents of a file. You can use the same `write` API to send data over network and to print files to a printer. (This is obviously very over-simplified but the gist is the same.)

The root directory (`/`) is the top-level directory, is the starting point of the filesystem (sits at the top of the hierarchy), and all other directories and files are nested within it. Every external drive you connect, every USB drive, and every network share is mounted under some directory that starts from the root `/`. For example, storage devices will be mounted under `/media`. Even an external HDD will be mounted to some directory that started from the root `/`. Network shares will be mounted under `/mnt`. Your audio device will be mounted under `/dev/snd`. The `/proc` directory contains information about the system's processes, and the `/sys` directory contains information about the system's hardware.

### 🏠 Your Home Directory
Each user on a system has a home directory in which all the files that are created by user are stored. This directory is usually located under `/home`. For example, if your username is `john`, your home directory will be `/home/john`. You can access your home directory by typing `cd ~` in the terminal. `~` is a shortcut for your home directory. You can read more [here](https://tecadmin.net/linux-file-system/).

![Linux file system](https://thesagediary.wordpress.com/wp-content/uploads/2018/09/linuxfile.png?w=1400)

{{<box warning>}}
You might have seen memes on the internet telling you to `sudo rm -rf /*` saying it will remove the french language pack or something else. Don't do it. It will delete everything recursively starting from the root directory.
{{</box >}}

## 📦 Softwares in Linux
No matter what OS you are running, you will install other software on it. Linux makes it really easy to install software. You can use the package manager to install software. For example, you can use the `apt` command to install software on Debian-based systems, and the `yum` command to install software on Red Hat-based systems. You can also use the `snap` command to install software on any Linux system. You can also use the `flatpak` command to install software on any Linux system. Similar to `brew` command to install software on macOS.

Each Linux distribution hosts a repository of software that you can easily and safely install on that distribution. Let's take example of Ubuntu. You can use the `apt` command to install software on Ubuntu. For example, you can use the `apt install` command to install software on Ubuntu. `apt install` fetches the software from the repository and installs it on your system.

To update your system, you can use the `apt update` command. This command fetches the latest package information from the repository and updates the package list. Your local machine has a copy of the package list and their versions. `apt update` fetches the latest package information from the repository and updates the package list. `apt upgrade` checks what packages are outdated and installs the latest version of them.

You will also see instructions on some sites to add a repository to your system to install their software. What this does is that it adds the repository to your system's package list. This allows you to install software from that repository using the package manager. So now the next time you do `apt install` it will also search the repository you added externally.

![Linux package repositories](https://miro.medium.com/v2/resize:fit:1163/1*6XiknbODn4CwVvzdDWt8pA.png)

{{<box warning>}}
You should stick to official repositories and avoid installing software from unofficial sources. Packages in official repositories are tested and verified by the distribution maintainers. Installing software from unofficial sources can be risky and may contain malware or other malicious code.
{{</box>}}

# 👤 Userspace Components in Linux
Since Linux is modular and very extensible, you can basically build your own system as per your specific needs (like Arch Linux). Let's get familiar with some very commonly used terms in Linux Systems.

## 🖥️ Desktop Environments
Desktop environments are graphical user interfaces that provide a graphical interface for interacting with the operating system. They sit on top of display servers and window managers. Some popular desktop environments are GNOME, KDE Plasma, XFCE, and LXDE. Most Linux distros offer one or multiple of these desktop environments, the difference being the level of customization and features they offer.

![KDE Desktop Environment](https://i.redd.it/f0i0ozhpzbqd1.png)

Like GNOME desktop environment offers a simple and good user experience. It is one of the most popular desktop environments and is used by millions of people around the world. KDE Plasma is another popular desktop environment that offers a lot of customization options and is similar UX to windows while being very very customizable. XFCE is a lightweight desktop environment that is ideal for older hardware or those who want a minimalistic interface. You can read more about desktop environments [here](https://en.wikipedia.org/wiki/Desktop_environment).

## 🖼️ Display Servers
As we saw above, desktop environments are built on top of display servers. Display servers are responsible for rendering the windows of applications on the screen. There are majorly 2 display servers right now: [Xorg](https://en.wikipedia.org/wiki/X.Org_Server) and [Wayland](https://wayland.freedesktop.org/). Xorg is the older display server and is widely used, while Wayland is a newer display server that is gaining popularity due to its security features and better performance. Wayland is also more lightweight and has better support for touchscreens and other input devices. Most Desktop environments support both Xorg and Wayland, but all of them are slowly [migrating](https://arewewaylandyet.com/) to Wayland as it is more secure and efficient.

![Wayland diagram](https://wayland.freedesktop.org/wayland-architecture.png)

## 📐 Window Managers

Window managers are responsible for managing the windows of applications on the screen. They are responsible for creating, resizing, and moving windows, as well as handling keyboard and mouse input. Some popular window managers are Hyprland, i3, DWM, and Awesome. Most desktop environments come with their own window managers, but you can also use a standalone window manager if you want more control over your desktop environment. Using only a window manager can offer a lot of customization options and is a great way to personalize your desktop environment. You can take a [look here](https://www.reddit.com/r/unixporn/) for more.

![Hyprland](https://preview.redd.it/hyprland-i-wanna-share-a-pic-of-my-laptop-stickers-too-3-v0-gldz38z1uiud1.png?width=1920&format=png&auto=webp&s=0c9dbfa7938b9f4d6d2af3f56abe6e045a90efa0)

## 🔑 Display Managers

Display managers are the stuff you see when your computer boots up and you see a login screen. They are responsible for managing the login screen and the session management of the desktop environment. It starts the desktop environment and handles user authentication. Some popular display managers are LightDM, GDM, SDDM, and LXDM. Most desktop environments come with their own display managers, but you can also use a standalone display manager if you want more control over your desktop environment. Using only a display manager can offer a lot of customization options and is a great way to personalize your desktop environment.

![GDM](https://www.baeldung.com/wp-content/uploads/sites/2/2023/12/gdm.png)

# 🔚 Closing Thoughts
I hope this guide has given you a solid introduction to Linux concepts and how its components work together. If you’re curious to try it out, you can start by live booting from a USB drive or using a virtual machine.

While Linux does have a learning curve, it’s incredibly rewarding in the long run. It not only enhances your productivity but also deepens your understanding of computer systems. Whether you're exploring Linux for personal use, development, or cloud computing, the skills you gain will be invaluable.

If you’re feeling adventurous, you can check out my [Arch Linux Installation Guide](https://funinkina.xyz/blog/the-way-of-arch/).
