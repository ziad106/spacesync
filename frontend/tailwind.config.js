import forms from '@tailwindcss/forms';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Using CSS variables that change based on dark class
        'background':                 'var(--bg-background)',
        'surface':                    'var(--bg-surface)',
        'surface-container-lowest':   'var(--bg-surface-container-lowest)',
        'surface-container-low':      'var(--bg-surface-container-low)',
        'surface-container':          'var(--bg-surface-container)',
        'surface-container-high':     'var(--bg-surface-container-high)',
        'surface-container-highest':  'var(--bg-surface-container-highest)',
        'surface-variant':            'var(--bg-surface-variant)',
        'surface-bright':             'var(--bg-surface-bright)',
        'primary':                    '#ffb595',
        'primary-fixed':              '#ffdbcd',
        'primary-fixed-dim':          '#ffb595',
        'primary-container':          '#ee671c',
        'on-primary':                 '#571e00',
        'on-surface':                 'var(--text-on-surface)',
        'on-surface-variant':         'var(--text-on-surface-variant)',
        'secondary':                  '#a5d0b9',
        'secondary-container':        '#29513f',
        'secondary-fixed':            '#c1ecd4',
        'tertiary':                   '#00dbe7',
        'tertiary-container':         '#00a0a9',
        'tertiary-fixed':             '#74f5ff',
        'error':                      '#ffb4ab',
        'error-container':            '#93000a',
        'outline':                    'var(--border-outline)',
        'outline-variant':            'var(--border-outline-variant)',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg:      '0.25rem',
        xl:      '0.5rem',
        full:    '9999px',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body:     ['Space Grotesk', 'sans-serif'],
        label:    ['Space Grotesk', 'sans-serif'],
        sans:     ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        ticker: 'ticker 40s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [forms({ strategy: 'class' })],
};

