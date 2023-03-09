/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        siteblack: "#131519",
        siteDimBlack: "#191d23",
        siteWhite: "#9eacc7",
        siteBlue: "#52c0e5",
      },
      backgroundImage: {
        // astral: "url('/src/assets/background/astral.jpeg')",
        // saiman: "url('/src/assets/background/saiman.jpeg')",
        // eoaalien: "url('/src/assets/background/eoaalien.jpg')",
        // panight: "url('/src/assets/background/panight.jpg')",
        // heroImg: "url('/src/assets/background/hero-img.jpg')",
        // landing: "url('/src/assets/background/landing.jpeg')",
        forest: "url('/src/assets/background/forest.jpg')",
        castle: "url('/src/assets/background/castle.jpg')",
        throneroom: "url('/src/assets/background/throneroom.jpg')",
      },
      fontFamily: {
        play: ["Play", "sans-serif"],
      },
    },
  },
  plugins: [],
};
