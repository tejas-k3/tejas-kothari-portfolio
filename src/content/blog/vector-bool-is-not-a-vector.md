---
title: "vector<bool> is not quite a vector"
date: 2026-06-24
category: Tech
tags: [cpp, stl]
summary: "A space-saving specialization that quietly breaks reference semantics."
draft: false
---

`vector<bool>` looks like a normal vector of bools, but it is a special optimized version that usually stores values as **packed bits**. That saves memory and changes behavior in ways that surprise generic code.

## What a vector should do

For `vector<int>`, `operator[]` returns a real reference:

```cpp
vector<int> nums = {10, 20, 30};
int& ref = nums[0];
ref = 99;   // nums[0] is now 99
```

## What vector<bool> does

A single bit cannot be referenced like a real object, so `operator[]` returns a **proxy object** instead:

```cpp
vector<bool> flags = {true, false, true};
auto x = flags[0];   // x is the proxy, not a bool
bool y = flags[0];   // y is a real bool

is_same_v<decltype(flags[0]), bool>   // false
is_same_v<decltype(y), bool>          // true

// bool& ref = flags[0];   // does not compile
```

The proxy still writes through. `auto proxy = flags[0]; proxy = false;` changes `flags[0]`.

## Where it hurts

Any template that assumes `T&` semantics breaks:

```cpp
template <typename T>
void flip_first(vector<T>& data) {
    T& ref = data[0];   // not valid for vector<bool>
    ref = !ref;
}
```

The `vector<bool>`-safe version uses value semantics:

```cpp
void flip_first_bool_safe(vector<bool>& data) {
    bool value = data[0];
    data[0] = !value;
}
```

## Takeaway

Use `vector<bool>` only when compact storage really matters. Otherwise `vector<char>`, `vector<uint8_t>` or an explicit bit structure behaves like a normal container.
