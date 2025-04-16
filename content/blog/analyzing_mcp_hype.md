---
title : 'Analyzing_mcp_hype'
subtitle: ''
date : '2025-04-16T14:37:16+05:30'
draft : true
tags : ['LLMs', 'AI', 'MCP']
toc: true
next: true
---
# Starting from the basics
## Why the hype?
Let's be real, we all have been in a situation where we need to write a professional email, and send it with slight changes to a lot of people. You surely can use ChatGPT to write it, but wouldn't it be better if it can also send to the peope you want? Specifically curated for each one of them. So wouldn't it be great if your LLMs can just do the task for you? This is where MCP steps in.

## Origin of MCP
In November of last year, Anthropic introduced the [Model Context Protocol (MCP)](https://www.anthropic.com/news/model-context-protocol), and it quickly gained significant traction in the AI community. Its popularity has surged to the point where major players like Google, OpenAI, and Microsoft have begun to adopt it.

MCP is designed to enhance the capabilities of Large Language Models (LLMs) by enabling them to seamlessly interact with external tools and APIs. This empowers LLMs to execute tasks that necessitate real-time data access, such as retrieving information from databases, initiating API calls, or running code. Essentially, MCP streamlines the integration of LLMs into diverse applications and workflows by providing a unified protocol for all interactions.

MCP is supposed to be a standard protocol for interacting with the LLM and creating new agents. Let's hope it doesn't get like [XKCD 927](https://xkcd.com/927/) where we have a million different protocols for the same thing.
![XKCD on Standards](https://imgs.xkcd.com/comics/standards.png)

## But didn't we already had function calling?
Yes, we still have and it is great for making your LLM's perform an action on your behalf, but given the number of LLMs and the number of APIs that is growing exponentially, it is becoming increasingly difficult to keep track of all the different APIs and their respective function calling formats. MCP aims to solve this problem by providing a unified interface for all LLMs and APIs, making it easier for developers to integrate them into their applications.

To give you an idea of how many formats for function calling we have, here are some of the most popular ones:
- ### OpenAI's function calling
```python
tools = [{
    "type": "function",
    "name": "get_weather",
    "description": "Get current temperature for a given location.",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City and country e.g. Bogotá, Colombia"
            }
        },
        "required": [
            "location"
        ],
        "additionalProperties": False
    }
}]
```

- ### Claude's function calling
```python
response = client.messages.create(
    model="claude-3-7-sonnet-20250219",
    max_tokens=1024,
    tools=[
        {
            "name": "get_weather",
            "description": "Get the current weather in a given location",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "The unit of temperature, either 'celsius' or 'fahrenheit'"
                    }
                },
                "required": ["location"]
            }
        }
    ]
```

- ### Gemini's function calling
```python
set_light_values_declaration = {
    "name": "set_light_values",
    "description": "Sets the brightness and color temperature of a light.",
    "parameters": {
        "type": "object",
        "properties": {
            "brightness": {
                "type": "integer",
                "description": "Light level from 0 to 100. Zero is off and 100 is full brightness",
            },
            "color_temp": {
                "type": "string",
                "enum": ["daylight", "cool", "warm"],
                "description": "Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.",
            },
        },
        "required": ["brightness", "color_temp"],
    },
}
```
As you can see, there is no standardized way to do function calling. If your workflow uses one of these models, and you want to switch to a different model by a different provider, you have to refactor your whole code. I know as a programmer you love to refactor codebase, but I think we can all agree refactoring something as simple as function calling is not the best use of our time.

## Limitations of function calling
Function calling works well for very structured and specific kinds of output, but as the complexity of the workflow increases, you cannot rely on just function calling. You cannot have implement functions that requires some form of creative thinking that the newer models provide. On top of that function calling is not very reliable, specially when you have a lot of them and certain criteria to call them. LLMs can often miss the function call, or even worse, call the wrong function at the wrong time. Given all this, something like MCP was imminent.

# Getting deeper into MCP
Compared to Function Calling, MCP is a more flexible and powerful way to interact with LLMs. Imagine the function calling but on steroids. So let's see how MCP actually works. You can think of MCP protocol very similar to HTTP requests. You got your server, that executes/processes stuff and you client, the LLM that sends the request and get things done for the user. Let's see how this works in practice.
## MCP Architecture
![MCP Architecture](/blog-assets/mcp_architecture.png)

## Understanding through an example
One of my favourite real world use cases of MCP is how it can be used to reverse engineer any executable of compiled code. Lets understand how MCP works with the example of [GhidraMCP](https://github.com/LaurieWired/GhidraMCP/). Ghidra is a popular open-source reverse engineering tool developed by the NSA. It provides a powerful framework for analyzing and decompiling binary files. GhidraMCP is a plugin that integrates the Model Context Protocol (MCP) into Ghidra, allowing users to leverage the capabilities of large language models (LLMs) for reverse engineering tasks.

For someone who is a beginner in the field of reverse engineering, GhidraMCP can be a valuable tool to help them understand and analyze binary files more effectively. It can assist in tasks such as:
- **Code Analysis**: GhidraMCP can help users analyze the control flow and data flow of a binary, making it easier to understand how the code works.
- **Function Identification**: The plugin can assist in identifying functions and their parameters, which is crucial for understanding the functionality of the binary.
- **Decompilation**: GhidraMCP can help decompile binary code into a higher-level representation, making it easier to read and understand.
- **Documentation Generation**: The plugin can generate documentation for the analyzed binary, providing insights into its structure and functionality.
- **Automated Analysis**: GhidraMCP can automate certain reverse engineering tasks, saving time and effort for users.

## Environment Setup
To get started with GhidraMCP, you need an MCP client and server as we saw earlier. Here we are using [Claude Desktop](https://claude.ai/download) as our client and [Ghidra](https://ghidra-sre.org/) with [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk) as our server.

### Server Setup
Here we are using MCP Python SDK to initialise the server. You can use any other server as long as it is compatible with MCP. The server is responsible for handling requests from the client and executing the necessary actions. It acts as a bridge between the LLM and the Ghidra tool.
```python
import sys
import requests
import argparse
import logging

from mcp.server.fastmcp import FastMCP

DEFAULT_GHIDRA_SERVER = "http://127.0.0.1:8080/"

logger = logging.getLogger(__name__)

mcp = FastMCP("ghidra-mcp")

# Initialize ghidra_server_url with default value
ghidra_server_url = DEFAULT_GHIDRA_SERVER
```

and the endpoints to handle requests from the client.
```python
def safe_get(endpoint: str, params: dict = None) -> list:
    """
    Perform a GET request with optional query parameters.
    """
    if params is None:
        params = {}

    url = f"{ghidra_server_url}/{endpoint}"

    try:
        response = requests.get(url, params=params, timeout=5)
        response.encoding = 'utf-8'
        if response.ok:
            return response.text.splitlines()
        else:
            return [f"Error {response.status_code}: {response.text.strip()}"]
    except Exception as e:
        return [f"Request failed: {str(e)}"]

def safe_post(endpoint: str, data: dict | str) -> str:
    try:
        if isinstance(data, dict):
            response = requests.post(f"{ghidra_server_url}/{endpoint}", data=data, timeout=5)
        else:
            response = requests.post(f"{ghidra_server_url}/{endpoint}", data=data.encode("utf-8"), timeout=5)
        response.encoding = 'utf-8'
        if response.ok:
            return response.text.strip()
        else:
            return f"Error {response.status_code}: {response.text.strip()}"
    except Exception as e:
        return f"Request failed: {str(e)}"
```

All the tools in MCP are decorated with `@mcp.tool` decorator. This decorator registers the function as a tool in the MCP server, allowing it to be called by the client. For example:
```python
@mcp.tool()
def decompile_function(name: str) -> str:
    """
    Decompile a specific function by name and return the decompiled C code.
    """
    return safe_post("decompile", name)

@mcp.tool()
def rename_function(old_name: str, new_name: str) -> str:
    """
    Rename a function by its current name to a new user-defined name.
    """
    return safe_post("renameFunction", {"oldName": old_name, "newName": new_name})

@mcp.tool()
def rename_data(address: str, new_name: str) -> str:
    """
    Rename a data label at the specified address.
    """
    return safe_post("renameData", {"address": address, "newName": new_name})
```
{{<  box info  >}}
All the actual interactions with the Ghidra Applicaiton is written in Java. You can find them in the github repo mentioned above.
{{<  /box  >}}
## Client Setup
Our client here is the Claude Desktop App. Claude desktop is great for this usecase because it has a built in MCP client support. The desktop will connect to our MCP server and will automatically give us a list of available tools. This will enable claude to directly connect to Ghidra and perform all sorts and analysis and debugging for us.

Using the MCP client is very simple. Just start by entering the prompt in claude on what you want to achieve. The LLM is smart enough to figure out which tools and functions need to be called and what to do with the output. One of the most powerful features of MCP is that it allows you to chain multiple tools together. This means you can use the output of one tool as the input for another tool, creating a seamless workflow. In this example, we can ask Claude to find the `main` function in the application and rename all the methods based on their functionality. Let's go through the steps performed by the MCP and Claude.

### Calling `search_function_by_name`
```java
private String searchFunctionsByName(String searchTerm, int offset, int limit) {
    Program program = getCurrentProgram();
    if (program == null) return "No program loaded";
    if (searchTerm == null || searchTerm.isEmpty()) return "Search term is required";

    List<String> matches = new ArrayList<>();
    for (Function func : program.getFunctionManager().getFunctions(true)) {
        String name = func.getName();
        // simple substring match
        if (name.toLowerCase().contains(searchTerm.toLowerCase())) {
            matches.add(String.format("%s @ %s", name, func.getEntryPoint()));
        }
    }

    Collections.sort(matches);

    if (matches.isEmpty()) {
        return "No functions matching '" + searchTerm + "'";
    }
    return paginateList(matches, offset, limit);
}    
```
This will return the relevant function to the LLM. And let's say inside the function `main` it is calling methods named `NXjkBDBKJBFKd` and `sdDFnkmjwDKJbD` which is garbled or maybe a way to obfuscate the code. Now we can use the `decompile_function` tool to decompile the function and get the actual code.
```java
private String decompileFunctionByName(String name) {
    Program program = getCurrentProgram();
    if (program == null) return "No program loaded";
    DecompInterface decomp = new DecompInterface();
    decomp.openProgram(program);
    for (Function func : program.getFunctionManager().getFunctions(true)) {
        if (func.getName().equals(name)) {
            DecompileResults result =
                decomp.decompileFunction(func, 30, new ConsoleTaskMonitor());
            if (result != null && result.decompileCompleted()) {
                return result.getDecompiledFunction().getC();
            } else {
                return "Decompilation failed";
            }
        }
    }
    return "Function not found";
}
```
This will return the decompiled code of the function. Now we can use the `rename_function` tool to rename the function to something more meaningful. The MCP has all the context of the function and the code, so it can easily figure out what the function does and rename it accordingly. This is a very powerful feature of MCP, as it allows you to automate the process of renaming functions and variables based on their functionality.
All the functions calls we have used so far can be considered as `GET` requests to the server. The server will return the result of the function call. But now we need to rename the function, which is similar to a `POST` request to the server. The `rename_function` tool will take the old name and the new name as input and will rename the function in Ghidra. We can see the payload that is being sent with the request.
```json
{
    "oldName": "NXjkBDBKJBFKd",
    "newName": "get_user_info"
}
and the response from the server will be something like:
{
    "status": "success",
    "message": "Function renamed successfully"
}
And this is the actual code that is being executed on the server side to rename the function. If you are wondering why Java is being used here, it is because Ghidra is written in Java and the MCP server is just a plugin for Ghidra. So all the code that is being executed on the server side is in Java.
```java
private boolean renameFunction(String oldName, String newName) {
    Program program = getCurrentProgram();
    if (program == null) return false;

    AtomicBoolean successFlag = new AtomicBoolean(false);
    try {
        SwingUtilities.invokeAndWait(() -> {
            int tx = program.startTransaction("Rename function via HTTP");
            try {
                for (Function func : program.getFunctionManager().getFunctions(true)) {
                    if (func.getName().equals(oldName)) {
                        func.setName(newName, SourceType.USER_DEFINED);
                        successFlag.set(true);
                        break;
                    }
                }
            }
            catch (Exception e) {
                Msg.error(this, "Error renaming function", e);
            }
            finally {
                program.endTransaction(tx, successFlag.get());
            }
        });
    }
    catch (InterruptedException | InvocationTargetException e) {
        Msg.error(this, "Failed to execute rename on Swing thread", e);
    }
    return successFlag.get();
}
```
This will rename the function to the new name. 