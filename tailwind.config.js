/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        poppinsMed: ['PoppinsMedium', 'sans-serif'],
        poppinsBold: ['PoppinsBold', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
}