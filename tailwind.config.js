/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      cursor: ["pointer"],
      colors: {
        "light-blue": "#add8e6", // This is a light blue color
      },
      fontFamily: {
        tahoma: ["Tahoma", "sans-serif"],
      },
    },
  },
  plugins: [],
};
