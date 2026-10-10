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
