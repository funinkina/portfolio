---
title : 'Why you should be a part of open source?'
subtitle: 'Exploring and explaining perks of Open Source software and community.'
date : '2025-05-04T13:16:23+05:30'
draft : false
tags : ['open-source', 'guide']
toc: true
next: true
image: '/blog-assets/open-source-header.png'
---

![Header](/blog-assets/open-source-header.png)

As a computer science student, you've likely encountered the terms "open source software" or "free software" while working on projects. But what exactly does open source mean, and why should it matter to you? Let's explore that in this post.

## What Does Open Source Stand For?

Technically, open source software (OSS) refers to software whose *source code is publicly available, allowing anyone to view, modify, and redistribute it freely, often under specific [open source licenses](https://opensource.org/licenses/)*. However, open source is more than just a technical standard; it's a philosophy. It benefits a wide range of people, not just programmers – even if you've never written a line of code, you likely benefit from OSS every day.

You might be surprised to learn how much the world relies on open source software. From the core infrastructure of the internet and cloud servers to specialized applications running the [International Space Station](https://www.nasa.gov/mission/international-space-station/) and [CERN's Large Hadron Collider](https://home.cern/science/accelerators/large-hadron-collider) (the world's largest particle accelerator), OSS is fundamental. A common thread among many of these systems is Linux, which we'll discuss later. Open source forms the backbone of much modern infrastructure, empowering developers to build software without restrictive third-party controls.

Open source software champions "free as in freedom," emphasizing your control over the software you use. Since the source code is publicly accessible, you (or experts you trust) can verify that the software does exactly what it claims to do – and nothing more, like hidden tracking or "snooping."

## Importance of Open Source Software

You might wonder: why release software for free when you could sell it? A key reason, especially for critical systems, is **trust and security**. While making source code public exposes it to potential attackers, it also exposes it to a much larger community of security researchers, developers, and users who can identify and fix vulnerabilities. This "many eyes" approach often makes OSS *more* secure and trustworthy than closed-source alternatives.

### Case in Point: OpenSSL

[OpenSSL](https://www.openssl.org/) is a critical piece of internet infrastructure. See the `https` in the URL bar? The '`s`' (for secure) often relies on protocols like TLS/SSL, which OpenSSL implements. This secures your connection to websites by encrypting traffic. In 2014, a major flaw was discovered in OpenSSL, now famously known as "[**The Heartbleed Bug**](https://heartbleed.com/)". This vulnerability allowed attackers potentially to read sensitive memory from affected servers, exposing data like passwords and private keys.

Crucially, Heartbleed was discovered because security researchers could audit OpenSSL's source code – something only possible due to its open nature. Imagine if OpenSSL were proprietary software, developed behind closed doors by a single company. Such a critical flaw might have remained hidden much longer, or potentially indefinitely, without independent review. Furthermore, with closed source, there's less external assurance against hidden backdoors.

Open source mitigates risks like this by allowing anyone to inspect, scrutinize, and improve the code. This transparency is why critical infrastructure greatly benefits from the open source model.

![xkcd's dependency](https://imgs.xkcd.com/comics/dependency_2x.png "Dependency")

## Why You as a Student Should Care About Open Source

Don't think open source is just for experienced programmers or large corporations. Anyone can create OSS, even to solve a niche problem they face personally. Think about it: is there a small, recurring annoyance in your digital life that a simple script or app could fix? If so, chances are others face the same issue. You can build a solution for yourself and then release it as open source for others to use and improve.

For example, a few months ago, I needed a tool to extract text directly from screenshots, whether it was from an image or selectable text. I searched online but couldn't find anything that perfectly matched my needs, so I decided to build it myself ([here's the link](https://github.com/funinkina/spectacle-ocr-screenshot)). Within a week of sharing it, it received 20 stars on GitHub, indicating at least 20 people found it interesting or useful! When building tools like this, I often try to follow the [UNIX philosophy](https://en.wikipedia.org/wiki/Unix_philosophy): "Do one thing and do it well."

Building in public exposes your work to others who are often willing to offer guidance. In my case, maintainers from the [KDE Plasma project](https://kde.org/) (another significant open source initiative) provided valuable feedback on improving my code. This kind of interaction provides real-world insights into writing clean, maintainable software and helps build your reputation in the software engineering community.

And the advantages don't end there. Active contribution to open source projects is highly valued by employers. Why? It demonstrates practical skills: consistency, coding in a collaborative environment, and proficiency with essential tools like Git (including commit messages and pull requests – concepts we'll touch on shortly). Many large tech companies are major contributors to and maintainers of OSS. For instance, **Meta** maintains [React](https://github.com/facebook/react), a library powering countless websites. **Google** maintains essential projects like Chromium (the foundation for Chrome, Edge, Brave, and others) and the [Android Open Source Project (AOSP)](https://source.android.com/). Interestingly, Android itself is built upon another monumental open source project: the [Linux Kernel](https://kernel.org/). This brings us to arguably the most influential OSS project of all: Linux.

## The Most Influential Open Source Project: Linux

Linux originated in 1991, created by [Linus Torvalds](https://en.wikipedia.org/wiki/Linus_Torvalds), then a 21-year-old Finnish computer science student at the University of Helsinki. He envisioned an operating system that was truly open and free from external restrictions. Contrary to common understanding, Linux itself is technically just the [kernel](https://en.wikipedia.org/wiki/Kernel_%28operating_system%29) – the core part of the OS. Much of what makes a usable Linux system comes from the [GNU Project](https://en.wikipedia.org/wiki/GNU_Project), initiated by [Richard Stallman](https://en.wikipedia.org/wiki/Richard_Stallman). The GNU project provided essential tools like the shell, compiler, and libraries needed to build a complete, functional operating system around the Linux kernel (which is why some advocate for the term [GNU/Linux](https://www.gnu.org/gnu/linux-and-gnu.html)).

Today, Linux quite literally powers much of the internet. Most web servers, [DNS servers](https://www.cloudflare.com/learning/dns/what-is-a-dns-server/), network switches, and routers run some form of Linux. But why? Couldn't proprietary operating systems like Windows Server be used? A key reason lies in the community support and the freedom Linux provides. With proprietary systems controlled by a single vendor (like Microsoft with Windows), users lack full control and the ability to deeply customize the OS. Because Linux is open source and free to modify, organizations can tailor it to their exact needs – removing unnecessary parts, adding custom features, and optimizing performance. This often results in systems that are significantly more efficient and stable for specific tasks compared to one-size-fits-all proprietary options.

Linux's efficiency and flexibility also make it dominant in high-performance computing; it powers the vast majority of the world's fastest supercomputers. You'll also find Linux in less obvious places: smart TVs, home routers, car infotainment systems, washing machines and countless other embedded devices often run a customized Linux kernel.

As highlighted by the "**Heartbleed Bug**" example, the open source approach facilitates the discovery and fixing of critical vulnerabilities. Linux, being open source, benefits from continuous auditing by countless security experts globally, contributing to its overall robustness and security.

Ultimately, Linux embodies the core values of open source: **community collaboration, transparency, meritocracy, and freedom**.

## How Can You Be a Part of Open Source?

As mentioned earlier, you don't need to be a programming genius to contribute to open source. You can start with small tasks and focus on doing them well. However, contributing effectively usually requires familiarity with certain tools and workflows. One of the most fundamental tools you'll need to learn is Git.

### Git as Version Control

[Git](https://git-scm.com/) is a distributed version control system (VCS). This means it tracks changes made to files over time, and every developer typically has a full copy of the project history. It's the industry standard for managing source code, especially for collaborative software development. You can learn more about its concepts [here](https://en.wikipedia.org/wiki/Git). In essence, Git allows you to save snapshots (called 'commits') of your project, view the history of changes, coordinate work with others effectively, and revert to earlier versions if something goes wrong.

Fun fact - Git was also developed by the creator of Linux: Linus Torvalds.

Git is the dominant VCS in modern software development. You've likely also heard of [GitHub](https://github.com/). GitHub (and similar platforms like [GitLab](https://about.gitlab.com/) and [Bitbucket](https://bitbucket.org/)) is a web-based hosting service for Git repositories, making it easier to store your code online, collaborate, and participate in open source projects.

A simple analogy: think of Git as a personal 'save' system for your project that keeps track of every version you've ever saved. GitHub is like a shared online platform (similar in concept to Google Docs for collaboration, but specifically for code) where you can store your project, share it, and work on it with others, including managing contributions and discussions.

You can learn the basics of Git and GitHub from this video:

{{<  youtube RGOj5yH7evk  >}}

Hopefully, you now have a basic grasp of why version control like Git is essential. Now let's look at how you can find and contribute to existing open source projects.

### Deciding What and Where to Contribute

The first step is finding a project that interests you and matches your skills (or skills you want to learn). You can use GitHub's built-in search (filtering by language, topic, or '[good first issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/filtering-and-searching-issues-and-pull-requests#filtering-issues-and-pull-requests-by-labels)' labels), or explore platforms specifically designed to help newcomers find projects:

- [First Timers Only](https://www.firsttimersonly.com/)
- [First Contributions](https://github.com/firstcontributions/first-contributions) (A project to help you make your first PR)
- [Open Source Friday](https://opensourcefriday.com/) (A weekly event to encourage open source contributions)
- [24 Pull Requests](https://24pullrequests.com/) (Promotes OSS contributions during December)
- [CodeTriage](https://www.codetriage.com/) (Helps you find popular repos that need help)
- [Up For Grabs](https://up-for-grabs.net/) (Lists projects with beginner-friendly tasks)
- Explore specific project communities like [KDE](https://community.kde.org/Get_Involved), [GNOME](https://welcome.gnome.org/en/), [Mozilla](https://community.mozilla.org/en/contribute/), etc.

Once you've found a potential project, the next step is identifying what you can contribute. Contributions aren't limited to just writing complex code! Here are common ways beginners can get involved:

- Improving documentation (like the project's README file – check out this guide on [writing a good README](https://www.freecodecamp.org/news/how-to-write-a-good-readme-file/)).
- Adding examples or clarifying instructions on how to use the project.
- Writing tutorials or guides for the project.
- Translating documentation or interfaces into other languages (e.g., [freeCodeCamp's translation program](https://contribute.freecodecamp.org/#/index?id=translations)).
- Finding and reporting bugs (creating detailed issue reports).
- Testing new features or upcoming releases.
- Answering questions from other users (e.g., in forums, issue trackers, Stack Overflow).
- Fixing typos or improving code formatting.
- Offering design suggestions or creating mockups (if you have design skills).

{{<  box info  >}}
Tip: Check the project's 'Issues' tab on GitHub. Many projects use labels like 'good first issue', 'help wanted', or 'documentation' to flag tasks suitable for newcomers. You can mention the issue number you're addressing in your pull request description (more on that below).
{{<  /box  >}}

### Okay, But How Do I Actually Contribute? The Workflow

Once you've identified a change you want to make (whether it's fixing a bug, improving docs, or adding a feature), the standard workflow on platforms like GitHub generally involves these steps:

1. **Fork the Repository**: Create your personal copy of the project on GitHub by clicking the '[Fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo)' button.
![Fork](https://media.geeksforgeeks.org/wp-content/uploads/20240521132627/Screenshot-(239).png "Fork")

2. **Clone Your Fork**: Download your forked repository to your local computer using the `git clone` command. ([How to clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository))

3. **Create a Branch**: It's best practice to create a new [branch](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell) for your changes (`git checkout -b my-fix-branch`). This keeps your changes isolated.

4. **Make Your Changes**: Edit the files, add new files, fix the bug, write the documentation – do the work!

5. **Commit Your Changes**: Save your changes locally using Git (`git add .` followed by `git commit -m "Descriptive commit message"`). Write clear [commit messages](https://cbea.ms/git-commit/) explaining what you changed.

6. **Push to Your Fork**: Upload your committed changes from your local machine to your forked repository on GitHub (`git push origin my-fix-branch`). ([How to push](https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository))

7. **Create a Pull Request (PR)**: Go to your fork on GitHub. You'll likely see a prompt to create a Pull Request. Click it!

![Compare & Pull Request](https://docs.github.com/assets/cb-34097/mw-1440/images/help/pull_requests/pull-request-compare-pull-request.webp)

### Creating a Good Pull Request

When creating the Pull Request (PR), you need to provide a clear, concise *Title* summarizing your change. The *Description* is vital: explain what you changed, why you changed it, and how. If your PR addresses a specific open issue, be sure to mention it (e.g., 'Closes #123' or 'Fixes #456' – GitHub often automatically links these). A well-written PR makes it much easier for maintainers to understand and review your contribution.

After filling in the title and description, click the '**Create Pull Request**' button. This officially submits your proposed changes to the original project. Now, you wait for the project maintainers to review your contribution. They might approve it directly, ask questions, or request further changes before merging your work. Be patient and responsive to feedback!

Congratulations! You've successfully submitted a pull request and are now actively participating in the open source community.

### Things to Keep in Mind While Contributing

Before contributing, always check if the project has contribution guidelines. These are often found in a file named CONTRIBUTING.md or similar in the root of the repository. These guidelines usually cover important aspects like:

- Code style and formatting rules.
- How to write commit messages.
- Requirements for tests.
- The expected format for pull request descriptions.

Adhering to these guidelines shows respect for the project's maintainers and makes the review process much smoother, significantly increasing the chances of your contribution being merged.

## Leveraging Open Source for Opportunities

Beyond the intrinsic rewards of learning and collaboration, contributing to open source can unlock tangible career opportunities, especially for students. Programs like [Google Summer of Code (GSoC)](https://summerofcode.withgoogle.com/) offer **paid, remote mentorships** where participants work on specific projects for established open source organizations over several months. GSoC is a fantastic way to gain real-world software development experience, get mentored by experienced developers, build your resume, and get paid for contributing to meaningful projects. 

Similar programs exist, such as [Outreachy](https://www.outreachy.org/) (which focuses on promoting diversity in tech), and participation in events like [Hacktoberfest](https://hacktoberfest.com/) can also boost your profile. Even without formal programs, consistent, high-quality contributions build a public portfolio that demonstrates your skills, passion, and ability to collaborate – qualities highly valued by potential employers.

## Closing Thoughts

Open source is a powerful force in the world of technology, built on collaboration, transparency, and freedom. As we've seen, it underpins critical infrastructure, fosters innovation, and offers incredible learning and career opportunities for students and developers alike. Whether you're using OSS tools, learning from publicly available code, or taking your first steps toward contributing, engaging with the open source community can be a rewarding experience. Don't hesitate to explo