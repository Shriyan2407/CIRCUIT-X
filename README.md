# CIRCUIT-X
## Dynamic Network Reliability & Failure Recovery System
### A University DSA Project

```
============================================================
                       CIRCUIT-X
     Dynamic Network Reliability & Failure Recovery
============================================================
              DSA NETWORK SIMULATION SYSTEM
============================================================
```

---

## 1. Project Overview

**CIRCUIT-X** is a terminal-based network reliability and failure recovery simulation system built entirely in Java. It models a computer network as a weighted, undirected graph and demonstrates core Data Structures and Algorithms through interactive simulation of network failures, path finding, and automated recovery.

---

## 2. Problem Statement

Modern computer networks must remain operational even when individual nodes (routers, computers) or links (cables, connections) fail. Network engineers need tools to:
- Visualize network topology
- Detect failures quickly
- Find alternate routes automatically
- Measure network reliability

CIRCUIT-X simulates this entire lifecycle in a terminal environment.

---

## 3. Objectives

- Build a working graph-based network using adjacency list representation
- Implement BFS and DFS traversal algorithms from scratch
- Implement Dijkstra's shortest path with a custom Min-Heap Priority Queue
- Simulate node and edge failures
- Automatically recover the network by finding alternate routes
- Generate real-time reliability reports

---

## 4. DSA Concepts Implemented

| Concept | Implementation | File |
|---|---|---|
| **Graph** | Weighted, undirected graph | `Graph.java` |
| **Adjacency List** | `HashMap<String, List<Edge>>` | `Graph.java` |
| **BFS** | Queue (LinkedList, FIFO) | `PathFinder.java` |
| **DFS** | Recursion (implicit call stack) | `PathFinder.java` |
| **Dijkstra** | dist[] + predecessor map + MinHeap | `PathFinder.java` |
| **Priority Queue** | Backed by custom MinHeap | `MinHeap.java` |
| **Min-Heap** | Binary heap in array | `MinHeap.java` |
