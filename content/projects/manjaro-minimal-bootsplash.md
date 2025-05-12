---
title : 'Manjaro Minimal Bootsplash'
subtitle: 'Plymouth theme for Manjaro linux using slightly tweaked manjaro logo and a custom spinner.'
date : '2022-06-16T21:01:12+05:30'
draft : false
tags : ['linux', 'shell scripting']
toc: true
next: true
---

Manjaro Minimal Bootsplash is a custom theme for Plymouth, the graphical boot splash system used in many Linux distributions, specifically tailored for Manjaro Linux. It aims to provide a cleaner, more minimal look during the system boot process.

### GitHub Repository: [funinkina/manjaro-minimal-bootsplash](https://github.com/funinkina/manjaro-minimal-bootsplash)

![Screenshot](https://github.com/funinkina/manjaro-minimal-bootsplash/raw/main/preview.gif)

## How it is built
This project is essentially a **Plymouth theme** package. It includes **shell scripts (`bootsplash-minimal.sh`, `bootsplash-packer`)** used to generate necessary files (like an STL model, which is part of the bootsplash mechanism) and assist in packaging. The theme itself defines how visual elements like the logo and spinner are displayed during boot. It's designed to be built and installed as an **Arch Linux package** using `makepkg`, integrating into Manjaro's package management system. The visual assets, particularly the spinner, were based on graphics from Preloaders.net and further modified. Installation involves modifying system configuration files like `/etc/mkinitcpio.conf` and `/etc/default/grub` to activate the theme.

## Current features
The Manjaro Minimal Bootsplash theme currently provides:
*   A custom graphical boot splash theme for Manjaro Linux.
*   Integration with the Plymouth boot splash system.
*   A slightly tweaked version of the standard Manjaro logo.
*   A unique, custom loading spinner animation.
*   Scripts to facilitate the generation of required theme files and packaging.
*   Provides instructions and files for installation via `makepkg`.
