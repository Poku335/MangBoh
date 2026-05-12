import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        card: "var(--card)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        muted: "var(--muted)",
        text: "var(--text)",
        gold: "var(--gold)",
        "reader-bg": "var(--reader-bg)",
        "reader-panel": "var(--reader-panel)",
        "reader-panel-soft": "var(--reader-panel-soft)",
        "reader-action": "var(--reader-action)",
      },
    },
  },
  plugins: [],
} satisfies Config;
