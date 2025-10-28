<template>
  <v-app>
    <!-- BARRA SUPERIOR -->
    <v-app-bar color="primary" density="comfortable" dark>
      <v-app-bar-title>Control PFA</v-app-bar-title>
      <v-spacer />

      <v-btn to="/" variant="text">Inicio</v-btn>
      <v-btn to="/checkin" variant="text">Check-In</v-btn>
      <v-btn to="/asientos" variant="text">Mapa</v-btn>
      <v-btn to="/personas" variant="text">Personas</v-btn>
    </v-app-bar>

    <!-- CONTENIDO PRINCIPAL -->
    <v-main class="bg-surface">
      <router-view />
    </v-main>

    <!-- PIE (opcional) -->
    <v-footer app color="primary" dark class="justify-center">
      <small>© {{ new Date().getFullYear() }} · Sistema de Control de Asistencia</small>
    </v-footer>
  </v-app>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useSeatsStore } from './stores'

const store = useSeatsStore()
let stop

onMounted(async () => {
  await store.ensureLoaded()
  // refresca cada 5 segundos en TODOS los dispositivos
  stop = store.autoRefresh(5000)
})

onBeforeUnmount(() => stop?.())
</script>


<style scoped>
.bg-surface {
  background-color: #f6f7fb;
  min-height: 100vh;
}
small {
  opacity: 0.8;
}
</style>
