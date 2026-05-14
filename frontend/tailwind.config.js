/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          800: '#0d1221',
          900: '#080c18',
          950: '#04060e',
        },
        brand: {
          cyan: '#60d8ff',
          purple: '#7c3aed',
          green: '#10b981',
          amber: '#f59e0b',
        }
      },
      animation: {
        'var-pop': 'varPop 0.4s ease',
        'var-flash': 'varFlash 0.5s ease',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        varPop: {
          '0%': { opacity: 0, transform: 'scale(0.8) translateY(10px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        varFlash: {
          '0%': { borderColor: '#60d8ff', backgroundColor: '#0d3a5a' },
          '100%': { borderColor: '#1e3a5a', backgroundColor: '#0f1e35' },
        }
      }
    }
  },
  plugins: []
}
