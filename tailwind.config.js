/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          base: '#050607',
          deep: '#080A0C',
          graphite: '#111416',
          panel: '#161A1D',
          line: '#1F2428',
        },
        lime: {
          DEFAULT: '#B9FF32',
          dim: '#8FCC1F',
          glow: '#D4FF6B',
        },
        violet: {
          DEFAULT: '#A16BFF',
          dim: '#7B4FCC',
          glow: '#C49BFF',
        },
        silver: {
          DEFAULT: '#929A96',
          dim: '#5C6360',
          bright: '#C3CAC6',
        },
        soft: '#F6F7F4',
      },
      fontFamily: {
        sans: ['"Geist"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Clash Display"', '"Geist"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse': 'spin 30s linear infinite reverse',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s ease-in-out infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%,100%': { transform: 'translateY(0%)', opacity: '0.3' },
          '50%': { transform: 'translateY(100%)', opacity: '0.8' },
        },
        flicker: {
          '0%,100%': { opacity: '0.6' },
          '45%': { opacity: '0.9' },
          '50%': { opacity: '0.4' },
          '55%': { opacity: '0.95' },
        },
      },
    },
  },
  plugins: [],
};
