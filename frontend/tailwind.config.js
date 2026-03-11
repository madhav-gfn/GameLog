/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // eSports Bold palette
        primary: '#f9f906',
        'background-light': '#f8f8f5',
        'background-dark': '#23230f',
        navy: '#0a192f',
        graphite: '#2d3748',
        crimson: '#e53e3e',

        // Legacy tokens (backward-compatible for other pages)
        light: {
          bg: {
            primary: '#f8f8f5',
            secondary: '#e8e8e0',
            card: '#FFFFFF',
            hover: '#2d3748',
          },
          text: {
            primary: '#0a192f',
            secondary: '#5A5A5A',
            tertiary: '#8A8A8A',
            accent: '#f9f906',
          },
          border: {
            default: '#2d3748',
            hover: '#f9f906',
            accent: '#e53e3e',
          },
          accent: {
            primary: '#f9f906',
            secondary: '#2d3748',
            tertiary: '#f8f8f5',
            quaternary: '#e53e3e',
          },
        },
        dark: {
          bg: {
            primary: '#23230f',
            secondary: '#0a192f',
            card: '#0a192f',
            hover: '#2d3748',
          },
          text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
            tertiary: '#64748b',
            accent: '#f9f906',
          },
          border: {
            default: '#2d3748',
            hover: '#f9f906',
            accent: '#e53e3e',
          },
          accent: {
            primary: '#f9f906',
            secondary: '#2d3748',
            tertiary: '#f1f5f9',
            quaternary: '#0a192f',
          },
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'card-dark': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'card-hover-dark': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'glow-yellow': '0 0 20px rgba(249, 249, 6, 0.3)',
        'glow-crimson': '0 0 20px rgba(229, 62, 62, 0.3)',
        'glow-crimson-lg': '0 0 15px rgba(229, 62, 62, 0.5)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
