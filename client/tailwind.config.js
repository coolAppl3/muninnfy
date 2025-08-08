/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,scss}'],
  theme: {
    extend: {
      colors: {
        dark: '#141510',
        primary: '#181B13',
        secondary: '#212518',
        title: '#EBEBEB',
        description: '#CBCBCD',
        cta: '#A1D321',
        'light-gray': 'rgba(200, 200, 200, 0.25)',
        overlay: 'rgba(30, 30, 30, 0.8)',
        danger: '#f87171',
        success: '#28a745',
        edit: '#0062CC',
      },

      borderWidth: {
        1: '1px',
        3: '3px',
      },

      boxShadow: {
        simple: '10px 10px 12px rgba(0, 0, 0, 0.15)',
      },

      animation: {
        pulse: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        spin: 'spin 350ms infinite linear forwards',
      },
    },

    screens: {
      xl: { max: '1200px' },
      lg: { max: '970px' },
      md: { max: '830px' },
      sm: { max: '650px' },
      xs: { max: '450px' },
      '2xs': { max: '390px' },
      '3xs': { max: '340px' },
    },

    fontFamily: {
      main: ['Work Sans', 'sans-serif'],
    },

    fontSize: {
      xs: '1.2rem',
      sm: '1.4rem',
      base: '1.6rem',
      md: '1.8rem',
      lg: '2rem',
      xl: '2.2rem',
      '2xl': '2.4rem',
      '3xl': '2.8rem',
      '4xl': '3rem',
    },

    spacing: {
      auto: 'auto',
      0: '0rem',
      1: '1rem',
      2: '2rem',
      3: '3rem',
      4: '4rem',
      5: '5rem',
      6: '6rem',
      7: '7rem',
      8: '8rem',
      9: '9rem',
      10: '10rem',
    },

    borderRadius: {
      DEFAULT: '3px',
      sm: '5px',
      md: '8px',
      lg: '10px',
      pill: '200px',
    },
  },
  plugins: [],
};
