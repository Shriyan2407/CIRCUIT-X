/**
 * CIRCUIT-X — Edge.java
 *
 * Represents a weighted, undirected connection (link) between two nodes.
 * An edge can be ACTIVE or FAILED. Failed edges are skipped during
 * BFS, DFS, and Dijkstra to simulate link failures in the network.
 */
public class Edge {

    private String source;      // Source node ID
    private String destination; // Destination node ID
    private int    weight;      // Cost / latency / distance
    private boolean failed;     // true → link has failed

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    public Edge(String source, String destination, int weight) {
        this.source      = source;
        this.destination = destination;
        this.weight      = weight;
        this.failed      = false;
    }

    // -----------------------------------------------------------------------
    // Accessors
    // -----------------------------------------------------------------------
    public String getSource() {
        return source;
    }

    public String getDestination() {
        return destination;
    }

    public int getWeight() {
        return weight;
    }

    public boolean isFailed() {
        return failed;
    }

    // -----------------------------------------------------------------------
    // Mutators
    // -----------------------------------------------------------------------
    public void setWeight(int weight) {
        this.weight = weight;
    }

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

    /**
     * Returns true if this edge connects the given two nodes
     * (in either direction, since the graph is undirected).
     */
    public boolean connects(String a, String b) {
        return (source.equals(a) && destination.equals(b))
            || (source.equals(b) && destination.equals(a));
    }

    @Override
    public String toString() {
        return source + " --[" + weight + "]--> " + destination + " [" + getStatus() + "]";
    }
}
