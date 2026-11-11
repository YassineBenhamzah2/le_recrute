/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#070913",
        cardBg: "rgba(18, 22, 41, 0.7)",
      }
    },
  },
  plugins: [],
}
