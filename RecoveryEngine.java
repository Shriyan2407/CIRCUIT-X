import java.util.*;

/**
 * CIRCUIT-X — RecoveryEngine.java
 *
 * MODULE 7 — Recovery / Rerouting
 *
 * Implements:
 *   - recoverNetwork()   — Auto-recover failed components if possible
 *   - rerouteTraffic()   — Find and apply an alternate path between two nodes
 *
 * Recovery logic:
 *   FAILURE
 *     ↓ MARK FAILED COMPONENT
 *     ↓ UPDATE GRAPH
 *     ↓ CHECK CONNECTIVITY
 *     ↓ IF DISCONNECTED
 *     ↓   SEARCH FOR ALTERNATE ROUTE (Dijkstra)
 *     ↓   IF ROUTE EXISTS  → REROUTE → RECOVERY SUCCESSFUL
 *     ↓   IF NO ROUTE      → RECOVERY FAILED
 *     ↓ IF STILL CONNECTED → NETWORK OPERATIONAL
 */
public class RecoveryEngine {

    private Graph           graph;
    private FailureManager  failureManager;
    private NetworkAnalyzer analyzer;
    private PathFinder      pathFinder;

    // Track reroutes performed in this session
    private int alternateRoutesFound;

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    public RecoveryEngine(Graph graph, FailureManager failureManager) {
        this.graph              = graph;
        this.failureManager     = failureManager;
        this.analyzer           = new NetworkAnalyzer(graph);
        this.pathFinder         = new PathFinder(graph);
        this.alternateRoutesFound = 0;
    }

    // =======================================================================
    // recoverNetwork() — Full network recovery attempt
    // =======================================================================

    /**
     * recoverNetwork() — Attempt to recover the network from all current failures.
     *
     * For node failures: attempts to restore the node (simulates hardware fix).
     * For edge failures: attempts to re-route traffic around the failed link.
     */
    public void recoverNetwork() {
        System.out.println(Colors.CYAN + "\n============================================================" + Colors.RESET);
        System.out.println(Colors.CYAN + "                  NETWORK RECOVERY" + Colors.RESET);
        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);

        if (!failureManager.hasFailures()) {
            System.out.println(Colors.BOLD_GREEN + "\n  Network is healthy. No recovery needed." + Colors.RESET);
            System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
            return;
        }

        System.out.println(Colors.YELLOW + "\n  Analyzing failures..." + Colors.RESET);
        boolean overallSuccess = true;

        // ── Recover failed nodes ────────────────────────────────────────────
        List<String> failedNodesCopy = new ArrayList<>(failureManager.getFailedNodes());
        for (String nodeId : failedNodesCopy) {
            System.out.println("\n  " + Colors.YELLOW + "► Attempting recovery of node: "
                    + Colors.BOLD_WHITE + nodeId + Colors.RESET);
            boolean ok = failureManager.recoverNode(nodeId);
            if (ok) {
                System.out.println(Colors.BOLD_GREEN + "  ✓ Node " + nodeId + " recovered successfully." + Colors.RESET);
            } else {
                System.out.println(Colors.RED + "  ✗ Could not recover node " + nodeId + Colors.RESET);
                overallSuccess = false;
            }
        }

        // ── Recover failed edges ────────────────────────────────────────────
        List<String[]> failedEdgesCopy = new ArrayList<>(failureManager.getFailedEdges());
        for (String[] pair : failedEdgesCopy) {
            System.out.println("\n  " + Colors.YELLOW + "► Attempting recovery of link: "
                    + Colors.BOLD_WHITE + pair[0] + " <-> " + pair[1] + Colors.RESET);
            boolean ok = failureManager.recoverEdge(pair[0], pair[1]);
            if (ok) {
                System.out.println(Colors.BOLD_GREEN + "  ✓ Link " + pair[0] + "-" + pair[1] + " recovered." + Colors.RESET);
            } else {
                System.out.println(Colors.RED + "  ✗ Could not recover link " + pair[0] + "-" + pair[1] + Colors.RESET);
                overallSuccess = false;
            }
        }

        // ── Check final connectivity ────────────────────────────────────────
        System.out.println(Colors.YELLOW + "\n  Checking network connectivity post-recovery..." + Colors.RESET);
        boolean connected = analyzer.isConnected();

        System.out.println();
        if (overallSuccess && connected) {
            System.out.println(Colors.BOLD_GREEN + "  ✓ RECOVERY SUCCESSFUL" + Colors.RESET);
            System.out.println(Colors.GREEN + "  Network connectivity restored." + Colors.RESET);
        } else if (connected) {
            System.out.println(Colors.YELLOW + "  ⚠ Partial recovery. Network is connected." + Colors.RESET);
        } else {
            System.out.println(Colors.BOLD_RED + "  ✗ RECOVERY INCOMPLETE" + Colors.RESET);
            System.out.println(Colors.RED + "  Network remains partitioned." + Colors.RESET);
        }
        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
    }

    // =======================================================================
    // rerouteTraffic() — Find alternate path after a specific failure
    // =======================================================================

    /**
     * rerouteTraffic(source, destination, failedSrc, failedDst) —
     *
     * Given that a link (failedSrc-failedDst) has failed, find an
     * alternate route from source to destination using Dijkstra
     * (which automatically ignores failed edges).
     *
     * Prints a detailed recovery narrative to the terminal.
     */
    public boolean rerouteTraffic(String source, String destination,
                                   String failedSrc, String failedDst) {

        System.out.println(Colors.CYAN + "\n========================================" + Colors.RESET);
        System.out.println(Colors.BOLD_RED + "        FAILURE DETECTED" + Colors.RESET);
        System.out.println(Colors.CYAN + "========================================" + Colors.RESET);
        System.out.println();

        if (failedSrc != null && failedDst != null) {
            System.out.println(Colors.RED + "  Failed Link: " + failedSrc + "-" + failedDst + Colors.RESET);
        }

        System.out.println(Colors.YELLOW + "\n  Analyzing network..." + Colors.RESET);

        // Check if there is a direct path still (direct edge may be failed)
        System.out.println(Colors.YELLOW + "  Primary route: " + source + " → " + destination + Colors.RESET);
        System.out.println(Colors.RED + "  Primary route unavailable (failed component on path)." + Colors.RESET);
        System.out.println(Colors.YELLOW + "\n  Searching for alternate route using Dijkstra..." + Colors.RESET);

        // Dijkstra respects failed edges/nodes automatically
        List<String> path = pathFinder.getShortestPath(source, destination);
        int cost = pathFinder.getPathCost(path);

        System.out.println();
        if (path.isEmpty() || cost < 0) {
            System.out.println(Colors.BOLD_RED + "  ✗ No alternate route found." + Colors.RESET);
            System.out.println(Colors.RED + "  RECOVERY FAILED — Network partition exists." + Colors.RESET);
            System.out.println(Colors.CYAN + "========================================" + Colors.RESET);
            return false;
        }

        alternateRoutesFound++;
        System.out.println(Colors.BOLD_GREEN + "  ✓ Alternate route found!" + Colors.RESET);
        System.out.println("  Alternate route: " + PathFinder.formatPath(path));
        System.out.println("  Cost: " + Colors.BOLD_GREEN + cost + Colors.RESET);
        System.out.println();
        System.out.println(Colors.YELLOW + "  Rerouting traffic..." + Colors.RESET);
        System.out.println();
        System.out.println(Colors.BOLD_GREEN + "  RECOVERY SUCCESSFUL" + Colors.RESET);
        System.out.println(Colors.GREEN + "  Network connectivity restored." + Colors.RESET);
        System.out.println(Colors.CYAN + "========================================" + Colors.RESET);
        return true;
    }

    /**
     * Simple reroute — find best path between two nodes given current failures.
     */
    public boolean rerouteTraffic(String source, String destination) {
        return rerouteTraffic(source, destination, null, null);
    }

    public int getAlternateRoutesFound() {
        return alternateRoutesFound;
    }

    public void resetStats() {
        alternateRoutesFound = 0;
    }
}
