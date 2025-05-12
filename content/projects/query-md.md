---
title : 'Query MD'
subtitle: 'Ask and query your markdown notes using AI 🤖'
date : '2025-03-28T20:37:57+05:30'
draft : false
tags : ['llm', 'genAI', 'tui']
toc: true
next: true
---
QueryMD is an AI-powered application designed to help users interact with and query their personal markdown notes. It allows you to ask questions and search your notes using natural language, leveraging the power of large language models.

### GitHub Repository: [funinkina/QueryMD](https://github.com/funinkina/QueryMD)
![Screenshot](https://github.com/funinkina/QueryMD/raw/main/Screenshot.png)

## Main usage of this?
If you are like me, who writes all their notes using markdown that is locally stored, this tool will be super handy. I use it frequently to manage and search some obscure reference I wrote somewhere.

## Tech Stack
QueryMD is built using **Python**. It utilizes **ChromaDB** as a local vector database to store the numerical representations (embeddings) of your notes. These embeddings are generated using ChromaDB's built-in `SentenceTransformer` model (specifically "all-MiniLM-L6-v2" by default). For processing user queries and retrieving relevant information, the application interfaces with external **Large Language Models (LLMs)**, supporting providers like **Groq** and **OpenAI**. It also includes support for running models **completely locally via Ollama**. The application features a simple **Text User Interface (TUI)** for interaction and manages configuration through a `config.toml` file. It tracks changes in your notes using either **Git integration** (recommended) or file **modification times (mtime)**.

## Current features
QueryMD currently offers the following capabilities:
*   Search notes using keywords or phrases.
*   Store embeddings entirely locally using **ChromaDB**.
*   Support for using completely local AI models via Ollama.
*   Integrate with **Git repositories** to track note changes and update embeddings.
*   Track changes in notes using a state file (as an alternative to Git).
*   Utilize AI to understand the context of your notes for relevant results.
*   Full support for parsing and extracting text from markdown files.
*   Provide a simple TUI for user interaction.
*   Allow customization through a configuration file.
*   Include additional contextual information from the LLM provider in responses.
*   Provide note references in the query results to locate source material easily.
*   Support multiple LLM providers including Groq and OpenAI.
