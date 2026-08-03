import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050B16",
          900: "#0A1628",
          800: "#122238",
          700: "#1B3150",
          600: "#274469",
        },
        silver: {
          100: "#F4F6F9",
          200: "#E6EAF0",
          300: "#C9D2DD",
          400: "#9FACBD",
        },
        cyan: {
          300: "#8CEAF2",
          400: "#4FDCE8",
          500: "#20C7D6",
        },
      },
      fontFamily: {
        display: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 8px 30px -8px rgba(10, 22, 40, 0.15)",
        "soft-lg": "0 20px 60px -15px rgba(10, 22, 40, 0.25)",
        glow: "0 0 40px -8px rgba(79, 220, 232, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
