<!-- src/components/SeatPickerDialog.vue -->
<template>
  <v-dialog v-model="internalOpen" max-width="1100" scrollable>
    <v-card rounded="xl" class="card-contrast">
      <!-- HEADER -->
      <v-card-title class="title-contrast seatpicker-header">
        <div class="header-left">
          <v-icon class="mr-2">mdi-seat</v-icon>
          <div class="header-titles">
            <div class="header-line1">Seleccionar asiento</div>
            <div v-if="personName" class="header-line2">{{ personName }}</div>
          </div>
        </div>

        <div class="legend d-flex align-center gap-2">
          <v-chip label size="small" class="chip-strong chip-presente">Presente</v-chip>
          <v-chip label size="small" class="chip-strong chip-asignado">Asignado</v-chip>
          <v-chip variant="outlined" label size="small" class="chip-outline">Libre</v-chip>
        </div>
      </v-card-title>

      <v-card-text>
        <div v-if="globalLoading" class="py-6 text-center text-dim">
          <v-progress-circular indeterminate size="24" class="mr-2" />
          Cargando mapa de asientos…
        </div>

        <template v-else>
          <!-- ===== TABS (alineado a SeatMap.vue) ===== -->
          <v-tabs v-model="activeTab" class="palcos-tabs tabs-compact" grow>
            <v-tab value="IZQ" class="tab-compact">IZQ</v-tab>
            <v-tab value="P" class="tab-compact">PRINCIPAL</v-tab>
            <v-tab value="DER" class="tab-compact">DER</v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="palcos-window" :touch="false">
            <!-- === TAB IZQ = PALCO B (J,K,L bottom→top) === -->
            <v-window-item value="IZQ" class="palco-window-item">
              <section class="palco-block">
                <header class="palco-header">
                  <div class="palco-header-inner">
                    <v-icon size="18" class="mr-1">mdi-view-grid</v-icon>
                    <!-- Nombre fijo en la UI -->
                    <span class="palco-title">PALCO B</span>
                  </div>
                </header>

                <div class="palco-body">
                  <div class="grid-rows-wrap">
                    <div class="grid-rows">
                      <div v-for="row in palcoIzqRows" :key="'IZQ-'+row.letter" class="row">
                        <div class="row-label">{{ row.letter }}</div>
                        <v-btn
                          v-for="code in row.codes"
                          :key="code"
                          :class="['seat', seatStatusClass(code), { 'seat-selected': selectedSeatLocal === code }]"
                          variant="flat"
                          size="small"
                          :aria-label="`Asiento ${code}`"
                          :disabled="isSeatDisabled(code)"
                          @click="selectSeat(code)"
                        >{{ code }}</v-btn>
                      </div>
                    </div>
                  </div>
                </div>

                <footer class="palco-footer">Palco B — Lateral izquierdo</footer>
              </section>
            </v-window-item>

            <!-- === TAB PRINCIPAL (A–F) === -->
            <v-window-item value="P" class="palco-window-item">
              <section class="palco-block palco-principal">
                <header class="palco-header">
                  <div class="palco-header-inner">
                    <v-icon size="18" class="mr-1">mdi-crown</v-icon>
                    <span class="palco-title">{{ palcoPrincipalMeta.name }}</span>
                  </div>
                </header>

                <div class="palco-body main-palco-body">
                  <div class="principal-split">
                    <!-- IZQUIERDA: A/C/E -->
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="row in palcoPrincipalLeftRows" :key="'P-L-'+row.letter" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="['seat', seatStatusClass(code), { 'seat-selected': selectedSeatLocal === code }]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            :disabled="isSeatDisabled(code)"
                            @click="selectSeat(code)"
                          >{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>

                    <!-- PASILLO CENTRAL -->
                    <div class="aisle-vert" aria-hidden="true"></div>

                    <!-- DERECHA: B/D/F -->
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="row in palcoPrincipalRightRows" :key="'P-R-'+row.letter" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="['seat', seatStatusClass(code), { 'seat-selected': selectedSeatLocal === code }]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            :disabled="isSeatDisabled(code)"
                            @click="selectSeat(code)"
                          >{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <footer class="palco-footer">Pasillo central</footer>
              </section>
            </v-window-item>

            <!-- === TAB DER = PALCO A (J,K,L bottom→top) === -->
            <v-window-item value="DER" class="palco-window-item">
              <section class="palco-block">
                <header class="palco-header">
                  <div class="palco-header-inner">
                    <v-icon size="18" class="mr-1">mdi-view-grid-plus</v-icon>
                    <!-- Nombre fijo en la UI -->
                    <span class="palco-title">PALCO A</span>
                  </div>
                </header>

                <div class="palco-body">
                  <div class="grid-rows-wrap">
                    <div class="grid-rows">
                      <div v-for="row in palcoDerRows" :key="'DER-'+row.letter" class="row">
                        <div class="row-label">{{ row.letter }}</div>
                        <v-btn
                          v-for="code in row.codes"
                          :key="code"
                          :class="['seat', seatStatusClass(code), { 'seat-selected': selectedSeatLocal === code }]"
                          variant="flat"
                          size="small"
                          :aria-label="`Asiento ${code}`"
                          :disabled="isSeatDisabled(code)"
                          @click="selectSeat(code)"
                        >{{ code }}</v-btn>
                      </div>
                    </div>
                  </div>
                </div>

                <footer class="palco-footer">Palco A — Lateral derecho</footer>
              </section>
            </v-window-item>
          </v-window>
        </template>
      </v-card-text>

      <v-divider class="divider-contrast" />

      <!-- FOOTER -->
      <v-card-actions class="picker-footer">
        <div class="picker-info">
          <v-icon size="18" class="mr-2">mdi-information-outline</v-icon>
          <div class="picker-label">
            <span class="picker-text">Asiento seleccionado:</span>
            <strong v-if="selectedSeatLocal" class="picker-code">{{ selectedSeatLocal }}</strong>
            <span v-else class="picker-none">Ninguno</span>
          </div>
        </div>

        <div class="picker-actions">
          <v-btn variant="outlined" class="btn-cancel" :disabled="busy" @click="close">Cancelar</v-btn>
          <v-btn class="btn-confirm" :disabled="!selectedSeatLocal || busy" :loading="busy" @click="confirm">Confirmar</v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useDisplay } from 'vuetify'
import api from '@/services/api'

/* ===== Props / Emits ===== */
const props = defineProps({
  modelValue:   { type: Boolean, default: false },
  currentSeat:  { type: String,  default: '' },
  personName:   { type: String,  default: '' },
  allowAssigned:{ type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'confirm'])

/* ===== UI ===== */
const { smAndDown } = useDisplay()
const internalOpen = ref(props.modelValue)
watch(() => props.modelValue, v => (internalOpen.value = v))
watch(internalOpen, v => emit('update:modelValue', v))

const activeTab = ref('P')
const busy = ref(false)
const globalLoading = ref(true)

/* ===== Selección ===== */
const selectedSeatLocal = ref('')
watch(() => props.currentSeat, v => {
  if (!selectedSeatLocal.value) selectedSeatLocal.value = v || ''
}, { immediate: true })

/* ===== Datos (no confiamos en name del backend) ===== */
const palcoMap = ref({
  1: { id: 1, rows: [], status: {} }, // Principal (A–F)
  2: { id: 2, rows: [], status: {} }, // IZQ  = Palco B (se remapea a J–L)
  3: { id: 3, rows: [], status: {} }, // DER  = Palco A (se remapea a J–L)
})

/* Construye filas por índice (A + idx) y filtra vacías */
const letterForIndex = (idx) => String.fromCharCode('A'.charCodeAt(0) + idx)
function rowsFromSeatsByIndex(seats2D = []) {
  const out = []
  seats2D.forEach((rowArr, idx) => {
    const codes = (rowArr || []).filter(c => typeof c === 'string' && c.trim().length)
    if (codes.length) out.push({ letter: letterForIndex(idx), codes })
  })
  return out
}

function transformSeatsResponse(data) {
  const seats  = Array.isArray(data?.seats) ? data.seats : []
  const status = data?.status || {}
  return { id: data?.palcoId, rows: rowsFromSeatsByIndex(seats), status }
}

async function loadPalco(pId) {
  const { data } = await api.get(`/palcos/${pId}/seats`)
  const parsed = transformSeatsResponse(data)
  palcoMap.value[pId] = { ...palcoMap.value[pId], ...parsed } // preserva nuestros names
}
async function loadAll() {
  globalLoading.value = true
  try { await Promise.all([1,2,3].map(loadPalco)) }
  finally { globalLoading.value = false }
}
onMounted(loadAll)

/* ===== Helpers ===== */
function seatInPalco(pId, code) {
  const rows = palcoMap.value[pId]?.rows || []
  for (const r of rows) if (r.codes?.includes(code)) return true
  return false
}

/* Remapea letras de laterales a J,K,L (orden estable) */
function remapRowsToLetters(rows = [], targetLetters = ['J','K','L']) {
  const sorted = [...rows] // orden visual abajo→arriba lo maneja el CSS (column-reverse)
  return sorted.slice(0, targetLetters.length).map((r, i) => ({ ...r, letter: targetLetters[i] }))
}

/* ===== Computed ===== */
const ALLOWED_PRINCIPAL = new Set(['A','B','C','D','E','F'])
const palcoPrincipalRows = computed(() =>
  (palcoMap.value[1]?.rows || []).filter(r => r?.codes?.length && ALLOWED_PRINCIPAL.has(r.letter))
)

/* Laterales: siempre J,K,L */
const palcoIzqRows = computed(() => {
  const base = (palcoMap.value[2]?.rows || []).filter(r => r?.codes?.length)
  return remapRowsToLetters(base, ['J','K','L'])
})
const palcoDerRows = computed(() => {
  const base = (palcoMap.value[3]?.rows || []).filter(r => r?.codes?.length)
  return remapRowsToLetters(base, ['J','K','L'])
})

/* Nombres fijos (solo usados en Principal; laterales se hardcodean en template) */
const palcoPrincipalMeta = computed(() => ({ id: 1, name: 'PALCO PRINCIPAL' }))
const palcoIzqMeta       = computed(() => ({ id: 2, name: 'PALCO B' })) // IZQ
const palcoDerMeta       = computed(() => ({ id: 3, name: 'PALCO A' })) // DER

/* Split principal (pasillo) */
const palcoPrincipalLeftRows  = computed(() =>
  (palcoPrincipalRows.value || []).filter(r => (r.letter.charCodeAt(0) - 65) % 2 === 0)
)
const palcoPrincipalRightRows = computed(() =>
  (palcoPrincipalRows.value || []).filter(r => (r.letter.charCodeAt(0) - 65) % 2 === 1)
)

/* ===== Estado / Clases ===== */
function statusOf(code) {
  if (!code) return ''
  if (props.currentSeat && code === props.currentSeat) return '' // permitir elegir el propio
  return (
    palcoMap.value[1]?.status?.[code] ||
    palcoMap.value[2]?.status?.[code] ||
    palcoMap.value[3]?.status?.[code] ||
    ''
  )
}
function seatStatusClass(code) {
  const s = statusOf(code)
  if (s === 'present')  return 'present'
  if (s === 'assigned') return 'assigned'
  return ''
}
function isSeatDisabled(code) {
  if (!code) return true
  const s = statusOf(code)
  if (!s) return false
  if (s === 'assigned') return !props.allowAssigned && code !== props.currentSeat
  if (s === 'present')  return true
  return false
}

/* Auto-tab según dónde exista el asiento actual/seleccionado */
watchEffect(() => {
  const seat = (props.currentSeat || selectedSeatLocal.value || '').toUpperCase()
  if (!seat) return
  if (seatInPalco(2, seat)) activeTab.value = 'IZQ'
  else if (seatInPalco(3, seat)) activeTab.value = 'DER'
  else activeTab.value = 'P'
})

/* ===== Acciones ===== */
function selectSeat(code){ if (!isSeatDisabled(code)) selectedSeatLocal.value = code }
function close(){ internalOpen.value = false }
async function confirm(){
  if (!selectedSeatLocal.value) return
  busy.value = true
  try{
    emit('confirm', { seat: selectedSeatLocal.value })
    internalOpen.value = false
  } finally { busy.value = false }
}
</script>

<style scoped>
/* ===== Card / fondo oscuro dorado ===== */
.card-contrast{ background:#0e1230 !important; border:1px solid rgba(255,217,81,.14); box-shadow:0 6px 18px rgba(0,0,0,.25); }
.title-contrast{ background:linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0)); border-bottom:1px solid rgba(255,217,81,.10); }
.divider-contrast{ border-color: rgba(255,217,81,.10) !important; }
.text-dim{ color: rgba(234,240,255,.75); }

/* ===== LEYENDA ===== */
.chip-strong{ background:rgba(255,217,81,.12) !important; color:#ffd951 !important; border:1px solid rgba(255,217,81,.24) !important; }
.chip-presente{ background:rgba(76,175,80,.18) !important; color:#9be89b !important; border:1px solid rgba(76,175,80,.35) !important; }
.chip-asignado{ background:rgba(255,152,0,.18) !important; color:#ffda9b !important; border:1px solid rgba(255,152,0,.35) !important; }
.chip-outline{ color:#eaf0ff !important; border-color:rgba(234,240,255,.35) !important; }

/* ===== TABS ===== */
.palcos-tabs{ border-bottom:1px solid rgba(255,217,81,.12); margin-bottom:8px; }
.tabs-compact{ overflow-x:auto; }
.tab-compact{
  text-transform:none !important; font-weight:700 !important;
  font-size:.78rem !important; letter-spacing:.02em !important;
  min-width:92px !important; padding:0 10px !important; height:34px !important;
}
:deep(.v-tab.v-tab--selected){
  background:rgba(255,217,81,.18) !important;
  box-shadow:inset 0 0 6px rgba(255,217,81,.25);
  color:#fff3bf !important; opacity:1 !important; font-weight:800 !important;
}

/* ===== LAYOUT Y GRILLA ===== */
.palco-block{ border:1px dashed rgba(255,217,81,.15); border-radius:16px; padding:10px 12px 14px; background:rgba(7,9,28,.35); }
.palco-header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.palco-header-inner{ display:flex; align-items:center; font-weight:700; letter-spacing:.2px; }
.palco-title{ font-weight:800; }
.palco-footer{ margin-top:8px; border-top:1px dashed rgba(255,217,81,.12); padding-top:8px; font-size:.85rem; opacity:.7; text-align:center; }

.grid-rows-wrap{ overflow:auto; }

/* ⬇️ Mostrar filas desde ABAJO hacia ARRIBA en todos los palcos */
.grid-rows{
  display:flex;
  flex-direction: column-reverse;
  gap:6px;
  width:100%;
}

.row{
  display:grid; grid-auto-flow:column;
  grid-template-columns:38px repeat(auto-fit, minmax(54px, 1fr));
  gap:6px; align-items:center;
}
.row-label{
  position:sticky; left:0; z-index:1; text-align:center; font-weight:800; color:#0b0d28;
  background:#ffd951; border:1px solid rgba(255,217,81,.45);
  box-shadow:0 2px 6px rgba(0,0,0,.25); border-radius:8px; padding:5px 0;
  width:38px; font-size:.75rem; line-height:1.2;
}
.seat{
  min-width:54px; height:32px; border-radius:16px; font-weight:700; text-transform:none;
  box-shadow:0 1px 2px rgba(0,0,0,.25); background:#f3f5f9 !important; color:#0b0d28 !important;
  border:0 !important; font-size:.75rem; line-height:1.2; justify-content:center; padding:0 8px;
}
.seat.present{ background:#4caf50 !important; color:#fff !important; }
.seat.assigned{ background:#ffb300 !important; color:#0b0d28 !important; }

/* selección */
.seat-selected{ outline:2px solid #ffd951; box-shadow:0 0 0 3px rgba(255,217,81,.18); }

/* PASILLO CENTRAL */
.principal-split{ display:grid; grid-template-columns:1fr 28px 1fr; align-items:start; gap:8px; }
.aisle-vert{
  width:100%; height:100%; min-height:100px;
  border-left:2px dashed rgba(255,217,81,.35);
  border-right:2px dashed rgba(255,217,81,.35);
  border-radius:6px;
}

/* ===== Responsivo ===== */
@media (max-width:600px){
  .palcos-window .row{
    grid-template-columns:32px !important;
    grid-auto-flow:column !important;
    grid-auto-columns:52px !important;
    width:max-content !important;
  }
  .palcos-window .seat.v-btn{ min-width:52px !important; width:52px !important; }
}

/* ===== Footer ===== */
.picker-footer{
  display:flex; justify-content:space-between; align-items:center;
  background:rgba(15,18,45,.65); border-top:1px solid rgba(255,217,81,.10);
  padding:12px 20px; border-radius:0 0 18px 18px;
}
.picker-info{ display:flex; align-items:center; gap:8px; color:rgba(234,240,255,.8); font-size:.95rem; font-weight:500; }
.picker-label{ display:flex; align-items:center; gap:6px; }
.picker-text{ opacity:.85; font-weight:400; }
.picker-code{ color:#ffd951; font-weight:800; letter-spacing:.3px; }
.picker-none{ color:rgba(234,240,255,.5); font-style:italic; }
.picker-actions{ display:flex; gap:10px; }
.btn-cancel{ color:rgba(234,240,255,.75) !important; border:1px solid rgba(234,240,255,.25) !important; background:rgba(255,255,255,.03) !important; font-weight:600 !important; text-transform:none !important; }
.btn-cancel:hover{ background:rgba(234,240,255,.08) !important; }
.btn-confirm{ background:#ffd951 !important; color:#0b0d28 !important; font-weight:800 !important; text-transform:none !important; box-shadow:0 0 10px rgba(255,217,81,.25); }
.btn-confirm:hover{ background:#ffe87a !important; }

/* ===== HEADER ===== */
.seatpicker-header{ display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
.header-left{ display:flex; align-items:center; gap:10px; min-width:0; }
.header-titles{ display:flex; flex-direction:column; min-width:0; }
.header-line1{ font-size:1.05rem; font-weight:600; color:#fff; white-space:nowrap; }
.header-line2{ font-size:.95rem; font-weight:700; color:#ffd951; white-space:normal; word-break:break-word; line-height:1.2; margin-top:2px; }
.legend{ flex-shrink:0; display:flex; align-items:center; gap:6px; }
@media (max-width:500px){ .seatpicker-header{ flex-direction:column; align-items:flex-start; } .legend{ margin-top:4px; } }
</style>
