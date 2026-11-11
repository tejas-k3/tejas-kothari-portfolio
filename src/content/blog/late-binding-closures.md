---
title: "Late binding closures in Python"
date: 2026-08-23
category: Tech
tags: [python, closures]
summary: "Why a list of lambdas all return the same number."
draft: false
---

A closure captures the *variable*, not a snapshot of its value. The variable is looked up when the function is **called**, not when it is created. That is late binding.

```python
functions = []
for i in range(3):
    functions.append(lambda: i)

for f in functions:
    print(f())   # 2, 2, 2
```

After the loop finishes, `i == 2`. All three lambdas point at that same `i`:

```
function 1 ──┐
function 2 ──┼──> i == 2
function 3 ──┘
```

## The fix

```python
functions = []
for i in range(3):
    functions.append(lambda i=i: i)

for f in functions:
    print(f())   # 0, 1, 2
```

`i=i` evaluates the right-hand `i` *now* and stores it as the function's default argument. This works because default arguments are evaluated when the function is **created**, while a closure variable is looked up when the function is **called**.

- `lambda: i` means "look up `i` when I am called."
- `lambda i=i: i` means "evaluate `i` now and keep it."

## Still on my list

Inspect `f.__closure__` and `f.__defaults__`, understand closure cells, and play with `nonlocal`.
