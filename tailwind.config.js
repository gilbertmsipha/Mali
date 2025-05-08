/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'income': 'rgb(var(--color-primary) / <alpha-value>)',
        'income-light': 'rgb(var(--color-primary-light) / <alpha-value>)',
        'income-dark': 'rgb(var(--color-primary-dark) / <alpha-value>)',
        'expense': 'rgb(var(--color-danger) / <alpha-value>)',
        'expense-light': 'rgb(var(--color-danger-light) / <alpha-value>)',
        'expense-dark': 'rgb(var(--color-danger-dark) / <alpha-value>)',
        'warning': 'rgb(var(--color-warning) / <alpha-value>)',
        'warning-light': 'rgb(var(--color-warning-light) / <alpha-value>)',
        'warning-dark': 'rgb(var(--color-warning-dark) / <alpha-value>)',
        'info': 'rgb(var(--color-info) / <alpha-value>)',
        'info-light': 'rgb(var(--color-info-light) / <alpha-value>)',
        'info-dark': 'rgb(var(--color-info-dark) / <alpha-value>)',
      },
      fontFamily: {
        sans: [
          'Inter', 
          'ui-sans-serif', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'Helvetica Neue', 
          'Arial', 
          'sans-serif'
        ]
      },
      screens: {
        'xs': '475px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
      },
    },
  },
  plugins: [],
};