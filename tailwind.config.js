/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // deep teal "ink" surface, with a few elevated shades
        ink: { DEFAULT: '#0a1c21', 500: '#143a43', 600: '#0e2a31', 700: '#081519' },
        paper: '#f4f1ea',
        mist: '#9fb3b8',
        coral: '#ff6a45',
        amber: '#ffc24a',
        iris: '#7b80ff',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 12px 40px -12px rgba(255, 106, 69, 0.55)',
        card: '0 18px 40px -20px rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        popIn: 'popIn 0.45s ease-out both',
        riseIn: 'riseIn 0.45s ease-out both',
      },
    },
  },
  plugins: [],
}
