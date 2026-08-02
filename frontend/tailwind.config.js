/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#1e3a8a',
          dark: '#0f2657',
          light: '#2563eb',
          50: '#eef3fc',
          100: '#dbe6f9',
        },
        accent: {
          DEFAULT: '#0d9488',
          light: '#14b8a6',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 38, 87, 0.04), 0 2px 8px rgba(15, 38, 87, 0.06)',
        card: '0 1px 3px rgba(15, 38, 87, 0.06), 0 4px 16px rgba(15, 38, 87, 0.08)',
      },
    },
  },
  plugins: [],
};
