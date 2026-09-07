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
        cara: {
          50: '#f0faf4',
          100: '#dcf3e4',
          200: '#bae6cb',
          300: '#8dd4ab',
          400: '#5cbd86',
          500: '#2E8B57',
          600: '#25764a',
          700: '#1F6E4A',
          800: '#1a5a3d',
          900: '#14482f',
        },
        success: '#2E8B57',
        warning: '#F59E0B',
        danger: '#EF4444',
        neutral: '#6B7280',
        surface: {
          light: '#FFFFFF',
          dark: '#1E1E1E',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
