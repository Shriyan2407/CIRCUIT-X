import java.util.*;

/**
 * CIRCUIT-X — PathFinder.java
 *
 * Implements the three core graph algorithms:
 *
 *   1. BFS  — Breadth-First Search   (uses a Queue / LinkedList)
 *   2. DFS  — Depth-First Search     (uses a Stack via recursion)
 *   3. Dijkstra — Shortest Path       (uses custom MinHeap-backed Priority Queue)
 *
 * All three algorithms respect node/edge failure states:
 *   - Failed nodes are never visited.
 *   - Failed edges are never traversed.
 *
 * DSA Highlights (visible for faculty review):
 *   BFS  → Queue<String> (FIFO)
 *   DFS  → recursive call stack (implicit stack)
 *   Dijkstra → MinHeap (custom) + distance[] array + predecessor map
 */
public class PathFinder {

    private Graph graph;

    public PathFinder(Graph graph) {
        this.graph = graph;
    }

    // =======================================================================
    // MODULE 4 — BFS Traversal
    // =======================================================================

    /**
     * bfsTraverse(startId) — Breadth-First Search starting from startId.
     *
     * DSA Details:
     *   - Uses a Queue<String> (FIFO) to process nodes level by level.
     *   - visited Set prevents revisiting nodes.
     *   - Only active nodes and active edges are traversed.
     *
     * Time complexity:  O(V + E)
     * Space complexity: O(V)
     */
    public List<String> bfsTraverse(String startId) {
        List<String>   visited  = new ArrayList<>();
        Queue<String>  queue    = new LinkedList<>();   // ← DSA: Queue (FIFO)
        Set<String>    seen     = new HashSet<>();

        if (!graph.hasNode(startId) || graph.getNode(startId).isFailed()) {
            return visited;
        }

        queue.offer(startId);
        seen.add(startId);

        System.out.println(Colors.CYAN + "\n[BFS] Starting traversal from node: "
                + Colors.BOLD_WHITE + startId + Colors.RESET);
        System.out.println(Colors.CYAN + "[BFS] Using Queue (FIFO) data structure" + Colors.RESET);
        System.out.println();

        while (!queue.isEmpty()) {
            String current = queue.poll();   // Dequeue
            visited.add(current);

            Node node = graph.getNode(current);
            String nodeColor = node.isFailed() ? Colors.RED : Colors.GREEN;
            System.out.print(Colors.BOLD + "  Visiting: " + Colors.RESET
                    + nodeColor + current + Colors.RESET);

            // Enqueue all active, unvisited neighbours
            List<Edge> neighbours = graph.getActiveNeighbours(current);
            System.out.print("  [Enqueue: ");
            boolean first = true;
            for (Edge e : neighbours) {
                String dest = e.getDestination();
                if (!seen.contains(dest)) {
                    queue.offer(dest);
                    seen.add(dest);
                    if (!first) System.out.print(", ");
                    System.out.print(dest);
                    first = false;
                }
            }
            if (first) System.out.print("-");
            System.out.println("]");
        }
        return visited;
    }

    // =======================================================================
    // MODULE 4 — DFS Traversal
    // =======================================================================

    /**
     * dfsTraverse(startId) — Depth-First Search starting from startId.
     *
     * DSA Details:
     *   - Implemented via recursion (implicit call stack).
     *   - Explores as deep as possible before backtracking.
     *   - Only active nodes and active edges are traversed.
     *
     * Time complexity:  O(V + E)
     * Space complexity: O(V) for the recursion stack
     */
    public List<String> dfsTraverse(String startId) {
        List<String> visited = new ArrayList<>();
        Set<String>  seen    = new HashSet<>();

        if (!graph.hasNode(startId) || graph.getNode(startId).isFailed()) {
            return visited;
        }

        System.out.println(Colors.CYAN + "\n[DFS] Starting traversal from node: "
                + Colors.BOLD_WHITE + startId + Colors.RESET);
        System.out.println(Colors.CYAN + "[DFS] Using Recursion (implicit call Stack)" + Colors.RESET);
        System.out.println();

        dfsHelper(startId, seen, visited, 0);
        return visited;
    }

    /**
     * Recursive DFS helper.
     * depth parameter is used to print indented call-stack visualization.
     */
    private void dfsHelper(String nodeId, Set<String> seen, List<String> visited, int depth) {
        seen.add(nodeId);
        visited.add(nodeId);

        String indent = "  " + "  ".repeat(depth);
        Node node = graph.getNode(nodeId);
        String nodeColor = (node != null && node.isFailed()) ? Colors.RED : Colors.GREEN;
        System.out.println(indent + Colors.BOLD + "→ Visiting: " + Colors.RESET
                + nodeColor + nodeId + Colors.RESET
                + " (depth=" + depth + ")");

        for (Edge e : graph.getActiveNeighbours(nodeId)) {
            String dest = e.getDestination();
            if (!seen.contains(dest)) {
                System.out.println(indent + Colors.YELLOW + "  ↓ Exploring edge: "
                        + nodeId + " --[" + e.getWeight() + "]--> " + dest + Colors.RESET);
                dfsHelper(dest, seen, visited, depth + 1);
                System.out.println(indent + Colors.YELLOW + "  ↑ Backtrack to: "
                        + nodeId + Colors.RESET);
            }
        }
    }
