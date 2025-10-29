<!-- App.vue -->
<template>
  <v-app>
    <!-- ========= NAV DRAWER ========= -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="isDesktop"
      :temporary="!isDesktop"
      color="primary-darken-1"
      class="text-white"
      width="260"
    >
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
        />
      </v-list>
    </v-navigation-drawer>

    <!-- ========= APP BAR ========= -->
    <v-app-bar color="primary" density="comfortable">
      <!-- En mobile: botón para abrir/cerrar el drawer -->
      <v-app-bar-nav-icon class="mr-1" @click="drawer = !drawer" />

      <v-toolbar-title class="font-weight-600">Control PFA</v-toolbar-title>

      <v-spacer />

      <!-- En desktop: acciones como botones planos -->
      <template v-if="isDesktop">
        <v-btn
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          variant="text"
          class="mx-1 text-white text-uppercase"
          :class="{ 'btn-active': isActive(item.to) }"
        >
          {{ item.text }}
        </v-btn>
      </template>
    </v-app-bar>

    <!-- ========= MAIN ========= -->
    <v-main class="bg-surface">
      <router-view />
    </v-main>

    <!-- ========= FOOTER ========= -->
    <v-footer app color="primary" class="justify-center text-white">
      <small>© {{ year }} · Sistema de Control de Asistencia</small>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from './stores'

/* -------- Navegación -------- */
const items = [
  { text: 'Inicio',    to: '/',          icon: 'mdi-home-outline' },
  { text: 'Check-In',  to: '/checkin',   icon: 'mdi-qrcode-scan' },
  { text: 'Mapa',      to: '/asientos',  icon: 'mdi-seat' },
  { text: 'Personas',  to: '/personas',  icon: 'mdi-account-group-outline' },
]

const route = useRoute()
const isActive = (to) => {
  // activo si coincide exactamente o es prefijo (para subrutas)
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

/* -------- Drawer responsivo -------- */
const { mdAndUp } = useDisplay()
const isDesktop = computed(() => mdAndUp.value)
const drawer = ref(false)

// Auto: en desktop lo mantenemos abierto en rail, en mobile lo cerramos
watch(isDesktop, (v) => {
  drawer.value = v ? true : false
})

/* -------- Store / autoRefresh -------- */
const store = useSeatsStore()
let stop
onMounted(async () => {
  drawer.value = isDesktop.value
  await store.ensureLoaded()
  stop = store.autoRefresh(5000)
})
onBeforeUnmount(() => stop?.())

/* -------- Util -------- */
const year = new Date().getFullYear()
</script>

<style scoped>
.bg-surface {
  background-color: #f6f7fb;
  min-height: 100vh;
}

/* Estado activo en botones del App Bar */
.btn-active {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: saturate(180%) blur(2px);
  border-radius: 8px;
}

/* Estado activo en ítems del Drawer */
.drawer-active {
  --v-theme-overlay-multiplier: 0; /* evita overlays fuertes */
  background: rgba(255, 255, 255, 0.12) !important;
  border-radius: 10px;
}

/* Tipografía del título un pelín más marcada */
.v-toolbar-title {
  letter-spacing: .3px;
}
</style>
