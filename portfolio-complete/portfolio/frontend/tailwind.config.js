/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f0ede8', 100: '#d6d1c8', 200: '#b8b0a3',
          300: '#968d7e', 400: '#7a7067', 500: '#5e5750',
          600: '#47413b', 700: '#322e2a', 800: '#1e1b18', 900: '#0e0c0a',
        },
        accent: {
          DEFAULT: '#c8a96e', light: '#e0c898', dark: '#a08040',
        },
        surface: {
          DEFAULT: '#0e0c0a', card: '#181512', border: '#2a2520',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in': 'slideIn 0.5s ease forwards',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        glow: { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '0.8' } },
      },
    },
  },
  plugins: [],
};
