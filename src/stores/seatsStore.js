// src/stores/seatsStore.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useSeatsStore = defineStore('seats', {
  state: () => ({
    loadingPalcos: false,
    loadingMapa: false,
    palcos: [],        // [{id, name}]
    currentPalcoId: 1, // por defecto mostramos PALCO PRINCIPAL
    mapa: null,        // { palcoId, name, rows, cols, seats[][], status{code: 'present'|'assigned'} }
    error: null,
  }),

  getters: {
    seatsFlat(state) {
      if (!state.mapa || !state.mapa.seats) return []
      // convertimos la matriz seats[][] en array [{code,status,rowIndex,colIndex}]
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
        this.error = err.message || 'No se pudieron cargar los palcos'
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
        this.mapa = res.data
        this.currentPalcoId = id
      } catch (err) {
        console.error('fetchMapa error', err)
        this.error = err.message || 'No se pudo cargar el mapa'
      } finally {
        this.loadingMapa = false
      }
    },

    setCurrentPalco(id) {
      this.currentPalcoId = id
    },
  },
})
