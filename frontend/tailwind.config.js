/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12141C",
        surface: "#1B1E29",
        surface2: "#242838",
        line: "#2A2E3F",
        cream: "#F1ECE1",
        muted: "#8B90A3",
        amber: {
          DEFAULT: "#E8A33D",
          dim: "#C97D1F",
        },
        danger: "#E8615C",
      },
      fontFamily: {
        display: ["\"Space Grotesk\"", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "monospace"],
      },
      backgroundImage: {
        sprocket:
          "repeating-linear-gradient(to bottom, transparent 0px, transparent 14px, rgba(232,163,61,0.35) 14px, rgba(232,163,61,0.35) 16px)",
      },
    },
  },
  plugins: [],
}
