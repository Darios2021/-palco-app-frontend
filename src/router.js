import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/stores/auth'

// Vistas
import HomeView from './views/HomeView.vue'
import CheckInView from './views/CheckInView.vue'
import SeatsView from './views/SeatsView.vue'
import PeopleView from './views/PeopleView.vue'
import AdminPalcos from './views/AdminPalcos.vue'
import LoginView from './views/LoginView.vue'
import ImportInvitados from './views/ImportInvitados.vue' // 👈 NUEVO

const routes = [
  { path: '/login', name: 'login', component: LoginView },

  { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/checkin', name: 'checkin', component: CheckInView, meta: { requiresAuth: true } },
  { path: '/asientos', name: 'asientos', component: SeatsView, meta: { requiresAuth: true } },
  { path: '/personas', name: 'personas', component: PeopleView, meta: { requiresAuth: true } },
  { path: '/admin-palcos', name: 'admin-palcos', component: AdminPalcos, meta: { requiresAuth: true } },

  // 👇 NUEVA RUTA PARA IMPORTAR INVITADOS
  { path: '/import-invitados', name: 'import-invitados', component: ImportInvitados, meta: { requiresAuth: true } },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Guardia global
router.beforeEach(async (to) => {
  const auth = useAuth()
  // Si ya tengo token pero no user, intento /me una vez
  if (auth.accessToken && !auth.user) {
    try { await auth.fetchMe() } catch {}
  }

  if (to.meta.requiresAuth && !auth.isAuth) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && auth.isAuth) {
    return { path: '/' }
  }
})
