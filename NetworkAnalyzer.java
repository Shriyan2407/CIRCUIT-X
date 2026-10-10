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

        for (String startNode : activeNodes) {
            if (globalSeen.contains(startNode)) continue;

            // BFS to find this component
            Set<String>   component = new LinkedHashSet<>();
            Queue<String> queue     = new LinkedList<>();

            queue.offer(startNode);
            globalSeen.add(startNode);

            while (!queue.isEmpty()) {
                String current = queue.poll();
                component.add(current);
                for (Edge e : graph.getActiveNeighbours(current)) {
                    String dest = e.getDestination();
                    if (!globalSeen.contains(dest)) {
                        globalSeen.add(dest);
                        queue.offer(dest);
                    }
                }
            }
            components.add(component);
        }
        return components;
    }

    // =======================================================================
    // Display helpers
    // =======================================================================

    /**
     * printConnectivityStatus() — Print a formatted connectivity report.
     */
    public void printConnectivityStatus() {
        System.out.println(Colors.CYAN + "\n============================================================" + Colors.RESET);
        System.out.println(Colors.CYAN + "               CONNECTIVITY ANALYSIS" + Colors.RESET);
        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);

        if (graph.isEmpty()) {
            System.out.println("  Network is empty.");
            System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
            return;
        }

        boolean connected = isConnected();
        System.out.println("\n  Is the network connected? "
                + (connected
                    ? Colors.BOLD_GREEN + "YES" + Colors.RESET
                    : Colors.BOLD_RED   + "NO"  + Colors.RESET));

        if (!connected) {
            List<Set<String>> components = findComponents();
            System.out.println("\n  " + Colors.YELLOW + "Connected Components: " + components.size() + Colors.RESET);
            int idx = 1;
            for (Set<String> comp : components) {
                System.out.print("    Component " + idx++ + ": ");
                System.out.println(Colors.GREEN + String.join("  ", comp) + Colors.RESET);
            }
        } else {
            List<Set<String>> components = findComponents();
            System.out.println("  Connected Components: 1");
            System.out.print("  Nodes: ");
            for (Set<String> comp : components) {
                System.out.println(Colors.GREEN + String.join("  ", comp) + Colors.RESET);
            }
        }

        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
    }

    /**
     * printComponents() — Print all connected components.
     */
    public void printComponents() {
        List<Set<String>> components = findComponents();

        System.out.println(Colors.CYAN + "\n============================================================" + Colors.RESET);
        System.out.println(Colors.CYAN + "             CONNECTED COMPONENTS ANALYSIS" + Colors.RESET);
        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
        System.out.println("  Total components: " + components.size());
        System.out.println();

        int idx = 1;
        for (Set<String> comp : components) {
            System.out.println("  Component " + idx++ + " ["
                    + Colors.YELLOW + comp.size() + " nodes" + Colors.RESET + "]:");
            System.out.println("    " + Colors.GREEN + String.join(" → ", comp) + Colors.RESET);
            System.out.println();
        }
        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
    }

    // =======================================================================
    // Utility
    // =======================================================================

    private List<String> getActiveNodeIds() {
        List<String> result = new ArrayList<>();
        for (Map.Entry<String, Node> entry : graph.getNodes().entrySet()) {
            if (!entry.getValue().isFailed()) {
                result.add(entry.getKey());
            }
        }
        return result;
    }
}
