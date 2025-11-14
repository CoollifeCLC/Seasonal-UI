/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'], // Safety (even though Seasonal-UI overrides)
  content: ["./src/**/*.{ts,tsx,jsx,js}", "./examples/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        fg: "var(--fg)",
        accent: "var(--accent)",
        muted: "var(--muted)",
        card: "var(--card)",
        border: "var(--border)",
        ok: "var(--ok)",
        warn: "var(--warn)",
        err: "var(--err)",
        info: "var(--info)",
      },
      boxShadow: {
        ui: "var(--shadow)",
      },
      borderRadius: {
        xs: "var(--r-xs)",
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        6: "var(--space-6)",
        8: "var(--space-8)",
      },
    },
  },
  plugins: [],
};
