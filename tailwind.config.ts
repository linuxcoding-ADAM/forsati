import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { background: "#0a0a0a", surface: "#171717", surfaceHover: "#262626", border: "#262626", primary: "#22c55e", primaryHover: "#16a34a", textMuted: "#a3a3a3" },
      animation: { 'fade-in': 'fadeIn 0.3s ease-out forwards', 'fade-up': 'fadeUp 0.4s ease-out forwards' },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }
      }
    }
  },
  plugins: [],
};
export default config;