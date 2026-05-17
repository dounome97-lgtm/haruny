export const mobileDesignTokens = {
  colors: {
    accent: "#238742",
    accentStrong: "#f25745",
    background: "#fbfaf6",
    foreground: "#142231",
    muted: "#6b7280",
    surface: "#ffffff",
    surfaceSoft: "#f1f8f0",
  },
  radius: {
    action: 24,
    card: 28,
    chip: 999,
  },
  shadow: {
    action: "0 12px 24px rgba(242, 87, 69, 0.22)",
    card: "0 1px 2px rgba(20, 34, 49, 0.05)",
  },
  spacing: {
    pageX: 20,
    pageY: 24,
    sectionGap: 20,
  },
  touchTarget: {
    actionMinHeight: 64,
    iconButton: 48,
  },
} as const;
