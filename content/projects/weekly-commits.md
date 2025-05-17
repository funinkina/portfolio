---
title : 'Weekly Commits'
subtitle: 'GNOME Extension to see your weekly GitHub commits in top bar'
date : '2025-05-14T00:30:42+05:30'
draft : false
tags : ['linux', 'gnome', 'github', 'extension']
toc: true
next: true
image: ''
---
# Weekly Commits GNOME Extension — Visualize Your GitHub Activity Right from the Top Bar

## Why I Built This

As developers, we spend hours coding, committing, and pushing changes — but rarely do we take a moment to reflect on our consistency. While GitHub contribution graphs are nice, they live on a webpage, buried behind a few clicks.

I wanted something more *immediate* and *minimal*. I wanted to see my GitHub commit activity at a glance — right from my GNOME desktop environment. So I built **Weekly Commits**, a GNOME Shell extension that brings your GitHub commit stats to your system's top bar.

![Weekly Commits Screenshot](https://github.com/funinkina/weekly-commits/raw/main/screenshot.png)

## What It Does

Weekly Commits is a lightweight, customizable GNOME extension that shows your last seven days of GitHub commits as colored boxes in the top panel — just like a mini contribution graph, always visible.

### Key Features:

* **Seven-box commit summary** in the top bar.
* **Popup menu** with daily commit counts.
* **Preferences UI** to configure your GitHub username and a Fine-Grained Personal Access Token (PAT).
* **Auto-fetches data** at user-defined intervals.
* **Adjustable placement** in the GNOME panel.

[![Get it on GNOME Extensions](https://github.com/andyholmes/gnome-shell-extensions-badge/raw/master/get-it-on-ego.png)](https://extensions.gnome.org/extension/8146/weekly-commits/)

## How It Works

The extension uses GitHub’s REST API to fetch your public and private commit activity from all repositories you own. It visualizes this data using seven colored boxes, representing the number of commits made on each day of the past week.

Here’s a high-level overview of how it works under the hood:

1. **Authentication**: The user enters their GitHub username and a Fine-Grained PAT (with read access to all repositories) through the GUI settings.
2. **Data Fetching**: At a regular interval (default: hourly), the extension queries the GitHub API to get recent commit data.
3. **UI Update**: The extension parses the data and updates the top bar with a simple, color-coded visual of your daily contributions.
4. **Popup Info**: Clicking the indicator shows a daily breakdown in a popup.

## Installation Guide

If you prefer the manual route, here's how to get started:

```bash
git clone https://github.com/funinkina/weekly-commits
mv weekly-commits ~/.local/share/gnome-shell/extensions/
```

Then restart GNOME Shell (`Alt + F2`, then `r` and `Enter`), and enable the extension:

```bash
gnome-extensions enable weekly-commits@funinkina.is-a.dev
```

Once enabled, open the preferences menu to set your GitHub username and personal access token.

{{< box warning >}}
Make sure to generate a **Fine-Grained PAT** with access to all repositories. You can create one [here](https://github.com/settings/personal-access-tokens/new).

{{< /box >}}

## Tech Stack: Under the Hood

Building a GNOME Shell extension requires working with the GNOME platform’s native libraries and conventions. Here's a breakdown of what powers Weekly Commits:
- `st` (Shell Toolkit): This is GNOME Shell’s internal widget toolkit — a lightweight UI framework used for rendering elements inside the GNOME Shell itself (not standalone apps). I used st to create and style the top panel indicators and commit boxes.

- `Clutter` is a scene graph–based rendering API used by GNOME for high-performance UI. Under the hood, st widgets are Clutter actors. I leveraged Clutter's layout system and animation capabilities to ensure the extension feels smooth and native.
- `GTK` is used for traditional desktop GUI applications, but in this project, it powers the Preferences dialog - the part where users input their GitHub credentials and customize behavior. This made the configuration experience consistent with other GNOME apps.
- `Gio` is GNOME's I/O and networking library. I used Gio’s Soup library (internally accessed via GNOME JavaScript bindings) to make HTTP requests to the GitHub API, parse JSON responses, and securely manage preferences storage.

Combining these technologies gives the extension a tight integration with GNOME Shell — from rendering UI in the panel to handling network calls and persistent settings.

## Use Cases

Here are a few ways Weekly Commits can improve your developer workflow:

* **Self-Tracking**: Quickly understand how consistent your coding habits are.
* **Stay Motivated**: Visual feedback can keep you on track with daily commit goals.
* **Lightweight Insight**: No need to visit GitHub or open any app to check your contributions.
* **Experiment Tracking**: If you're working on multiple small repositories, this is a great way to monitor activity across them all.

## Roadmap

The extension is already quite functional, but there’s always room for more polish. Here are some features planned for future releases:

* **Week Start Day Toggle**: Choose between Monday or Sunday as the starting day.
* **Custom Thresholds**: Set your own commit count ranges for each color level.
* **Translations**: Internationalize the extension for non-English users.

Feel free to contribute to the [GitHub repo](https://github.com/funinkina/weekly-commits) or suggest features and improvements.

## Final Thoughts

If you use GNOME and care about your GitHub activity, **Weekly Commits** offers a simple, elegant way to stay informed and motivated — right from your desktop.

You can install it from the [GNOME Extensions website](https://extensions.gnome.org/extension/8146/weekly-commits/) or build it from source on [GitHub](https://github.com/funinkina/weekly-commits). Contributions, bug reports, and stars are always welcome!


### If you like my work, consider supporting me
[![Buy Me A Coffee Badge](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FD0?logo=buymeacoffee&logoColor=000&style=plastic)](https://www.buymeacoffee.com/funinkina)