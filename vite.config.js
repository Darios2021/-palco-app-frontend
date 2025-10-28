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
        target: 'http://192.168.2.101:3001', // backend
        changeOrigin: true,
        // si tu backend ya sirve /api, NO reescribas
        // si sirviera en raíz, usar: rewrite: p => p.replace(/^\/api/, '')
      }
    }
  }
})
