<!-- src/App.vue -->
<template>
  <v-app>
    <!-- ======== CON SESIÓN ======== -->
    <template v-if="auth.isAuth">
      <!-- Drawer anclado al layout -->
      <v-navigation-drawer
        app
        v-model="drawer"
        :permanent="isDesktop"
        :rail="isDesktop"
        rail-width="64"
        :temporary="!isDesktop"
        color="primary"
        class="nav text-yellow"
        width="260"
      >
        <!-- Header usuario (visible en mobile y también si no está en rail) -->
        <div class="px-3 pt-3 pb-1" v-if="!isDesktop">
          <v-card class="user-card" rounded="lg" variant="tonal">
            <v-card-text class="py-3 px-3 d-flex align-center gap-3">
              <v-avatar color="#ffd951" size="36">
                <v-icon color="#0b0d28">mdi-account</v-icon>
              </v-avatar>
              <div class="min-w-0">
                <div class="user-name text-truncate">{{ auth.user?.name || 'Usuario' }}</div>
                <div class="user-mail text-truncate">{{ auth.user?.email }}</div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <v-list density="compact" nav>
          <v-list-item
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.text"
            :active="isActive(item.to)"
            active-class="drawer-active"
            link
            @click="onNavClick"
          />
        </v-list>

        <!-- Salir en mobile -->
        <div v-if="!isDesktop" class="mt-auto px-3 pb-3 pt-1">
          <v-btn block variant="tonal" color="yellow-darken-2" @click="logoutAndGo">
            <v-icon start>mdi-logout</v-icon> Cerrar sesión
          </v-btn>
        </div>
      </v-navigation-drawer>

      <!-- App bar anclado al layout -->
      <v-app-bar app color="primary" density="comfortable" class="appbar text-yellow">
        <!-- Nav icon solo en mobile -->
        <v-app-bar-nav-icon v-if="!isDesktop" class="mr-1" @click="drawer = !drawer" />
        <v-toolbar-title class="font-weight-600">Control PFA</v-toolbar-title>
        <v-spacer />

        <!-- Botones + menú usuario en desktop -->
        <template v-if="isDesktop">
          <div class="d-flex align-center gap-1">
            <v-btn
              v-for="item in items"
              :key="item.to"
              :to="item.to"
              variant="text"
              class="mx-1 text-yellow text-uppercase"
              :class="{ 'btn-active': isActive(item.to) }"
            >
              {{ item.text }}
            </v-btn>

            <v-menu location="bottom end">
              <template #activator="{ props }">
                <v-chip
                  v-bind="props"
                  class="ml-3 user-chip"
                  variant="elevated"
                  size="large"
                  color="yellow-darken-2"
                >
                  <v-avatar start size="20"><v-icon color="#0b0d28">mdi-account</v-icon></v-avatar>
                  <span class="chip-text">{{ auth.user?.name || 'Usuario' }}</span>
                </v-chip>
              </template>
              <v-list density="compact" min-width="240">
                <v-list-item :title="auth.user?.email" prepend-icon="mdi-email-outline" />
                <v-divider class="my-1" />
                <v-list-item title="Cerrar sesión" prepend-icon="mdi-logout" @click="logoutAndGo" />
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-app-bar>

      <v-main class="bg-surface">
        <router-view />
      </v-main>

      <v-footer app color="primary" class="justify-center text-yellow">
        <small>© {{ year }} · Sistema de Control de Asistencia</small>
      </v-footer>
    </template>

    <!-- ======== SIN SESIÓN (login) ======== -->
    <template v-else>
      <router-view />
    </template>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '@/stores'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

/* Menú */
const items = [
  { text: 'Inicio',        to: '/',             icon: 'mdi-home-outline' },
  { text: 'Check-In',      to: '/checkin',      icon: 'mdi-qrcode-scan' },
  { text: 'Mapa',          to: '/asientos',     icon: 'mdi-seat' },
  { text: 'Personas',      to: '/personas',     icon: 'mdi-account-group-outline' },
  { text: 'Admin Palcos',  to: '/admin-palcos', icon: 'mdi-cog-outline' },
]
const isActive = (to) => (to === '/' ? route.path === '/' : route.path.startsWith(to))

/* Drawer responsivo */
const { mdAndUp } = useDisplay()
const isDesktop = computed(() => mdAndUp.value)
const drawer = ref(false)
const onNavClick = () => { if (!isDesktop.value) drawer.value = false }

/* Datos de asientos solo si hay sesión */
const store = useSeatsStore()
let stop
onMounted(async () => {
  drawer.value = isDesktop.value
  if (auth.isAuth) {
    await store.ensureLoaded()
    stop = store.autoRefresh(5000)
  }
})
onBeforeUnmount(() => stop?.())

async function logoutAndGo () {
  await auth.logout()
  router.replace({ name: 'login' })
}

const year = new Date().getFullYear()
</script>

<style scoped>
/* Drawer */
.nav { border-right: 1px solid rgba(255, 217, 81, 0.18); }

/* Usuario */
.user-card { background: rgba(255,217,81,.08) !important; border: 1px solid rgba(255,217,81,.15); }
.user-name { font-weight: 700; color: #ffd951; line-height: 1.1; }
.user-mail { font-size: .85rem; opacity: .8; color: rgba(255,255,255,.85); }

/* Activo */
.drawer-active,
.nav :deep(.v-list-item--active){
  background:#ffd951 !important; color:#0b0d28 !important; border-radius:12px;
  --v-theme-overlay-multiplier:0; --v-activated-opacity:1;
}
.nav :deep(.v-list-item--active .v-icon),
.nav :deep(.v-list-item--active .v-list-item-title){ color:#0b0d28 !important; }

/* Hover */
.nav :deep(.v-list-item:hover){ background:rgba(255,217,81,.16)!important; border-radius:12px; }

/* Chip usuario AppBar */
.user-chip { color:#0b0d28 !important; font-weight:600; }
.chip-text { max-width: 180px; display:inline-block; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }
</style>
