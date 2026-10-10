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
