/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      colors: {
        cream: '#FDF6EC',
        brown: {
          100: '#D4A574',
          300: '#A0826D',
          500: '#8B6F47',
          700: '#8B4513',
          900: '#3E2723',
        },
      },
    },
  },
  plugins: [],
};
