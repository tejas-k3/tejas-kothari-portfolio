---
title: "Why does BFS use a queue?"
date: 2023-08-01
category: Tech
tags: [python, graphs, algorithms]
summary: "Level by level: why a queue, and not a stack, drives breadth-first search."
draft: false
---

While exploring graph data structures, I wondered why BFS uses a **queue** rather than another container like a stack. [This Stack Overflow answer](https://stackoverflow.com/questions/39731498/why-does-the-bfs-algorithm-use-a-queue) cleared it up for me.

BFS works **level by level**. A queue keeps the steps in order: every node at the current level is processed before moving on to the next one. That lets BFS explore neighbor nodes first before diving deeper, which is exactly the breadth-first pattern. A queue is the natural fit because it preserves that ordering.

## The traversal

The code I kept alongside this note is a standard BFS over a directed graph stored as an adjacency list (credited in the file to Neelam Yadav):

```python
def BFS(self, s):
    visited = [False] * (max(self.graph) + 1)
    queue = []

    queue.append(s)      # mark the source visited and enqueue it
    visited[s] = True

    while queue:
        s = queue.pop(0)  # dequeue a vertex and print it
        print(s, end=" ")

        for i in self.graph[s]:
            if visited[i] == False:
                queue.append(i)   # mark visited, then enqueue
                visited[i] = True
```

Dequeue a vertex, look at its unvisited neighbors, mark them visited and enqueue them. Because new neighbors go to the back, the current level always finishes first.

Starting from vertex 2 on the sample graph, it prints `2 0 3 1`.
