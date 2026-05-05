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
          DEFAULT: '#293a88',
          foreground: '#ffffff',
          50: '#e8ebf5',
          100: '#d0d7ef',
          200: '#a3b4df',
          300: '#7591cf',
          400: '#4159a8',
          500: '#293a88',
          600: '#203070',
          700: '#182358',
          800: '#101840',
          900: '#081028',
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
          foreground: '#293a88',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#293a88',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#293a88',
        },
        surface: {
          0: 'hsl(var(--surface-0))',
          1: 'hsl(var(--surface-1))',
          2: 'hsl(var(--surface-2))',
          3: 'hsl(var(--surface-3))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: '#ffffff',
        },
        text: {
          primary: 'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          tertiary: 'hsl(var(--text-tertiary))',
          disabled: 'hsl(var(--text-disabled))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
        boxShadow: {
          xs: '0 1px 2px rgba(0,0,0,0.05)',
          sm: '0 2px 8px rgba(0,0,0,0.06)',
          md: '0 4px 16px rgba(0,0,0,0.08)',
          lg: '0 8px 30px rgba(0,0,0,0.10)',
          xl: '0 16px 48px rgba(0,0,0,0.14)',
          brand: '0 8px 30px rgba(41,58,136,0.25)',
          'brand/80': '0 8px 30px rgba(41,58,136,0.20)',
          glow: '0 0 40px rgba(41,58,136,0.15)',
        },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
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