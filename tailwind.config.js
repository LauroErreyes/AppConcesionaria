/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'hero-scale': 'heroScale 1.5s ease-out'
      },
      keyframes: {
        fadeIn: {
          'from': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          }
        },
        heroScale: {
          'from': { transform: 'scale(1.1)' },
          'to': { transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
}