<!-- App.vue -->
<template>
  <v-app>
    <!-- ========= NAV DRAWER ========= -->
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
    <v-app-bar
      color="primary"
      density="comfortable"
      class="appbar text-yellow"
    >
      <!-- BOTÓN HAMBURGUESA / MENU -->
      <v-app-bar-nav-icon
        class="mr-2 appbar-nav"
        @click="drawer = !drawer"
      />

      <!-- TITULO -->
      <v-toolbar-title class="appbar-title">
        Control PFA
      </v-toolbar-title>

      <v-spacer />

      <!-- ACCIONES EN DESKTOP (tabs arriba a la derecha) -->
      <template v-if="isDesktop">
        <div class="appbar-actions">
          <v-btn
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            variant="text"
            class="appbar-action"
            :class="{ 'appbar-action-active': isActive(item.to) }"
          >
            <v-icon size="18" class="mr-1 appbar-action-ico">
              {{ item.icon }}
            </v-icon>
            <span class="appbar-action-text">{{ item.text }}</span>
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <!-- ========= MAIN ========= -->
    <v-main class="bg-surface">
      <router-view />
    </v-main>

    <!-- ========= FOOTER ========= -->
    <v-footer app color="primary" class="justify-center footer-bar">
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
const isActive = (to) =>
  (to === '/' ? route.path === '/' : route.path.startsWith(to))

/* -------- Drawer responsivo -------- */
const { mdAndUp } = useDisplay()
const isDesktop = computed(() => mdAndUp.value)
const drawer = ref(false)
watch(isDesktop, (v) => { drawer.value = v })

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
/* ===============================
   PALETA BASE
   =============================== */
:root {
  --bg-dark:        #0b0d28;
  --bg-card:        #0e1230;
  --gold:           #ffd951;
  --gold-border:    rgba(255,217,81,.4);
  --gold-soft-bg:   rgba(255,217,81,.12);
  --gold-soft-line: rgba(255,217,81,.28);
  --text-light:     #eaf0ff;
  --text-dim:       rgba(234,240,255,.7);
}

/* ===============================
   DRAWER
   (dejamos tu diseño original)
   =============================== */
.nav {
  border-right: 1px solid rgba(255, 217, 81, 0.18);
  background: #0b0d28 !important;
}
.nav :deep(.v-icon),
.nav :deep(.v-list-item-title) {
  color: #ffd951 !important;
  opacity: 1 !important;
  font-weight: 600;
  letter-spacing: .03em;
}
.drawer-active,
.nav :deep(.v-list-item--active) {
  background: #ffd951 !important;
  color: #0b0d28 !important;
  border-radius: 12px;
  --v-theme-overlay-multiplier: 0;
  --v-activated-opacity: 1;
}
.nav :deep(.v-list-item--active .v-list-item__overlay) {
  opacity: 0 !important;
  background: transparent !important;
}
.nav :deep(.v-list-item--active .v-icon),
.nav :deep(.v-list-item--active .v-list-item-title) {
  color: #0b0d28 !important;
  opacity: 1 !important;
  font-weight: 700 !important;
}
.nav :deep(.v-list-item:hover) {
  background: rgba(255, 217, 81, 0.16) !important;
  border-radius: 12px;
}
.nav :deep(.v-list-item:hover .v-icon),
.nav :deep(.v-list-item .v-icon) {
  opacity: 1 !important;
}

/* ===============================
   APP BAR / HEADER SUPERIOR
   =============================== */

.appbar {
  /* fondo más presente + glow leve dorado arriba */
  background:
    radial-gradient(circle at 0% 0%, rgba(255,217,81,.18) 0%, rgba(11,13,40,0) 60%),
    radial-gradient(circle at 100% 0%, rgba(0,180,255,.12) 0%, rgba(11,13,40,0) 60%),
    var(--bg-dark) !important;

  border-bottom: 1px solid var(--gold-soft-line);
  box-shadow:
    0 20px 40px rgba(0,0,0,.9),
    0 0 120px rgba(255,217,81,.08) inset;

  color: var(--gold) !important;

  min-height: 72px; /* más alto */
  align-items: flex-start;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 12px;
  padding-right: 12px;
}

/* hamburguesa grande, con caja */
.appbar-nav {
  color: var(--gold) !important;
  background: rgba(0,0,0,.45);
  border: 1px solid var(--gold-border);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow:
    0 10px 24px rgba(0,0,0,.9),
    0 30px 60px rgba(255,217,81,.3),
    0 0 24px rgba(255,217,81,.45) inset;
}
.appbar-nav :deep(.v-icon) {
  color: var(--gold) !important;
  font-size: 1.4rem;
  line-height: 1;
}

/* título principal */
.appbar-title {
  color: var(--gold) !important;
  font-weight: 800 !important;
  line-height: 1.2;
  letter-spacing: .03em;
  font-size: clamp(1rem, .25vw + 1rem, 1.05rem);
  margin-left: 4px;
  max-width: 70%;
  white-space: normal; /* puede bajar a 2 líneas en mobile */
  word-break: break-word;
  text-shadow: 0 0 8px rgba(255,217,81,.4);
}

/* bloque de acciones en desktop (tabs derecha) */
.appbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
  justify-content: flex-end;
  padding-top: 2px;
  margin-left: 12px;
}

/* botoncitos/tab */
.appbar-action {
  background: rgba(0,0,0,.45) !important;
  border: 1px solid var(--gold-border) !important;
  border-radius: 12px !important;

  text-transform: none !important;
  font-weight: 700 !important;
  letter-spacing: .03em !important;
  min-height: 38px !important;
  padding: 8px 12px !important;

  line-height: 1.2 !important;
  font-size: .8rem !important;
  color: var(--gold) !important;

  box-shadow:
    0 8px 24px rgba(0,0,0,.9),
    0 24px 48px rgba(255,217,81,.2),
    0 0 24px rgba(255,217,81,.3) inset;
}
.appbar-action-ico {
  color: var(--gold) !important;
  margin-right: 6px;
}
.appbar-action-text {
  color: var(--gold) !important;
  font-weight: 700 !important;
  line-height: 1.2 !important;
}

/* estado activo del tab */
.appbar-action-active {
  background: rgba(255,217,81,.16) !important;
  box-shadow:
    0 8px 24px rgba(0,0,0,.8),
    0 24px 48px rgba(255,217,81,.4) !important;
}

/* ===============================
   MAIN BG
   =============================== */
.bg-surface {
  background:
    radial-gradient(circle at 0% 0%, rgba(255,217,81,.08) 0%, rgba(11,13,40,0) 60%),
    radial-gradient(circle at 100% 0%, rgba(0,180,255,.07) 0%, rgba(11,13,40,0) 60%),
    #0f1631;
  color: var(--text-light);
  min-height: calc(100vh - 72px - 40px); /* header+footer aprox */
  padding-bottom: 32px;
  box-shadow:
    0 40px 120px rgba(0,0,0,.9) inset,
    0 0 240px rgba(0,180,255,.07) inset;
}

/* ===============================
   FOOTER
   =============================== */
.footer-bar {
  background: var(--bg-dark) !important;
  border-top: 1px solid var(--gold-soft-line);
  box-shadow:
    0 -20px 40px rgba(0,0,0,.9),
    0 0 120px rgba(255,217,81,.08) inset;
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  min-height: 40px;
  font-size: .75rem;
  line-height: 1.2;
  text-align: center;
  color: var(--gold) !important;
  font-weight: 600;
  letter-spacing: .03em;
}

/* ===============================
   RESPONSIVE
   =============================== */
@media (max-width: 959px) {
  /* drawer temporal: ancho fijo cómodo */
  .nav {
    width: 260px !important;
  }

  /* esconder tabs de la derecha en mobile */
  .appbar-actions {
    display: none;
  }

  .appbar-title {
    max-width: calc(100% - 60px);
    font-size: 1rem;
  }

  .bg-surface {
    min-height: calc(100vh - 72px - 40px);
  }
}

@media (min-width: 960px) {
  .appbar {
    min-height: 76px;
  }
  .appbar-title {
    max-width: none;
    font-size: 1.05rem;
  }
  .appbar-nav {
    margin-top: 2px;
  }
  .appbar-actions {
    display: flex;
  }
}
</style>
