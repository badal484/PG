import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A1A2E",
          light: "#16213E",
        },
        accent: {
          DEFAULT: "#E8471C",
          light: "#FF6B3D",
        },
        success: "#16A34A",
        warning: "#D97706",
        error: "#DC2626",
        background: "#FAFAFA",
        surface: "#FFFFFF",
        border: "#E5E7EB",
        text: {
          primary: "#111827",
          secondary: "#6B7280",
          tertiary: "#9CA3AF",
        },
        verified: {
          premium: "#F59E0B",
          standard: "#3B82F6",
          budget: "#6B7280",
        },
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "1.5" }],
        sm: ["14px", { lineHeight: "1.5" }],
        base: ["16px", { lineHeight: "1.5" }],
        lg: ["18px", { lineHeight: "1.5" }],
        xl: ["20px", { lineHeight: "1.5" }],
        "2xl": ["24px", { lineHeight: "1.25" }],
        "3xl": ["30px", { lineHeight: "1.25" }],
        "4xl": ["36px", { lineHeight: "1.25" }],
        "5xl": ["48px", { lineHeight: "1.25" }],
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(17, 24, 39, 0.06)",
        md: "0 8px 24px rgba(17, 24, 39, 0.08)",
        lg: "0 20px 48px rgba(17, 24, 39, 0.14)",
        xl: "0 24px 64px rgba(17, 24, 39, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
