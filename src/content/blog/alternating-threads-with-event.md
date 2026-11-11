---
title: "Alternating threads with Python's Event"
date: 2026-05-11
category: Tech
tags: [python, threading]
summary: "Printing foobar in order is the easy part; the ordering is the interesting part."
draft: false
---

This is [LeetCode's print FooBar alternately](https://leetcode.com/problems/print-foobar-alternately/): two threads, one prints `foo`, the other `bar`, and the output must alternate.

The printing is not the interesting part. The interesting part is how synchronization **creates ordering** between two threads that would otherwise run in any order.

```python
class FooBar:
    def __init__(self, n):
        self.n = n
        self.foo_printed = Event()
        self.bar_printed = Event()
        self.bar_printed.set()   # lets foo go first

    def foo(self, printFoo):
        for i in range(self.n):
            self.bar_printed.wait()
            self.bar_printed.clear()
            printFoo()
            self.foo_printed.set()

    def bar(self, printBar):
        for i in range(self.n):
            self.foo_printed.wait()
            self.foo_printed.clear()
            printBar()
            self.bar_printed.set()
```

Each thread waits for the other's signal, consumes it with `clear()`, does its work, then signals back. With `n = 5` the output is `foobarfoobarfoobarfoobarfoobar`.

`bar_printed` starts out set so `foo` is allowed to run first. `bar` has nothing to do until `foo_printed` is set.

## Another one: H2O

The same file keeps a semaphore version, [building H2O](https://leetcode.com/problems/building-h2o/): `Semaphore(2)` for hydrogen, `Semaphore(1)` for oxygen, and a `Barrier(3)` so three threads assemble a molecule together.

## Where I want to go

This feels like one of those tiny examples that opens a deeper systems rabbit hole. Next: read CPython's `Event`, redo this with a semaphore or condition variable, trace blocking and wakeup, and study memory ordering and scheduling underneath.
