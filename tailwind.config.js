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
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 6px 18px -2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 28px -4px rgba(15, 23, 42, 0.08), 0 3px 8px -2px rgba(15, 23, 42, 0.04)',
        'card-elevated': '0 20px 40px -8px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
        'glow-red': '0 6px 24px -2px rgba(229, 57, 53, 0.3)',
        'glow-subtle': '0 4px 16px -2px rgba(15, 23, 42, 0.06)',
        'bottom-nav': '0 -4px 24px 0 rgba(15, 23, 42, 0.06)',
        'float': '0 14px 34px -4px rgba(15, 23, 42, 0.14), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
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
