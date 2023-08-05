/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      primary: '"Exo 2"'
    },
    container: {
      padding: {
        DEFAULT: '15px'
      }
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '960px',
      xl: '1440px'
    },
    extend: { 
      colors: {
        body: '#1D1F23',
        primary: '#151618',
        accent: {
          DEFAULT: '#F6CD46',
          hover: '#E1B72E'
        }
      },
      backgroundImage: {
        mainSlider: "url('assets/images/mainSlider_bg.png')"
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0,0 )' },
          '20%, 80%': { transform: 'translate3d(2px, 0,0 )' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0,0 )' },
          '40%, 60%': { transform: 'translate3d(4px, 0,0 )' },
        },
      },
      animation: {
        shake: 'shake 1s ease-in-out',
      },
    //extend: {
    //   screens: {
    //     'small': { 'max': '767px' },
    //     // => @media (min-width: 640px and max-width: 767px) { ... }

    //     'medium': { 'min': '768px', 'max': '1023px' },
    //     // => @media (min-width: 768px and max-width: 1023px) { ... }

    //     'large': { 'min': '1024px', 'max': '1279px' },
    //     // => @media (min-width: 1024px and max-width: 1279px) { ... }

    //     'xlarge': { 'min': '1280px', 'max': '1536px' },
    //     '2xlarge': { 'min': '1537px' }

    //   },
    //   colors: {
    //     sidebar: '#111418',
    //     sidebarLink: '#fff',
    //     lightGray: '#dee3e4'

    //   },
    //   fontFamily: {
    //     'roboto': ['Roboto', 'san-serif'],
    //     'poppins': ['Poppins', 'san-serif']
    //   },
    //   padding: {
    //     '4.5rem': '4.5rem'
    //   },
    //   maxWidth: {
    //     '1/2': '1320px',
    //   },
    //   fontSize: {
    //     'sectionBackgroundText': '8.25rem'
    //   },
    //   minWidth: {
    //     '1/2': '110px',
    //   }
    }
  },
  plugins: ['@tailwindcss/forms'],
}

