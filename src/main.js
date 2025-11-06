// === Update Watcher ===
import { setupUpdateWatcher } from './utils/forceUpdate.js'

// === Vue App ===
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { router } from './router'
import { vuetify } from './plugins/vuetify'

// 🟡 Iconos MDI
import '@mdi/font/css/materialdesignicons.css'
// 🎨 Estilos globales de contraste (cards, menús, tablas, etc.)
import './styles/app.css'

// Arranca el watcher (no bloquea render y funciona en PROD)
if (import.meta.env.PROD) {
  setupUpdateWatcher();
}

createApp(App)
  .use(createPinia())
  .use(router)
  .use(vuetify)
  .mount('#app')
