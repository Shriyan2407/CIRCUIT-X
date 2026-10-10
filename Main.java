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
