export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e4e4ff',
          200: '#ccccff',
          300: '#a8a3ff',
          400: '#8470ff',
          500: '#6c47ff',
          600: '#5c25f7',
          700: '#4f13e3',
          800: '#4210bf',
          900: '#37109c',
          950: '#200874',
        },
        fuchsia: {
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        gridFade: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px 4px rgba(99,102,241,0.3)' },
          '50%': { boxShadow: '0 0 40px 8px rgba(139,92,246,0.5)' },
        },
        spotlightMove: {
          '0%': { transform: 'translate(-20%, -20%) scale(1)' },
          '50%': { transform: 'translate(20%, 10%) scale(1.1)' },
          '100%': { transform: 'translate(-20%, -20%) scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        aurora: 'aurora 8s ease infinite',
        shimmer: 'shimmer 3s linear infinite',
        marquee: 'marquee 30s linear infinite',
        'grid-fade': 'gridFade 4s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
        'spotlight-move': 'spotlightMove 12s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'count-up': 'countUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
