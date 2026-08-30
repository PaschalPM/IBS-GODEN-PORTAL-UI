/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // IBS Golden Brand Theme
        ibs: {
          gold: '#E09900',
          'gold-dark': '#D99A00',
          'gold-light': '#F5B027',
          bg: '#0E0E0F',
          charcoal: '#1F242A',
          'charcoal-light': '#2A313A',
          black: '#070808',
          text: '#F9F8F7',
          subtext: '#D9D9D9',
          muted: '#6B6B6B',
          border: '#2E353E',
        },
        // Dedukt Service Theme
        dedukt: {
          primary: '#00498B',      // Deep Blue
          navy: '#081A4D',         // Dark Navy
          slate: '#354778',        // Secondary Blue
          teal: '#008E97',         // Primary Teal
          'teal-hover': '#007A82',
          'teal-light': '#E6F4F5', // Very Light Teal
          'blue-pale': '#F0F9FF',  // Pale Blue
          'blue-sky': '#0BA5EC',   // Sky Blue / Focus Border
          border: '#C4C9D7',       // Light Gray Border
          'border-light': '#E4E7EC',
          icon: '#717680',         // Gray Icon
          white: '#FFFFFF',
          green: '#12B76A',        // Success Green
          'bg-gray': '#F8FAFC',
          text: '#101828',
          subtext: '#475467',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'dedukt-card': '0 1px 3px 0 rgba(16, 24, 40, 0.1), 0 1px 2px -1px rgba(16, 24, 40, 0.1)',
        'dedukt-dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'ibs-gold-glow': '0 0 20px rgba(224, 153, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
