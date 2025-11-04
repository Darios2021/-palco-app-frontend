// src/services/api.js
import axios from 'axios'

// Base URL (Vite): usar '/api' detrás del mismo dominio o URL completa al backend
const baseURL = import.meta.env.VITE_API_URL || '/api'

// En producción también necesitamos enviar credenciales (cookie 'rt') para /auth/refresh.
// Si tu frontend está en otro dominio, CORS del backend ya permite credentials.
const withCreds = true

const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: withCreds,
})

// Inyectar token (si lo hubiera) en el arranque
const bootToken = localStorage.getItem('accessToken')
if (bootToken) {
  api.defaults.headers.common.Authorization = `Bearer ${bootToken}`
}

console.log('[API BASE URL]', api.defaults.baseURL, 'withCredentials=', withCreds)

// Interceptor de respuesta: auto-refresh en 401 (una sola vez)
api.interceptors.response.use(
  r => r,
  async err => {
    const cfg = err?.config || {}
    const status = err?.response?.status

    if (status === 401 && !cfg.__isRetry) {
      try {
        cfg.__isRetry = true
        // Hacemos refresh con cookie rt (withCredentials=true)
        const { data } = await api.post('/auth/refresh')
        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken)
          api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
          cfg.headers = cfg.headers || {}
          cfg.headers.Authorization = `Bearer ${data.accessToken}`
          return api(cfg)
        }
      } catch {
        // limpiar token inválido
        localStorage.removeItem('accessToken')
        delete api.defaults.headers.common.Authorization
      }
    }

    // Log básico de error
    console.error('[API ERROR]', {
      url: (cfg.baseURL || '') + (cfg.url || ''),
      method: cfg.method,
      code: err.code,
      status,
      message: err.message,
    })
    return Promise.reject(err)
  }
)

export default api
