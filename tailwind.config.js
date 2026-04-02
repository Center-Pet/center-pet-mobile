/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src-mobile/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: "#D14D72",
        brandSoft: "#FEF2F4",
        surface: "#FFFFFF",
        textMain: "#1F2937",
        textMuted: "#6B7280",
        borderSoft: "#E5E7EB"
      }
    }
  },
  plugins: []
};
