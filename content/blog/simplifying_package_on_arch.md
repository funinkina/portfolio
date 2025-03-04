---
title: "Simplifying Package installation on Arch Linux"
date: "2024-08-25"
tags:
  - Linux
toc: true
---

All of us in the "Arch Btw" cult use it for one of its main selling points, the repositories. Arch Linux's pragmatic approach to its packages makes it so much easier for users to sync packages without fiddling with multiple repositories and dependency hell, making it a one-stop solution. The Arch User Repository (AUR) is just a cherry on top. Including packages submitted by users makes it even more complete, removing the need for flatpaks or snaps. (Might cause dependency issues, we will discuss this later).
>100% Human written btw

### Still using Pacman and Yay?

If you read any basics about Arch, you know that the default way to install packages is `pacman`, which is great if you only install from the official repositories where `pacman` beautifully takes care of the dependency issues, but the real culprit to Arch instability issues is caused by packages installed from the AUR, as they might include outdated packages that can potentially break your system. Most probably, you might be using **Yay** or **Paru**, as your AUR helpers to get packages from AUR, while they work pretty flawlessly and fast, they also introduce system dependency issues and not work really well with `pacman`. The solution? Aura

### Introducing Aura

Aura is a fully fledged replacement for `pacman` with enhancements as well as an AUR helper built-in. Aura provides all the same features as `pacman` with all the same commands and flags.

Taken from the [Aura's own guide](https://fosskers.github.io/aura/introduction.html): Aura doesn't just mimic `pacman`; it *is* `pacman`. All `pacman` operations and their sub-options are accepted, as-is.

Aura also provides a dead simple way to install AUR packages from

```bash
aura -As google-chrome
```

**Using Aura as** `pacman` **also provides multiple extra features such as:**

* Downgrading a package

    ```bash
    aura -C firefox
    ```

* Discovering what package owns a certain file

    ```bash
    aura -Qo firefox
    /usr/bin/firefox is owned by firefox 127.0.2-1
    ```


**Using Aura as AUR helper:**

* Installing a package from AUR

    ```bash
    aura -As google-chrome
    ```

* Scrutinizing a package

    ```bash
    aura -Ai google-chrome
    ```


Now let's see how do we get started with Aura

### Getting started with Aura

To install Aura, we have to compile it from source first.

* Step 1: Grab the code from code and cd into it

    ```bash
    git clone https://aur.archlinux.org/aura.git && cd aura
    ```

* Step 2: Compile it

    ```bash
    makepkg -si
    ```


Then run `aura check` to see the status.

### Some recommended configurations:

First generate the config file by running

```bash
aura conf --gen > ~/.config/aura/config.toml
```

* If you are not comfortable with vim as editor, change `editor="nano"` in \[general\] of the config file

* Put `delmakedeps = true` if you want to remove the build dependencies after every install automatically to save space.

* Now you can use


```bash
aura -As google-chrome
```

to get started with installing packages.

### Some bonus life hacks

A few tricks I use to make installing and removing packages faster and easier is to create aliases in my .zshrc (.bashrc) file, such as

```bash
alias yeet="aura -Rns"
alias update="aura -Syu"
alias install="install_package"
alias search="search_package"
alias list="aura -Q | grep"

install_package() {
    if ! aura -S "$1"; then
        echo "\e[38;2;94;255;190m\e[1mPackage not found in official repositories. Trying to install from AUR...\e[m\n"
        aura -A "$1"
    fi
}
search_package() {
    echo "\e[38;2;94;255;190m\e[1m$1 in official repositories:\e[m"
    aura -Ss "$1"
    echo "\n\e[38;2;94;255;190m\e[1m$1 in AUR:\e[m"
    aura -As "$1"
}
```

Here, I have simply created aliases to uninstall and install a package using `yeet` and `install`. For searching and installing packages, there's a simple script that checks both official and AUR while installing a package. (This is not perfect, I am aware).

> Check out rest of my configuration in my [Dotfiles GitHub repository](https://github.com/funinkina/dotfiles).

### A word on stability
Most people use Arch for its rolling release cycle and being on the bleeding edge, but most of the time, this is the main reason for your system instability, therefore in my opinion, it is best to update your packages weekly. This increases the chance that if a certain bug or dependency was present in an update, it would have been fixed after a few days.
Also if you aren't using Nvidia GPU, and your hardware is well-supported by the latest kernel, chances are, it is also supported by the LTS kernel as well. So I would recommend you to switch to LTS kernel for maximum stability.
