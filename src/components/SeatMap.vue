<template>
  <!-- === MAPA 3 PALCOS / RESPONSIVE === -->
  <v-card rounded="xl" class="mb-6 card-contrast">
    <!-- HEADER -->
    <v-card-title class="d-flex align-center flex-wrap gap-2 title-contrast">
      <v-icon class="mr-2">mdi-seat</v-icon>
      <span class="text-truncate">Mapa de Asientos</span>

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
                        :class="['seat', seatStatusClass(code)]"
                        variant="flat"
                        size="small"
                        :aria-label="`Asiento ${code}`"
                        @click="openSeat(code)"
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
                        :class="['seat', seatStatusClass(code)]"
                        variant="flat"
                        size="small"
                        :aria-label="`Asiento ${code}`"
                        @click="openSeat(code)"
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
                        :class="['seat', seatStatusClass(code)]"
                        variant="flat"
                        size="small"
                        :aria-label="`Asiento ${code}`"
                        @click="openSeat(code)"
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
                            :class="['seat', seatStatusClass(code)]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            @click="openSeat(code)"
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
                            :class="['seat', seatStatusClass(code)]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            @click="openSeat(code)"
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
                            :class="['seat', seatStatusClass(code)]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            @click="openSeat(code)"
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
  </v-card>

  <!-- === TABLA: PRESENTES EN EL PALCO === -->
  <v-card rounded="xl" elevation="2" class="card-contrast">
    <v-card-title class="d-flex flex-wrap align-start gap-2 title-contrast">
      <div class="d-flex align-center flex-wrap gap-2">
        <v-icon class="mr-2">mdi-account-check</v-icon>
        <span class="text-truncate">Presentes en el palco</span>

        <!-- contador del palco activo -->
        <v-chip class="chip-count" color="success" label>
          {{ visibleRows.length }}
        </v-chip>
      </div>

      <v-spacer />

      <!-- selector de palco para la TABLA -->
      <div class="table-palco-tabs">
        <v-tabs
          v-model="activePalcoTab"
          density="comfortable"
          slider-color="#ffd951"
          class="table-tabs-inner"
        >
          <v-tab value="1" class="tab-btn-mini">
            {{ palcoPrincipalMeta.name || 'PRINCIPAL' }}
          </v-tab>
          <v-tab value="2" class="tab-btn-mini">
            {{ palcoAmeta.name || 'PALCO A' }}
          </v-tab>
          <v-tab value="3" class="tab-btn-mini">
            {{ palcoBmeta.name || 'PALCO B' }}
          </v-tab>
        </v-tabs>
      </div>

      <div class="title-actions">
        <v-text-field
          v-model="q"
          prepend-inner-icon="mdi-magnify"
          label="Buscar (nombre / DNI / organismo / asiento)"
          hide-details
          single-line
          density="comfortable"
          class="search-input"
        />
        <v-btn
          variant="tonal"
          prepend-icon="mdi-file-delimited"
          class="btn-tonal"
          @click="exportCSV"
        >
          EXPORTAR CSV
        </v-btn>
      </div>
    </v-card-title>

    <div class="table-wrap">
      <v-data-table
        :headers="headers"
        :items="filteredRows"
        :items-per-page="50"
        class="present-table"
        hover
        fixed-header
        :height="tableHeight"
        density="comfortable"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-3 avatar-contrast">
              <span class="avatar">{{ initials(item.name) }}</span>
            </v-avatar>
            <div class="font-weight-600 text-truncate">{{ item.name }}</div>
          </div>
        </template>

        <template #item.seat="{ item }">
          <v-chip
            color="success"
            size="small"
            label
            class="font-weight-600 chip-table"
          >
            {{ item.seat }}
          </v-chip>
        </template>

        <template #item.presentAt="{ item }">
          <div class="d-flex align-center text-dim">
            <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
            <span class="font-mono">{{ formatDateTime(item.presentAt) }}</span>
          </div>
        </template>

        <template #no-data>
          <div class="py-8 text-medium-emphasis">
            Aún no hay presentes en este palco.
          </div>
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
        <v-chip
          v-if="currentStatus === 'present'"
          size="small"
          color="success"
          label
          class="chip-strong"
        >
          Presente
        </v-chip>

        <v-chip
          v-else-if="currentStatus === 'assigned'"
          size="small"
          color="warning"
          label
          class="chip-strong"
        >
          Asignado
        </v-chip>

        <v-chip
          v-else
          size="small"
          variant="outlined"
          label
          class="chip-outline"
        >
          Libre
        </v-chip>
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
              <div class="text-dim">
                {{ [holder.org, holder.doc].filter(Boolean).join(' · ') || '—' }}
              </div>
            </div>
          </div>

          <v-alert
            v-if="holder.present"
            type="success"
            variant="tonal"
            class="mt-4 alert-contrast"
            border="start"
            rounded="lg"
          >
            Ingresó al palco:
            <b>{{ formatDateTime(holder.presentAt) }}</b>
          </v-alert>

          <v-alert
            v-else
            type="warning"
            variant="tonal"
            class="mt-4 alert-contrast"
            border="start"
            rounded="lg"
          >
            Asiento asignado, aún <b>no ingresó</b>.
          </v-alert>
        </template>

        <template v-else>
          <v-alert
            variant="tonal"
            border="start"
            rounded="lg"
            class="alert-contrast"
          >
            Este asiento está <b>libre</b>.
          </v-alert>
        </template>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" class="btn-text" @click="dialog=false">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'
import api from '../services/api'

/* ===== Breakpoint ===== */
const { smAndDown } = useDisplay()

/* ===== Store de personas / presencia ===== */
const store = useSeatsStore()

/*
  palcoMap[id] = {
    id,
    name,
    rows: [
      { letter:'A', codes:['A1','A2',...] },
      { letter:'B', codes:['B1','B2',...] },
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

/* tabs del mapa mobile */
const activeTab = ref('P') // P = principal

/* tabs de la TABLA de presentes */
const activePalcoTab = ref('1') // "1" | "2" | "3"

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

// GET /api/palcos/:id/seats
async function loadPalco(palcoId) {
  const { data } = await api.get(`/palcos/${palcoId}/seats`)
  palcoMap.value[palcoId] = transformSeatsResponse(data)
}

/* seatToPalcoId: { "A6":1, "B3":2, ... } */
const seatToPalcoId = ref({})

function rebuildSeatToPalco() {
  const map = {}
  for (const palcoIdStr of Object.keys(palcoMap.value)) {
    const palcoIdNum = Number(palcoIdStr)
    const palco = palcoMap.value[palcoIdNum]
    palco?.rows?.forEach(row => {
      row.codes.forEach(code => {
        map[code] = palcoIdNum
      })
    })
  }
  seatToPalcoId.value = map
}

/* load data inicial */
onMounted(async () => {
  await Promise.all([
    loadPalco(1),
    loadPalco(2),
    loadPalco(3),
    store.ensureLoaded(),
  ])
  rebuildSeatToPalco()
  globalLoading.value = false
})

/* ===== Computed para cada palco (mapa visual) ===== */
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

/* ===== Estado visual de cada asiento =====
   store.seatStatus(code) -> "present" | "assigned" | "free"
*/
function seatStatusClass(code) {
  const st = store.seatStatus?.(code)
  return st || 'free'
}

/* ===== Modal detalle asiento ===== */
const dialog = ref(false)
const currentSeat = ref(null)

const holder = computed(() =>
  currentSeat.value ? store.seatHolder(currentSeat.value) : null
)

const currentStatus = computed(() =>
  currentSeat.value ? (store.seatStatus(currentSeat.value) || 'free') : 'free'
)

function openSeat(code) {
  currentSeat.value = code
  dialog.value = true
}

/* ===== Tabla Presentes (por palco) ===== */
const headers = [
  { title: 'Asiento',   key: 'seat',      sortable: true },
  { title: 'Nombre',    key: 'name',      sortable: true },
  { title: 'DNI',       key: 'doc',       sortable: true },
  { title: 'Organismo', key: 'org',       sortable: true },
  { title: 'Ingreso',   key: 'presentAt', sortable: true },
]

/*
  presentRowsByPalco = {
    1: [...personas en palcoId 1...],
    2: [...],
    3: [...]
  }

  criterio:
  - persona.present === true  (ya entró)
  - seatToPalcoId[persona.seat] === palcoId
*/
const presentRowsByPalco = computed(() => {
  const acc = { 1: [], 2: [], 3: [] }

  store.people.forEach(p => {
    if (!p.present) return
    const palcoId = seatToPalcoId.value[p.seat]
    if (!palcoId) return
    if (!acc[palcoId]) acc[palcoId] = []

    acc[palcoId].push({
      name: p.name,
      seat: p.seat,
      org: p.org,
      doc: p.doc,
      presentAt: p.presentAt
    })
  })

  // ordenamos cada lista por hora de ingreso
  for (const pid of Object.keys(acc)) {
    acc[pid].sort((a,b) =>
      (a.presentAt || '').localeCompare(b.presentAt || '')
    )
  }

  return acc
})

/* filas visibles según pestaña activa en la tabla */
const visibleRows = computed(() => {
  return presentRowsByPalco.value[Number(activePalcoTab.value)] || []
})

/* búsqueda */
const q = ref('')
const filteredRows = computed(() => {
  const needle = q.value.trim().toLowerCase()
  if (!needle) return visibleRows.value
  return visibleRows.value.filter(r =>
    [r.name, r.doc, r.org, r.seat]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(needle)
  )
})

/* ===== Tabla height ===== */
const { smAndDown: smForTable } = useDisplay()
const tableHeight = computed(() => (smForTable.value ? 360 : 420))

/* ===== Utils ===== */
const initials = (name = '') => {
  const p = String(name).trim().split(/\s+/).slice(0, 2)
  return p.map(s => s[0]?.toUpperCase() || '').join('')
}

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    const dt = new Date(iso)
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(dt)
  } catch {
    return iso
  }
}

/* ===== Export CSV: exporta lo filtrado del palco actual ===== */
function exportCSV() {
  const rows = filteredRows.value
  const header = ['Asiento','Nombre','DNI','Organismo','Ingreso']

  const csv = [
    header.join(','),
    ...rows.map(r => [
      r.seat || '',
      `"${(r.name || '').replace(/"/g, '""')}"`,
      r.doc || '',
      `"${(r.org || '').replace(/"/g, '""')}"`,
      formatDateTime(r.presentAt)
    ].join(','))
  ].join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const palcoName =
    activePalcoTab.value === '1'
      ? (palcoPrincipalMeta.value.name || 'Principal')
      : activePalcoTab.value === '2'
        ? (palcoAmeta.value.name || 'PalcoA')
        : (palcoBmeta.value.name || 'PalcoB')

  a.download = `presentes-${palcoName}-${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}.csv`
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
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
}
.title-contrast {
  background: linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0));
  border-bottom: 1px solid rgba(255,217,81,.10);
}
.divider-contrast {
  border-color: rgba(255,217,81,.10) !important;
}
.text-dim {
  color: rgba(234,240,255, .75);
}

/* Botón EXPORTAR CSV */
.btn-tonal {
  background: rgba(255,217,81,.12) !important;
  color: #ffd951 !important;
  border: 1px solid rgba(255,217,81,.24) !important;
}

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
.chip-count {
  font-weight: 800;
  color: #eaf0ff !important;
  background: #1b5e20 !important;
}

/* Avatar tabla */
.avatar-contrast {
  background: rgba(255,217,81,.12);
  border: 1px solid rgba(255,217,81,.18);
  color: #ffd951;
}

/* tabs mini dentro de la tarjeta tabla */
.table-palco-tabs {
  display: flex;
  align-items: center;
}
.table-tabs-inner {
  background: rgba(11,13,40,.6);
  border: 1px solid rgba(255,217,81,.24);
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0,0,0,.7);
  overflow: hidden;
}
.tab-btn-mini {
  text-transform: none;
  font-weight: 600;
  font-size: .75rem;
  letter-spacing: .03em;
  color: #ffd951 !important;
  min-width: auto !important;
  padding-left: 12px !important;
  padding-right: 12px !important;
  opacity: .85;
}
:deep(.v-tab.v-tab--selected) {
  background: rgba(255,217,81,.18) !important;
  box-shadow: inset 0 0 6px rgba(255,217,81,.25);
  color: #fff3bf !important;
  opacity: 1 !important;
  font-weight: 700 !important;
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

/* LEYENDA ESTADOS */
.legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
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
.chip-outline {
  /* ya definida arriba */
}

/* TABLA PRESENTES */
.table-wrap {
  width: 100%;
  overflow-x: auto;
}
.present-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #0e1230 !important;
  color: #eaf0ff !important;
  border-bottom: 1px solid rgba(255,217,81,.14) !important;
}
.present-table :deep(tbody tr:nth-child(odd)) {
  background: rgba(255,217,81,.03);
}
.present-table :deep(td) {
  border-bottom: 1px solid rgba(255,217,81,.06) !important;
}
.chip-table {
  box-shadow: 0 0 0 1px rgba(255,217,81,.18) inset;
}
.font-mono {
  font-variant-numeric: tabular-nums;
}

/* RESPONSIVE FINO */
@media (max-width: 960px) {
  .search-input {
    max-width: 320px;
    width: 100%;
  }
}
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
.btn-text {
  color: #ffd951 !important;
}
.alert-contrast {
  background: rgba(255,217,81,.07) !important;
  border-color: rgba(255,217,81,.18) !important;
  color: #ffd951 !important;
}
</style>
