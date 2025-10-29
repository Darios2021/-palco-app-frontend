// src/plugins/vuetify.js
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'   // 🔸 habilita iconos MDI

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'customDark',
    themes: {
      customDark: {
        dark: true,
        colors: {
          primary: '#0b0d28',     // 🔵 azul base (drawer y app-bar)
          secondary: '#ffd951',   // 🟡 amarillo detalles
          background: '#0b0d28',
          surface: '#0e1230',
          success: '#4caf50',
          warning: '#ffb300',
          error: '#ef5350',
          'on-primary': '#ffd951',
          'on-secondary': '#0b0d28',
          'on-surface': '#eaf0ff',
          'on-background': '#ffffff'
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi',        // Usa Material Design Icons
    aliases,
    sets: { mdi }
  },
  defaults: {
    VNavigationDrawer: { color: 'primary' },
    VAppBar: { color: 'primary', flat: true },
    VCard: { color: 'surface', rounded: 'xl', elevation: 2 }
  }
})
