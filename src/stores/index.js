// src/stores/index.js
import { defineStore } from 'pinia'
import api from '../services/api' // axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api' })

const BC = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('palco-sync')
  : null

export const useSeatsStore = defineStore('seats', {
  state: () => ({
    loading: false,
    seats: [],                 // [['A1','A2',...], ['B1',...], ...]
    people: [],                // { id,name,doc,org,cargo,seat,present,presentAt }
    config: { rows: ['A','B','C','D'], cols: 10 },
    _loaded: false,
  }),

  getters: {
    seatStatus: (state) => (code) => {
      const p = state.people.find(p => p.seat === code)
      if (!p) return 'free'
      return p.present ? 'present' : 'assigned'
    },
    seatHolder: (state) => (code) =>
      state.people.find(p => p.seat === code) || null,
    presentList: (state) =>
      state.people.filter(p => p.present)
                  .sort((a,b)=> (a.presentAt||'').localeCompare(b.presentAt||'')),
  },

  actions: {
    _buildSeats(rows, cols) {
      this.seats = rows.map(r => Array.from({ length: cols }, (_, i) => `${r}${i+1}`))
    },

    async ensureLoaded() {
      if (this._loaded || this.loading) return
      this.loading = true
      try {
        // si tenés endpoint /config, podés traerlo acá
        this._buildSeats(this.config.rows, this.config.cols)
        const { data } = await api.get('/people')
        this.people = Array.isArray(data) ? data : []
        this._loaded = true
      } finally { this.loading = false }
    },

    async refresh() {
      const { data } = await api.get('/people')
      this.people = Array.isArray(data) ? data : []
    },

    // ------- CRUD -------
    async createPerson(payload) {
      // payload: {name, doc?, org?, cargo?, seat?}
      const { data } = await api.post('/people', payload)
      this.people.unshift(data)                 // reactivo
      this._notify()
      return data
    },

    async updatePerson(id, patch) {
      const { data } = await api.put(`/people/${id}`, patch)
      const idx = this.people.findIndex(p => p.id === id)
      if (idx !== -1) this.people[idx] = { ...data } // reemplazo in-place => reactivo
      this._notify()
      return data
    },

    async removePerson(id) {
      await api.delete(`/people/${id}`)
      this.people = this.people.filter(p => p.id !== id)
      this._notify()
    },

    // ------- Check-in -------
    async checkInById(id) {
      const { data } = await api.post(`/people/${id}/checkin`)
      const idx = this.people.findIndex(p => p.id === id)
      if (idx !== -1) this.people[idx] = { ...data }
      this._notify()
      return data
    },

    async checkInByName(name) {
      const { data } = await api.post('/people/checkin/by-name', { name })
      const idx = this.people.findIndex(p => p.id === data.id)
      if (idx !== -1) this.people[idx] = { ...data }
      else this.people.unshift(data)
      this._notify()
      return data
    },

    // ------- Utilidades -------
    findSeatByName(name) {
      const q = String(name||'').trim().toLowerCase()
      const p = this.people.find(x => x.name.toLowerCase() === q)
      return p?.seat || null
    },

    // Broadcast a otras pestañas y a otros componentes
    _notify() {
      // fuerza notificación de cambio (por si algún watcher espera referencia)
      this.people = [...this.people]
      if (BC) BC.postMessage({ type: 'people.changed' })
    },

    // Polling opcional para multi-operador (desactivar si usás sockets)
    autoRefresh(intervalMs = 8000) {
      let t = setInterval(async () => {
        try { await this.refresh() } catch { /* noop */ }
      }, intervalMs)
      return () => clearInterval(t)
    },
  }
})

// escuchar broadcast para sincronizar en vivo entre pestañas
if (BC) {
  BC.onmessage = (e) => {
    if (e?.data?.type === 'people.changed') {
      const store = useSeatsStore()
      store.refresh().catch(()=>{})
    }
  }
}
