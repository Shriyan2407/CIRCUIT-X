import java.util.*;

/**
 * CIRCUIT-X — Graph.java
 *
 * Core data structure: a weighted, undirected graph stored as an
 * ADJACENCY LIST (HashMap of node-ID → list of edges).
 *
 * DSA Highlights:
 *   - Adjacency list  → HashMap<String, List<Edge>>
 *   - O(V + E) space  (much better than adjacency matrix for sparse graphs)
 *   - Supports dynamic add/remove of nodes and edges at runtime
 *
 * The graph is UNDIRECTED — when the user adds A-B(5), the implementation
 * stores both A→B and B→A in the adjacency list.
 */
public class Graph {

    // -----------------------------------------------------------------------
    // Primary data structures
    // -----------------------------------------------------------------------

    /** Adjacency list: nodeId → list of outgoing edges */
    private Map<String, List<Edge>> adjacencyList;

    /** Node registry: nodeId → Node object */
    private Map<String, Node> nodes;

    /** Edge list (unduplicated, one entry per undirected edge) */
    private List<Edge> edges;

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    public Graph() {
        adjacencyList = new LinkedHashMap<>();   // Insertion-ordered for display
        nodes         = new LinkedHashMap<>();
        edges         = new ArrayList<>();
    }

    // =======================================================================
    // MODULE 1 — Network Creation
    // =======================================================================

    /**
     * addNode(id) — Add a new node to the graph.
     * Returns false if the node already exists.
     */
    public boolean addNode(String id) {
        if (nodes.containsKey(id)) {
            return false;  // Duplicate
        }
        nodes.put(id, new Node(id));
        adjacencyList.put(id, new ArrayList<>());
        return true;
    }

    /**
     * addEdge(src, dst, weight) — Add a weighted, undirected edge.
     * Both directions are stored in the adjacency list.
     * Returns false if either node is missing or edge already exists.
     */
    public boolean addEdge(String src, String dst, int weight) {
        if (!nodes.containsKey(src) || !nodes.containsKey(dst)) {
            return false;  // Unknown node
        }
        if (src.equals(dst)) {
            return false;  // No self-loops
        }
        // Check for duplicate edge
        for (Edge e : edges) {
            if (e.connects(src, dst)) {
                return false;
            }
        }
        Edge forward = new Edge(src, dst, weight);
        Edge backward = new Edge(dst, src, weight);

        edges.add(forward);  // Keep one canonical entry in the edge list

        adjacencyList.get(src).add(forward);
        adjacencyList.get(dst).add(backward);

        return true;
    }

    // =======================================================================
    // MODULE 2 — Graph Management
    // =======================================================================

    /**
     * removeNode(id) — Remove a node and all its incident edges.
     */
    public boolean removeNode(String id) {
        if (!nodes.containsKey(id)) {
            return false;
        }
        // Remove all edges incident to this node
        edges.removeIf(e -> e.getSource().equals(id) || e.getDestination().equals(id));

        // Remove from all other nodes' adjacency lists
        for (List<Edge> edgeList : adjacencyList.values()) {
            edgeList.removeIf(e -> e.getSource().equals(id) || e.getDestination().equals(id));
        }

        adjacencyList.remove(id);
        nodes.remove(id);
        return true;
    }

    /**
     * removeEdge(src, dst) — Remove the edge between two nodes.
     */
    public boolean removeEdge(String src, String dst) {
        if (!nodes.containsKey(src) || !nodes.containsKey(dst)) {
            return false;
        }
        boolean removed = edges.removeIf(e -> e.connects(src, dst));
        if (!removed) return false;

        adjacencyList.get(src).removeIf(e -> e.connects(src, dst));
        adjacencyList.get(dst).removeIf(e -> e.connects(src, dst));
        return true;
    }

    /**
     * updateWeight(src, dst, newWeight) — Change the weight of an existing edge.
     */
    public boolean updateWeight(String src, String dst, int newWeight) {
        if (!nodes.containsKey(src) || !nodes.containsKey(dst)) {
            return false;
        }
        boolean updated = false;
        for (Edge e : edges) {
            if (e.connects(src, dst)) {
                e.setWeight(newWeight);
                updated = true;
            }
        }
        // Also update in adjacency list
        for (List<Edge> edgeList : adjacencyList.values()) {
            for (Edge e : edgeList) {
                if (e.connects(src, dst)) {
                    e.setWeight(newWeight);
                }
            }
        }
        return updated;
    }

    // =======================================================================
    // MODULE 3 — Failure Management (delegated to FailureManager)
    // =======================================================================

    /** Mark a node as failed. */
    public boolean markNodeFailed(String id) {
        if (!nodes.containsKey(id)) return false;
        nodes.get(id).markFailed();
        return true;
    }

    /** Mark a node as active (recovered). */
    public boolean markNodeActive(String id) {
        if (!nodes.containsKey(id)) return false;
        nodes.get(id).markActive();
        return true;
    }

    /** Mark an edge as failed. */
    public boolean markEdgeFailed(String src, String dst) {
        boolean found = false;
        for (Edge e : edges) {
            if (e.connects(src, dst)) {
                e.markFailed();
                found = true;
            }
        }
        // Also update copies in the adjacency list
        for (List<Edge> edgeList : adjacencyList.values()) {
            for (Edge e : edgeList) {
                if (e.connects(src, dst)) {
                    e.markFailed();
                }
            }
        }
        return found;
    }

    /** Mark an edge as active (recovered). */
    public boolean markEdgeActive(String src, String dst) {
        boolean found = false;
        for (Edge e : edges) {
            if (e.connects(src, dst)) {
                e.markActive();
                found = true;
            }
        }
        for (List<Edge> edgeList : adjacencyList.values()) {
            for (Edge e : edgeList) {
                if (e.connects(src, dst)) {
                    e.markActive();
                }
            }
        }
        return found;
    }

    // =======================================================================
    // Accessors used by other modules
    // =======================================================================

    public Map<String, List<Edge>> getAdjacencyList() {
        return adjacencyList;
    }

    public Map<String, Node> getNodes() {
        return nodes;
    }

    public List<Edge> getEdges() {
        return edges;
    }

    public Node getNode(String id) {
        return nodes.get(id);
    }

    public boolean hasNode(String id) {
        return nodes.containsKey(id);
    }

    public boolean isEmpty() {
        return nodes.isEmpty();
    }

    /** Return active (non-failed) neighbours of a node. */
    public List<Edge> getActiveNeighbours(String nodeId) {
        List<Edge> result = new ArrayList<>();
        if (!adjacencyList.containsKey(nodeId)) return result;
        for (Edge e : adjacencyList.get(nodeId)) {
            // Skip failed edge or failed destination node
            if (!e.isFailed() && !nodes.get(e.getDestination()).isFailed()) {
                result.add(e);
            }
        }
        return result;
    }

    /** Return all neighbours (including failed) of a node. */
    public List<Edge> getAllNeighbours(String nodeId) {
        List<Edge> result = new ArrayList<>();
        if (!adjacencyList.containsKey(nodeId)) return result;
        return new ArrayList<>(adjacencyList.get(nodeId));
    }

    // =======================================================================
    // Reset
    // =======================================================================
    public void reset() {
        adjacencyList.clear();
        nodes.clear();
        edges.clear();
    }

    // =======================================================================
    // Display
    // =======================================================================

    /**
     * Render the network as an adjacency-list tree to the terminal.
     * Uses ANSI colours where supported.
     */
    public void display() {
        if (nodes.isEmpty()) {
            System.out.println("  (Network is empty. Use option 1 to create a network.)");
            return;
        }

        int totalNodes   = nodes.size();
        int activeNodes  = (int) nodes.values().stream().filter(n -> !n.isFailed()).count();
        int failedNodes  = totalNodes - activeNodes;
        int totalEdges   = edges.size();
        int activeEdges  = (int) edges.stream().filter(e -> !e.isFailed()).count();
        int failedEdges  = totalEdges - activeEdges;

        String networkStatus;
        if (failedNodes == 0 && failedEdges == 0) {
            networkStatus = Colors.GREEN + "FULLY OPERATIONAL" + Colors.RESET;
        } else if (activeNodes == 0) {
            networkStatus = Colors.RED + "DOWN" + Colors.RESET;
        } else {
            networkStatus = Colors.YELLOW + "DEGRADED" + Colors.RESET;
        }

        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
        System.out.println(Colors.CYAN + "                    CURRENT NETWORK" + Colors.RESET);
        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
        System.out.println();

        for (String nodeId : adjacencyList.keySet()) {
            Node n = nodes.get(nodeId);
            String nodeColor = n.isFailed() ? Colors.RED : Colors.GREEN;
            System.out.println(nodeColor + nodeId + Colors.RESET
                + " [" + nodeColor + n.getStatus() + Colors.RESET + "]");

            List<Edge> edgeList = adjacencyList.get(nodeId);
            for (int i = 0; i < edgeList.size(); i++) {
                Edge e = edgeList.get(i);
                String branch = (i == edgeList.size() - 1) ? " └── " : " ├── ";
                String edgeColor = e.isFailed() ? Colors.RED : Colors.GREEN;
                System.out.println(branch
                    + edgeColor + e.getDestination()
                    + " [Weight: " + e.getWeight() + "] ["
                    + e.getStatus() + "]" + Colors.RESET);
            }
            System.out.println();
        }

        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
        System.out.println("Network Status    : " + networkStatus);
        System.out.println("Active Nodes      : " + Colors.GREEN + activeNodes + Colors.RESET
                         + " / " + totalNodes);
        System.out.println("Failed Nodes      : " + (failedNodes > 0 ? Colors.RED : Colors.GREEN)
                         + failedNodes + Colors.RESET);
        System.out.println("Active Links      : " + Colors.GREEN + activeEdges + Colors.RESET
                         + " / " + totalEdges);
        System.out.println("Failed Links      : " + (failedEdges > 0 ? Colors.RED : Colors.GREEN)
                         + failedEdges + Colors.RESET);
        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
    }

    /** Print adjacency list in raw text form. */
    public void printAdjacencyList() {
        System.out.println(Colors.CYAN + "\n[ADJACENCY LIST REPRESENTATION]" + Colors.RESET);
        for (String nodeId : adjacencyList.keySet()) {
            StringBuilder sb = new StringBuilder();
            sb.append(nodeId).append(" -> ");
            List<Edge> edgeList = adjacencyList.get(nodeId);
            if (edgeList.isEmpty()) {
                sb.append("(no connections)");
            } else {
                for (int i = 0; i < edgeList.size(); i++) {
                    Edge e = edgeList.get(i);
                    sb.append(e.getDestination())
                      .append("(")
                      .append(e.getWeight())
                      .append(")");
                    if (e.isFailed()) sb.append("*FAILED*");
                    if (i < edgeList.size() - 1) sb.append(", ");
                }
            }
            System.out.println("  " + sb);
        }
        System.out.println();
    }
}
