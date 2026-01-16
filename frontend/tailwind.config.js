/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3e5a7a',
          50: '#f0f3f7',
          100: '#dce3eb',
          200: '#b9c7d7',
          300: '#94a8bf',
          400: '#6d87a3',
          500: '#3e5a7a',
          600: '#355166',
          700: '#2c4453',
          800: '#243740',
          900: '#1b2a2d',
        },
        correct: {
          DEFAULT: '#6aaa64', 
          light: '#e8f5e6',
        },
        wrong: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
        },
        dark: '#121213',
        gray: {
          50: '#f9fafb',
          100: '#f6f7f8',
          200: '#e3e3e1',
          300: '#d3d6da',
          400: '#878a8c',
          500: '#565758',
          600: '#3a3a3c',
        },
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 4px 23px 0 rgba(0, 0, 0, 0.2)',
      },
      letterSpacing: {
        'wide': '0.02em',
      },
    },
  },
  plugins: [],
}