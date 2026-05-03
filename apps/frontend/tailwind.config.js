/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#4f6ef7',
          600: '#3d5ce0',
          700: '#2d4acc',
          900: '#1a2d7a',
        },
        surface: {
          900: '#0f1117',
          800: '#161b27',
          700: '#1e2536',
          600: '#252d40',
          500: '#2d3650',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
