// src/services/api.js
import axios from 'axios'

// Lee variable de entorno de Vite
const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: false, // cambia a true si usás cookies/sesión
})

// Log de diagnóstico (verás la URL efectiva en consola)
console.log('[API BASE URL]', api.defaults.baseURL)

// Interceptor opcional de errores (útil para debugging)
api.interceptors.response.use(
  r => r,
  err => {
    const cfg = err?.config || {}
    console.error('[API ERROR]', {
      url: (cfg.baseURL || '') + (cfg.url || ''),
      method: cfg.method,
      code: err.code,
      status: err.response?.status,
      message: err.message,
    })
    return Promise.reject(err)
  }
)

export default api
