/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          150: '#e9eef5',
        },
        gray: {
          150: '#e9eef5',
        },
        nso: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          red: '#E53935',
          600: '#E53935',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          darkred: '#991B1B',
          lightred: '#FEF2F2',
          hoverred: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 14px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.1)',
        'glow-red': '0 4px 20px -2px rgba(229, 57, 53, 0.35)',
        'bottom-nav': '0 -4px 20px 0 rgba(0, 0, 0, 0.06)',
      },
      screens: {
        'xs': '360px',
      },
      scale: {
        '98': '0.98',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
