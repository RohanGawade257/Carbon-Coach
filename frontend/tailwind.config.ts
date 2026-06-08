import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#13201a",
        forest: "#1f7a4d",
        mint: "#dff5e8",
        skyline: "#2f6f9f",
        sun: "#f4b942"
      },
      boxShadow: {
        soft: "0 14px 35px rgba(19, 32, 26, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;

