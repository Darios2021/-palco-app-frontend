<template>
  <v-card rounded="xl" class="card-contrast">
    <!-- HEADER -->
    <v-card-title class="d-flex align-center flex-wrap gap-2 title-contrast">
      <v-icon class="mr-2">mdi-seat</v-icon>
      <span class="text-truncate">Seleccionar asiento</span>

      <v-spacer />

      <div class="legend d-flex align-center gap-2">
        <v-chip
          label
          size="small"
          class="chip-strong chip-presente"
        >
          Presente
        </v-chip>

        <v-chip
          label
          size="small"
          class="chip-strong chip-asignado"
        >
          Asignado
        </v-chip>

        <v-chip
          variant="outlined"
          label
          size="small"
          class="chip-outline"
        >
          Libre
        </v-chip>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="globalLoading" class="py-6 text-center text-dim">
        Cargando…
      </div>

      <template v-else>
        <!-- DESKTOP / TABLET ANCHA -->
        <template v-if="!smAndDown">
          <div class="palcos-layout">
            <!-- PALCO A (ID 2) -->
            <section class="palco-block palco-lateral">
              <header class="palco-header">
                <div class="palco-header-inner">
                  <v-icon size="18" class="mr-1">mdi-seat</v-icon>
                  <span class="palco-title">{{ palcoAmeta.name || 'PALCO A' }}</span>
                </div>
              </header>

              <div class="palco-body main-palco-body">
                <div class="grid-rows-wrap">
                  <div class="grid-rows">
                    <div
                      v-for="(row, rIdx) in palcoArows"
                      :key="'A-'+rIdx"
                      class="row"
                    >
                      <div class="row-label">{{ row.letter }}</div>

                      <v-btn
                        v-for="code in row.codes"
                        :key="code"
                        :class="[
                          'seat',
                          seatStatusClass(code),
                          { 'seat-selected': selectedSeatLocal === code }
                        ]"
                        variant="flat"
                        size="small"
                        :aria-label="`Asiento ${code}`"
                        :disabled="busy"
                        @click="selectSeat(code)"
                      >
                        {{ code }}
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>

              <footer class="palco-footer">
                Autoridades media prioridad
              </footer>
            </section>

            <!-- PALCO PRINCIPAL (ID 1) -->
            <section class="palco-block palco-principal">
              <header class="palco-header">
                <div class="palco-header-inner">
                  <v-icon size="18" class="mr-1">mdi-crown</v-icon>
                  <span class="palco-title">{{ palcoPrincipalMeta.name || 'PALCO PRINCIPAL' }}</span>
                </div>
              </header>

              <div class="palco-body main-palco-body">
                <div class="grid-rows-wrap">
                  <div class="grid-rows">
                    <div
                      v-for="(row, rIdx) in palcoPrincipalRows"
                      :key="'P-'+rIdx"
                      class="row"
                    >
                      <div class="row-label">{{ row.letter }}</div>

                      <v-btn
                        v-for="code in row.codes"
                        :key="code"
                        :class="[
                          'seat',
                          seatStatusClass(code),
                          { 'seat-selected': selectedSeatLocal === code }
                        ]"
                        variant="flat"
                        size="small"
                        :aria-label="`Asiento ${code}`"
                        :disabled="busy"
                        @click="selectSeat(code)"
                      >
                        {{ code }}
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>

              <footer class="palco-footer">
                Autoridades alta prioridad
              </footer>
            </section>

            <!-- PALCO B (ID 3) -->
            <section class="palco-block palco-lateral">
              <header class="palco-header">
                <div class="palco-header-inner">
                  <v-icon size="18" class="mr-1">mdi-seat-outline</v-icon>
                  <span class="palco-title">{{ palcoBmeta.name || 'PALCO B' }}</span>
                </div>
              </header>

              <div class="palco-body main-palco-body">
                <div class="grid-rows-wrap">
                  <div class="grid-rows">
                    <div
                      v-for="(row, rIdx) in palcoBrows"
                      :key="'B-'+rIdx"
                      class="row"
                    >
                      <div class="row-label">{{ row.letter }}</div>

                      <v-btn
                        v-for="code in row.codes"
                        :key="code"
                        :class="[
                          'seat',
                          seatStatusClass(code),
                          { 'seat-selected': selectedSeatLocal === code }
                        ]"
                        variant="flat"
                        size="small"
                        :aria-label="`Asiento ${code}`"
                        :disabled="busy"
                        @click="selectSeat(code)"
                      >
                        {{ code }}
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>

              <footer class="palco-footer">
                Autoridades baja prioridad
              </footer>
            </section>
          </div>
        </template>

        <!-- MOBILE: pestañas -->
        <template v-else>
          <div class="palcos-tabs-wrap">
            <v-tabs
              v-model="activeTab"
              class="palcos-tabs"
              density="comfortable"
              slider-color="#ffd951"
            >
              <v-tab value="A" class="tab-btn">{{ palcoAmeta.name || 'PALCO A' }}</v-tab>
              <v-tab value="P" class="tab-btn">{{ palcoPrincipalMeta.name || 'PRINCIPAL' }}</v-tab>
              <v-tab value="B" class="tab-btn">{{ palcoBmeta.name || 'PALCO B' }}</v-tab>
            </v-tabs>

            <v-window
              v-model="activeTab"
              class="palcos-window"
              :touch="false"
            >
              <!-- TAB A -->
              <v-window-item value="A" class="palco-window-item">
                <section class="palco-block palco-lateral">
                  <header class="palco-header">
                    <div class="palco-header-inner">
                      <v-icon size="18" class="mr-1">mdi-seat</v-icon>
                      <span class="palco-title">{{ palcoAmeta.name || 'PALCO A' }}</span>
                    </div>
                  </header>

                  <div class="palco-body main-palco-body">
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div
                          v-for="(row, rIdx) in palcoArows"
                          :key="'A-m-'+rIdx"
                          class="row"
                        >
                          <div class="row-label">{{ row.letter }}</div>

                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="[
                              'seat',
                              seatStatusClass(code),
                              { 'seat-selected': selectedSeatLocal === code }
                            ]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            :disabled="busy"
                            @click="selectSeat(code)"
                          >
                            {{ code }}
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer class="palco-footer">
                    Autoridades media prioridad
                  </footer>
                </section>
              </v-window-item>

              <!-- TAB PRINCIPAL -->
              <v-window-item value="P" class="palco-window-item">
                <section class="palco-block palco-principal">
                  <header class="palco-header">
                    <div class="palco-header-inner">
                      <v-icon size="18" class="mr-1">mdi-crown</v-icon>
                      <span class="palco-title">{{ palcoPrincipalMeta.name || 'PALCO PRINCIPAL' }}</span>
                    </div>
                  </header>

                  <div class="palco-body main-palco-body">
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div
                          v-for="(row, rIdx) in palcoPrincipalRows"
                          :key="'P-m-'+rIdx"
                          class="row"
                        >
                          <div class="row-label">{{ row.letter }}</div>

                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="[
                              'seat',
                              seatStatusClass(code),
                              { 'seat-selected': selectedSeatLocal === code }
                            ]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            :disabled="busy"
                            @click="selectSeat(code)"
                          >
                            {{ code }}
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer class="palco-footer">
                    Autoridades alta prioridad
                  </footer>
                </section>
              </v-window-item>

              <!-- TAB B -->
              <v-window-item value="B" class="palco-window-item">
                <section class="palco-block palco-lateral">
                  <header class="palco-header">
                    <div class="palco-header-inner">
                      <v-icon size="18" class="mr-1">mdi-seat-outline</v-icon>
                      <span class="palco-title">{{ palcoBmeta.name || 'PALCO B' }}</span>
                    </div>
                  </header>

                  <div class="palco-body main-palco-body">
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div
                          v-for="(row, rIdx) in palcoBrows"
                          :key="'B-m-'+rIdx"
                          class="row"
                        >
                          <div class="row-label">{{ row.letter }}</div>

                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="[
                              'seat',
                              seatStatusClass(code),
                              { 'seat-selected': selectedSeatLocal === code }
                            ]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            :disabled="busy"
                            @click="selectSeat(code)"
                          >
                            {{ code }}
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer class="palco-footer">
                    Autoridades baja prioridad
                  </footer>
                </section>
              </v-window-item>
            </v-window>
          </div>
        </template>
      </template>
    </v-card-text>

    <!-- FOOTER CONFIRM -->
        <!-- FOOTER CONFIRM -->
    <v-card-actions class="picker-footer">
      <div
        class="picked-seat text-dim text-caption"
        v-if="selectedSeatLocal"
      >
        Asiento seleccionado:
        <b class="text-accent">{{ selectedSeatLocal }}</b>
      </div>

      <v-spacer />

      <v-btn
        class="btn-confirm"
        :disabled="!selectedSeatLocal || busy"
        @click="confirmSelection"
      >
        Confirmar
      </v-btn>
    </v-card-actions>

  </v-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'
import api from '../services/api'

/* emits: avisar al padre qué asiento eligió */
const emit = defineEmits(['select'])

/* ===== Breakpoint ===== */
const { smAndDown } = useDisplay()

/* ===== Store global de personas ===== */
const store = useSeatsStore()

/*
  palcoMap[id] = {
    id,
    name,
    rows: [
      { letter:'A', codes:['A1','A2',...] },
      ...
    ]
  }
*/
const palcoMap = ref({
  1: { id: 1, name: 'PALCO PRINCIPAL', rows: [] },
  2: { id: 2, name: 'PALCO A', rows: [] },
  3: { id: 3, name: 'PALCO B', rows: [] },
})

const globalLoading = ref(true)
const busy = ref(false)

/* tabs del mapa mobile */
const activeTab = ref('P') // P = principal

/* asiento que eligió el usuario en este picker */
const selectedSeatLocal = ref('')

/* ===== helper: backend seats -> rows ===== */
function transformSeatsResponse(data) {
  // data.seats = [ ['A1','A2',...], ['B1','B2',...] ]
  const rowsOut = data.seats.map(arr => {
    const letter = arr[0]?.charAt(0) || '?'
    return { letter, codes: arr }
  })
  return {
    id: data.palcoId,
    name: data.name,
    rows: rowsOut,
  }
}

// GET /palcos/:id/seats
async function loadPalco(palcoId) {
  const { data } = await api.get(`/palcos/${palcoId}/seats`)
  palcoMap.value[palcoId] = transformSeatsResponse(data)
}

/* load inicial */
onMounted(async () => {
  await Promise.all([
    loadPalco(1),
    loadPalco(2),
    loadPalco(3),
    store.ensureLoaded(),
  ])
  globalLoading.value = false
})

/* ===== Computed por palco ===== */
const palcoPrincipalRows = computed(() => palcoMap.value[1]?.rows || [])
const palcoArows          = computed(() => palcoMap.value[2]?.rows || [])
const palcoBrows          = computed(() => palcoMap.value[3]?.rows || [])

const palcoPrincipalMeta  = computed(() => ({
  id:   palcoMap.value[1]?.id,
  name: palcoMap.value[1]?.name,
}))
const palcoAmeta          = computed(() => ({
  id:   palcoMap.value[2]?.id,
  name: palcoMap.value[2]?.name,
}))
const palcoBmeta          = computed(() => ({
  id:   palcoMap.value[3]?.id,
  name: palcoMap.value[3]?.name,
}))

/* ===== Estado visual por asiento =====
   store.seatStatus(code) -> "present" | "assigned" | "free"
*/
function seatStatusClass(code) {
  const st = store.seatStatus?.(code)
  return st || 'free'
}

/* click en un asiento */
function selectSeat(code) {
  if (busy.value) return
  selectedSeatLocal.value = code
}

/* confirmar selección */
function confirmSelection() {
  if (!selectedSeatLocal.value) return
  emit('select', selectedSeatLocal.value)
}
</script>

<style scoped>
/* ===== Card / fondo oscuro dorado ===== */
.card-contrast {
  background: #0e1230 !important;
  border: 1px solid rgba(255, 217, 81, .14);
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
}
.title-contrast {
  background: linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0));
  border-bottom: 1px solid rgba(255,217,81,.10);
}
.text-dim {
  color: rgba(234,240,255, .75);
}
.text-accent {
  color: #ffd951;
  font-weight: 700;
}
.btn-strong {
  font-weight: 800;
  text-transform: none;
}

/* leyenda */
.chip-strong {
  font-weight: 700;
  color: #0b0d28 !important;
}
.chip-outline {
  color: #eaf0ff !important;
  border-color: rgba(234,240,255,.28) !important;
  background: rgba(234,240,255,.07) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,.6);
  font-weight: 600;
  height: 24px;
  line-height: 1;
  border-radius: 6px;
  padding: 0 8px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
}
.legend :deep(.chip-strong) {
  font-weight: 700;
  border: 1px solid rgba(255,217,81,.24) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,.6);
  height: 24px;
  line-height: 1;
  border-radius: 6px;
  padding: 0 8px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
}
.legend :deep(.chip-presente) {
  background-color: #4caf50 !important;
  color: #0b0d28 !important;
}
.legend :deep(.chip-asignado) {
  background-color: #ffb300 !important;
  color: #0b0d28 !important;
}

/* ===========================
   DESKTOP GRID: 3 PALCOS
=========================== */
.palcos-layout {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) minmax(320px, 2fr) minmax(200px, 1fr);
  gap: 16px;
}
@media (max-width: 900px) {
  .palcos-layout {
    grid-template-columns: 1fr;
  }
}

.palco-block {
  background: rgba(11,13,40,.5);
  border: 1px solid rgba(255,217,81,.14);
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0,0,0,.6);
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.palco-header {
  padding: 12px 16px;
  background: #1a1d38;
  border-bottom: 1px solid rgba(255,217,81,.18);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  color: #ffd951;
  font-size: .8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .03em;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.palco-header-inner {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #ffd951;
}
.palco-title {
  line-height: 1.2;
}
.palco-body {
  padding: 16px;
  overflow-x: auto;
}
.main-palco-body {
  padding: 0 16px 16px;
  background: #0f122a;
}
.palco-footer {
  font-size: .7rem;
  line-height: 1.2;
  color: rgba(234,240,255,.55);
  border-top: 1px solid rgba(255,217,81,.08);
  padding: 8px 16px 12px;
  text-align: right;
  text-transform: uppercase;
  letter-spacing: .05em;
}

/* MOBILE: TABS */
.palcos-tabs-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.palcos-tabs {
  background: rgba(11,13,40,.6);
  border: 1px solid rgba(255,217,81,.24);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0,0,0,.7);
  overflow: hidden;
}
.tab-btn {
  text-transform: none;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: .03em;
  color: #ffd951 !important;
  transition: all 0.25s ease;
  opacity: .85;
}
.tab-btn:hover,
.tab-btn:focus-visible {
  background: rgba(255,217,81,.1) !important;
  color: #ffdc60 !important;
  opacity: 1;
}
.palcos-window {
  background: transparent;
}

/* GRID FILAS + ASIENTOS */
.grid-rows-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 6px;
}
.grid-rows {
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  min-width: max(480px, 100%);
}
.row {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 44px repeat(auto-fit, minmax(60px, 1fr));
  gap: 8px;
  align-items: center;
}

/* etiqueta amarilla con la letra de fila */
.row-label {
  position: sticky;
  left: 0;
  z-index: 1;
  text-align: center;
  font-weight: 800;
  color: #0b0d28;
  background: #ffd951;
  border: 1px solid rgba(255,217,81,.45);
  box-shadow: 0 2px 6px rgba(0,0,0,.25);
  border-radius: 10px;
  padding: 6px 0;
  width: 44px;
  font-size: .8rem;
  line-height: 1.2;
}

/* píldoras asiento */
.seat {
  min-width: 58px;
  height: 36px;
  border-radius: 18px;
  font-weight: 700;
  text-transform: none;
  box-shadow: 0 1px 2px rgba(0,0,0,.25);
  background: #f3f5f9 !important;
  color: #0b0d28 !important;
  border: 0 !important;
  font-size: .8rem;
  line-height: 1.2;
  justify-content: center;
}
.seat.present  {
  background: #4caf50 !important;
  color: #fff !important;
}
.seat.assigned {
  background: #ffb300 !important;
  color: #0b0d28 !important;
}
.seat.free     {
  background: #f3f5f9 !important;
  color: #0b0d28 !important;
}

/* cuando el usuario eligió ese asiento en este picker */
.seat.seat-selected {
  outline: 2px solid #ffd951;
  outline-offset: 0;
  box-shadow: 0 0 8px rgba(255,217,81,.75);
}

/* RESPONSIVE FINO */
@media (max-width: 600px) {
  .legend :deep(.v-chip) {
    height: 22px;
    font-size: 11px;
  }
  .grid-rows {
    gap: 10px;
    min-width: max(400px, 100%);
  }
  .row {
    grid-template-columns: 36px repeat(auto-fit, minmax(54px, 1fr));
    gap: 6px;
  }
  .row-label {
    width: 36px;
    padding: 4px 0;
    font-size: .7rem;
  }
  .seat {
    min-width: 54px;
    height: 32px;
    border-radius: 16px;
    font-size: 0.8rem;
  }
}
/* footer del modal */
.picker-footer {
  background: rgba(11,13,40,.6);
  border-top: 1px solid rgba(255,217,81,.24);
  box-shadow: 0 -8px 24px rgba(0,0,0,.8);
  padding: 16px 20px !important;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

/* texto "Asiento seleccionado" */
.picked-seat {
  font-weight: 600;
  font-size: .8rem;
  line-height: 1.3;
  color: rgba(234,240,255,.8);
}

/* botón confirmar bien visible estilo dorado/oscuro */
.btn-confirm {
  background: #ffd951 !important;
  color: #0b0d28 !important;
  font-weight: 800 !important;
  text-transform: none !important;
  letter-spacing: .02em;
  border-radius: 10px !important;
  min-width: 120px !important;
  min-height: 40px !important;
  box-shadow: 0 10px 24px rgba(0,0,0,.8),
              0 0 10px rgba(255,217,81,.6);
  border: 1px solid rgba(255,217,81,.4) !important;
  font-size: .9rem !important;
  line-height: 1.2 !important;
}

/* estado deshabilitado del botón confirmar */
.btn-confirm.v-btn--disabled {
  background: rgba(255,255,255,.08) !important;
  color: rgba(234,240,255,.3) !important;
  box-shadow: 0 0 0 rgba(0,0,0,0) !important;
  border: 1px solid rgba(255,255,255,.12) !important;
}

</style>
