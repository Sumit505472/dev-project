/** @type {import('tailwindcss').Config} */
const daisyui = require('daisyui');

export default {
    darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark"], // Or specify your own
  },
}
