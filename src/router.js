// src/router.js
import { createRouter, createWebHistory } from 'vue-router'

// ====== Vistas principales ======
import HomeView from './views/HomeView.vue'
import CheckInView from './views/CheckInView.vue'
import SeatsView from './views/SeatsView.vue'
import PeopleView from './views/PeopleView.vue'

// ====== Nueva vista de administración ======
import AdminPalcos from './views/AdminPalcos.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/checkin', name: 'checkin', component: CheckInView },
  { path: '/asientos', name: 'asientos', component: SeatsView },
  { path: '/personas', name: 'personas', component: PeopleView },

  // 🟡 NUEVA RUTA: Administración de palcos / asientos
  { path: '/admin-palcos', name: 'admin-palcos', component: AdminPalcos },
]

export const router = createRouter({
  // 🟢 Esto es clave: asegura rutas correctas al servir desde dominio o subruta
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
