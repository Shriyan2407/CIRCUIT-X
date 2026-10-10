import java.util.*;

/**
 * CIRCUIT-X — ReliabilityReport.java
 *
 * MODULE 8 — Network Reliability Report
 *
 * Generates a comprehensive reliability report by querying the actual
 * graph state. All numbers are calculated from live data, not hard-coded.
 */
public class ReliabilityReport {

    private Graph           graph;
    private FailureManager  failureManager;
    private NetworkAnalyzer analyzer;
    private RecoveryEngine  recoveryEngine;

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    public ReliabilityReport(Graph graph, FailureManager failureManager,
                              NetworkAnalyzer analyzer, RecoveryEngine recoveryEngine) {
        this.graph          = graph;
        this.failureManager = failureManager;
        this.analyzer       = analyzer;
        this.recoveryEngine = recoveryEngine;
    }

    // =======================================================================
    // Generate and print the full report
    // =======================================================================

    public void generate() {
        System.out.println(Colors.CYAN + "\n============================================================" + Colors.RESET);
        System.out.println(Colors.CYAN + "              NETWORK RELIABILITY REPORT" + Colors.RESET);
        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);

        if (graph.isEmpty()) {
            System.out.println("  Network is empty. No data to report.");
            System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
            return;
        }

        // ── Node statistics ─────────────────────────────────────────────────
        int totalNodes  = graph.getNodes().size();
        long activeCnt  = graph.getNodes().values().stream().filter(n -> !n.isFailed()).count();
        int activeNodes = (int) activeCnt;
        int failedNodes = totalNodes - activeNodes;

        // ── Edge statistics ─────────────────────────────────────────────────
        int totalEdges   = graph.getEdges().size();
        long activeCnt2  = graph.getEdges().stream().filter(e -> !e.isFailed()).count();
        int activeEdges  = (int) activeCnt2;
        int failedEdges  = totalEdges - activeEdges;

        // ── Connectivity ─────────────────────────────────────────────────────
        boolean connected   = analyzer.isConnected();
        List<Set<String>> comps = analyzer.findComponents();
        int numComponents   = comps.size();

        // ── Failed components list ───────────────────────────────────────────
        List<String>   failedNodeList = failureManager.getFailedNodes();
        List<String[]> failedEdgeList = failureManager.getFailedEdges();
