/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E3A8A',
          900: '#0E1B4D',
        },
      },
      boxShadow: {
        'card': '0 4px 16px rgba(14,27,77,.08), 0 1px 4px rgba(14,27,77,.06)',
        'card-hover': '0 12px 32px rgba(14,27,77,.14), 0 4px 8px rgba(14,27,77,.08)',
        'button': '0 4px 12px rgba(37,99,235,.35)',
        'button-hover': '0 8px 20px rgba(37,99,235,.45)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,.15)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out both',
        'pulse-slow': 'pulse-slow 8s ease-in-out infinite',
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #0E1B4D 0%, #1D4ED8 60%, #2563EB 100%)',
        'grad-card-blue': 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
        'grad-card-green': 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
        'grad-card-amber': 'linear-gradient(135deg, #92400E 0%, #F59E0B 100%)',
        'grad-card-slate': 'linear-gradient(135deg, #1E293B 0%, #475569 100%)',
      },
    },
  },
  plugins: [],
}
