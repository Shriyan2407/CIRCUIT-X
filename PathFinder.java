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
