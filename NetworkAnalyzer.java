import java.util.*;

/**
 * CIRCUIT-X — NetworkAnalyzer.java
 *
 * MODULE 5 — Reliability / Connectivity Analysis
 *
 * Implements:
 *   - isConnected()      — Check if the active network is fully connected
 *   - findComponents()   — Find all connected components using BFS
 *
 * Uses BFS internally for component discovery.
 * Only active (non-failed) nodes and edges are considered.
 */
public class NetworkAnalyzer {

    private Graph graph;

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    public NetworkAnalyzer(Graph graph) {
        this.graph = graph;
    }

    // =======================================================================
    // MODULE 5 — Connectivity Check
    // =======================================================================

    /**
     * isConnected() — Check if all ACTIVE nodes form a single connected component.
     *
     * Uses BFS from the first active node and verifies that all
     * other active nodes are reachable.
     *
     * Returns true  → network is fully connected
     * Returns false → network is partitioned (multiple components)
     */
    public boolean isConnected() {
        // Collect all active nodes
        List<String> activeNodes = getActiveNodeIds();
        if (activeNodes.isEmpty()) return true;  // Trivially connected

        // BFS from the first active node
        Set<String>   visited = new HashSet<>();
        Queue<String> queue   = new LinkedList<>();

        queue.offer(activeNodes.get(0));
        visited.add(activeNodes.get(0));

        while (!queue.isEmpty()) {
            String current = queue.poll();
            for (Edge e : graph.getActiveNeighbours(current)) {
                String dest = e.getDestination();
                if (!visited.contains(dest)) {
                    visited.add(dest);
                    queue.offer(dest);
                }
            }
        }

        // Check whether all active nodes were reached
        return visited.containsAll(activeNodes);
    }

    /**
     * findComponents() — Identify all connected components in the active graph.
     *
     * Uses BFS per component. Returns a list of sets, where each set
     * contains the node IDs of one connected component.
     */
    public List<Set<String>> findComponents() {
        List<String>      activeNodes = getActiveNodeIds();
        Set<String>       globalSeen  = new HashSet<>();
        List<Set<String>> components  = new ArrayList<>();
