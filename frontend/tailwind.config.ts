import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'sunset': {
          DEFAULT: '#FF6B35',
          50: '#FFF0E6',
          100: '#FFE1CC',
          200: '#FFC299',
          300: '#FFA366',
          400: '#FF8533',
          500: '#FF6B35',
          600: '#E85100',
          700: '#B53E00',
          800: '#822C00',
          900: '#4F1A00',
        },
        'deep-indigo': {
          DEFAULT: '#1A1B3A',
          50: '#E8E8F0',
          100: '#D1D1E1',
          200: '#A3A3C3',
          300: '#7575A5',
          400: '#474787',
          500: '#1A1B3A',
          600: '#15162E',
          700: '#101122',
          800: '#0B0C17',
          900: '#06070B',
          950: '#020206',
        },
        'emerald-growth': {
          DEFAULT: '#00D9A3',
          50: '#E6FFF8',
          100: '#CCFFF1',
          200: '#99FFE3',
          300: '#66FFD5',
          400: '#33FFC7',
          500: '#00D9A3',
          600: '#00B386',
          700: '#008C69',
          800: '#00664C',
          900: '#00402F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 3s ease infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
      },
    },
  },
  plugins: [],
}
export default config