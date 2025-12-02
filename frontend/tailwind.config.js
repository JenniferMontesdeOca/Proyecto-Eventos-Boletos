export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#003f88',      // azul tipo Ticketasa
        primaryLight: '#0059c0',
        accent: '#ffb703',       // amarillo para botones
        dark: '#0b1220'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15,23,42,0.12)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem'
      }
    }
  },
  plugins: []
}
