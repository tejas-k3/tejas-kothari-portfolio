---
title: "Threads vs asyncio: one port allocator, two ways"
date: 2023-08-01
category: Tech
tags: [python, asyncio, threading]
summary: "The same small allocator written with threading and with async/await."
draft: false
---

Two ways to get concurrency in Python, using the same tiny `PortAllocator` that hands out the lowest free port.

## Threading

Multiple threads give you concurrency, but the Global Interpreter Lock lets only one run Python bytecode at a time. It suits I/O-bound work, where a thread can switch while waiting.

Since threads can interleave, the sync version guards the shared set with a lock:

```python
def allocate_sync(self):
    with self.lock:
        for port in range(1025):
            if port not in self.allocated_ports:
                self.allocated_ports.add(port)
                return port
        raise Exception("No free ports available.")
```

## async / await

`asyncio` handles many concurrent I/O operations without multiple threads. The async version has **no lock**:

```python
async def allocate_async(self):
    for port in range(1025):
        if port not in self.allocated_ports:
            self.allocated_ports.add(port)
            return port
```

There is no `await` inside the method, so it cannot be interrupted halfway through.

## Running both

Three "users" each take a port, and the async ones simulate work with `await asyncio.sleep(1)` before releasing it.

- **Threaded:** every user got port `0`. Each thread allocated and released immediately, so they happened to run one after another.
- **Async:** users got ports `0`, `1`, `2`, because all three tasks ran under `asyncio.gather` and held their ports while sleeping.

Same allocator, but the async run is what actually overlapped.
