import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],

  // ---- DEV SERVER ----
  server: {
    host: true,                 // expone en LAN
    port: 5173,
    strictPort: true,
    hmr: { host: '192.168.2.101', clientPort: 5173 }, // tu IP LAN
    proxy: {
      '/api': {
        target: 'http://192.168.2.101:3001',  // 🔌 backend dev
        changeOrigin: true,
        // Si tu backend sirve /api en la raíz, sin prefijo, usa:
        // rewrite: path => path.replace(/^\/api/, '')
      }
    },
    // Opcional: dev sin cache (útil cuando iterás fuerte en CSS/JS)
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },

  // ---- BUILD (cache-busting por nombre de archivo) ----
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})
