---
title: "Python's recursion limit and the call stack"
date: 2023-08-12
category: Tech
tags: [python, recursion]
summary: "Reading and raising the recursion depth, with a parentheses generator to look at the stack."
draft: false
---

I recently found that Python lets you configure the **recursion depth** of a program through the `sys` module. The default is 1000.

```python
import sys

print(sys.getrecursionlimit())   # 1000
sys.setrecursionlimit(5000)
```

## Something to recurse on

A generator of balanced parentheses. It adds `(` while it still has budget and `)` whenever there are more opens than closes:

```python
def generator(stringVal, limit):
    openCount = stringVal.count('(')
    closeCount = stringVal.count(')')

    if not limit:
        if openCount == closeCount:
            print(stringVal)
        elif openCount > closeCount:
            generator(stringVal + ')', limit)

    if openCount == closeCount and limit:
        generator(stringVal + '(', limit-1)
    elif openCount > closeCount and limit:
        generator(stringVal + '(', limit-1)
        generator(stringVal + ')', limit)

generator("", 3)
```

For `limit = 3` it prints:

```
((()))
(()())
(())()
()(())
()()()
```

My comment on it says the time complexity is O(2^n), since each step can branch two ways.

## What the stack looks like

A very simplified view, where every call gets its own frame:

```
| Return Address | <- Third call
| stringVal: "()" , limit: 1 |
| Return Address | <- Second call
| stringVal: "("  , limit: 2 |
| Return Address | <- First call
| stringVal: ""   , limit: 3 |
```

Each call makes the operating system allocate memory for a new stack frame, and the stack pointer moves to it. The recursion limit is Python's guard against piling those up forever.
