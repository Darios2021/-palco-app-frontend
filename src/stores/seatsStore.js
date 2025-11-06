// src/stores/seatsStore.js
import { defineStore } from 'pinia'
import api from '@/services/api'
import { usePeopleStore } from '@/stores/peopleStore'

export const useSeatsStore = defineStore('seats', {
  state: () => ({
    loadingPalcos: false,
    loadingMapa: false,
    palcos: [],            // [{id, name}]
    currentPalcoId: 1,     // Palco por defecto
    mapa: null,            // { palcoId, name, rows, cols, seats[][], status? }
    statusAll: {},         // { [seatCode]: 'free'|'assigned'|'present' } (GLOBAL)
    error: null,

    _wired: false,         // evita duplicar suscripciones
    _loadedOnce: false,
  }),

  getters: {
    seatsFlat(state) {
      if (!state.mapa?.seats) return []
      const out = []
      const statusMap = state.mapa.status || {}
      state.mapa.seats.forEach((fila, rIdx) => {
        fila.forEach((code, cIdx) => {
          out.push({ code, status: statusMap[code] || 'free', rIdx, cIdx })
        })
      })
      return out
    },

    // Estado por asiento – usa el mapa GLOBAL para todos los palcos
    seatStatus: (state) => (code) => state.statusAll?.[code] || 'free',

    // Holder por asiento – consulta directo al peopleStore
    seatHolder: () => (code) => {
      const people = usePeopleStore()
      return (people.list || []).find(
        p => (p.seat ?? p.seatCode ?? p.seat_code) === code
      ) || null
    },

    // Compat: lista de personas desde seatsStore
    peopleList() {
      const people = usePeopleStore()
      return people.list || []
    },

    statusOf() {
      return (code) => this.seatStatus(code)
    },
  },

  actions: {
    /* ===== Puente de reactividad con peopleStore ===== */
    _ensureWired() {
      if (this._wired) return
      const people = usePeopleStore()

      // 1) Sync inicial
      this._rebuildStatusFromPeople(people.list)

      // 2) Cualquier cambio en people.list (cambios profundos incluidos)
      people.$subscribe((_mutation, state) => {
        this._rebuildStatusFromPeople(state.list)
      }, { detached: true })

      // 3) Reaccionar a acciones típicas que tocan presencia/asientos
      const touchNames = new Set([
        'fetchAll',
        'createPerson',
        'updatePerson',
        'markPresent',   // 👈 importante para CheckIn
        'checkIn',       // por si existe con ese nombre en algún flujo
        'setPresent',
        'assignSeat',
        'unassignSeat',
        'bulkCheckIn',
      ])
      people.$onAction(({ name, after }) => {
        if (!touchNames.has(name)) return
        after(() => this._rebuildStatusFromPeople(people.list))
      })

      this._wired = true
    },

    /* ===== Carga/boot público y único ===== */
    async ensureLoaded() {
      this._ensureWired()

      if (!this.palcos.length) {
        await this.fetchPalcos().catch(() => {})
      }
      if (!this.mapa) {
        await this.fetchMapa(this.currentPalcoId).catch(() => {})
      } else {
        // reflejar el global actual en el mapa local
        this._rebuildStatusFromPeople(usePeopleStore().list)
      }

      this._loadedOnce = true
    },

    _rebuildStatusFromPeople(list) {
      // Construir mapa GLOBAL: asiento -> estado
      const nextAll = {}
      for (const p of list || []) {
        const code = p?.seat ?? p?.seatCode ?? p?.seat_code
        if (!code) continue
        nextAll[code] = p.present ? 'present' : 'assigned'
      }

      // Reemplazo inmutable para disparar reactividad
      this.statusAll = { ...nextAll }

      // Reflejar subset en mapa.status (útil en SeatPickerDialog)
      if (this.mapa?.seats) {
        const local = {}
        this.mapa.seats.flat().forEach(code => {
          local[code] = nextAll[code] || 'free'
        })
        this.mapa = { ...this.mapa, status: local }
      }
    },

    /* ===== Data remota ===== */
    async fetchPalcos() {
      this.loadingPalcos = true
      this.error = null
      try {
        const { data } = await api.get('/palcos')
        this.palcos = data || []
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
        const { data } = await api.get(`/palcos/${id}/seats`)
        this.mapa = data || null
        this.currentPalcoId = id

        // asegurar puente y refrescar status local/global
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
