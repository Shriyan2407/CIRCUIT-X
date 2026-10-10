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

    /**
     * extractMin() — Remove and return the (key, value) pair with the
     * smallest value. Replaces root with last element then bubbles DOWN.
     *
     * Returns null if the heap is empty.
     */
    public HeapEntry extractMin() {
        if (isEmpty()) return null;

        HeapEntry min = new HeapEntry(keys[0], values[0]);

        // Move last element to root
        size--;
        keys[0]   = keys[size];
        values[0] = values[size];

        // Restore heap by bubbling down
        bubbleDown(0);

        return min;
    }

    /**
     * peek() — Return the minimum element without removing it. O(1).
     */
    public HeapEntry peek() {
        if (isEmpty()) return null;
        return new HeapEntry(keys[0], values[0]);
    }

    /**
     * decreaseKey(key, newValue) — Update the value of an existing key
     * to a smaller value and restore heap property.
     * Used by Dijkstra's algorithm for relaxation.
     *
     * O(n) for find + O(log n) for bubble-up.
     */
    public void decreaseKey(String key, int newValue) {
        for (int i = 0; i < size; i++) {
            if (keys[i].equals(key)) {
                if (newValue < values[i]) {
                    values[i] = newValue;
                    bubbleUp(i);
                }
                return;
            }
        }
    }

    /**
     * contains(key) — Check whether a key is in the heap. O(n).
     */
    public boolean contains(String key) {
        for (int i = 0; i < size; i++) {
            if (keys[i].equals(key)) return true;
        }
        return false;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public int size() {
        return size;
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    /**
     * bubbleUp(i) — Repeatedly swap element at index i with its parent
     * while the heap property is violated.
     *
     *   parent index = (i - 1) / 2
     */
    private void bubbleUp(int i) {
        while (i > 0) {
            int parent = (i - 1) / 2;
            if (values[parent] <= values[i]) break;  // Heap property satisfied
            swap(i, parent);
            i = parent;
        }
    }

    /**
     * bubbleDown(i) — Repeatedly swap element at index i with its
     * smallest child while the heap property is violated.
     *
     *   left  child = 2*i + 1
     *   right child = 2*i + 2
     */
    private void bubbleDown(int i) {
        while (true) {
            int smallest = i;
            int left     = 2 * i + 1;
            int right    = 2 * i + 2;

            if (left  < size && values[left]  < values[smallest]) smallest = left;
            if (right < size && values[right] < values[smallest]) smallest = right;

            if (smallest == i) break;  // Heap property satisfied

            swap(i, smallest);
            i = smallest;
        }
    }

    /** Swap elements at positions i and j. */
    private void swap(int i, int j) {
        String tmpKey = keys[i];
        int    tmpVal = values[i];
        keys[i]   = keys[j];
        values[i] = values[j];
        keys[j]   = tmpKey;
        values[j] = tmpVal;
    }

    /** Double the capacity of the heap arrays. */
    private void resize() {
        capacity *= 2;
        String[] newKeys   = new String[capacity];
        int[]    newValues = new int[capacity];
        System.arraycopy(keys,   0, newKeys,   0, size);
        System.arraycopy(values, 0, newValues, 0, size);
        keys   = newKeys;
        values = newValues;
    }

    // -----------------------------------------------------------------------
    // Inner class — heap entry
    // -----------------------------------------------------------------------
    public static class HeapEntry {
        public final String key;
        public final int    value;

        public HeapEntry(String key, int value) {
            this.key   = key;
            this.value = value;
        }

        @Override
        public String toString() {
            return "(" + key + ", " + value + ")";
        }
    }
}
