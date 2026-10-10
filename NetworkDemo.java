import java.util.*;

/**
 * CIRCUIT-X — NetworkDemo.java
 *
 * MODULE 9 — Automated Demo Mode
 *
 * When the user selects "Run CIRCUIT-X Demo", this class:
 *   1. Resets the network
 *   2. Creates a rich 8-node sample network
 *   3. Runs through all modules step by step
 *   4. Demonstrates complete failure → recovery flow
 *
 * IMPORTANT: This demo exercises every DSA algorithm in sequence
 * so that the faculty can see the full system in one run.
 */
public class NetworkDemo {

    private Graph           graph;
    private FailureManager  failureManager;
    private PathFinder      pathFinder;
    private NetworkAnalyzer analyzer;
    private RecoveryEngine  recoveryEngine;
    private ReliabilityReport report;

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    public NetworkDemo(Graph graph, FailureManager failureManager,
                       PathFinder pathFinder, NetworkAnalyzer analyzer,
                       RecoveryEngine recoveryEngine, ReliabilityReport report) {
        this.graph          = graph;
        this.failureManager = failureManager;
        this.pathFinder     = pathFinder;
        this.analyzer       = analyzer;
        this.recoveryEngine = recoveryEngine;
        this.report         = report;
    }

    // =======================================================================
    // Run complete demo
    // =======================================================================

    public void run() {
        printBanner();

        // ── STEP 1 — Reset and create the sample network ───────────────────
        step(1, "Creating Sample Network (8 Nodes)");
        graph.reset();
        failureManager.reset();
        recoveryEngine.resetStats();
        buildSampleNetwork();
        pause();

        // ── STEP 2 — Display network ───────────────────────────────────────
        step(2, "Displaying Network Topology");
        graph.display();
        graph.printAdjacencyList();
        pause();

        // ── STEP 3 — BFS Traversal ─────────────────────────────────────────
        step(3, "BFS Traversal (starting from node A)");
        List<String> bfsResult = pathFinder.bfsTraverse("A");
        System.out.println("\n  " + Colors.BOLD_CYAN + "BFS Order: " + Colors.RESET
                + Colors.BOLD_GREEN + String.join(" → ", bfsResult) + Colors.RESET);
        pause();

        // ── STEP 4 — DFS Traversal ─────────────────────────────────────────
        step(4, "DFS Traversal (starting from node A)");
        List<String> dfsResult = pathFinder.dfsTraverse("A");
        System.out.println("\n  " + Colors.BOLD_CYAN + "DFS Order: " + Colors.RESET
                + Colors.BOLD_GREEN + String.join(" → ", dfsResult) + Colors.RESET);
        pause();

        // ── STEP 5 — Connectivity check (before failure) ──────────────────
        step(5, "Checking Network Connectivity (BEFORE failure)");
        analyzer.printConnectivityStatus();
        pause();

        // ── STEP 6 — Simulate edge failure ────────────────────────────────
        step(6, "Simulating Edge Failure: B <-> D");
        boolean edgeFailed = failureManager.markEdgeFailed("B", "D");
        if (edgeFailed) {
            System.out.println(Colors.BOLD_RED + "\n  [FAILURE] Link B-D has FAILED." + Colors.RESET);
            System.out.println(Colors.YELLOW + "  Updating graph..." + Colors.RESET);
        }
        pause();

        // ── STEP 7 — Detect failures ──────────────────────────────────────
        step(7, "Running Failure Detection");
        failureManager.detectFailure();
        pause();

        // ── STEP 8 — Connectivity check (after failure) ───────────────────
        step(8, "Checking Connectivity AFTER Edge Failure");
        analyzer.printConnectivityStatus();
        analyzer.printComponents();
        pause();

        // ── STEP 9 — Dijkstra shortest path (A to H) ──────────────────────
        step(9, "Finding Shortest Path: A → H (using Dijkstra + MinHeap)");
        List<String> path = pathFinder.getShortestPath("A", "H");
        int cost = pathFinder.getPathCost(path);
        System.out.println();
        if (path.isEmpty()) {
            System.out.println(Colors.RED + "  No path found between A and H." + Colors.RESET);
        } else {
            System.out.println("  " + Colors.BOLD_CYAN + "Shortest Path: " + Colors.RESET
                    + PathFinder.formatPath(path));
            System.out.println("  " + Colors.BOLD_CYAN + "Total Cost:    " + Colors.RESET
                    + Colors.BOLD_GREEN + cost + Colors.RESET);
        }
        pause();

        // ── STEP 10 — Simulate node failure ───────────────────────────────
        step(10, "Simulating Node Failure: Node E");
        boolean nodeFailed = failureManager.markNodeFailed("E");
        if (nodeFailed) {
            System.out.println(Colors.BOLD_RED + "\n  [FAILURE] Node E has FAILED." + Colors.RESET);
            System.out.println(Colors.YELLOW + "  Updating graph — all links through E are now unavailable." + Colors.RESET);
        }
        pause();

        // ── STEP 11 — Alternate route after failures ───────────────────────
        step(11, "Rerouting Traffic: A → H (with B-D and E failed)");
        recoveryEngine.rerouteTraffic("A", "H", "B", "D");
        pause();

        // ── STEP 12 — Full network display after failures ─────────────────
        step(12, "Current Network Status (with failures)");
        graph.display();
        pause();

        // ── STEP 13 — Recover network ─────────────────────────────────────
        step(13, "Recovering Network (restoring all failed components)");
        recoveryEngine.recoverNetwork();
        pause();

        // ── STEP 14 — Display recovered network ───────────────────────────
        step(14, "Network Status AFTER Recovery");
        graph.display();
        pause();

        // ── STEP 15 — Reliability report ──────────────────────────────────
        step(15, "Generating Network Reliability Report");
        report.generate();
        pause();

        // ── Final summary ──────────────────────────────────────────────────
        System.out.println(Colors.BOLD_CYAN + "\n============================================================" + Colors.RESET);
        System.out.println(Colors.BOLD_GREEN + "         CIRCUIT-X DEMO COMPLETED SUCCESSFULLY" + Colors.RESET);
        System.out.println(Colors.BOLD_CYAN + "============================================================" + Colors.RESET);
        System.out.println(Colors.YELLOW + "\n  Demonstrated:" + Colors.RESET);
        System.out.println("    ✓ Graph creation (Adjacency List)");
        System.out.println("    ✓ BFS Traversal (Queue)");
        System.out.println("    ✓ DFS Traversal (Recursion/Stack)");
        System.out.println("    ✓ Connectivity Analysis");
        System.out.println("    ✓ Edge Failure Simulation");
        System.out.println("    ✓ Node Failure Simulation");
        System.out.println("    ✓ Failure Detection");
        System.out.println("    ✓ Dijkstra's Algorithm (MinHeap Priority Queue)");
        System.out.println("    ✓ Alternate Path Finding");
        System.out.println("    ✓ Traffic Rerouting & Recovery");
        System.out.println("    ✓ Reliability Report");
        System.out.println();
    }
