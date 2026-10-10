/**
 * CIRCUIT-X — MinHeap.java
 *
 * Custom Min-Heap implementation used as the underlying structure
 * for the Priority Queue in Dijkstra's algorithm.
 *
 * DSA Highlights:
 *   - Binary heap stored as an array (int[])
 *   - Parent of index i  → (i - 1) / 2
 *   - Left  child of i   → 2*i + 1
 *   - Right child of i   → 2*i + 2
 *   - insert()  → O(log n)  — bubble up
 *   - extractMin() → O(log n)  — bubble down
 *   - peek()    → O(1)
 *
 * Each element is a pair: (node-id, distance).
 * We keep parallel arrays for clarity so the DSA logic is transparent.
 */
public class MinHeap {

    // -----------------------------------------------------------------------
    // Internal arrays — parallel storage of (key, value) pairs
    // key   = node ID (String)
    // value = tentative distance (int) — used for comparison
    // -----------------------------------------------------------------------
    private String[] keys;
    private int[]    values;
    private int      size;
    private int      capacity;

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    public MinHeap(int capacity) {
        this.capacity = capacity;
        this.size     = 0;
        this.keys     = new String[capacity];
        this.values   = new int[capacity];
    }

    // -----------------------------------------------------------------------
    // Core Operations
    // -----------------------------------------------------------------------

    /**
     * insert(key, value) — Insert a (node, distance) pair.
     * After inserting at the end, bubble UP to restore the heap property.
     *
     * Heap property (min-heap): parent.value ≤ children.value
     */
    public void insert(String key, int value) {
        if (size >= capacity) {
            // Auto-expand the heap
            resize();
        }
        keys[size]   = key;
        values[size] = value;
        bubbleUp(size);
        size++;
    }
