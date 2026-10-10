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

        // ── Recovery status ──────────────────────────────────────────────────
        boolean hasFailures = failureManager.hasFailures();
        String recoveryStatus = !hasFailures
                ? Colors.BOLD_GREEN + "HEALTHY — No failures" + Colors.RESET
                : (connected
                    ? Colors.YELLOW + "DEGRADED — Failures exist but network is connected" + Colors.RESET
                    : Colors.BOLD_RED + "CRITICAL — Network is partitioned" + Colors.RESET);

        // ── Alternate routes ─────────────────────────────────────────────────
        int altRoutes = recoveryEngine.getAlternateRoutesFound();

        // ── Overall status ───────────────────────────────────────────────────
        String overallStatus;
        if (!hasFailures) {
            overallStatus = Colors.BOLD_GREEN + "FULLY OPERATIONAL" + Colors.RESET;
        } else if (connected) {
            overallStatus = Colors.YELLOW + "OPERATIONAL (DEGRADED)" + Colors.RESET;
        } else {
            overallStatus = Colors.BOLD_RED + "CRITICAL / PARTITIONED" + Colors.RESET;
        }

        // ── Print report ─────────────────────────────────────────────────────
        System.out.println();
        System.out.printf("  %-28s : %d%n", "Total Nodes",         totalNodes);
        System.out.printf("  %-28s : %s%d%s%n", "Active Nodes",
                Colors.GREEN, activeNodes, Colors.RESET);
        System.out.printf("  %-28s : %s%d%s%n", "Failed Nodes",
                failedNodes > 0 ? Colors.RED : Colors.GREEN, failedNodes, Colors.RESET);
        System.out.println();
        System.out.printf("  %-28s : %d%n", "Total Connections",   totalEdges);
        System.out.printf("  %-28s : %s%d%s%n", "Active Connections",
                Colors.GREEN, activeEdges, Colors.RESET);
        System.out.printf("  %-28s : %s%d%s%n", "Failed Connections",
                failedEdges > 0 ? Colors.RED : Colors.GREEN, failedEdges, Colors.RESET);
        System.out.println();
        System.out.printf("  %-28s : %s%n", "Network Connected",
                connected ? Colors.BOLD_GREEN + "YES" + Colors.RESET
                          : Colors.BOLD_RED + "NO" + Colors.RESET);
        System.out.printf("  %-28s : %d%n", "Connected Components", numComponents);

        if (!failedNodeList.isEmpty() || !failedEdgeList.isEmpty()) {
            System.out.println();
            System.out.println(Colors.RED + "  Failed Components:" + Colors.RESET);
            for (String n : failedNodeList) {
                System.out.println(Colors.RED + "    - Node " + n + Colors.RESET);
            }
            for (String[] pair : failedEdgeList) {
                System.out.println(Colors.RED + "    - Link " + pair[0] + "-" + pair[1] + Colors.RESET);
            }
        }

        System.out.println();
        System.out.printf("  %-28s : %s%n", "Recovery Status",    recoveryStatus);
        System.out.printf("  %-28s : %d%n", "Alternate Routes Found", altRoutes);
        System.out.println();
        System.out.printf("  %-28s : %s%n", "Overall Status",     overallStatus);
        System.out.println();
        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
    }
}
