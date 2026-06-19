/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pulse: {
          50:  '#f0f4ff',
          100: '#dce7ff',
          500: '#4f6ef7',
          600: '#3b54e8',
          700: '#2d43cc',
          900: '#1a2b8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
