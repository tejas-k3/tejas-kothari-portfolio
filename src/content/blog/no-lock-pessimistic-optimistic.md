---
title: "No lock, pessimistic lock, optimistic lock"
date: 2026-07-30
category: Tech
tags: [python, threading, locking]
summary: "Selling the last item twice, then fixing it two ways."
draft: false
---

One product, quantity 1, two threads trying to buy it. Each version sleeps one second between checking and updating, to make the problem easy to see.

## 1. No locking

```python
def buy_without_lock():
    if product.quantity > 0:
        time.sleep(1)
        product.quantity -= 1
        print("Purchased")
```

Both threads read `quantity=1` before either updates it, so both believe the product is available:

```
Thread-1 sees quantity=1
Thread-2 sees quantity=1
Thread-2 Purchased
Thread-1 Purchased
Final Quantity: -1
```

A race condition. We sold something we did not have.

## 2. Pessimistic locking

Take the lock before even looking.

```python
def buy_with_lock():
    with product.lock:
        if product.quantity > 0:
            time.sleep(1)
            product.quantity -= 1
```

Only one thread gets in. The second waits, then checks again and finds nothing left:

```
Thread-1 Purchased
Thread-2 Out of Stock
Final Quantity: 0
```

## 3. Optimistic locking

Do not lock while reading. Remember the `quantity` and `version`, and only lock briefly to commit.

```python
with product.lock:
    if version != product.version:
        print("Version Changed... Retrying")
        continue
    product.quantity -= 1
    product.version += 1
```

If someone else committed first, the version has moved, so the thread retries:

```
Thread-1 Purchased
Thread-2 Version Changed... Retrying
Thread-2 Out of Stock
Final Quantity: 0
```

## The difference

Pessimistic locking holds the lock for the whole read-think-write. Optimistic locking holds it only for the commit, and pays with a retry loop when it loses.
