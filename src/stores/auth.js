// src/stores/auth.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuth = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    user: null,
    loading: false,
  }),

  getters: {
    isAuth: (s) => !!s.accessToken && !!s.user,
  },

  actions: {
    setToken(token) {
      this.accessToken = token || null
      if (token) localStorage.setItem('accessToken', token)
      else localStorage.removeItem('accessToken')

      if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
      else delete api.defaults.headers.common.Authorization
    },

    async login(email, password) {
      this.loading = true
      try {
        const { data } = await api.post('/auth/login', { email, password })
        if (!data?.accessToken) throw new Error('Sin accessToken')
        this.setToken(data.accessToken)
        this.user = data.user || null
        if (!this.user) await this.fetchMe()
        return true
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      if (!this.accessToken) return false
      const { data } = await api.get('/auth/me')
      this.user = data
      return true
    },

    async refresh() {
      const { data } = await api.post('/auth/refresh', null, { withCredentials: true })
      if (data?.accessToken) {
        this.setToken(data.accessToken)
        this.user = data.user || this.user
        if (!this.user) await this.fetchMe()
        return true
      }
      return false
    },

    async ensure() {
      if (this.user && this.accessToken) return true
      if (this.accessToken) { try { await this.fetchMe(); return true } catch {} }
      try { return await this.refresh() } catch { return false }
    },

    async logout() {
      try { await api.post('/auth/logout', null, { withCredentials: true }) } catch {}
      this.user = null
      this.setToken(null)
    },
  },
})
