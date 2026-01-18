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
        // Light mode colors
        light: {
          bg: {
            primary: '#FFE2AF', // Peach
            secondary: '#79C9C5', // Teal
            card: '#FFFFFF',
            hover: '#3F9AAE', // Teal-blue
          },
          text: {
            primary: '#2C2C2C', // Charcoal
            secondary: '#5A5A5A',
            tertiary: '#8A8A8A',
            accent: '#3F9AAE', // Teal-blue
          },
          border: {
            default: '#79C9C5', // Teal
            hover: '#3F9AAE', // Teal-blue
            accent: '#F96E5B', // Coral
          },
          accent: {
            primary: '#3F9AAE', // Teal-blue
            secondary: '#79C9C5', // Teal
            tertiary: '#FFE2AF', // Peach
            quaternary: '#F96E5B', // Coral
          },
        },
        // Dark mode colors
        dark: {
          bg: {
            primary: '#0C2C55', // Dark blue
            secondary: '#296374', // Blue-grey
            card: '#296374', // Blue-grey
            hover: '#629FAD', // Light blue
          },
          text: {
            primary: '#EDEDCE', // Cream
            secondary: '#EDEDCE', // Cream
            tertiary: '#629FAD', // Light blue
            accent: '#EDEDCE', // Cream
          },
          border: {
            default: '#296374', // Blue-grey
            hover: '#629FAD', // Light blue
            accent: '#629FAD', // Light blue
          },
          accent: {
            primary: '#629FAD', // Light blue
            secondary: '#296374', // Blue-grey
            tertiary: '#EDEDCE', // Cream
            quaternary: '#0C2C55', // Dark blue
          },
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'card-dark': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'card-hover-dark': '0 4px 16px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
