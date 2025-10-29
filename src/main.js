// === Cache-buster / actualización forzada del frontend ===
if (import.meta.env.PROD) {
  const version = import.meta.env.VITE_APP_VERSION || Date.now()
  const stored = localStorage.getItem('app-version')

  // 🔁 Si cambió la versión, limpia caché y recarga
  if (stored !== String(version)) {
    console.log('[Frontend] Nueva versión detectada → forzando actualización')
    localStorage.setItem('app-version', String(version))

    // Limpia cachés de service workers / Vite
    if ('caches' in window) {
      caches.keys().then(keys => {
        for (const key of keys) caches.delete(key)
      })
    }

    // Limpia Service Worker si existiera
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(r => r.unregister())
      })
    }

    // Recarga total
    window.location.reload(true)
  }
}

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { router } from './router'
import { vuetify } from './plugins/vuetify'

// 🟡 Importar la fuente de iconos MDI (necesario para ver íconos y hamburguesa)
import '@mdi/font/css/materialdesignicons.css'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(vuetify)
  .mount('#app')