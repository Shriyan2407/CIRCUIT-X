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

### Adjacency List Example
```
A -> B(4), C(2)
B -> A(4), D(5), E(3)
C -> A(2), E(6), F(7)
D -> B(5), E(1), G(4)
...
```

### Min-Heap Operations
- `insert()` → O(log n) — bubble up
- `extractMin()` → O(log n) — bubble down
- `peek()` → O(1)

### Dijkstra Relaxation
```
if dist[u] + weight(u,v) < dist[v]:
    dist[v] = dist[u] + weight(u,v)
    prev[v] = u
```

---

## 5. Modules

| Module | Description |
|---|---|
| **Module 1** | Network Creation — `addNode()`, `addEdge()` |
| **Module 2** | Graph Management — `removeNode()`, `removeEdge()`, `updateWeight()` |
| **Module 3** | Failure Detection — `detectFailure()`, `markFailed()` |
| **Module 4** | Network Traversal — `bfsTraverse()`, `dfsTraverse()` |
| **Module 5** | Connectivity Analysis — `isConnected()`, `findComponents()` |
| **Module 6** | Path Finding — `dijkstra()`, `getShortestPath()` |
| **Module 7** | Recovery / Rerouting — `recoverNetwork()`, `rerouteTraffic()` |
| **Module 8** | Reliability Report |
| **Module 9** | Automated Demo Mode |

---

## 6. Architecture

```
Main.java               ← Entry point & interactive menu
├── Graph.java          ← Adjacency list graph structure
│   ├── Node.java       ← Network node (router/computer)
│   └── Edge.java       ← Network link with weight + failure state
├── MinHeap.java        ← Custom binary min-heap implementation
├── PathFinder.java     ← BFS, DFS, Dijkstra algorithms
├── FailureManager.java ← Node/edge failure tracking
├── NetworkAnalyzer.java← Connectivity analysis, components
├── RecoveryEngine.java ← Recovery and traffic rerouting
├── ReliabilityReport.java ← Live reliability report generator
├── NetworkDemo.java    ← Automated 15-step demonstration
└── Colors.java         ← ANSI terminal color codes
```
