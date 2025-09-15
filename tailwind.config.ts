import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif','system-ui','-apple-system','Segoe UI','Roboto','Helvetica','Arial','Noto Sans','Apple Color Emoji','Segoe UI Emoji'
        ],
      },
      fontSize: {
        display: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        headline: ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        title: ['1.5rem', { lineHeight: '1.2' }],
        body: ['1rem', { lineHeight: '1.6' }],
        caption: ['0.8125rem', { lineHeight: '1.4' }],
      },
      colors: {
        indigo: {
          950: '#0b1020',
        },
        brand: {
          primary: '#3b82f6',
          accent: '#22d3ee',
          neutral: '#111827',
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(99,102,241,0.35)',
        elevated: '0 10px 30px rgba(2, 6, 23, 0.12), 0 4px 10px rgba(2, 6, 23, 0.06)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(1200px 600px at 50% -10%, rgba(99,102,241,0.25), rgba(14,23,42,0))',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      borderRadius: {
        glass: '20px',
      },
      blur: {
        glass: '20px',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '600ms',
      },
      zIndex: {
        overlay: '100',
        modal: '1000',
      },
    },
  },
  plugins: [],
} satisfies Config
