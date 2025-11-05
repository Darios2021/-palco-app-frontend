// src/stores/seatsStore.js
import { defineStore } from 'pinia'
import api from '@/services/api'
import { usePeopleStore } from '@/stores/peopleStore'

export const useSeatsStore = defineStore('seats', {
  state: () => ({
    loadingPalcos: false,
    loadingMapa: false,
    palcos: [],        // [{id, name}]
    currentPalcoId: 1, // Palco por defecto
    mapa: null,        // { palcoId, name, rows, cols, seats[][], status: { [code]: 'free'|'assigned'|'present' } }
    error: null,

    _wired: false,     // para no duplicar suscripciones
  }),

  getters: {
    seatsFlat(state) {
      if (!state.mapa?.seats) return []
      const out = []
      const statusMap = state.mapa.status || {}
      state.mapa.seats.forEach((fila, rIdx) => {
        fila.forEach((code, cIdx) => {
          out.push({
            code,
            status: statusMap[code] || 'free',
            rIdx,
            cIdx,
          })
        })
      })
      return out
    },
  },

  actions: {
    /* ===== Sincronía con peopleStore ===== */
    _ensureWired() {
      if (this._wired) return
      const people = usePeopleStore()

      // 1) Sync inicial (si ya hay gente cargada)
      this._rebuildStatusFromPeople(people.list)

      // 2) Cualquier cambio en people.list vuelve a armar el status del mapa
      people.$subscribe((_mutation, state) => {
        this._rebuildStatusFromPeople(state.list)
      }, { detached: true })

      // 3) También podemos reaccionar a acciones específicas (opcional)
      people.$onAction(({ name, after }) => {
        const touchNames = new Set(['fetchAll','createPerson','updatePerson','checkIn','assignSeat'])
        if (touchNames.has(name)) {
          after(() => {
            this._rebuildStatusFromPeople(people.list)
          })
        }
      })

      this._wired = true
    },

    _rebuildStatusFromPeople(list) {
      if (!this.mapa) return
      const newStatus = {}
      for (const p of list || []) {
        if (!p?.seat) continue
        // si está presente → 'present', si tiene asiento pero no presente → 'assigned'
        newStatus[p.seat] = p.present ? 'present' : 'assigned'
      }
      // reemplazo inmutable para disparar reactividad
      this.mapa = { ...this.mapa, status: newStatus }
    },

    /* ===== Data remota ===== */
    async fetchPalcos() {
      this.loadingPalcos = true
      this.error = null
      try {
        const res = await api.get('/palcos')
        this.palcos = res.data || []
        if (!this.currentPalcoId && this.palcos.length) {
          this.currentPalcoId = this.palcos[0].id
        }
      } catch (err) {
        console.error('fetchPalcos error', err)
        this.error = err?.message || 'No se pudieron cargar los palcos'
      } finally {
        this.loadingPalcos = false
      }
    },

    async fetchMapa(palcoId = null) {
      this.loadingMapa = true
      this.error = null
      try {
        const id = palcoId || this.currentPalcoId || 1
        const res = await api.get(`/palcos/${id}/seats`)
        // backend debería devolver: { palcoId,name,rows,cols,seats,status? }
        // si no trae status, lo generamos desde peopleStore:
        const baseMapa = res.data || null
        this.mapa = baseMapa
        this.currentPalcoId = id

        // conectar y sincronizar con people
        this._ensureWired()
        this._rebuildStatusFromPeople(usePeopleStore().list)
      } catch (err) {
        console.error('fetchMapa error', err)
        this.error = err?.message || 'No se pudo cargar el mapa'
      } finally {
        this.loadingMapa = false
      }
    },

    setCurrentPalco(id) {
      this.currentPalcoId = id
      return this.fetchMapa(id)
    },
  },
})
