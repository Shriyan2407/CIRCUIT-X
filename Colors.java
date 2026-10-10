/**
 * CIRCUIT-X — Colors.java
 *
 * ANSI escape codes for terminal coloring.
 * Used throughout the application for professional terminal output.
 * Falls back gracefully on terminals that do not support ANSI codes
 * (the strings simply render as empty).
 */
public class Colors {

    // Basic colors
    public static final String RESET  = "\u001B[0m";
    public static final String RED    = "\u001B[31m";
    public static final String GREEN  = "\u001B[32m";
    public static final String YELLOW = "\u001B[33m";
    public static final String BLUE   = "\u001B[34m";
    public static final String PURPLE = "\u001B[35m";
    public static final String CYAN   = "\u001B[36m";
    public static final String WHITE  = "\u001B[37m";

    // Bold variants
    public static final String BOLD        = "\u001B[1m";
    public static final String BOLD_RED    = "\u001B[1;31m";
    public static final String BOLD_GREEN  = "\u001B[1;32m";
    public static final String BOLD_YELLOW = "\u001B[1;33m";
    public static final String BOLD_CYAN   = "\u001B[1;36m";
    public static final String BOLD_WHITE  = "\u001B[1;37m";
    public static final String BOLD_BLUE   = "\u001B[1;34m";

    // Prevent instantiation
    private Colors() {}

    /** Wrap text in a color and reset after. */
    public static String color(String text, String color) {
        return color + text + RESET;
    }
}
