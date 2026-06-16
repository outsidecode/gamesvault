/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:       "#0F0F1A",
        bg2:      "#1A1A2E",
        bg3:      "#16213E",
        surface:  "#1F1F35",
        accent:   "#6C63FF",
        accent2:  "#A78BFA",
        accent3:  "#7C3AED",
        fg:       "#E2E8F0",
        fg2:      "#94A3B8",
        vgreen:   "#10B981",
        vgreen2:  "#34D399",
        vred:     "#F43F5E",
        vred2:    "#FB7185",
        vyellow:  "#FBBF24",
        gold:     "#F59E0B",
        vcyan:    "#06B6D4",
        vcyan2:   "#22D3EE",
        vorange:  "#F97316",
        entry:    "#252540",
        border:   "#2D2D5E",
        selected: "#312E81",
      },
      fontFamily: {
        sans: ["'Segoe UI'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
