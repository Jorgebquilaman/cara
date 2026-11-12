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
        /* ── Calm Kit ─────────────────────────────── */
        sage: '#687F6E',
        moss: '#A7B8A7',
        mist: '#D9E1D9',
        ivory: '#F4EFE8',
        sand: '#C9BDAF',
        ink: '#1F2A24',
        'ink-muted': '#7A8479',
        surface: '#F8F4EE',

        /* Mapa de compatibilidad: la escala `cara` ahora es la familia sage */
        cara: {
          50: '#F6F3ED',
          100: '#EDF1EC',
          200: '#D9E1D9',
          300: '#C2CDC2',
          400: '#A7B8A7',
          500: '#687F6E',
          600: '#5C7163',
          700: '#4F6256',
          800: '#3E4E45',
          900: '#1F2A24',
        },

        /* Neutros cálidos (sin negro puro) */
        gray: {
          50: '#F8F4EE',
          100: '#F4EFE8',
          200: '#EBE4D9',
          300: '#D8CFC1',
          400: '#A9A293',
          500: '#7A8479',
          600: '#5E675F',
          700: '#454E47',
          800: '#2E3831',
          900: '#1F2A24',
        },

        /* Semánticos suaves */
        success: '#687F6E',
        info: '#5C7C8A',
        warning: '#B98A56',
        danger: '#A65D57',
        neutral: '#7A8479',
        'surface-warm': {
          light: '#F8F4EE',
          dark: '#2E3430',
        },
      },
      borderRadius: {
        card: '24px',
        pill: '999px',
      },
      boxShadow: {
        soft: '8px 8px 20px rgba(120,110,95,.12), -6px -6px 16px rgba(255,255,255,.8)',
        'soft-sm': '4px 4px 12px rgba(120,110,95,.10), -4px -4px 10px rgba(255,255,255,.7)',
        float: '0 10px 30px rgba(120,110,95,.16)',
        inset: 'inset 2px 2px 5px rgba(120,110,95,.10), inset -2px -2px 6px rgba(255,255,255,.85)',
      },
      letterSpacing: {
        section: '0.18em',
        page: '0.2em',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
