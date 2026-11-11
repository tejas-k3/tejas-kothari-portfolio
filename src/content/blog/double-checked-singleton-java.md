---
title: "A thread-safe Singleton in Java"
date: 2023-08-31
category: Tech
tags: [java, concurrency, design-patterns]
summary: "volatile, a private constructor and double-checked locking."
draft: false
---

A Singleton gives you exactly one instance. The hard part is keeping that true when several threads ask for it at the same time.

```java
public class Singleton {
    private static volatile Singleton instance;

    private Singleton() { }

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

## The pieces

- **Private constructor:** nothing outside the class can instantiate it.
- **`volatile` instance:** holds the single instance, and makes sure threads see its latest value.
- **Double check:** the first `if` skips locking once the instance exists. The second `if`, inside `synchronized`, covers two threads that both passed the first check.

## Why not synchronize everything?

Synchronization adds overhead, since it means acquiring and releasing locks. It is essential for thread safety, but excessive use leads to contention and slower code. With double-checked locking, the lock is only paid for while the instance is first being created.
