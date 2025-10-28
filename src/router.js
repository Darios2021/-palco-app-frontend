import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import CheckInView from './views/CheckInView.vue'
import SeatsView from './views/SeatsView.vue'
import PeopleView from './views/PeopleView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/checkin', name: 'checkin', component: CheckInView },
  { path: '/asientos', name: 'asientos', component: SeatsView },
  { path: '/personas', name: 'personas', component: PeopleView }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
