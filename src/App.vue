<!-- App.vue -->
<template>
  <v-app>
    <!-- ========= NAV DRAWER ========= -->
    <!-- Drawer y AppBar usan el mismo color primary (#0b0d28) -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="isDesktop"
      :temporary="!isDesktop"
      color="primary"
      class="nav text-yellow"
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
    <v-app-bar color="primary" density="comfortable" class="appbar text-yellow">
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
          class="mx-1 text-yellow text-uppercase"
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
    <v-footer app color="primary" class="justify-center text-yellow">
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
/*  Agregamos "Admin Palcos" -> ruta de administración de asientos.
    Ajustá el `to` si en tu router está registrado con otro path.
*/
const items = [
  { text: 'Inicio',        to: '/',               icon: 'mdi-home-outline' },
  { text: 'Check-In',      to: '/checkin',        icon: 'mdi-qrcode-scan' },
  { text: 'Mapa',          to: '/asientos',       icon: 'mdi-seat' },
  { text: 'Personas',      to: '/personas',       icon: 'mdi-account-group-outline' },
  { text: 'Admin Palcos',  to: '/admin-palcos',   icon: 'mdi-cog-outline' },
]

const route = useRoute()
const isActive = (to) =>
  (to === '/' ? route.path === '/' : route.path.startsWith(to))

/* -------- Drawer responsivo -------- */
const { mdAndUp } = useDisplay()
const isDesktop = computed(() => mdAndUp.value)
const drawer = ref(false)

watch(isDesktop, (v) => {
  drawer.value = v
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
/* ===== Drawer: activo y hover bien legibles ===== */
.nav {
  border-right: 1px solid rgba(255, 217, 81, 0.18);
}

/* Iconos y títulos por defecto en amarillo */
.nav :deep(.v-icon),
.nav :deep(.v-list-item-title) {
  color: #ffd951 !important;
  opacity: 1 !important;
}

/* Clase de activo que ya usás: active-class="drawer-active" */
.drawer-active,
.nav :deep(.v-list-item--active) {
  background: #ffd951 !important;     /* 🟡 amarillo sólido */
  color: #0b0d28 !important;           /* 🔵 texto/ícono azul */
  border-radius: 12px;

  /* apagar overlays/atenuaciones de Vuetify */
  --v-theme-overlay-multiplier: 0;
  --v-activated-opacity: 1;
}

/* Apagar la capa de overlay del item (la que lo “ensucia”) */
.nav :deep(.v-list-item--active .v-list-item__overlay) {
  opacity: 0 !important;
  background: transparent !important;
}

/* Colorear icono y título cuando está activo */
.nav :deep(.v-list-item--active .v-icon),
.nav :deep(.v-list-item--active .v-list-item-title) {
  color: #0b0d28 !important;
  opacity: 1 !important;
}

/* Hover legible (amarillo translúcido, sin barro) */
.nav :deep(.v-list-item:hover) {
  background: rgba(255, 217, 81, 0.16) !important;
  border-radius: 12px;
}

/* Iconos siempre visibles incluso en hover o estados intermedios */
.nav :deep(.v-list-item:hover .v-icon),
.nav :deep(.v-list-item .v-icon) {
  opacity: 1 !important;
}
</style>
