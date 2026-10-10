import java.util.*;

/**
 * CIRCUIT-X — Main.java
 *
 * Entry point for the CIRCUIT-X terminal application.
 *
 * Provides a fully interactive menu that exercises every module:
 *   1-6   → Network creation and graph management
 *   7     → Display network
 *   8-9   → BFS / DFS traversal
 *   10-11 → Connectivity analysis
 *   12    → Dijkstra shortest path
 *   13-15 → Failure simulation and detection
 *   16-17 → Recovery and rerouting
 *   18    → Reliability report
 *   19    → Reset network
 *   20    → Automated demo
 *   0     → Exit
 *
 * Compile:  javac *.java
 * Run:      java Main
 */
public class Main {

    // -----------------------------------------------------------------------
    // Application-wide components (shared state)
    // -----------------------------------------------------------------------
    private static Graph           graph          = new Graph();
    private static FailureManager  failureManager = new FailureManager(graph);
    private static PathFinder      pathFinder     = new PathFinder(graph);
    private static NetworkAnalyzer analyzer       = new NetworkAnalyzer(graph);
    private static RecoveryEngine  recovery       = new RecoveryEngine(graph, failureManager);
    private static ReliabilityReport reliReport   = new ReliabilityReport(graph, failureManager, analyzer, recovery);
    private static NetworkDemo     demo           = new NetworkDemo(graph, failureManager, pathFinder, analyzer, recovery, reliReport);

    private static Scanner scanner = new Scanner(System.in);

    // -----------------------------------------------------------------------
    // Main
    // -----------------------------------------------------------------------
    public static void main(String[] args) {
        printWelcomeBanner();

        boolean running = true;
        while (running) {
            printMenu();
            int choice = readInt("Enter your choice: ");

            switch (choice) {
                case 1  -> createNetwork();
                case 2  -> addNode();
                case 3  -> addEdge();
                case 4  -> removeNode();
                case 5  -> removeEdge();
                case 6  -> updateEdgeWeight();
                case 7  -> displayNetwork();
                case 8  -> bfsTraversal();
                case 9  -> dfsTraversal();
                case 10 -> checkConnectivity();
                case 11 -> findComponents();
                case 12 -> findShortestPath();
                case 13 -> simulateNodeFailure();
                case 14 -> simulateEdgeFailure();
                case 15 -> detectFailures();
                case 16 -> recoverNetwork();
                case 17 -> rerouteTraffic();
                case 18 -> generateReport();
                case 19 -> resetNetwork();
                case 20 -> runDemo();
                case 0  -> running = false;
                default -> System.out.println(Colors.RED + "\n  Invalid option. Please enter 0-20." + Colors.RESET);
            }
        }

        System.out.println(Colors.BOLD_CYAN + "\n============================================================" + Colors.RESET);
        System.out.println(Colors.BOLD_GREEN + "  Thank you for using CIRCUIT-X. Goodbye!" + Colors.RESET);
        System.out.println(Colors.BOLD_CYAN + "============================================================\n" + Colors.RESET);
        scanner.close();
    }

    // =======================================================================
    // OPTION 1 — Create Network (quick-build wizard)
    // =======================================================================
    private static void createNetwork() {
        sectionHeader("CREATE NETWORK");
        System.out.println("  This wizard lets you create multiple nodes and edges at once.");

        System.out.print("\n  How many nodes? ");
        int n = readPositiveInt();
        if (n <= 0) return;

        for (int i = 0; i < n; i++) {
            System.out.print("  Node name " + (i+1) + ": ");
            String name = readLine();
            if (name.isEmpty()) { System.out.println(Colors.RED + "  Empty name not allowed." + Colors.RESET); i--; continue; }
            boolean ok = graph.addNode(name);
            if (ok) System.out.println(Colors.GREEN + "  ✓ Node '" + name + "' added." + Colors.RESET);
            else    System.out.println(Colors.RED + "  ERROR: Node '" + name + "' already exists." + Colors.RESET);
        }

        System.out.print("\n  How many edges? ");
        int e = readPositiveInt();
        for (int i = 0; i < e; i++) {
            System.out.print("  Edge source      : ");
            String src = readLine();
            System.out.print("  Edge destination : ");
            String dst = readLine();
            System.out.print("  Weight           : ");
            int w = readPositiveInt();
            addEdgeToGraph(src, dst, w);
        }

        System.out.println(Colors.BOLD_GREEN + "\n  Network creation complete." + Colors.RESET);
    }

    // =======================================================================
    // OPTION 2 — Add Node
    // =======================================================================
    private static void addNode() {
        sectionHeader("ADD NODE");
        System.out.print("  Enter node name: ");
        String name = readLine();
        if (name.isEmpty()) { System.out.println(Colors.RED + "  ERROR: Name cannot be empty." + Colors.RESET); return; }
        boolean ok = graph.addNode(name);
        if (ok) System.out.println(Colors.GREEN + "\n  ✓ Node '" + name + "' added successfully." + Colors.RESET);
        else    System.out.println(Colors.RED + "\n  ERROR: Node '" + name + "' already exists." + Colors.RESET);
    }

    // =======================================================================
    // OPTION 3 — Add Edge
    // =======================================================================
    private static void addEdge() {
        sectionHeader("ADD EDGE");
        if (graph.isEmpty()) { noNetworkError(); return; }
        System.out.print("  Source node      : ");
        String src = readLine();
        System.out.print("  Destination node : ");
        String dst = readLine();
        System.out.print("  Weight           : ");
        int w = readPositiveInt();
        addEdgeToGraph(src, dst, w);
    }

    private static void addEdgeToGraph(String src, String dst, int w) {
        if (!graph.hasNode(src)) { System.out.println(Colors.RED + "  ERROR: Node '" + src + "' does not exist." + Colors.RESET); return; }
        if (!graph.hasNode(dst)) { System.out.println(Colors.RED + "  ERROR: Node '" + dst + "' does not exist." + Colors.RESET); return; }
        if (src.equals(dst))     { System.out.println(Colors.RED + "  ERROR: Self-loops are not allowed." + Colors.RESET); return; }
        boolean ok = graph.addEdge(src, dst, w);
        if (ok) System.out.println(Colors.GREEN + "  ✓ Edge " + src + " --[" + w + "]--> " + dst + " added." + Colors.RESET);
        else    System.out.println(Colors.RED + "  ERROR: Edge between '" + src + "' and '" + dst + "' already exists." + Colors.RESET);
    }

    // =======================================================================
    // OPTION 4 — Remove Node
    // =======================================================================
    private static void removeNode() {
        sectionHeader("REMOVE NODE");
        if (graph.isEmpty()) { noNetworkError(); return; }
        System.out.print("  Enter node to remove: ");
        String name = readLine();
        if (!graph.hasNode(name)) { System.out.println(Colors.RED + "  ERROR: Node '" + name + "' does not exist." + Colors.RESET); return; }
        graph.removeNode(name);
        System.out.println(Colors.GREEN + "  ✓ Node '" + name + "' and all its edges removed." + Colors.RESET);
    }

    // =======================================================================
    // OPTION 5 — Remove Edge
    // =======================================================================
    private static void removeEdge() {
        sectionHeader("REMOVE EDGE");
        if (graph.isEmpty()) { noNetworkError(); return; }
        System.out.print("  Source node      : ");
        String src = readLine();
        System.out.print("  Destination node : ");
        String dst = readLine();
        if (!graph.hasNode(src)) { System.out.println(Colors.RED + "  ERROR: Node '" + src + "' does not exist." + Colors.RESET); return; }
        if (!graph.hasNode(dst)) { System.out.println(Colors.RED + "  ERROR: Node '" + dst + "' does not exist." + Colors.RESET); return; }
        boolean ok = graph.removeEdge(src, dst);
        if (ok) System.out.println(Colors.GREEN + "  ✓ Edge " + src + " <-> " + dst + " removed." + Colors.RESET);
        else    System.out.println(Colors.RED + "  ERROR: No edge exists between '" + src + "' and '" + dst + "'." + Colors.RESET);
    }

    // =======================================================================
    // OPTION 6 — Update Edge Weight
    // =======================================================================
    private static void updateEdgeWeight() {
        sectionHeader("UPDATE EDGE WEIGHT");
        if (graph.isEmpty()) { noNetworkError(); return; }
        System.out.print("  Source node      : ");
        String src = readLine();
        System.out.print("  Destination node : ");
        String dst = readLine();
        System.out.print("  New weight       : ");
        int w = readPositiveInt();
        boolean ok = graph.updateWeight(src, dst, w);
        if (ok) System.out.println(Colors.GREEN + "  ✓ Weight of " + src + "<->" + dst + " updated to " + w + "." + Colors.RESET);
        else    System.out.println(Colors.RED + "  ERROR: Edge not found or nodes don't exist." + Colors.RESET);
    }

    // =======================================================================
    // OPTION 7 — Display Network
    // =======================================================================
    private static void displayNetwork() {
        sectionHeader("DISPLAY NETWORK");
        graph.display();
        graph.printAdjacencyList();
    }

    // =======================================================================
    // OPTION 8 — BFS Traversal
    // =======================================================================
    private static void bfsTraversal() {
        sectionHeader("BFS TRAVERSAL");
        if (graph.isEmpty()) { noNetworkError(); return; }
        System.out.print("  Enter starting node: ");
        String start = readLine();
        if (!graph.hasNode(start)) { System.out.println(Colors.RED + "  ERROR: Node '" + start + "' does not exist." + Colors.RESET); return; }
        if (graph.getNode(start).isFailed()) { System.out.println(Colors.RED + "  ERROR: Node '" + start + "' is FAILED." + Colors.RESET); return; }

        List<String> result = pathFinder.bfsTraverse(start);

        System.out.println();
        System.out.println(Colors.CYAN + "  BFS Traversal Result:" + Colors.RESET);
        System.out.println("  " + Colors.BOLD_GREEN + String.join(" -> ", result) + Colors.RESET);
        System.out.println("\n  Total nodes visited: " + result.size());
    }

    // =======================================================================
    // OPTION 9 — DFS Traversal
    // =======================================================================
    private static void dfsTraversal() {
        sectionHeader("DFS TRAVERSAL");
        if (graph.isEmpty()) { noNetworkError(); return; }
        System.out.print("  Enter starting node: ");
        String start = readLine();
        if (!graph.hasNode(start)) { System.out.println(Colors.RED + "  ERROR: Node '" + start + "' does not exist." + Colors.RESET); return; }
        if (graph.getNode(start).isFailed()) { System.out.println(Colors.RED + "  ERROR: Node '" + start + "' is FAILED." + Colors.RESET); return; }

        List<String> result = pathFinder.dfsTraverse(start);

        System.out.println();
        System.out.println(Colors.CYAN + "  DFS Traversal Result:" + Colors.RESET);
        System.out.println("  " + Colors.BOLD_GREEN + String.join(" -> ", result) + Colors.RESET);
        System.out.println("\n  Total nodes visited: " + result.size());
    }

    // =======================================================================
    // OPTION 10 — Check Connectivity
    // =======================================================================
    private static void checkConnectivity() {
        sectionHeader("CONNECTIVITY CHECK");
        if (graph.isEmpty()) { noNetworkError(); return; }
        analyzer.printConnectivityStatus();
    }

    // =======================================================================
    // OPTION 11 — Find Connected Components
    // =======================================================================
    private static void findComponents() {
        sectionHeader("CONNECTED COMPONENTS");
        if (graph.isEmpty()) { noNetworkError(); return; }
        analyzer.printComponents();
    }

    // =======================================================================
    // OPTION 12 — Find Shortest Path (Dijkstra)
    // =======================================================================
    private static void findShortestPath() {
        sectionHeader("SHORTEST PATH — DIJKSTRA");
        if (graph.isEmpty()) { noNetworkError(); return; }
        System.out.print("  Source node      : ");
        String src = readLine();
        System.out.print("  Destination node : ");
        String dst = readLine();

        if (!graph.hasNode(src)) { System.out.println(Colors.RED + "  ERROR: Node '" + src + "' does not exist." + Colors.RESET); return; }
        if (!graph.hasNode(dst)) { System.out.println(Colors.RED + "  ERROR: Node '" + dst + "' does not exist." + Colors.RESET); return; }
        if (graph.getNode(src).isFailed()) { System.out.println(Colors.RED + "  ERROR: Source node '" + src + "' is FAILED." + Colors.RESET); return; }
        if (graph.getNode(dst).isFailed()) { System.out.println(Colors.RED + "  ERROR: Destination node '" + dst + "' is FAILED." + Colors.RESET); return; }

        List<String> path = pathFinder.getShortestPath(src, dst);
        int cost = pathFinder.getPathCost(path);

        System.out.println();
        if (path.isEmpty() || cost < 0) {
            System.out.println(Colors.BOLD_RED + "  No valid path exists between '" + src + "' and '" + dst + "'." + Colors.RESET);
        } else {
            System.out.println(Colors.CYAN + "  Shortest / Alternate Path:" + Colors.RESET);
            System.out.println("  " + PathFinder.formatPath(path));
            System.out.println("\n  Total Cost: " + Colors.BOLD_GREEN + cost + Colors.RESET);
        }
    }

    // =======================================================================
    // OPTION 13 — Simulate Node Failure
    // =======================================================================
    private static void simulateNodeFailure() {
        sectionHeader("SIMULATE NODE FAILURE");
        if (graph.isEmpty()) { noNetworkError(); return; }
        System.out.print("  Enter node to fail: ");
        String name = readLine();
        if (!graph.hasNode(name)) { System.out.println(Colors.RED + "  ERROR: Node '" + name + "' does not exist." + Colors.RESET); return; }
        if (graph.getNode(name).isFailed()) { System.out.println(Colors.YELLOW + "  Node '" + name + "' is already FAILED." + Colors.RESET); return; }

        failureManager.markNodeFailed(name);
        System.out.println(Colors.BOLD_RED + "\n  [FAILURE] Node " + name + " has FAILED." + Colors.RESET);
        System.out.println(Colors.YELLOW + "  Updating graph..." + Colors.RESET);
        System.out.println(Colors.YELLOW + "  Checking network connectivity..." + Colors.RESET);
        analyzer.printConnectivityStatus();
    }

    // =======================================================================
    // OPTION 14 — Simulate Edge Failure
    // =======================================================================
    private static void simulateEdgeFailure() {
        sectionHeader("SIMULATE EDGE FAILURE");
        if (graph.isEmpty()) { noNetworkError(); return; }
        System.out.print("  Enter source node      : ");
        String src = readLine();
        System.out.print("  Enter destination node : ");
        String dst = readLine();
        if (!graph.hasNode(src)) { System.out.println(Colors.RED + "  ERROR: Node '" + src + "' does not exist." + Colors.RESET); return; }
        if (!graph.hasNode(dst)) { System.out.println(Colors.RED + "  ERROR: Node '" + dst + "' does not exist." + Colors.RESET); return; }

        boolean ok = failureManager.markEdgeFailed(src, dst);
        if (!ok) { System.out.println(Colors.RED + "  ERROR: No edge exists between '" + src + "' and '" + dst + "'." + Colors.RESET); return; }

        System.out.println(Colors.BOLD_RED + "\n  [FAILURE] Link " + src + "-" + dst + " has FAILED." + Colors.RESET);
        System.out.println(Colors.YELLOW + "  Updating graph..." + Colors.RESET);
        System.out.println(Colors.YELLOW + "  Checking network connectivity..." + Colors.RESET);
        analyzer.printConnectivityStatus();
    }

    // =======================================================================
    // OPTION 15 — Detect Failures
    // =======================================================================
    private static void detectFailures() {
        sectionHeader("FAILURE DETECTION");
        failureManager.detectFailure();
    }

    // =======================================================================
    // OPTION 16 — Recover Network
    // =======================================================================
    private static void recoverNetwork() {
        sectionHeader("RECOVER NETWORK");
        recovery.recoverNetwork();
    }

    // =======================================================================
    // OPTION 17 — Reroute Traffic
    // =======================================================================
    private static void rerouteTraffic() {
        sectionHeader("REROUTE TRAFFIC");
        if (graph.isEmpty()) { noNetworkError(); return; }
        System.out.print("  Source node      : ");
        String src = readLine();
        System.out.print("  Destination node : ");
        String dst = readLine();
        if (!graph.hasNode(src)) { System.out.println(Colors.RED + "  ERROR: Node '" + src + "' does not exist." + Colors.RESET); return; }
        if (!graph.hasNode(dst)) { System.out.println(Colors.RED + "  ERROR: Node '" + dst + "' does not exist." + Colors.RESET); return; }
        recovery.rerouteTraffic(src, dst);
    }

    // =======================================================================
    // OPTION 18 — Generate Report
    // =======================================================================
    private static void generateReport() {
        sectionHeader("NETWORK RELIABILITY REPORT");
        if (graph.isEmpty()) { noNetworkError(); return; }
        reliReport.generate();
    }

    // =======================================================================
    // OPTION 19 — Reset Network
    // =======================================================================
    private static void resetNetwork() {
        sectionHeader("RESET NETWORK");
        System.out.print("  Are you sure you want to reset the entire network? (yes/no): ");
        String confirm = readLine();
        if (confirm.equalsIgnoreCase("yes") || confirm.equalsIgnoreCase("y")) {
            graph.reset();
            failureManager.reset();
            recovery.resetStats();
            System.out.println(Colors.BOLD_GREEN + "  ✓ Network has been reset." + Colors.RESET);
        } else {
            System.out.println(Colors.YELLOW + "  Reset cancelled." + Colors.RESET);
        }
    }

    // =======================================================================
    // OPTION 20 — Run Demo
    // =======================================================================
    private static void runDemo() {
        demo.run();
    }

    // =======================================================================
    // Menu Display
    // =======================================================================
    private static void printWelcomeBanner() {
        System.out.println();
        System.out.println(Colors.BOLD_CYAN + "============================================================" + Colors.RESET);
        System.out.println(Colors.BOLD_CYAN + "                       CIRCUIT-X" + Colors.RESET);
        System.out.println(Colors.BOLD_CYAN + "     Dynamic Network Reliability & Failure Recovery" + Colors.RESET);
        System.out.println(Colors.BOLD_CYAN + "============================================================" + Colors.RESET);
        System.out.println(Colors.CYAN + "              DSA NETWORK SIMULATION SYSTEM" + Colors.RESET);
        System.out.println();
        System.out.println(Colors.YELLOW + "  Data Structures Used:" + Colors.RESET);
        System.out.println("    • Graph (Adjacency List)");
        System.out.println("    • BFS  (Queue / FIFO)");
        System.out.println("    • DFS  (Recursion / Stack)");
        System.out.println("    • Dijkstra (MinHeap Priority Queue)");
        System.out.println();
        System.out.println(Colors.YELLOW + "  Tip: Select option 20 to run the full automated demo." + Colors.RESET);
        System.out.println(Colors.BOLD_CYAN + "============================================================" + Colors.RESET);
    }

    private static void printMenu() {
        System.out.println();
        System.out.println(Colors.CYAN + "------------------------------------------------------------" + Colors.RESET);
        System.out.println(Colors.BOLD_WHITE + "                      MAIN MENU" + Colors.RESET);
        System.out.println(Colors.CYAN + "------------------------------------------------------------" + Colors.RESET);
        System.out.println();
        System.out.println(Colors.YELLOW + "  [NETWORK MANAGEMENT]" + Colors.RESET);
        System.out.println("    1.  Create Network (wizard)");
        System.out.println("    2.  Add Node");
        System.out.println("    3.  Add Edge");
        System.out.println("    4.  Remove Node");
        System.out.println("    5.  Remove Edge");
        System.out.println("    6.  Update Edge Weight");
        System.out.println("    7.  Display Network");
        System.out.println();
        System.out.println(Colors.YELLOW + "  [TRAVERSAL & ANALYSIS]" + Colors.RESET);
        System.out.println("    8.  BFS Traversal");
        System.out.println("    9.  DFS Traversal");
        System.out.println("    10. Check Connectivity");
        System.out.println("    11. Find Connected Components");
        System.out.println("    12. Find Shortest Path (Dijkstra)");
        System.out.println();
        System.out.println(Colors.YELLOW + "  [FAILURE & RECOVERY]" + Colors.RESET);
        System.out.println("    13. Simulate Node Failure");
        System.out.println("    14. Simulate Edge Failure");
        System.out.println("    15. Detect Failures");
        System.out.println("    16. Recover Network");
        System.out.println("    17. Reroute Traffic");
        System.out.println();
        System.out.println(Colors.YELLOW + "  [REPORTS & DEMO]" + Colors.RESET);
        System.out.println("    18. Network Reliability Report");
        System.out.println("    19. Reset Network");
        System.out.println(Colors.BOLD_GREEN + "    20. Run CIRCUIT-X Demo  ★" + Colors.RESET);
        System.out.println();
        System.out.println("    0.  Exit");
        System.out.println();
        System.out.println(Colors.CYAN + "------------------------------------------------------------" + Colors.RESET);
    }

    // =======================================================================
    // Input Helpers
    // =======================================================================

    private static int readInt(String prompt) {
        System.out.print(prompt);
        try {
            String line = scanner.nextLine().trim();
            return Integer.parseInt(line);
        } catch (NumberFormatException e) {
            System.out.println(Colors.RED + "  Invalid input. Please enter a number." + Colors.RESET);
            return -1;
        }
    }

    private static int readPositiveInt() {
        try {
            String line = scanner.nextLine().trim();
            int val = Integer.parseInt(line);
            if (val <= 0) {
                System.out.println(Colors.RED + "  Must be a positive number." + Colors.RESET);
                return 1;
            }
            return val;
        } catch (NumberFormatException e) {
            System.out.println(Colors.RED + "  Invalid input. Please enter a positive number." + Colors.RESET);
            return 1;
        }
    }

    private static String readLine() {
        return scanner.nextLine().trim();
    }

    // =======================================================================
    // Utility helpers
    // =======================================================================

    private static void sectionHeader(String title) {
        System.out.println();
        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
        System.out.println(Colors.BOLD_WHITE + "  [" + title + "]" + Colors.RESET);
        System.out.println(Colors.CYAN + "============================================================" + Colors.RESET);
    }

    private static void noNetworkError() {
        System.out.println(Colors.YELLOW + "\n  Network is empty. Use option 1 or 2 to add nodes first." + Colors.RESET);
    }
}
