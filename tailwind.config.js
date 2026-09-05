/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D5257',
        navy: '#1E3A5F',
        cream: '#FAF7F2',
        pnru: '#016a2b',
        black: '#000000',
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
