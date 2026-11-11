---
title: "Mutable default arguments in Python"
date: 2026-08-23
category: Tech
tags: [python, gotchas]
summary: "Default arguments are evaluated once, when the function is defined."
draft: false
---

Default arguments are evaluated **once**, when the function is defined, not on every call. That is harmless for numbers and strings, and surprising for a list, dict or set, because every call reuses the same object.

```python
def add(item=[]):
    item.append(1)
    return item

print(add())   # [1]
print(add())   # [1, 1]
print(add())   # [1, 1, 1]
```

The `[]` was created once and lives on the function itself. You can see it in `add.__defaults__`, which prints `([],)` and grows with each call.

## The usual pattern

```python
def add_safe(item=None):
    if item is None:
        item = []
    item.append(1)
    return item

print(add_safe())   # [1]
print(add_safe())   # [1]
print(add_safe())   # [1]
```

`None` signals "no list was given", and a **new** list is created per call.

## The problem is not mutability

Passing the same list explicitly is perfectly valid:

```python
items = []
print(add_safe(items))   # [1]
print(add_safe(items))   # [1, 1]
print(add_safe(items))   # [1, 1, 1]
```

Lists being mutable is fine. The surprise is that the *default* is shared across calls.

Related: [late binding closures](/blog/late-binding-closures) are the other side of the same rule, since defaults are evaluated when the function is created.
