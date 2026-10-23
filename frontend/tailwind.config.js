/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#501B24',
          dark: '#3D131B',
          deep: '#501B24',
          wine: '#651F2B',
          light: '#7A2B39',
        },
        blush: {
          DEFAULT: '#EAC4CF',
          dusty: '#EAC4CF',
          pale: '#F4DDE2',
          light: '#FAF0F2',
          accent: '#DFB0BD',
        },
        cream: {
          DEFAULT: '#F7EFE6',
          warm: '#F7EFE6',
          soft: '#FAF5EE',
          muted: '#EFE3D5',
        },
        beige: {
          DEFAULT: '#DCCBBC',
          soft: '#DCCBBC',
          border: '#D3BFAD',
          dark: '#BAA38E',
        },
        ink: {
          DEFAULT: '#24191A',
          nearBlack: '#24191A',
          muted: '#5A4647',
          faint: '#857172',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Oswald"', 'sans-serif'],
        headline: ['"Oswald"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        editorial: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'editorial': '0 4px 20px -2px rgba(80, 27, 36, 0.08)',
        'editorial-hover': '0 10px 25px -4px rgba(80, 27, 36, 0.14)',
        'editorial-dark': '0 12px 30px -4px rgba(36, 25, 26, 0.25)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest: '0.15em',
        ultra: '0.25em',
      }
    },
  },
  plugins: [],
}


