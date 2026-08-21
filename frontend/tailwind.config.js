/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        legal: {
          50: '#f4f6fb',
          100: '#e8edf6',
          200: '#cbd7ec',
          300: '#9eb7dd',
          400: '#6a92cb',
          500: '#4672b7',
          600: '#34589b',
          700: '#2b477e',
          800: '#263d69',
          900: '#1b2945',
          950: '#10192d'
        }
      }
    },
  },
  plugins: [],
}
