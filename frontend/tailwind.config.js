/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary = deep indigo/violet (academic & distinctive)
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Warm accent = amber/honey
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        // Warm neutral background / surface
        surface: {
          50:  '#fdfcf9',
          100: '#faf8f3',
          200: '#f0ece3',
        },
      },
      boxShadow: {
        'soft':  '0 2px 8px -2px rgba(79, 70, 229, 0.08), 0 4px 16px -4px rgba(79, 70, 229, 0.06)',
        'lift':  '0 10px 30px -10px rgba(79, 70, 229, 0.25), 0 6px 20px -8px rgba(245, 158, 11, 0.12)',
      },
    },
  },
  plugins: [],
};
