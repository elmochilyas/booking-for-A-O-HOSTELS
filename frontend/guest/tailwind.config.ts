import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#E94E1B',
          foreground: '#ffffff',
          50: '#FEF3EE',
          100: '#FCE4D6',
          200: '#F9C9AD',
          300: '#F5AE84',
          400: '#F08A4D',
          500: '#E94E1B',
          600: '#D13D14',
          700: '#A93110',
          800: '#7F250C',
          900: '#561908',
        },
        secondary: {
          DEFAULT: '#1E3A5F',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#22C55E',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#000000',
        },
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#F5F5F5',
          foreground: '#1E3A5F',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1E3A5F',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1E3A5F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config