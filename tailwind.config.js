const solidsPreset = require('@soli92/solids/tailwind-preset')

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [solidsPreset],
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
    './contexts/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
