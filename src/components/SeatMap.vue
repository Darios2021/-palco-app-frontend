<template>
  <!-- === MAPA 3 PALCOS / RESPONSIVE === -->
  <v-card rounded="xl" class="mb-6 card-contrast">
    <!-- HEADER -->
    <v-card-title class="d-flex align-center flex-wrap gap-2 title-contrast">
      <v-icon class="mr-2">mdi-seat</v-icon>
      <span class="text-truncate">Mapa de Asientos</span>

      <v-spacer />

      <div class="legend d-flex align-center gap-2">
        <v-chip label size="small" class="chip-strong chip-presente">Presente</v-chip>
        <v-chip label size="small" class="chip-strong chip-asignado">Asignado</v-chip>
        <v-chip variant="outlined" label size="small" class="chip-outline">Libre</v-chip>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="globalLoading" class="py-6 text-center text-dim">
        Cargando…
      </div>

      <template v-else>
        <!-- DESKTOP / TABLET ANCHA -->
        <template v-if="!smAndDown">
          <div class="palcos-viewport">
            <div class="palcos-layout">
              <!-- PALCO IZQUIERDO -->
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
                          :class="['seat', seatStatusClass(code)]"
                          variant="flat"
                          size="small"
                          :aria-label="`Asiento ${code}`"
                          @click="openSeat(code)"
                        >{{ code }}</v-btn>
                      </div>
                    </div>
                  </div>
                </div>

                <footer class="palco-footer">Sector lateral izquierdo (4×4)</footer>
              </section>

              <!-- PALCO PRINCIPAL -->
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
                        <div v-for="(row, rIdx) in palcoPrincipalLeftRows" :key="'P-L-'+rIdx" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="['seat', seatStatusClass(code)]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            @click="openSeat(code)"
                          >{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>

                    <div class="aisle-vert" aria-hidden="true"></div>

                    <!-- DERECHA: B/D/F -->
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="(row, rIdx) in palcoPrincipalRightRows" :key="'P-R-'+rIdx" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="['seat', seatStatusClass(code)]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            @click="openSeat(code)"
                          >{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <footer class="palco-footer">Autoridades alta prioridad (pasillo central)</footer>
              </section>

              <!-- PALCO DERECHO -->
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
                          :class="['seat', seatStatusClass(code)]"
                          variant="flat"
                          size="small"
                          :aria-label="`Asiento ${code}`"
                          @click="openSeat(code)"
                        >{{ code }}</v-btn>
                      </div>
                    </div>
                  </div>
                </div>

                <footer class="palco-footer">Sector lateral derecho (4×6)</footer>
              </section>
            </div>
          </div>
        </template>

        <!-- MOBILE (tabs con el MISMO look del SeatPickerDialog) -->
        <template v-else>
          <div class="palcos-tabs-wrap">
            <v-tabs
              v-model="activeTab"
              class="palcos-tabs tabs-compact"
              density="compact"
              slider-color="#ffd951"
              show-arrows
              center-active
            >
              <v-tab value="IZQ" class="tab-compact">IZQ</v-tab>
              <v-tab value="P" class="tab-compact">PRINCIPAL</v-tab>
              <v-tab value="DER" class="tab-compact">DER</v-tab>
            </v-tabs>

            <!-- ⛔ Sin swipe para no chocar con scroll horizontal -->
            <v-window v-model="activeTab" class="palcos-window" :touch="false">
              <!-- IZQ -->
              <v-window-item value="IZQ" class="palco-window-item">
                <section class="palco-block">
                  <header class="palco-header">
                    <div class="palco-header-inner">
                      <v-icon size="18" class="mr-1">mdi-seat</v-icon>
                      <span class="palco-title">{{ palcoIzqMeta.name }}</span>
                    </div>
                  </header>

                  <div class="palco-body">
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="(row, rIdx) in palcoIzqRows" :key="'IZQ-m-'+rIdx" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="['seat', seatStatusClass(code)]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            @click="openSeat(code)"
                          >{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer class="palco-footer">Lateral izquierdo (4×4)</footer>
                </section>
              </v-window-item>

              <!-- PRINCIPAL -->
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
                      <!-- IZQ: A/C/E -->
                      <div class="grid-rows-wrap">
                        <div class="grid-rows">
                          <div v-for="(row, rIdx) in palcoPrincipalLeftRows" :key="'P-L-m-'+rIdx" class="row">
                            <div class="row-label">{{ row.letter }}</div>
                            <v-btn
                              v-for="code in row.codes"
                              :key="code"
                              :class="['seat', seatStatusClass(code)]"
                              variant="flat"
                              size="small"
                              :aria-label="`Asiento ${code}`"
                              @click="openSeat(code)"
                            >{{ code }}</v-btn>
                          </div>
                        </div>
                      </div>

                      <div class="aisle-vert" aria-hidden="true"></div>

                      <!-- DER: B/D/F -->
                      <div class="grid-rows-wrap">
                        <div class="grid-rows">
                          <div v-for="(row, rIdx) in palcoPrincipalRightRows" :key="'P-R-m-'+rIdx" class="row">
                            <div class="row-label">{{ row.letter }}</div>
                            <v-btn
                              v-for="code in row.codes"
                              :key="code"
                              :class="['seat', seatStatusClass(code)]"
                              variant="flat"
                              size="small"
                              :aria-label="`Asiento ${code}`"
                              @click="openSeat(code)"
                            >{{ code }}</v-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer class="palco-footer">Pasillo central</footer>
                </section>
              </v-window-item>

              <!-- DER -->
              <v-window-item value="DER" class="palco-window-item">
                <section class="palco-block">
                  <header class="palco-header">
                    <div class="palco-header-inner">
                      <v-icon size="18" class="mr-1">mdi-seat-outline</v-icon>
                      <span class="palco-title">{{ palcoDerMeta.name }}</span>
                    </div>
                  </header>

                  <div class="palco-body">
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="(row, rIdx) in palcoDerRows" :key="'DER-m-'+rIdx" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="['seat', seatStatusClass(code)]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            @click="openSeat(code)"
                          >{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer class="palco-footer">Lateral derecho (4×6)</footer>
                </section>
              </v-window-item>
            </v-window>
          </div>
        </template>
      </template>
    </v-card-text>
  </v-card>

  <!-- === TABLA: PRESENTES EN EL PALCO === -->
  <v-card rounded="xl" elevation="2" class="card-contrast">
    <v-card-title class="d-flex flex-wrap align-start gap-2 title-contrast">
      <div class="d-flex align-center flex-wrap gap-2">
        <v-icon class="mr-2">mdi-account-check</v-icon>
        <span class="text-truncate">Presentes en el palco</span>
        <v-chip class="chip-count" color="success" label>{{ visibleRows.length }}</v-chip>
        <v-chip size="small" label class="chip-outline ml-2">
          {{ currentSectorLabel }}
        </v-chip>
      </div>

      <v-spacer />

      <!-- Tabs sincronizados con el mapa (arriba) -->
      <div class="table-tabs">
        <v-tabs
          v-model="activeTab"
          class="tabs-compact"
          density="compact"
          slider-color="#ffd951"
        >
          <v-tab value="IZQ" class="tab-compact">IZQ</v-tab>
          <v-tab value="P" class="tab-compact">PRINCIPAL</v-tab>
          <v-tab value="DER" class="tab-compact">DER</v-tab>
        </v-tabs>
      </div>

      <div class="title-actions">
        <v-text-field
          v-model="q"
          prepend-inner-icon="mdi-magnify"
          label="Buscar (nombre / cargo / organismo / asiento)"
          hide-details
          single-line
          density="comfortable"
          class="search-input"
        />
        <v-btn
          variant="tonal"
          size="small"
          icon="mdi-file-pdf-box"
          class="btn-tonal btn-icon"
          :title="'Exportar PDF'"
          @click="exportPDF"
        />
      </div>
    </v-card-title>

    <div class="table-wrap">
      <v-data-table
        :headers="headers"
        :items="filteredRows"
        :items-per-page="itemsPerPage"
        class="present-table"
        hover
        fixed-header
        :height="tableHeight"
        :mobile-breakpoint="0"
        density="comfortable"
      >
        <template #bottom></template>

        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="28" class="mr-2 avatar-contrast">
              <span class="avatar">{{ initials(item.name) }}</span>
            </v-avatar>
            <div class="font-weight-600 text-truncate">{{ item.name }}</div>
          </div>
        </template>

        <template #item.seat="{ item }">
          <v-chip color="success" size="x-small" label class="font-weight-600 chip-table">
            {{ item.seat }}
          </v-chip>
        </template>

        <template #item.presentAt="{ item }">
          <div class="d-flex align-center text-dim nowrap">
            <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
            <span class="font-mono">{{ formatDateTime(item.presentAt, smForTable.value) }}</span>
          </div>
        </template>

        <template #no-data>
          <div class="py-8 text-medium-emphasis">Aún no hay presentes en este sector.</div>
        </template>
      </v-data-table>
    </div>
  </v-card>

  <!-- === MODAL DETALLE DE ASIENTO === -->
  <v-dialog v-model="dialog" max-width="520">
    <v-card rounded="xl" class="card-contrast">
      <v-card-title class="d-flex align-center title-contrast">
        <v-icon class="mr-2">mdi-seat</v-icon>
        Asiento {{ currentSeat }}
        <v-spacer />
        <v-chip v-if="currentStatus === 'present'" size="small" color="success" label class="chip-strong">Presente</v-chip>
        <v-chip v-else-if="currentStatus === 'assigned'" size="small" color="warning" label class="chip-strong">Asignado</v-chip>
        <v-chip v-else size="small" variant="outlined" label class="chip-outline">Libre</v-chip>
      </v-card-title>

      <v-divider class="divider-contrast" />

      <v-card-text class="py-5">
        <template v-if="holder">
          <div class="d-flex align-center">
            <v-avatar size="40" class="mr-3 avatar-contrast">
              <span class="avatar">{{ initials(holder.name) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ holder.name }}</div>
              <div class="text-dim">{{ [holder.org, holder.doc].filter(Boolean).join(' · ') || '—' }}</div>
            </div>
          </div>

          <v-alert v-if="holder.present" type="success" variant="tonal" class="mt-4 alert-contrast" border="start" rounded="lg">
            Ingresó al palco: <b>{{ formatDateTime(holder.presentAt) }}</b>
          </v-alert>

          <v-alert v-else type="warning" variant="tonal" class="mt-4 alert-contrast" border="start" rounded="lg">
            Asiento asignado, aún <b>no ingresó</b>.
          </v-alert>
        </template>

        <template v-else>
          <v-alert variant="tonal" border="start" rounded="lg" class="alert-contrast">
            Este asiento está <b>libre</b>.
          </v-alert>
        </template>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" class="btn-text" @click="dialog=false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, ref, onBeforeUnmount } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore, usePeopleStore } from '@/stores'
import api from '@/services/api'

/* ===== Breakpoints ===== */
const { smAndDown } = useDisplay()
const { smAndDown: smForTable } = useDisplay()

/* ===== Stores ===== */
const seats = useSeatsStore()
const people = usePeopleStore()

/* ===== Helpers ===== */
function letterFor(index) { return String.fromCharCode('A'.charCodeAt(0) + index) }
// Remapea las letras de las filas empezando en la letra indicada (conserva orden y códigos)
function remapLetters(rows = [], startLetter = 'A') {
  const base = startLetter.charCodeAt(0)
  return rows.map((r, i) => ({ ...r, letter: String.fromCharCode(base + i) }))
}

/* ===== Palcos (layout) ===== */
const palcoMap = ref({
  1: { id: 1, name: 'PALCO PRINCIPAL', rows: [] },
  2: { id: 2, name: 'PALCO IZQUIERDO', rows: [] },
  3: { id: 3, name: 'PALCO DERECHO', rows: [] },
})

const globalLoading = ref(true)
const activeTab = ref('P') // IZQ | P | DER

/* Igual que en SeatPicker: filtra filas vacías y numera por índice */
function transformSeatsResponse (data) {
  const seatsArr = Array.isArray(data?.seats) ? data.seats : []
  const rowsOut = seatsArr
    .map((rowArr, idx) => {
      const codes = (rowArr || []).filter(code => code && typeof code === 'string')
      return codes.length ? { letter: letterFor(idx), codes } : null
    })
    .filter(Boolean)
  return { id: data.palcoId, name: data.name, rows: rowsOut }
}

async function loadPalco (palcoId) {
  const { data } = await api.get(`/palcos/${palcoId}/seats`)
  palcoMap.value[palcoId] = transformSeatsResponse(data)
}

/* seat -> palcoId */
const seatToPalcoId = ref({})
function rebuildSeatToPalco () {
  const map = {}
  Object.keys(palcoMap.value).forEach(pid => {
    const palco = palcoMap.value[Number(pid)]
    palco?.rows?.forEach(row => row.codes.forEach(code => { map[code] = Number(pid) }))
  })
  seatToPalcoId.value = map
}

/* ==== Carga inicial + suscripciones ==== */
let unsubscribePeople = null
let unActionPeople = null
let autoPull = null

onMounted(async () => {
  await seats.ensureLoaded().catch(() => {})

  await Promise.all([loadPalco(1), loadPalco(2), loadPalco(3)])
  rebuildSeatToPalco()
  globalLoading.value = false

  // suscripción reactiva: si cambia people.list, refresca status
  unsubscribePeople = people.$subscribe(() => {
    seats._rebuildStatusFromPeople(people.list)
  }, { detached: true })

  const touch = new Set(['markPresent', 'updatePerson', 'createPerson', 'fetchAll'])
  unActionPeople = people.$onAction(({ name, after }) => {
    if (!touch.has(name)) return
    after(() => seats._rebuildStatusFromPeople(people.list))
  })

  // auto-pull cada 15 s (multiusuario)
  autoPull = setInterval(() => people.fetchAll().catch(()=>{}), 15000)
})

onBeforeUnmount(() => {
  if (unsubscribePeople) unsubscribePeople()
  if (unActionPeople) unActionPeople()
  if (autoPull) clearInterval(autoPull)
})

/* ===== Computed filas ===== */
const ALLOWED_PRINCIPAL_LETTERS = new Set(['A','B','C','D','E','F'])

const palcoPrincipalRows = computed(() =>
  (palcoMap.value[1]?.rows || [])
    .filter(r => r?.codes?.length)
    .filter(r => ALLOWED_PRINCIPAL_LETTERS.has(r.letter))  // ⛔ excluye G
)

// Base laterales (tal cual backend, solo filtradas)
const palcoIzqRowsBase = computed(() => (palcoMap.value[2]?.rows || []).filter(r => r?.codes?.length))
const palcoDerRowsBase = computed(() => (palcoMap.value[3]?.rows || []).filter(r => r?.codes?.length))

// ✅ Laterales con letras correctas: IZQ = G,H,I — DER = J,K,L (ascendente de abajo hacia arriba)
const palcoIzqRows = computed(() => remapLetters(palcoIzqRowsBase.value, 'G'))
const palcoDerRows = computed(() => remapLetters(palcoDerRowsBase.value, 'J'))

/* ======= META ======= */
const palcoPrincipalMeta = computed(() => ({ id: 1, name: palcoMap.value[1]?.name || 'PALCO PRINCIPAL' }))
const palcoIzqMeta       = computed(() => ({ id: 2, name: palcoMap.value[2]?.name || 'PALCO IZQUIERDO' }))
const palcoDerMeta       = computed(() => ({ id: 3, name: palcoMap.value[3]?.name || 'PALCO DERECHO' }))

/* ===== Orden PALCO PRINCIPAL (A/C/E vs B/D/F por paridad) ===== */
const palcoPrincipalLeftRows = computed(() =>
  (palcoPrincipalRows.value || []).filter(r => (r.letter.charCodeAt(0) - 65) % 2 === 0)
)
const palcoPrincipalRightRows = computed(() =>
  (palcoPrincipalRows.value || []).filter(r => (r.letter.charCodeAt(0) - 65) % 2 === 1)
)

/* ===== Tabla de presentes ===== */
const headers = [
  { title: 'Asiento',   key: 'seat',      sortable: true },
  { title: 'Nombre',    key: 'name',      sortable: true },
  { title: 'Cargo',     key: 'cargo',     sortable: true },
  { title: 'Organismo', key: 'org',       sortable: true },
  { title: 'Ingreso',   key: 'presentAt', sortable: true },
]

const tabToPalcoId = { IZQ: 2, P: 1, DER: 3 }

const presentRowsByPalco = computed(() => {
  const acc = { 1: [], 2: [], 3: [] }
  ;(people.list || []).forEach(p => {
    if (!p.present) return
    const code = p.seat ?? p.seatCode ?? p.seat_code
    if (!code) return
    const pid = seatToPalcoId.value[code]
    if (!pid) return
    acc[pid].push({
      name: p.name,
      seat: code,
      org:  p.org ?? p.organismo ?? p.organization,
      cargo: p.cargo ?? p.role ?? p.position ?? p.cargoName ?? '',
      presentAt: p.presentAt
    })
  })
  Object.keys(acc).forEach(pid =>
    acc[pid].sort((a,b) => (a.presentAt || '').localeCompare(b.presentAt || ''))
  )
  return acc
})

const currentPalcoId = computed(() => tabToPalcoId[activeTab.value] || 1)
const currentSectorLabel = computed(() =>
  currentPalcoId.value === 1 ? 'PRINCIPAL'
  : currentPalcoId.value === 2 ? 'IZQ'
  : 'DER'
)

const visibleRows = computed(() => presentRowsByPalco.value[currentPalcoId.value] || [])

const q = ref('')
const filteredRows = computed(() => {
  const needle = q.value.trim().toLowerCase()
  if (!needle) return visibleRows.value
  return visibleRows.value.filter(r =>
    [r.name, r.cargo, r.org, r.seat].filter(Boolean).join(' ').toLowerCase().includes(needle)
  )
})

/* Tabla responsive */
const tableHeight  = computed(() => (smForTable.value ? 340 : 420))
const itemsPerPage = computed(() => (smForTable.value ? 10  : 25))

/* Estado visual de cada asiento */
function seatStatusClass (code) {
  return seats.seatStatus?.(code) || 'free' // 'present' | 'assigned' | 'free'
}

/* Modal detalle asiento */
const dialog = ref(false)
const currentSeat = ref(null)
const holder = computed(() => currentSeat.value ? seats.seatHolder(currentSeat.value) : null)
const currentStatus = computed(() => currentSeat.value ? (seats.seatStatus(currentSeat.value) || 'free') : 'free')
function openSeat (code) { currentSeat.value = code; dialog.value = true }

/* Utils */
const initials = (name = '') => String(name).trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('')
function formatDateTime (iso, compact = false) {
  if (!iso) return '—'
  try {
    const dt = new Date(iso)
    if (compact) {
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
      }).format(dt).replace(',', '')
    }
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium', timeStyle: 'short', hour12: false
    }).format(dt).replace(',', '')
  } catch { return iso }
}

/* Export HTML */
function exportPDF () {
  const rows = filteredRows.value
  if (!rows.length) { alert('No hay datos para exportar.'); return }

  const palcoName =
    currentPalcoId.value === 1 ? (palcoPrincipalMeta.value.name || 'Principal')
      : currentPalcoId.value === 2 ? (palcoIzqMeta.value.name || 'Palco Izquierdo')
      : (palcoDerMeta.value.name || 'Palco Derecho')

  const htmlRows = rows.map(r => (
    '<tr>' +
      '<td>' + (r.seat || '') + '</td>' +
      '<td>' + String(r.name || '').replace(/</g, '&lt;') + '</td>' +
      '<td>' + String(r.cargo || '') + '</td>' +
      '<td>' + String(r.org || '').replace(/</g, '&lt;') + '</td>' +
      '<td>' + formatDateTime(r.presentAt) + '</td>' +
    '</tr>'
  )).join('')

  const html =
    '<!doctype html><html><head><meta charset="utf-8"/>' +
    '<title>Presentes - ' + palcoName + '</title>' +
    '<style>@page{size:A4;margin:14mm;}body{font-family:Arial,Helvetica,sans-serif;color:#0b0d28;}h1{font-size:18px;margin:0 0 6px 0;}h2{font-size:12px;margin:0 0 10px 0;color:#333;}table{width:100%;border-collapse:collapse;font-size:11px;}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;}th{background:#0b0d28;color:#ffd951;}tr:nth-child(odd) td{background:#fafafa;}.muted{color:#666;}</style>' +
    '</head><body>' +
    '<h1>Presentes en Palco</h1>' +
    '<h2 class="muted">Palco: ' + palcoName + ' · Generado: ' + new Date().toLocaleString('es-AR') + '</h2>' +
    '<table><thead><tr><th>Asiento</th><th>Nombre</th><th>Cargo</th><th>Organismo</th><th>Ingreso</th></tr></thead><tbody>' +
    htmlRows +
    '</tbody></table>' +
    '</body></html>'

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'presentes-' + palcoName + '.html'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>


<style scoped>
/* ===== Card / fondo oscuro dorado ===== */
.card-contrast {
  background: #0e1230 !important;
  border: 1px solid rgba(255, 217, 81, .14);
  box-shadow: 0 3px 10px rgba(0,0,0,.25);
}
.title-contrast {
  background: linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0));
  border-bottom: 1px solid rgba(255,217,81,.10);
  padding: 6px 10px !important;
  font-size: .78rem !important;
}
.divider-contrast { border-color: rgba(255,217,81,.10) !important; }
.text-dim { color: rgba(234,240,255, .7); }

/* Botón EXPORTAR */
.btn-tonal {
  background: rgba(255,217,81,.12) !important;
  color: #ffd951 !important;
  border: 1px solid rgba(255,217,81,.24) !important;
}
.btn-icon{
  width:26px !important; height:26px !important; min-width:26px !important;
  border-radius:7px !important; padding:0 !important;
  display:flex; align-items:center; justify-content:center;
}
.btn-icon :deep(.v-icon){ font-size:16px !important; }

/* ===== LEYENDA / Chips ===== */
.chip-strong {
  background: rgba(255,217,81,.12) !important;
  color: #ffd951 !important;
  border: 1px solid rgba(255,217,81,.24) !important;
  font-weight: 600 !important;
}
.chip-presente {
  background: rgba(76, 175, 80, .15) !important;
  color: #9be89b !important;
  border: 1px solid rgba(76, 175, 80, .3) !important;
}
.chip-asignado {
  background: rgba(255, 152, 0, .15) !important;
  color: #ffda9b !important;
  border: 1px solid rgba(255, 152, 0, .3) !important;
}
.chip-outline {
  color: #eaf0ff !important;
  border-color: rgba(234,240,255,.26) !important;
  background: rgba(234,240,255,.06) !important;
  box-shadow: 0 3px 10px rgba(0,0,0,.5);
  font-weight: 600;
  height: 18px; line-height: 1;
  border-radius: 5px;
  padding: 0 5px; font-size: 10px;
  display: inline-flex;
}
.chip-count { font-weight: 700; color: #eaf0ff !important; background: #1b5e20 !important; }

/* ===== TABS compactas ===== */
.palcos-tabs{ border-bottom: 1px solid rgba(255,217,81,.12); margin-bottom: 5px; }
.tab-compact{
  text-transform:none !important; font-weight:700 !important;
  font-size:.65rem !important;
  min-width:72px !important; padding:0 6px !important; height:26px !important;
}

/* ===== LAYOUT 3 PALCOS ===== */
.palcos-viewport{ overflow-x:auto; overflow-y:hidden; -webkit-overflow-scrolling:touch; }
.palcos-layout{ display:grid; grid-template-columns:0.8fr 2.4fr 0.8fr; gap:12px; width:100%; }

/* Bloques */
.palco-block{
  background: rgba(11,13,40,.5);
  border: 1px solid rgba(255,217,81,.14);
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0,0,0,.5);
  display: flex; flex-direction: column; min-width: 0;
}
.palco-header{
  padding: 6px 10px;
  background:#1a1d38; border-bottom:1px solid rgba(255,217,81,.18);
  border-top-left-radius: 10px; border-top-right-radius: 10px;
  color:#ffd951; font-size:.68rem; font-weight:600;
  display:flex; align-items:center; justify-content:space-between;
}
.palco-body{ padding:10px; overflow-x:auto; }
.main-palco-body{ padding:0 10px 10px; background:#0f122a; }
.palco-footer{
  font-size:.6rem; line-height:1.2; color:rgba(234,240,255,.55);
  border-top:1px solid rgba(255,217,81,.08); padding:5px 10px 8px;
  text-align:center; text-transform:uppercase; letter-spacing:.04em;
}

/* ===== GRID FILAS + ASIENTOS (base) ===== */
.grid-rows-wrap{ overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:3px; }
.grid-rows{ display:flex; flex-direction:column-reverse; gap:6px; min-width:max(380px,100%); }
.row{
  display:grid; grid-auto-flow:column;
  grid-template-columns:30px repeat(auto-fit, minmax(42px, 1fr));
  gap:3px; align-items:center;
}
.row-label{
  position:sticky; left:0; z-index:1; text-align:center; font-weight:700; color:#0b0d28;
  background:#ffd951; border:1px solid rgba(255,217,81,.4);
  box-shadow:0 2px 5px rgba(0,0,0,.25);
  border-radius:6px; padding:3px 0;
  width:30px; font-size:.6rem; line-height:1;
}
.seat{
  min-width:42px; height:24px; border-radius:10px; font-weight:600;
  box-shadow:0 1px 2px rgba(0,0,0,.25);
  background:#f3f5f9 !important; color:#0b0d28 !important;
  border:0 !important; font-size:.6rem; line-height:1;
  justify-content:center; padding:0 4px;
}
.seat.present{ background:#4caf50 !important; color:#fff !important; }
.seat.assigned{ background:#ffb300 !important; color:#0b0d28 !important; }

/* ===== PASILLO CENTRAL (global levemente más fino) ===== */
.principal-split{
  display:grid;
  grid-template-columns: 1fr 18px 1fr; /* 20px -> 18px */
  align-items:start; gap:4px;           /* 5px -> 4px */
}
.aisle-vert{
  width:100%; height:100%; min-height:100px;
  border-left:2px dashed rgba(255,217,81,.35);
  border-right:2px dashed rgba(255,217,81,.35);
  border-radius:3px;
}

/* ======== OVERRIDES SOLO PARA PALCO PRINCIPAL (más compacto) ======== */
.palco-principal .grid-rows{ gap:5px; min-width:max(360px,100%); }  /* 380 -> 360 */
.palco-principal .row{
  grid-template-columns:26px repeat(auto-fit, minmax(38px, 1fr));  /* 30/42 -> 26/38 */
  gap:2px;
}
.palco-principal .row-label{
  width:26px; font-size:.56rem; padding:2px 0; border-radius:5px;
}
.palco-principal .seat.v-btn{
  min-width:38px; width:38px; height:22px;
  font-size:.56rem; border-radius:9px; padding:0 3px;
}

/* ===== TABLA ===== */
.table-wrap{ width:100%; overflow-x:auto; }
.present-table :deep(thead th){
  background:#0e1230 !important; color:#eaf0ff !important;
  border-bottom:1px solid rgba(255,217,81,.14) !important;
  font-size:.7rem !important; padding:5px 6px !important;
}
.present-table :deep(td){
  border-bottom:1px solid rgba(255,217,81,.06) !important;
  font-size:.68rem !important; padding:4px 6px !important;
}

/* ===== MOBILE ===== */
@media (max-width:900px){
  .legend :deep(.v-chip){ height:16px; font-size:9.5px; padding:0 4px !important; }

  .grid-rows-wrap{
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 3px;
  }
  .grid-rows{
    gap: 5px !important;
    min-width: max(340px, 100%) !important;
  }
  .row{
    grid-template-columns: 24px repeat(auto-fit, minmax(38px, 1fr)) !important;
    grid-auto-flow: column !important;
    align-items: center !important;
    gap: 3px !important;
  }
  .row-label{
    width: 24px !important;
    padding: 2px 0 !important;
    font-size: .55rem !important;
  }
  .seat.v-btn{
    min-width: 38px !important;
    width: 38px !important;
    height: 22px !important;
    border-radius: 9px !important;
    font-size: .55rem !important;
    padding: 0 3px !important;
  }
  .principal-split{
    grid-template-columns: 1fr 18px 1fr !important;
    gap: 4px !important;
  }

  /* Overrides SOLO para el principal en móvil */
  .palco-principal .grid-rows{ gap:4px !important; min-width:max(320px,100%) !important; }
  .palco-principal .row{
    grid-template-columns:22px repeat(auto-fit, minmax(34px, 1fr)) !important;
    gap:2px !important;
  }
  .palco-principal .row-label{
    width:22px !important; font-size:.52rem !important; padding:2px 0 !important;
  }
  .palco-principal .seat.v-btn{
    min-width:34px !important; width:34px !important; height:20px !important;
    font-size:.52rem !important; border-radius:8px !important; padding:0 2px !important;
  }
}
</style>


