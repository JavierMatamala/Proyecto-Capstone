/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0B0F29",
          light: "#F1F5F9",
          primary: "#1E3A8A",
          accent: "#FBBF24",
        },
      },
    },
  },
  plugins: [],
};
