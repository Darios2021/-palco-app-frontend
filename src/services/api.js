import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000
})

// (opcional) log para ver la URL efectiva en la consola del celu
console.log('[API BASE URL]', api.defaults.baseURL)

export default api
