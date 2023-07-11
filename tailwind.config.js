/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./App.{js,jsx,ts,tsx}",
      "./navigation/screens/*.{js,jsx,ts,tsx}",
      "./*.{js,jsx,ts,tsx}",
      './src/**/*.{html,js}',
      "./screens/**/*.{js,jsx,ts,tsx}",
      "./pages/**/*.{js,jsx,ts,tsx}",
      ".components/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }