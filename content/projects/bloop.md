---
title : 'Bloop'
subtitle: 'Get fun and quirky insights from your whatsapp chats'
date : '2025-03-12T19:43:31+05:30'
draft : false
tags : ['nextjs', 'golang']
toc: true
next: true
---

Bloop is a web application designed to analyze exported WhatsApp chat files, offering insights into conversation dynamics, popular words, user activity, and more. It provides a comprehensive look into your chat history.

### Try it live at: &nbsp; [bloopit.vercel.app](https://bloopit.vercel.app)
### The GitHub Repos: [Backend](https://github.com/funinkina/whatsappchatanalyzer/) [Frontend](https://github.com/funinkina/bloop-frontend)

[![bloop demo](/blog-assets/bloop-demo.png)](https://bloopit.vercel.app)

## How it is built
The backend of Bloop is built with **GoLang** using the **Gin framework**. GoLang was chosen for its speed and lightweight nature. Gin is utilized for its high performance and efficiency in handling a large number of requests, making the server suitable for potentially high-traffic scenarios. The frontend is developed using **Next.js**, a popular React framework, chosen for its capabilities in building fast, scalable, and SEO-friendly web applications.

## Current features
Currently, Bloop accepts an exported `.txt` and `.zip` WhatsApp chat files and provides the following analyses and features:
*   Identification of most used words
*   Identification of most used emojis
*   Calculation of the total number of messages
*   Estimation of average reply duration
*   Identification of most active users
*   Detection of conversation starters
*   Generation of an interaction matrix (likely showing who talks to whom)
*   Creation of a histogram visualizing messages over time
*   Generation of a word cloud based on chat content
*   AI analysis of the chat data

## Quirky Hacks
- The backend is hosted on two places: **Render.com** and my **RaspberryPi**. The frontend intelligently distributes requests between them.
- The LLM used is `llama-4-scout-17b-16e-instruct` which is provided by [groq.com](https://groq.com). The free tier currently gives 1000 requests a day with no token limit per day. So it works fine for a small project.
