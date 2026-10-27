/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        google: ['"Google Sans"', '"Plus Jakarta Sans"', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
      colors: {
        google: {
          blue: {
            DEFAULT: '#1a73e8',
            hover: '#1765cc',
            subtle: '#e8f0fe',
            dark: '#8ab4f8',
            darkBg: 'rgba(138, 180, 248, 0.12)',
          },
          red: {
            DEFAULT: '#ea4335',
            hover: '#d93025',
            subtle: '#fce8e6',
            dark: '#f28b82',
            darkBg: 'rgba(242, 139, 130, 0.12)',
          },
          yellow: {
            DEFAULT: '#f9ab00',
            hover: '#e37400',
            subtle: '#fef7e0',
            dark: '#fdd663',
            darkBg: 'rgba(253, 214, 99, 0.12)',
          },
          green: {
            DEFAULT: '#1e8e3e',
            hover: '#188038',
            subtle: '#e6f4ea',
            dark: '#81c995',
            darkBg: 'rgba(129, 201, 149, 0.12)',
          },
          grey: {
            50: '#f8f9fa',
            100: '#f1f3f4',
            200: '#e8eaed',
            300: '#dadce0',
            400: '#bdc1c6',
            500: '#9aa0a6',
            600: '#80868b',
            700: '#5f6368',
            800: '#3c4043',
            900: '#202124',
          },
        },
      },
    },
  },
  plugins: [],
};

