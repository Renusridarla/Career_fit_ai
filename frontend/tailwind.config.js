/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F17',
          card: '#151C2C',
          border: '#1E293B',
          muted: '#64748B',
          accent: '#3B82F6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444'
        }
      }
    },
  },
  plugins: [],
}
