// src/stores/peopleStore.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const usePeopleStore = defineStore('people', {
  state: () => ({
    loading: false,
    list: [], // [{id,name,doc,org,cargo,seat,present,presentAt,...}]
    error: null,
  }),

  getters: {
    // por comodidad si algún componente usa "people"
    people: (state) => state.list,
  },

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/people')
        this.list = Array.isArray(res.data) ? res.data : []
        this.list = [...this.list]
      } catch (err) {
        console.error('fetchAll people error', err)
        this.error = err.message || 'Error cargando personas'
      } finally {
        this.loading = false
      }
    },

    async createPerson(payload) {
      try {
        const res = await api.post('/people', payload)
        const newPerson = res.data
        this.list.unshift(newPerson)
        this.list = [...this.list]
        return newPerson
      } catch (err) {
        console.error('createPerson error', err)
        this.error = err.message || 'No se pudo crear la persona'
        throw err
      }
    },

    async markPresent(id) {
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

    // alias por compatibilidad si algún componente llamaba checkInById
    async checkInById(id) {
      return this.markPresent(id)
    },

    async updatePerson(id, patch) {
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

    async removePerson(id) {
      try {
        await api.delete(`/people/${id}`)
        this.list = this.list.filter(p => p.id !== id)
        this.list = [...this.list]
      } catch (err) {
        console.error('removePerson error', err)
        throw err
      }
    },

    // alias "refresh" usado por varias vistas
    async refresh() {
      await this.fetchAll()
    },

    _merge(updated) {
      const idx = this.list.findIndex(p => p.id === updated.id)
      if (idx !== -1) this.list[idx] = { ...this.list[idx], ...updated }
      else this.list.unshift(updated)
      this.list = [...this.list]
    },
  },
})
