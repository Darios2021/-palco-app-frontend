// src/main.js

// === Cache-buster / actualización forzada del frontend ===
if (import.meta.env.PROD) {
  (async () => {
    try {
      const version = String(import.meta.env.VITE_APP_VERSION || Date.now())
      const stored = localStorage.getItem('app-version')
      const alreadyReloaded = sessionStorage.getItem('app-reloaded-on-version')

      // Si cambió la versión y aún no recargamos en esta sesión
      if (stored !== version && alreadyReloaded !== version) {
        console.log('[Frontend] Nueva versión detectada → limpiando caché y actualizando…')
        localStorage.setItem('app-version', version)
        sessionStorage.setItem('app-reloaded-on-version', version)

        // 1️⃣ Limpiar caches HTTP/Vite
        if ('caches' in window) {
          try {
            const keys = await caches.keys()
            await Promise.all(keys.map(k => caches.delete(k)))
          } catch (e) {
            console.warn('[Frontend] No se pudo limpiar caches:', e)
          }
        }

        // 2️⃣ Desregistrar Service Workers
        if ('serviceWorker' in navigator) {
          try {
            const regs = await navigator.serviceWorker.getRegistrations()
            await Promise.all(regs.map(r => r.unregister()))
          } catch (e) {
            console.warn('[Frontend] No se pudo desregistrar SW:', e)
          }
        }

        // 3️⃣ Recargar la aplicación
        window.location.reload()
      }
    } catch (err) {
      console.warn('[Frontend] Cache-buster falló (continuando app):', err)
    }
  })()
}

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { router } from './router'
import { vuetify } from './plugins/vuetify'

// 🟡 Iconos MDI
import '@mdi/font/css/materialdesignicons.css'

// 🎨 Estilos globales de contraste (cards, menús, tablas, etc.)
import './styles/app.css'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(vuetify)
  .mount('#app')
