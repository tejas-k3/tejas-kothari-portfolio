---
title: "What is __all__ in Python?"
date: 2023-07-26
category: Tech
tags: [python, modules]
summary: "A keyword I spotted in CPython's asyncio that controls what `import *` exposes."
draft: false
---

While reading [CPython's `asyncio/__init__.py`](https://github.com/python/cpython/blob/3.11/Lib/asyncio/__init__.py), I noticed `__all__` and got curious.

It lists the names a module exposes when someone does `from module import *`.

```python
# AllVariable.py

def public_function():
    pass

def _private_function():
    pass

public_variable = 42
_private_variable = 10

__all__ = ['public_function', 'public_variable']
```

Now `from AllVariable import *` brings in only `public_function` and `public_variable`. The underscore-prefixed names stay out, ready for the module's internal use.
