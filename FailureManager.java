import java.util.*;

/**
 * CIRCUIT-X — FailureManager.java
 *
 * MODULE 3 — Failure Detection
 *
 * Responsible for:
 *   - Simulating node failures
 *   - Simulating edge/link failures
 *   - Tracking failed components
 *   - Providing failure detection queries
 */
public class FailureManager {

    private Graph              graph;
    private List<String>       failedNodes;  // IDs of failed nodes
    private List<String[]>     failedEdges;  // [src, dst] pairs of failed edges

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    public FailureManager(Graph graph) {
        this.graph       = graph;
        this.failedNodes = new ArrayList<>();
        this.failedEdges = new ArrayList<>();
    }

    // =======================================================================
    // Node Failure
    // =======================================================================

    /**
     * markFailed(nodeId) — Simulate a node failure.
     * The node is marked as failed in the graph, making it invisible
     * to path-finding and traversal algorithms.
     */
    public boolean markNodeFailed(String nodeId) {
        if (!graph.hasNode(nodeId)) return false;
        if (graph.getNode(nodeId).isFailed()) return false;  // Already failed

        graph.markNodeFailed(nodeId);
        failedNodes.add(nodeId);
        return true;
    }

    /**
     * recoverNode(nodeId) — Restore a previously failed node.
     */
    public boolean recoverNode(String nodeId) {
        if (!graph.hasNode(nodeId)) return false;
        if (!graph.getNode(nodeId).isFailed()) return false;

        graph.markNodeActive(nodeId);
        failedNodes.remove(nodeId);
        return true;
    }

    // =======================================================================
    // Edge Failure
    // =======================================================================

    /**
     * markEdgeFailed(src, dst) — Simulate a link failure between two nodes.
     */
    public boolean markEdgeFailed(String src, String dst) {
        if (!graph.hasNode(src) || !graph.hasNode(dst)) return false;

        boolean found = graph.markEdgeFailed(src, dst);
        if (found) {
            // Store canonical (alphabetically sorted) pair to avoid duplicates
            String a = src.compareTo(dst) <= 0 ? src : dst;
            String b = src.compareTo(dst) <= 0 ? dst : src;
            // Don't add duplicates
            for (String[] pair : failedEdges) {
                if (pair[0].equals(a) && pair[1].equals(b)) return true;
            }
            failedEdges.add(new String[]{a, b});
        }
        return found;
    }
