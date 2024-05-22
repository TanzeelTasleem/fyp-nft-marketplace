module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#fff",
        black: "#111",
        general: "#727272",
        black_soft: "#333",
        black_col: "#2e333c",
        black_more: "#0f0f0f",
        color_less: "#ded4ff",
        color: "#8364E2",
        color_more: "#403f83",
        error: '#ff3333',
        success: '#0e810e',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}









