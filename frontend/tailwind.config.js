/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'retro-dark': '#0a0e27',
        'retro-purple': '#1a1a3e',
        'retro-neon-green': '#00ff41',
        'retro-neon-blue': '#00d4ff',
        'retro-neon-magenta': '#ff006e',
        'retro-neon-yellow': '#ffbe0b',
      },
      fontFamily: {
        'pixel': ['Press Start 2P', 'cursive'],
        'mono': ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'neon-green': '0 0 10px rgba(0, 255, 65, 0.5)',
        'neon-blue': '0 0 10px rgba(0, 212, 255, 0.5)',
        'neon-magenta': '0 0 10px rgba(255, 0, 110, 0.5)',
      },
      backdropFilter: {
        'glass': 'backdrop-filter: blur(10px)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
