// src/stores/peopleStore.js
import { defineStore } from 'pinia'
import api from '@/services/api' // asumo que ya tenés un axios con baseURL

export const usePeopleStore = defineStore('people', {
  state: () => ({
    loading: false,
    list: [], // [{id,name,doc,org,cargo,seat,present,presentAt,...}]
    error: null,
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/people')
        this.list = res.data || []
      } catch (err) {
        console.error('fetchAll people error', err)
        this.error = err.message || 'Error cargando personas'
      } finally {
        this.loading = false
      }
    },

    async createPerson(payload) {
      // payload esperado: { name, doc, org, cargo, seat }
      this.error = null
      try {
        const res = await api.post('/people', payload)
        const newPerson = res.data
        // metemos la nueva persona arriba de la lista
        this.list.unshift(newPerson)
        return newPerson
      } catch (err) {
        console.error('createPerson error', err)
        this.error = err.message || 'No se pudo crear la persona'
        throw err
      }
    },

    async markPresent(id) {
      // POST /people/:id/checkin
      try {
        const res = await api.post(`/people/${id}/checkin`)
        const updated = res.data
        this._merge(updated)
        return updated
      } catch (err) {
        console.error('markPresent error', err)
        throw err
      }
    },

    async updatePerson(id, patch) {
      // PUT /people/:id  (puede venir { present:false } o { seat:null } etc)
      try {
        const res = await api.put(`/people/${id}`, patch)
        const updated = res.data
        this._merge(updated)
        return updated
      } catch (err) {
        console.error('updatePerson error', err)
        throw err
      }
    },

    _merge(updated) {
      const idx = this.list.findIndex(p => p.id === updated.id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...updated }
      } else {
        // si no estaba lo agrego
        this.list.unshift(updated)
      }
    },
  },
})
