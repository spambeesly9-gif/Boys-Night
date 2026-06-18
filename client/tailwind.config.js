/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        cream: '#FFFFFF',
        'cream-dark': '#F3F4F6',
        brand: {
          red:    '#A82020',
          blue:   '#2563EB',
          yellow: '#F59E0B',
          green:  '#10B981',
          purple: '#7C3AED',
          orange: '#EA580C',
        },
        ql: {
          accent: '#A82020',
          light:  '#FFF1F1',
          border: '#F5C6C6',
        },
        hp: {
          accent: '#6D28D9',
          light:  '#F5F3FF',
          border: '#C4B5FD',
        },
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
