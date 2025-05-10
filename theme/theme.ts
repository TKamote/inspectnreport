export const COLORS = {
  RED: "#E30613",
  MIDNIGHT: "#131E29",
  TEXT: "#333333",
  BACKGROUND: "#fff",
  BORDER: "#ccc",
  DISABLED: "#cccccc",
  WHITE: "#ffffff",
  CARD_BACKGROUND: "#f9f9f9",
  SPACE: "#003E51",
};

// Helper type for type safety
type FontWeight =
  | "normal"
  | "bold"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

// Update to use literal values instead of strings
export const FONTS = {
  FAMILY:
    "System, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  WEIGHTS: {
    REGULAR: "400" as FontWeight,
    MEDIUM: "500" as FontWeight,
    SEMIBOLD: "600" as FontWeight,
    BOLD: "bold" as FontWeight,
  },
};
