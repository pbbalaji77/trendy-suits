/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        luxury: {
          gold: "#D4AF37",      // Classic premium gold
          goldlight: "#F3E5AB", // Soft ivory-gold
          golddark: "#AA7C11",  // Deep bronze-gold
          black: "#0A0A0B",     // Obsidian dark
          charcoal: "#161619",  // Deep grey
          slate: "#2A2A30",     // Glass base grey
          accent: "#9966cc",    // Luxury royal amethyst accent
        }
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        "luxury-glow": "0 0 20px rgba(212, 175, 55, 0.15)",
        "glass-light": "0 8px 32px 0 rgba(31, 38, 135, 0.05)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backdropBlur: {
        xs: "2px",
      }
    },
  },
  plugins: [],
}
