// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],

  // 👇 Alias para usar "@/..." en imports
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: { host: '192.168.2.100', clientPort: 5173 },

    // Proxy DEV -> backend PROD
    proxy: {
      '/api': {
        target: 'https://palco-app-backend.cingulado.org',
        changeOrigin: true,
        secure: true,
        // 🔑 Esto permite que el navegador acepte la cookie `rt` en localhost
        cookieDomainRewrite: '', // quita "Domain=..." => cookie host-only (localhost)
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
