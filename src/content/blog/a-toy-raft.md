---
title: "A toy Raft, and everything it skips"
date: 2025-03-07
category: Tech
tags: [python, raft, consensus]
summary: "A small Raft sketch covering elections, log replication and heartbeats, plus its honest limits."
draft: false
---

I wrote a small Raft sketch in Python to get the shape of the algorithm into my head. It is deliberately simplified.

## What a node holds

Each `RaftNode` keeps its state (`follower`, `candidate` or `leader`), the `current_term`, who it `voted_for`, a `log`, and a `commit_index`. It also gets a random `election_timeout` between 150 and 300 ms.

## Leader election

A node starts an election by incrementing its term and voting for itself. It asks its peers for votes and becomes leader if it gets a majority.

```python
def start_election(self):
    self.current_term += 1
    self.voted_for = self.node_id
    votes = 1  # vote for itself
    for peer in self.peers:
        if peer.vote_for(self.node_id, self.current_term):
            votes += 1
    if votes > len(self.peers) / 2:
        self.state = "leader"
```

## Log replication and heartbeats

The leader appends an entry to its log and "sends" it to followers, which append it too. A leader also sends heartbeats; a follower that gets one with a term at least as high as its own steps back to follower and resets its election timeout.

## What it does not do

- No log persistence and no network failures.
- No mechanism to apply log entries to a state machine.
- A simple voting rule that ignores network partitions.

Real implementations such as etcd or ZooKeeper handle all of that and give you something you can actually build configuration data or distributed locks on.
