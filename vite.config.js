// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: { host: '192.168.2.101', clientPort: 5173 },
    proxy: {
      '/api': {
        target: 'https://palco-app-backend.cingulado.org',
        changeOrigin: true,
        secure: true, // si hubiera problemas de cert, probar false temporalmente
        // rewrite: p => p, // (no tocar path)
      },
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  },
})
