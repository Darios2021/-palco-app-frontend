// Estilos base de Vuetify
import 'vuetify/styles'
// Iconos MDI (opcional, pero útil)
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#0a456b',
          secondary: '#d7db45',
          surface: '#ffffff'
        }
      }
    }
  }
})
