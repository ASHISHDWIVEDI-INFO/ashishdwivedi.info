/** @type {import('tailwindcss').Config} */
module.exports = {
  // ========================
  // Dark Mode via class
  // ========================
  darkMode: 'class',

  // ========================
  // Content Paths
  // ========================
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      // ========================
      // Custom Color Palette
      // ========================
      colors: {
        // Primary — Electric Purple
        primary: {
          50:  '#f3f0ff',
          100: '#e8e2ff',
          200: '#d3c8ff',
          300: '#b5a3ff',
          400: '#9272ff',
          500: '#7C3AED',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b0764',
          950: '#2e0457',
        },
        // Secondary — Vivid Orange
        secondary: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#F97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Dark backgrounds
        dark: {
          50:  '#f0f0f5',
          100: '#d1d1e0',
          200: '#a3a3c2',
          300: '#7070a3',
          400: '#4d4d7a',
          500: '#2a2a4a',
          600: '#1e1e38',
          700: '#141428',
          800: '#0d0d1f',
          900: '#07071a',
          950: '#030310',
        },
        // Accent — Cyan
        accent: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
      },

      // ========================
      // Custom Fonts
      // ========================
      fontFamily: {
        sans:    ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        heading: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        mono:    ['var(--font-fira-code)', 'Fira Code', 'monospace'],
      },

      // ========================
      // Custom Animations
      // ========================
      animation: {
        'fade-in':        'fadeIn 0.6s ease-out forwards',
        'fade-up':        'fadeUp 0.7s ease-out forwards',
        'fade-down':      'fadeDown 0.7s ease-out forwards',
        'slide-in-left':  'slideInLeft 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'float':          'float 3s ease-in-out infinite',
        'float-slow':     'float 5s ease-in-out infinite',
        'pulse-slow':     'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':      'spin 8s linear infinite',
        'bounce-slow':    'bounce 3s infinite',
        'gradient-x':     'gradientX 4s ease infinite',
        'typing':         'typing 3.5s steps(40,end), blink .75s step-end infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'count-up':       'countUp 0.8s ease-out forwards',
        'progress':       'progress 1.2s ease-out forwards',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countUp: {
          '0%':   { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        progress: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
      },

      // ========================
      // Custom Spacing
      // ========================
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '128': '32rem',
      },

      // ========================
      // Custom Border Radius
      // ========================
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ========================
      // Custom Box Shadows
      // ========================
      boxShadow: {
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.4)',
        'glow-cyan':   '0 0 20px rgba(6, 182, 212, 0.4)',
        'card-dark':   '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-light':  '0 4px 24px rgba(0, 0, 0, 0.08)',
      },

      // ========================
      // Backdrop Blur
      // ========================
      backdropBlur: {
        xs: '2px',
      },

      // ========================
      // Screen Sizes
      // ========================
      screens: {
        xs: '480px',
      },
    },
  },

  plugins: [],
};