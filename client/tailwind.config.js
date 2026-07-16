/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          darkest: 'var(--color-bg-darkest)',
          darker: 'var(--color-bg-darker)',
          dark: 'var(--color-bg-dark)',
          border: 'var(--color-border)',
          textMuted: 'var(--color-text-muted)',
          textBright: 'var(--color-text-bright)',
          teal: '#0D9488',     // Safe state / Primary
          amber: '#D97706',    // Advisory / Medium Risk
          orange: '#EA580C',   // High Risk
          red: '#DC2626',      // Critical Risk
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace']
      },
      boxShadow: {
        'glow-teal': '0 0 15px rgba(13, 148, 136, 0.15)',
        'glow-red': '0 0 15px rgba(220, 38, 38, 0.25)',
        'glow-amber': '0 0 15px rgba(217, 119, 6, 0.15)'
      }
    },
  },
  plugins: [],
}
