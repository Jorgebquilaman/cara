/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Acento teal oscuro (Styleguide v2.1) */
        cara: {
          50: '#EEF5F5',
          100: '#D3E4E5',
          200: '#A3C4C7',
          300: '#6FA3A8',
          400: '#3D7E85',
          500: '#0B4F57',  /* --color-primary */
          600: '#15666F',  /* --color-primary-hover */
          700: '#083A41',  /* --color-primary-active */
          800: '#062B30',
          900: '#051E22',
        },
        /* Grises cálidos del styleguide (override del default) */
        gray: {
          50: '#F8F6EF',
          100: '#F1EFE9',
          200: '#E7E5DE',
          300: '#DDDBD5',
          400: '#ABA9A3',
          500: '#7A7A7A',
          600: '#5C5B57',
          700: '#404040',
          800: '#333230',
          900: '#1F1F1F',
        },
        /* Semánticos */
        success: '#2E9E5B',
        info: '#2878C8',
        warning: '#E0A800',
        danger: '#D13B3B',
        neutral: '#7A7A7A',
        surface: {
          light: '#F7F5EE',
          dark: '#23221F',
        },
      },
      boxShadow: {
        /* Elevación del styleguide */
        'level-1': '0 2px 4px -1px rgba(0, 0, 0, 0.08)',
        'level-2': '0 4px 8px -2px rgba(0, 0, 0, 0.10)',
        'level-3': '0 8px 16px -4px rgba(0, 0, 0, 0.12)',
        'level-4': '0 12px 24px -6px rgba(0, 0, 0, 0.16)',
        card: '0 8px 16px -4px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 12px 24px -6px rgba(0, 0, 0, 0.16)',
        dropdown: '0 4px 8px -2px rgba(0, 0, 0, 0.10)',
      },
    },
  },
  plugins: [],
};
