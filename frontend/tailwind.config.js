/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // JU Maroon — primary ink/brand
        brand: {
          50:  '#fdf3f3',
          100: '#fbe5e5',
          200: '#f5c2c2',
          300: '#eb9595',
          400: '#dc5f5f',
          500: '#c83838',
          600: '#a71d1d',
          700: '#7f1d1d',
          800: '#651616',
          900: '#3f0e0e',
        },
        // Ochre / brass accent
        accent: {
          50:  '#fbf7ee',
          100: '#f4e8c8',
          200: '#ead493',
          300: '#dcb85a',
          400: '#ca9a2e',
          500: '#a77e20',
          600: '#81611a',
          700: '#5b4412',
        },
        // Paper / ink surfaces (light mode cream, dark mode deep graphite)
        surface: {
          50:  '#faf7f2',
          100: '#f3ede3',
          200: '#e6dfd1',
          300: '#c9bfa9',
          700: '#3d3933',
          800: '#24211c',
          900: '#141210',
        },
      },
      boxShadow: {
        'soft':  '0 1px 2px 0 rgba(20, 18, 16, 0.04), 0 4px 12px -4px rgba(20, 18, 16, 0.08)',
        'lift':  '0 12px 28px -14px rgba(127, 29, 29, 0.35), 0 6px 14px -6px rgba(20, 18, 16, 0.12)',
      },
    },
  },
  plugins: [],
};
