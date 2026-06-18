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
        cream: '#F2EAD8',
        'cream-dark': '#E8DEC8',
        brand: {
          red:    '#A82020',
          blue:   '#2563EB',
          yellow: '#F59E0B',
          green:  '#10B981',
          purple: '#7C3AED',
          orange: '#EA580C',
        },
      },
      animation: {
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'slide-up':  'slideUp 0.35s ease-out',
        'pop':       'pop 0.25s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%':   { transform: 'scale(0.8)', opacity: 0 },
          '70%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        pop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
