/**
 * CIRCUIT-X — Node.java
 *
 * Represents a single node (computer / router / host) in the network graph.
 * A node can be ACTIVE or FAILED. Failed nodes are excluded from all
 * path-finding, BFS, and DFS operations.
 */
public class Node {

    private String id;       // Unique identifier (e.g. "A", "RouterB")
    private boolean failed;  // true  → node has failed and is excluded from routing

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    public Node(String id) {
        this.id = id;
        this.failed = false;
    }

    // -----------------------------------------------------------------------
    // Accessors
    // -----------------------------------------------------------------------
    public String getId() {
        return id;
    }

    public boolean isFailed() {
        return failed;
    }

    // -----------------------------------------------------------------------
    // State mutators
    // -----------------------------------------------------------------------
    public void markFailed() {
        this.failed = true;
    }

    public void markActive() {
        this.failed = false;
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------
    public String getStatus() {
        return failed ? "FAILED" : "ACTIVE";
    }

    @Override
    public String toString() {
        return id + " [" + getStatus() + "]";
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Node)) return false;
        Node other = (Node) obj;
        return id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
