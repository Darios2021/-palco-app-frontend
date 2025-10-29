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

    // 🔁 Proxy útil solo si usás VITE_API_URL=/api en dev
    proxy: {
      '/api': {
        target: 'https://palco-app-backend.cingulado.org',
        changeOrigin: true,
        secure: true, // Si falla por SSL, probar secure: false temporalmente
        // rewrite: p => p, // Mantiene el prefijo /api
      },
    },

    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  },

  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
})
