/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#060709',
          900: '#0c0e14',
          850: '#12151f',
          800: '#171b28',
          700: '#22283a',
          600: '#323b54',
        },
        kage: {
          gold: '#e6b85c',
          goldLight: '#f8d58a',
          goldDark: '#b3862b',
          crimson: '#e12b48',
          crimsonGlow: '#ff3d5e',
          cyan: '#00e5ff',
          board: '#2a1a12',
          wood: '#1e110b',
          woodBorder: '#3d2516',
          felt: '#d9a76a',
        }
      },
      fontFamily: {
        display: ['Cinzel', 'Trajan Pro', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-gold': '0 0 25px rgba(230, 184, 92, 0.45)',
        'glow-crimson': '0 0 25px rgba(225, 43, 72, 0.5)',
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.4)',
        'board-depth': '0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
