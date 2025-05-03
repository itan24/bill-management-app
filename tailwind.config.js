
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@shadcn/ui/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Moved inside the config object
  theme: {
    extend: {},
  },
  plugins: [],
};