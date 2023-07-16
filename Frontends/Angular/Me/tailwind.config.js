/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
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

