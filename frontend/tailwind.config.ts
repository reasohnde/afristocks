// tailwind.config.ts
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
        // Couleurs Primaires - Psychologie Africaine
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
        mono: ['Space Grotesk', 'SF Mono', 'monospace'],
      },
      animation: {
        'gradient': 'gradient 3s ease infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
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
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
        'blur-heavy': 'blur(40px)',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(255, 107, 53, 0.3)',
        'glow-md': '0 0 40px rgba(255, 107, 53, 0.4)',
        'glow-lg': '0 0 60px rgba(255, 107, 53, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 8px 40px 0 rgba(31, 38, 135, 0.45)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'mesh': '50px 50px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [
    // Plugin pour le glass morphism
    function ({ addUtilities }: any) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-heavy': {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        },
        '.text-gradient': {
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      addUtilities(newUtilities)
    }
  ],
}
export default config