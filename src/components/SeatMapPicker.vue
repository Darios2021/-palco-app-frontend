<!-- src/components/SeatMapPicker.vue -->
<template>
  <v-card rounded="xl" class="card-contrast">
    <!-- HEADER -->
    <v-card-title class="d-flex align-center flex-wrap gap-2 title-contrast">
      <v-icon class="mr-2">mdi-seat</v-icon>
      <span class="text-truncate">Seleccionar asiento</span>
      <v-spacer />
      <div class="legend d-flex align-center gap-2">
        <v-chip label size="small" class="chip-strong chip-presente">Presente</v-chip>
        <v-chip label size="small" class="chip-strong chip-asignado">Asignado</v-chip>
        <v-chip variant="outlined" label size="small" class="chip-outline">Libre</v-chip>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="globalLoading" class="py-6 text-center text-dim">Cargando…</div>

      <template v-else>
        <!-- DESKTOP -->
        <template v-if="!smAndDown">
          <div class="palcos-viewport">
            <div class="palcos-layout">
              <!-- IZQ -->
              <section class="palco-block palco-lateral">
                <header class="palco-header">
                  <div class="palco-header-inner">
                    <v-icon size="18" class="mr-1">mdi-seat</v-icon>
                    <span class="palco-title">{{ palcoIzqMeta.name }}</span>
                  </div>
                </header>
                <div class="palco-body main-palco-body">
                  <div class="grid-rows-wrap">
                    <div class="grid-rows">
                      <div v-for="(row, rIdx) in palcoIzqRows" :key="'IZQ-'+rIdx" class="row">
                        <div class="row-label">{{ row.letter }}</div>
                        <v-btn
                          v-for="code in row.codes"
                          :key="code"
                          :class="['seat', seatStatusClass(code), { 'seat-selected': selected === code }]"
                          variant="flat" size="small" :aria-label="`Asiento ${code}`"
                          :disabled="busy"
                          @click="pick(code)"
                        >{{ code }}</v-btn>
                      </div>
                    </div>
                  </div>
                </div>
                <footer class="palco-footer">Lateral izquierdo</footer>
              </section>

              <!-- PRINCIPAL -->
              <section class="palco-block palco-principal">
                <header class="palco-header">
                  <div class="palco-header-inner">
                    <v-icon size="18" class="mr-1">mdi-crown</v-icon>
                    <span class="palco-title">{{ palcoPrincipalMeta.name }}</span>
                  </div>
                </header>

                <div class="palco-body main-palco-body">
                  <div class="principal-split">
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="(row, rIdx) in palcoPrincipalLeftRows" :key="'P-L-'+rIdx" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="['seat', seatStatusClass(code), { 'seat-selected': selected === code }]"
                            variant="flat" size="small" :aria-label="`Asiento ${code}`"
                            :disabled="busy"
                            @click="pick(code)"
                          >{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>

                    <div class="aisle-vert" aria-hidden="true"></div>

                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="(row, rIdx) in palcoPrincipalRightRows" :key="'P-R-'+rIdx" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="['seat', seatStatusClass(code), { 'seat-selected': selected === code }]"
                            variant="flat" size="small" :aria-label="`Asiento ${code}`"
                            :disabled="busy"
                            @click="pick(code)"
                          >{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <footer class="palco-footer">Pasillo central</footer>
              </section>

              <!-- DER -->
              <section class="palco-block palco-lateral">
                <header class="palco-header">
                  <div class="palco-header-inner">
                    <v-icon size="18" class="mr-1">mdi-seat-outline</v-icon>
                    <span class="palco-title">{{ palcoDerMeta.name }}</span>
                  </div>
                </header>
                <div class="palco-body main-palco-body">
                  <div class="grid-rows-wrap">
                    <div class="grid-rows">
                      <div v-for="(row, rIdx) in palcoDerRows" :key="'DER-'+rIdx" class="row">
                        <div class="row-label">{{ row.letter }}</div>
                        <v-btn
                          v-for="code in row.codes"
                          :key="code"
                          :class="['seat', seatStatusClass(code), { 'seat-selected': selected === code }]"
                          variant="flat" size="small" :aria-label="`Asiento ${code}`"
                          :disabled="busy"
                          @click="pick(code)"
                        >{{ code }}</v-btn>
                      </div>
                    </div>
                  </div>
                </div>
                <footer class="palco-footer">Lateral derecho</footer>
              </section>
            </div>
          </div>
        </template>

        <!-- MOBILE -->
        <template v-else>
          <div class="palcos-tabs-wrap">
            <v-tabs v-model="activeTab" class="palcos-tabs tabs-compact" density="compact" slider-color="#ffd951" show-arrows center-active>
              <v-tab value="IZQ" class="tab-compact">IZQ</v-tab>
              <v-tab value="P" class="tab-compact">PRINCIPAL</v-tab>
              <v-tab value="DER" class="tab-compact">DER</v-tab>
            </v-tabs>

            <v-window v-model="activeTab" class="palcos-window" :touch="false">
              <v-window-item value="IZQ" class="palco-window-item">
                <section class="palco-block palco-lateral">
                  <header class="palco-header">
                    <div class="palco-header-inner">
                      <v-icon size="18" class="mr-1">mdi-seat</v-icon>
                      <span class="palco-title">{{ palcoIzqMeta.name }}</span>
                    </div>
                  </header>
                  <div class="palco-body main-palco-body">
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="(row, rIdx) in palcoIzqRows" :key="'IZQ-m-'+rIdx" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn v-for="code in row.codes" :key="code"
                            :class="['seat', seatStatusClass(code), { 'seat-selected': selected === code }]"
                            variant="flat" size="small" :aria-label="`Asiento ${code}`" :disabled="busy" @click="pick(code)">{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                  <footer class="palco-footer">Lateral izquierdo</footer>
                </section>
              </v-window-item>

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
                      <div class="grid-rows-wrap">
                        <div class="grid-rows">
                          <div v-for="(row, rIdx) in palcoPrincipalLeftRows" :key="'P-L-m-'+rIdx" class="row">
                            <div class="row-label">{{ row.letter }}</div>
                            <v-btn v-for="code in row.codes" :key="code"
                              :class="['seat', seatStatusClass(code), { 'seat-selected': selected === code }]"
                              variant="flat" size="small" :aria-label="`Asiento ${code}`" :disabled="busy" @click="pick(code)">{{ code }}</v-btn>
                          </div>
                        </div>
                      </div>
                      <div class="aisle-vert" aria-hidden="true"></div>
                      <div class="grid-rows-wrap">
                        <div class="grid-rows">
                          <div v-for="(row, rIdx) in palcoPrincipalRightRows" :key="'P-R-m-'+rIdx" class="row">
                            <div class="row-label">{{ row.letter }}</div>
                            <v-btn v-for="code in row.codes" :key="code"
                              :class="['seat', seatStatusClass(code), { 'seat-selected': selected === code }]"
                              variant="flat" size="small" :aria-label="`Asiento ${code}`" :disabled="busy" @click="pick(code)">{{ code }}</v-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <footer class="palco-footer">Pasillo central</footer>
                </section>
              </v-window-item>

              <v-window-item value="DER" class="palco-window-item">
                <section class="palco-block palco-lateral">
                  <header class="palco-header">
                    <div class="palco-header-inner">
                      <v-icon size="18" class="mr-1">mdi-seat-outline</v-icon>
                      <span class="palco-title">{{ palcoDerMeta.name }}</span>
                    </div>
                  </header>
                  <div class="palco-body main-palco-body">
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="(row, rIdx) in palcoDerRows" :key="'DER-m-'+rIdx" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn v-for="code in row.codes" :key="code"
                            :class="['seat', seatStatusClass(code), { 'seat-selected': selected === code }]"
                            variant="flat" size="small" :aria-label="`Asiento ${code}`" :disabled="busy" @click="pick(code)">{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                  <footer class="palco-footer">Lateral derecho</footer>
                </section>
              </v-window-item>
            </v-window>
          </div>
        </template>
      </template>
    </v-card-text>

    <!-- FOOTER CONFIRM -->
    <v-card-actions class="picker-footer">
      <div class="picked-seat text-dim text-caption" v-if="selected">
        Asiento seleccionado: <b class="text-accent">{{ selected }}</b>
      </div>
      <v-spacer />
      <v-btn class="btn-confirm" :disabled="!selected || busy" @click="confirm">Confirmar</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'
import api from '../services/api'

const props = defineProps({ modelValue: { type: String, default: '' } })
const emit  = defineEmits(['update:modelValue','select','close'])

const { smAndDown } = useDisplay()
const store = useSeatsStore()

const selected = ref(props.modelValue || '')
const busy = ref(false)
const globalLoading = ref(true)
const activeTab = ref('P')

const palcoMap = ref({
  1: { id: 1, name: 'PALCO PRINCIPAL', rows: [] },
  2: { id: 2, name: 'PALCO IZQUIERDO', rows: [] },
  3: { id: 3, name: 'PALCO DERECHO', rows: [] },
})

function transformSeatsResponse (data) {
  const rowsOut = (data.seats || []).map(arr => ({
    letter: arr[0]?.charAt(0) || '?',
    codes: arr
  }))
  return { id: data.palcoId, name: data.name, rows: rowsOut }
}
async function loadPalco (palcoId) {
  const { data } = await api.get(`/palcos/${palcoId}/seats`)
  palcoMap.value[palcoId] = transformSeatsResponse(data)
}

onMounted(async () => {
  await Promise.all([loadPalco(1), loadPalco(2), loadPalco(3), store.ensureLoaded?.()])
  globalLoading.value = false
})

/* rows */
const palcoPrincipalRows = computed(() => palcoMap.value[1]?.rows || [])
const palcoIzqRows       = computed(() => palcoMap.value[2]?.rows || [])
const palcoDerRows       = computed(() => palcoMap.value[3]?.rows || [])

/* meta */
const palcoPrincipalMeta = computed(() => ({ id: 1, name: palcoMap.value[1]?.name || 'PALCO PRINCIPAL' }))
const palcoIzqMeta       = computed(() => ({ id: 2, name: palcoMap.value[2]?.name || 'PALCO IZQUIERDO' }))
const palcoDerMeta       = computed(() => ({ id: 3, name: palcoMap.value[3]?.name || 'PALCO DERECHO' }))

/* split principal */
const LETTERS_LEFT  = ['A','C','E']
const LETTERS_RIGHT = ['B','D','F']

const palcoPrincipalLeftRows = computed(() => {
  const rows = palcoPrincipalRows.value || []
  return rows.filter(r => LETTERS_LEFT.includes((r.letter || '').toUpperCase()))
             .sort((a,b) => LETTERS_LEFT.indexOf(a.letter.toUpperCase()) - LETTERS_LEFT.indexOf(b.letter.toUpperCase()))
})
const palcoPrincipalRightRows = computed(() => {
  const rows = palcoPrincipalRows.value || []
  return rows.filter(r => LETTERS_RIGHT.includes((r.letter || '').toUpperCase()))
             .sort((a,b) => LETTERS_RIGHT.indexOf(a.letter.toUpperCase()) - LETTERS_RIGHT.indexOf(b.letter.toUpperCase()))
})

function seatStatusClass (code) {
  return store.seatStatus?.(code) || 'free'
}
function pick (code) {
  if (busy.value) return
  selected.value = code
  emit('update:modelValue', code)
}
function confirm () {
  if (!selected.value) return
  emit('select', selected.value)
}
</script>

<style scoped>
.card-contrast{ background:#0e1230 !important; border:1px solid rgba(255,217,81,.14); box-shadow:0 6px 18px rgba(0,0,0,.25); }
.title-contrast{ background:linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0)); border-bottom:1px solid rgba(255,217,81,.10); }
.text-dim{ color:rgba(234,240,255,.75); }
.text-accent{ color:#ffd951; font-weight:700; }
.chip-strong{ font-weight:700; color:#0b0d28 !important; }
.chip-outline{ color:#eaf0ff !important; border-color:rgba(234,240,255,.28) !important; background:rgba(234,240,255,.07) !important; box-shadow:0 4px 12px rgba(0,0,0,.6); font-weight:600; height:22px; line-height:1; border-radius:6px; padding:0 8px; font-size:12px; display:inline-flex; align-items:center; }

/* Tabs compactos */
.tabs-compact{ overflow-x:auto; }
.tab-compact{ text-transform:none !important; font-weight:700 !important; font-size:.78rem !important; letter-spacing:.02em !important; min-width:92px !important; padding:0 10px !important; height:34px !important; }
:deep(.v-tab.v-tab--selected){ background:rgba(255,217,81,.18) !important; box-shadow:inset 0 0 6px rgba(255,217,81,.25); color:#fff3bf !important; opacity:1 !important; font-weight:800 !important; }

/* LAYOUT */
.palcos-viewport{ overflow-x:auto; overflow-y:hidden; -webkit-overflow-scrolling:touch; }
.palcos-layout{ display:grid; grid-template-columns:1fr 2fr 1fr; gap:24px; width:100%; max-width:100%; }

.palco-block{ background:rgba(11,13,40,.5); border:1px solid rgba(255,217,81,.14); border-radius:16px; box-shadow:0 12px 32px rgba(0,0,0,.6); display:flex; flex-direction:column; min-width:0; }
.palco-header{ padding:12px 16px; background:#1a1d38; border-bottom:1px solid rgba(255,217,81,.18); border-top-left-radius:16px; border-top-right-radius:16px; color:#ffd951; font-size:.8rem; font-weight:600; text-transform:uppercase; letter-spacing:.03em; display:flex; align-items:center; justify-content:space-between; }
.palco-header-inner{ display:flex; align-items:center; font-weight:600; color:#ffd951; }
.palco-title{ line-height:1.2; }
.palco-body{ padding:16px; overflow-x:auto; }
.main-palco-body{ padding:0 16px 16px; background:#0f122a; }
.palco-footer{ font-size:.7rem; line-height:1.2; color:rgba(234,240,255,.55); border-top:1px solid rgba(255,217,81,.08); padding:8px 16px 12px; text-align:center; text-transform:uppercase; letter-spacing:.05em; }

/* grid */
.grid-rows-wrap{ overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:6px; }
.grid-rows{ display:flex; flex-direction:column-reverse; gap:12px; min-width:max(480px,100%); }
.row{ display:grid; grid-auto-flow:column; grid-template-columns:38px repeat(auto-fit, minmax(54px, 1fr)); gap:6px; align-items:center; }
.row-label{ position:sticky; left:0; z-index:1; text-align:center; font-weight:800; color:#0b0d28; background:#ffd951; border:1px solid rgba(255,217,81,.45); box-shadow:0 2px 6px rgba(0,0,0,.25); border-radius:8px; padding:5px 0; width:38px; font-size:.75rem; line-height:1.2; }
.seat{ min-width:54px; height:32px; border-radius:16px; font-weight:700; text-transform:none; box-shadow:0 1px 2px rgba(0,0,0,.25); background:#f3f5f9 !important; color:#0b0d28 !important; border:0 !important; font-size:.75rem; line-height:1.2; justify-content:center; padding:0 8px; }
.seat.present{ background:#4caf50 !important; color:#fff !important; }
.seat.assigned{ background:#ffb300 !important; color:#0b0d28 !important; }
.seat.seat-selected{ outline:2px solid #ffd951; outline-offset:0; box-shadow:0 0 8px rgba(255,217,81,.75); }

.principal-split{ display:grid; grid-template-columns: 1fr 28px 1fr; align-items:start; gap: 8px; }
.aisle-vert{ width:100%; height:100%; min-height:100px; border-left:2px dashed rgba(255,217,81,.35); border-right:2px dashed rgba(255,217,81,.35); border-radius:6px; }

/* MOBILE overrides */
@media (max-width: 900px){
  .grid-rows-wrap{ overflow-x:auto !important; overflow-y:hidden !important; -webkit-overflow-scrolling:touch; padding-bottom:6px; }
  .grid-rows{ display:flex !important; flex-direction:column !important; gap:10px !important; min-width:100% !important; overflow:visible !important; }
  .row{ display:grid !important; grid-template-columns:32px !important; grid-auto-flow:column !important; grid-auto-columns:52px !important; align-items:center !important; gap:6px !important; width:max-content !important; }
  .row-label{ width:32px !important; padding:4px 0 !important; font-size:.7rem !important; }
  .seat.v-btn{ min-width:52px !important; width:52px !important; height:30px !important; border-radius:14px !important; font-size:.7rem !important; padding:0 6px !important; }
  .principal-split{ grid-template-columns:1fr !important; }
  .aisle-vert{ height:18px !important; min-height:18px !important; border-left:0 !important; border-right:0 !important; border-top:2px dashed rgba(255,217,81,.35) !important; border-bottom:2px dashed rgba(255,217,81,.35) !important; }
}
/* footer */
.picker-footer{ background:rgba(11,13,40,.6); border-top:1px solid rgba(255,217,81,.24); box-shadow:0 -8px 24px rgba(0,0,0,.8); padding:16px 20px !important; border-bottom-left-radius:12px; border-bottom-right-radius:12px; display:flex; flex-wrap:wrap; align-items:center; gap:12px; }
.picked-seat{ font-weight:600; font-size:.8rem; line-height:1.3; color:rgba(234,240,255,.8); }
.btn-confirm{ background:#ffd951 !important; color:#0b0d28 !important; font-weight:800 !important; text-transform:none !important; letter-spacing:.02em; border-radius:10px !important; min-width:120px !important; min-height:40px !important; box-shadow:0 10px 24px rgba(0,0,0,.8), 0 0 10px rgba(255,217,81,.6); border:1px solid rgba(255,217,81,.4) !important; font-size:.9rem !important; line-height:1.2 !important; }
.btn-confirm.v-btn--disabled{ background:rgba(255,255,255,.08) !important; color:rgba(234,240,255,.3) !important; box-shadow:none !important; border:1px solid rgba(255,255,255,.12) !important; }
</style>
