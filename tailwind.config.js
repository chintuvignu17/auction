/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cricket: {
          darkest: '#050811',
          darker: '#0a0f1e',
          dark: '#0f172a',
          card: '#131d36',
          border: '#1e2d52',
          gold: '#f59e0b',
          'gold-light': '#fbbf24',
          'gold-dark': '#b45309',
          blue: '#3b82f6',
          'blue-glow': '#60a5fa',
          cyan: '#06b6d4',
          emerald: '#10b981',
          crimson: '#ef4444',
          sold: '#10b981',
          unsold: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 25px rgba(245, 158, 11, 0.7))' },
        },
        'blue-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))' },
        },
        'stamp-in': {
          '0%': { opacity: '0', transform: 'scale(3) rotate(-25deg)' },
          '60%': { opacity: '1', transform: 'scale(0.9) rotate(-12deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-15deg)' },
        },
        'hammer-hit': {
          '0%': { transform: 'rotate(-45deg)' },
          '50%': { transform: 'rotate(15deg)' },
          '70%': { transform: 'rotate(-10deg)' },
          '100%': { transform: 'rotate(0deg)' },
        }
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s infinite ease-in-out',
        'blue-pulse': 'blue-pulse 2s infinite ease-in-out',
        'stamp-in': 'stamp-in 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'hammer-hit': 'hammer-hit 0.6s ease-out'
      }
    },
  },
  plugins: [],
}

