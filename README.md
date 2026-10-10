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

---

## 7. How the Algorithms Work

### BFS (Breadth-First Search)
Uses a `Queue<String>` (FIFO). Visits nodes level by level. Used for connectivity checking and traversal visualization.

```
Queue: [A]
Visit A → Enqueue B, C
Queue: [B, C]
Visit B → Enqueue D, E
Queue: [C, D, E]
...
```

### DFS (Depth-First Search)
Uses recursion (implicit call stack). Explores as deeply as possible before backtracking. Used for component analysis.

```
Visit A → recurse B → recurse D → recurse G → backtrack
                                 → recurse H → backtrack
          → backtrack to A → recurse C → ...
```

### Dijkstra's Algorithm
Uses a custom `MinHeap`-backed priority queue. The `dist[]` array holds tentative shortest distances. The `prev[]` map enables path reconstruction.

```
Initialize: dist[A]=0, dist[*]=∞
Extract min from MinHeap → settle node u
For each neighbor v of u:
    if dist[u] + w(u,v) < dist[v]:
        dist[v] = dist[u] + w(u,v)   ← RELAXATION
        prev[v] = u
        insert/update v in MinHeap
```

---

## 8. How to Compile

### Requirements
- Java Development Kit (JDK) 11 or later
- Command prompt / PowerShell / Terminal

### Compile
```bash
cd CIRCUIT-X
javac *.java
```

All `.java` files compile to `.class` files in the same directory.

---

## 9. How to Run

```bash
java Main
```

You will see the main menu. **For a full demonstration, select option 20.**

### Quick demo run
```bash
javac *.java && java Main
```
Then enter `20` at the menu.

---

## 10. Example Terminal Session

```
============================================================
                       CIRCUIT-X
     Dynamic Network Reliability & Failure Recovery
============================================================
              DSA NETWORK SIMULATION SYSTEM

Enter your choice: 20

STEP 1 — Creating Sample Network (8 Nodes)
  + Node A added
  + Node B added
  ...
  + Edge A ──[4]── B

STEP 3 — BFS Traversal (starting from node A)
  BFS Order: A → B → C → D → E → F → G → H

STEP 6 — Simulating Edge Failure: B <-> D
  [FAILURE] Link B-D has FAILED.

STEP 9 — Finding Shortest Path: A → H
  Shortest Path: A → C → E → F → H
  Total Cost: 15

STEP 11 — Rerouting Traffic: A → H (with failures)
  ✓ Alternate route found!
  Alternate route: A → B → E → F → H
  RECOVERY SUCCESSFUL

STEP 15 — Reliability Report
  Total Nodes       : 8
  Active Nodes      : 7
  ...
  Overall Status    : OPERATIONAL (DEGRADED)
```

---

## 11. Menu Options

```
[NETWORK MANAGEMENT]
  1.  Create Network (wizard)
  2.  Add Node
  3.  Add Edge
  4.  Remove Node
  5.  Remove Edge
  6.  Update Edge Weight
  7.  Display Network

[TRAVERSAL & ANALYSIS]
  8.  BFS Traversal
  9.  DFS Traversal
  10. Check Connectivity
  11. Find Connected Components
  12. Find Shortest Path (Dijkstra)

[FAILURE & RECOVERY]
  13. Simulate Node Failure
  14. Simulate Edge Failure
  15. Detect Failures
  16. Recover Network
  17. Reroute Traffic

[REPORTS & DEMO]
  18. Network Reliability Report
  19. Reset Network
  20. Run CIRCUIT-X Demo ★
  0.  Exit
```

---

## 12. Team Members

*(Add your team member names here)*

---

## 13. Source Files Summary

| File | Lines | Purpose |
|---|---|---|
| `Main.java` | ~350 | Entry point, interactive menu |
| `Graph.java` | ~280 | Adjacency list graph |
| `Node.java` | ~60 | Network node |
| `Edge.java` | ~80 | Network edge |
| `MinHeap.java` | ~200 | Custom binary min-heap |
| `PathFinder.java` | ~230 | BFS, DFS, Dijkstra |
| `FailureManager.java` | ~120 | Failure detection |
| `NetworkAnalyzer.java` | ~130 | Connectivity analysis |
| `RecoveryEngine.java` | ~150 | Recovery & rerouting |
| `NetworkDemo.java` | ~180 | Automated demo |
| `ReliabilityReport.java` | ~120 | Reliability report |
| `Colors.java` | ~40 | ANSI terminal colors |

---

## License

University DSA Project — For educational use only.
