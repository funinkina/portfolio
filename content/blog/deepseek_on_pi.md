---
date : '2025-01-31T23:42:36+05:30'
draft : false
title : 'Running Deepseek on Raspberry Pi'
tags: ['LLM', 'Raspberry Pi']
---
Let's start by addressing the elephant in the room, why? Why would I run a freaking Large Language Model on a 4-core arm processor with 4GB of RAM? Well, why not? I have a Raspberry Pi 4 lying around and I wanted to see if I could run Deepseek on it. (Also cause free content for the blog). Before starting, let me say, I have absolutely zero expectations from this experiment. I am not expecting it to work, I am not expecting it to be fast, I am not expecting it to be usable. I am just doing it because I can. So, let's get started.

## 🛠️ Setting up the Pi
I am using a Raspberry Pi 4 with 4GB of RAM. I have installed the latest version of Raspberry Pi OS Lite which is based on Debian. I don't have a spare keyboard or mouse laying around, so it's going headless on my home router. Therefore all the commands will be run over SSH.

![Raspberry Pi 4](/blog-assets/PXL_20240127_130937347.jpg)

## 🧑‍💻 Setting up Software
To run the Deepseek model, without much hassle, the obvious choice is Ollama. It provides us with simple commands to run the model. So, let's start by installing Ollama. This command is from the official [webiste](https://ollama.com/download).

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

{{< box info >}}
**A note about Raspberry's SD Card Storage**

I would not recommend using the default SD card for running the model. The SD card is not designed for heavy read-write operations. It will wear out quickly. I would recommend using an external SSD or a USB drive for running the model. In my case, I am using a 16GB Sandisk USB drive. It is ext4 formatted and mounted at `/mnt/usb`.
{{< /box >}}

## ⬇️ Getting the model
Since we are using USB for storing the model, we need to set the `OLLAMA_MODELS` environment variable to point to the USB drive. I have added the following line to my `.bashrc` file.

```bash
export OLLAMA_MODELS=/mnt/usb/ollama/models
```

Now the path is sorted out, let's download the model. Let's start with the smallest model, `deepseek-r1:1.5b`. This has 1.5 billion parameters and is around 1.4GB in size. We can download and run it using the following command.

```bash
ollama pull deepseek-r1:1.5b
ollama run deepseek-r1:1.5b
```

I asked it some basic questions, the speed is around 2 tokens per second, which is horrible. But it works. I am not going to use it for anything, but it's fun to see it work.

{{< box warning >}}
**A note about the model size**

The model is around 1.4GB in size. The Raspberry Pi 4 has 4GB of RAM. So, you can't run the model along with any other heavy process. The model itself takes around 3GB of RAM. So, you are left with 1GB of RAM for the OS and other processes. If you want to run the model along with other processes, I would recommend using a model with fewer parameters.
{{< /box >}}

![Deepseek 1.5b example](/blog-assets/deepseek-running.gif)

As you can see this is definitely not 200 tokens/sec, but not bad for a hardware with 4GB of RAM and no GPU. Also considering the fact that the model has only 1.5 Billion parameters, it is definitely usable for some basic tasks. The model also seems to reason before the answer, which is something you don't have to pay $200 for, and I think that's pretty cool in itself.

## ⏳ Performance and comparisons
Let's actually see if the result is any good. Here's the entire output:

### Deepseek R1 1.5B
```
<think>
To determine the shortest path between two points on a weighted graph, I should consider using
Dijkstra's algorithm or BFS (Breadth-First Search), depending on whether the weights are uniform or
variable. These algorithms will help efficiently find the optimal route with minimal computational
effort.
</think>

**Solution:**

To find the shortest path between two points in a **weighted graph**, you can use either **Dijkstra's
Algorithm** or **Breadth-First Search (BFS)**, depending on whether the weights are uniform or variable.
Here's a concise approach:

1. **Understand the Graph Type:**
   - **Uniform Weights:** All edges have the same weight.
   - **Variable Weights:** Edges can have different weights.

2. **Choose an Appropriate Algorithm:**

   - **Dijkstra's Algorithm**:
     - Suitable for graphs with non-negative (variable) edge weights.
     - Works efficiently even for large graphs by using a priority queue to process nodes in order of
their current shortest distance from the start node.

   - **Breadth-First Search (BFS):**
     - Appropriate for graphs with uniform edge weights.
     - Works level by level, expanding all nodes at the present depth before moving on to nodes at the
next depth level.

3. **Apply the Algorithm:**

   - **Dijkstra's Algorithm Steps:**
     1. Initialize distances to all nodes as infinity, except the starting node (distance = 0).
     2. Use a priority queue (min-heap) to select the node with the smallest current distance.
     3. For each selected node, update its neighbors' distances if a shorter path is found.
     4. Repeat until the destination node is reached or all nodes are processed.

   - **BFS Steps:**
     1. Use a queue to process nodes level by level.
     2. For each node, explore its neighbors and enqueue them if they haven't been visited yet.
     3. Keep track of distances and stop when the destination is found.

4. **Determine the Shortest Path:**

   - After processing all relevant nodes using your chosen algorithm:
     - If you used Dijkstra's Algorithm, look at the smallest distance to the destination node.
     - If you used BFS (for uniform weights), note which path reached the destination first.

**Final Answer:**

To find the shortest path between two points in a weighted graph, use **Dijkstra's Algorithm** for
variable weights or **Breadth-First Search (BFS)** for uniform weights. Both methods efficiently
determine the optimal route with minimal effort by prioritizing nodes based on their current distance
from the start point.

\boxed{\text{Use Dijkstra's Algorithm for variable weights and BFS for uniform weights}}

```

### GPT 4o

```
The best approach depends on the graph's properties:

1. **Dijkstra’s Algorithm** – Best for graphs with non-negative weights. Uses a priority queue to efficiently find the shortest path.
2. **A\*** (A-star) – Optimized version of Dijkstra’s that uses a heuristic (e.g., Euclidean distance) to prioritize paths, making it faster in many cases.
3. **Bellman-Ford** – Handles graphs with negative weights but is slower (\(O(VE)\)).
4. **Floyd-Warshall** – Best for all-pairs shortest paths in dense graphs (\(O(V^3)\)).
5. **Bidirectional Dijkstra/A\*** – Searches from both the start and goal for faster performance in large graphs.

For most real-world scenarios with non-negative weights, **Dijkstra’s or A\*** is the best choice.
```

Honestly speaking, there is some obvious knowledge gap, but what else can you expect with a that many parameters.


Now I have some bad news to break to you guys, the way the model runs locally, it has to copy itself entirely in the memory for processing, that means the model's size can't be more than the available RAM. So, the 1.5b model is the largest model that can run on a Raspberry Pi 4 with 4GB of RAM. The only other model we can fit under 4GB is the Deepseek Coder model, that has 1.3 Billion parameters in only 776MB. Let's see how that goes.
For this model, I gave it a [hard leetcode question](https://leetcode.com/problems/making-a-large-island/description/), and it gave this:

```
Here's a Python solution using depth-first search to find connected components in the given binary
matrix, then calculate areas for each component. We keep track of maximum area obtained so far and also
count total number of unique grids that we can form by including current grid into result after changing
one 0 cell as per requirements:
```python3
class Solution(object):
    def largestIsland(self, grid):
        self.seen = set() # keep track seen nodes to avoid duplicate visit for same node in DFS function
call stack memory and speed up the solution significantly when a large area is found

        directions=[(1,0),(-1,0),(0,1),(0,-1)]# possible direction right down left top   (up) are
excluded from consideration as they can't form an island with current cell    i.e already visited in DFS
call stack memory and speed up the solution significantly when a large area is found

        def dfs(r, c): # depth first search to explore all connected cells of this grid   (cell r,c)
for which we want calculate its maximum size island if it's not visited before then return zero as per
problem requirements since that means an empty cell so the area will be zeros
            self.seen.add((r, c)) # add current node into seen to avoid duplicate visit in DFS call
stack memory and speed up solution when a large grid is found

            ret = 1 if not (r + 1 < len(grid) and r - 1 >= 0 and c + 1 < len(grid[0]) and c-  1>=0 )
else dfs((r+1),c)*dfs(r,c-(1))*dfs(r,(c+ 1)) * df s
            # return size of this connected component (if it's not seen before) otherwise zero. If
current cell can be visited then recursively call DFS function on its neighbouring cells if they are in
the grid  else consider only diagonal neighbours as per problem requirement for making an island from
that particular non-visited adjacent cell and add to result

            # Return size of this connected component (if it's not seen before) otherwise zero. If
current cell can be visited then recursively call DFS function on its neighbouring cells if they are in
the grid  else consider only diagonal neighbours as per problem requirement for making an island from
that particular non
```

Which yea I would agree is not great, or even right. I asked it in C++ and it gave me a Python solution. But hey, it's running on a Raspberry Pi 4, so I am not complaining. I am just happy it works.

## 📊 Benchmarks
I ran some benchmarks to see how the model performs on the Raspberry Pi 4. I used the [ollama-bench](https://github.com/dalist1/ollama-bench) tool to measure the time taken to generate the output for a given input. Here are the results:

```
⭐ Benchmark results for deepseek-coder:
  Total time: 42.97 seconds
  Tokens generated: 93
  Tokens per second: 4.57
```

## 🎯 Conclusion

So, can you run Deepseek on a Raspberry Pi 4? Yes, you can. Is it usable? Not really.The model is too large for the available RAM and the performance is abysmal. But it works! 🎊

If you have a Raspberry Pi 4 lying around and want to run a Large Language Model on it, you can. Just don't expect it to be fast or usable. 🐌 It's more of a fun experiment than anything else. But hey, it's cool to see a Large Language Model running on a Raspberry Pi 4! 🤖 And that's all that matters. I still consider deepseek a huge win for the open source community! 🌟 💪

![My Raspberry Pi 4 running Deepseek](/blog-assets/PXL_20240123_184438843.jpg)
