
/**
 * TMS.ai Design Tokens
 * Machine-readable token definitions for styling consistency
 *
 * Usage:
 * import tokens from '@/design-system/tokens/tokens';
 * style={{ color: tokens.color.text.default }}
 */

export const tokens = {
  $schema: "https://design-tokens.org/schema.json",
  meta: {
    name: "TMS.ai Design Tokens",
    version: "1.0.0"
  },
  color: {
    brand: {
      primary: "#2257FF",
      primarySoft: "#E5EDFF",
      secondary: "#0BA5E9"
    },
    role: {
      brokerAccent: "#2257FF",
      carrierAccent: "#0BA5E9",
      driverAccent: "#10B981",
      customerAccent: "#8B5CF6",
      ownerOperatorAccent: "#F59E0B"
    },
    neutral: {
      "50": "#F9FAFB",
      "100": "#F3F4F6",
      "200": "#E5E7EB",
      "300": "#D1D5DB",
      "400": "#9CA3AF",
      "500": "#6B7280",
      "600": "#4B5563",
      "700": "#374151",
      "800": "#1F2933",
      "900": "#111827"
    },
    semantic: {
      success: "#16A34A",
      warning: "#F59E0B",
      danger: "#DC2626",
      info: "#0BA5E9"
    },
    background: {
      app: "#F9FAFB", // Resolved from {color.neutral.50}
      surface: "#FFFFFF",
      surfaceSubtle: "#F3F4F6", // Resolved from {color.neutral.100}
      surfaceElevated: "#FFFFFF"
    },
    border: {
      subtle: "#E5E7EB", // Resolved from {color.neutral.200}
      strong: "#D1D5DB", // Resolved from {color.neutral.300}
      focus: "#2257FF" // Resolved from {color.brand.primary}
    },
    text: {
      default: "#111827", // Resolved from {color.neutral.900}
      muted: "#6B7280", // Resolved from {color.neutral.500}
      onPrimary: "#FFFFFF",
      danger: "#DC2626" // Resolved from {color.semantic.danger}
    }
  },
  font: {
    family: {
      base: "'Inter', system-ui, -apple-system, sans-serif",
      mono: "'Roboto Mono', ui-monospace, monospace"
    },
    size: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    },
    weight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700"
    },
    lineHeight: {
      tight: "1.1",
      normal: "1.4",
      relaxed: "1.6"
    }
  },
  space: {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px"
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    pill: "9999px"
  },
  shadow: {
    sm: "0 1px 2px rgba(15, 23, 42, 0.04)",
    md: "0 4px 8px rgba(15, 23, 42, 0.08)",
    lg: "0 10px 24px rgba(15, 23, 42, 0.12)",
    xl: "0 20px 40px rgba(15, 23, 42, 0.16)"
  },
  zIndex: {
    base: "0",
    dropdown: "1000",
    sticky: "1050",
    overlay: "1100",
    modal: "1200",
    toast: "1300"
  },
  breakpoint: {
    mobile: "480px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1280px",
    ultrawide: "1536px"
  },
  theme: {
    light: {
      background: "#F9FAFB", // Resolved from {color.background.app} which resolves to {color.neutral.50}
      surface: "#FFFFFF",
      text: "#111827" // Resolved from {color.text.default} which resolves to {color.neutral.900}
    },
    dark: {
      background: "#020617",
      surface: "#0F172A",
      surfaceElevated: "#1E293B",
      text: "#E5E7EB",
      textMuted: "#9CA3AF"
    }
  }
} as const;

export default tokens;
