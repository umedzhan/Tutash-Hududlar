/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1e3a8a',
          dark: '#0f2657',
          light: '#2563eb',
        },
      },
    },
  },
  plugins: [],
};
