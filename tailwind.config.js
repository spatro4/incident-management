/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      colors: {
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
        },
        candy: {
          pink: '#FF6FA5',
          purple: '#8B5CF6',
          blue: '#3DA9FC',
          teal: '#2EC4B6',
          yellow: '#FFC93C',
          orange: '#FF9F45',
          green: '#4ADE80',
          red: '#FF6B6B',
        },
      },
      boxShadow: {
        chunky: '0 6px 0 rgba(0,0,0,0.15)',
        'chunky-sm': '0 4px 0 rgba(0,0,0,0.15)',
        pop: '0 10px 30px -10px rgba(0,0,0,0.3)',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '70%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fly-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-60px)', opacity: '0' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(400px) rotate(720deg)', opacity: '0' },
        },
        'shake-x': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
        'progress-fill': {
          '0%': { width: '0%' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        wiggle: 'wiggle 0.6s ease-in-out',
        float: 'float 3s ease-in-out infinite',
        'fly-up': 'fly-up 1s ease-out forwards',
        confetti: 'confetti-fall 1.8s ease-in forwards',
        'shake-x': 'shake-x 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}
