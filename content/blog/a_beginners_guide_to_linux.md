---
title : "A beginner's guide to Linux"
date : '2025-02-20T15:45:33+05:30'
draft : true
tags : ['linux', 'guide']
---

# Why this guide?
When I first heard about linux, I jumped headfirst into it. All I did was a few minutes of googling about what it is, and how to install it. And for a short term, it works, but the moment you want to do more with it, you will use the things you learned from windows or macos and that has a very good chance of breaking your system. This guide aims to help you understand the basics of linux and how to use it effectively. And more importantly, it will help you avoid common mistakes that can lead to system crashes or data loss. All those mistakes in the beginning broke my system a lot and gave up on linux for a while, then one day, I decided to do a good research and found out that linux is not as hard as it seems. I started learning linux again and now I can confidently say "I use Arch btw". My aim with this guide is to make people know how to use linux effectively that most youtube tutorials or online posts won't tell you.

# So what Linux actually is?
Linux is actually the kernel. A kernel is what sits between the operating system and the hardware. It is responsible for managing the system's resources and providing a platform for other software to run on. Linux (created by Linus Torvalds as a hobby project) is open-source software, which means that its source code is freely available for anyone to view, modify, and distribute. This has led to the development of a vast ecosystem of software and hardware that is compatible with Linux.

All the commands you use with linux such as `ls`, `cd` are part of GNU utilities. These utilities are part of the GNU project, which is a collection of free software tools that are designed to work together to provide a complete operating system. GNU is a collection of free software tools that are designed to work together to provide a complete operating system. GNU is a collection of free software tools that are designed to work together to provide a complete operating system. So when you use a command like `ls`, you are actually using a GNU utility that is part of the GNU project.

Hence GNU/Linux is the proper term for the operating system that is commonly used. But for the sake of simplicity, we will call it Linux.

# How is it different from windows?
Apart from being fully open source and free to use and distribute or do anything with it, Linux is modular. This means that you can choose which components you want to install on your system, and you can easily add or remove them as needed. This flexibility allows you to customize your system to your specific needs and preferences. Unlike windows that has everything garbeled up together, Linux is designed to be modular and flexible.

In linux your web browser is not tied to the kernel (looking at you edge), you can simple download one you like (including edge) and set it as your default browser. This is just one example of the flexibility that Linux offers. You can also choose the fonts, icons anything you want of your liking.

Getting a bit technical, you can also choose the init system that will load up the actual OS, or the filesystem you want to use. For example, you can choose ext4 for simplicity or brtfs for its snapshot capabilities.

It is true that there will be a learning curve, or to put it more accurately, unlearning curve. Since you will unlearn so many things that you have been doing in windows, which after learning linux you will realize how stupid the whole windows way of doing things is.  You will also learn how to use the command line, which is a powerful tool that can be used to automate tasks and manage your system more efficiently.

### A frustrating windows example
You must have as a developer installed python in your system, and I am 99% sure it didn't work the first time. Infact the whole installation process is a bit frustrating, first you find the correct website, then the correct version file of the installation. After that you have to open the exe, give it permission, answer questions, and then wait for it to install. Even after doing all that, it won't work properly because windows couldn't find the executable python file. So you open a confusing looking window to add to path.

Comparing that experience to linux, all you do is type a command or click a button in GUI and python is installed and ready to use. It's because linux's filesystem is really organised, all the binaries are in a single directory (`/bin`), and the system knows where to find them. This makes it easy to manage and update software, and ensures that everything works smoothly. Similarly all the configurations are in `/etc`.
