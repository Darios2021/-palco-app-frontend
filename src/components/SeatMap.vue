<template>
  <!-- === MAPA === -->
  <v-card rounded="xl" class="mb-6 card-contrast">
    <v-card-title class="d-flex align-center flex-wrap gap-2 title-contrast">
      <v-icon class="mr-2">mdi-seat</v-icon>
      <span class="text-truncate">Mapa de Asientos</span>
      <v-spacer />
      <div class="legend d-flex align-center gap-2">
        <v-chip color="success" label size="small" class="chip-strong">Presente</v-chip>
        <v-chip color="warning" label size="small" class="chip-strong">Asignado</v-chip>
        <v-chip variant="outlined" label size="small" class="chip-outline">Libre</v-chip>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="store.loading" class="py-6 text-center">Cargando…</div>

      <!-- 👇 GRID invertido (A abajo, D arriba) + scroll horizontal en mobile -->
      <div v-else class="grid-rows-wrap">
        <div class="grid-rows">
          <div v-for="(row, rIdx) in store.seats" :key="rIdx" class="row">
            <div class="row-label">{{ row[0][0] }}</div>
            <v-btn
              v-for="code in row"
              :key="code"
              :class="['seat', statusClass(code)]"
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
    </v-card-text>
  </v-card>

  <!-- === TABLA: PRESENTES EN EL PALCO === -->
  <v-card rounded="xl" elevation="2" class="card-contrast">
    <v-card-title class="d-flex align-center flex-wrap gap-2 title-contrast">
      <v-icon class="mr-2">mdi-account-check</v-icon>
      <span class="text-truncate">Presentes en el palco</span>
      <v-chip class="ml-1 chip-count" color="success" label>{{ presentRows.length }}</v-chip>
      <v-spacer />
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
        <v-btn variant="tonal" prepend-icon="mdi-file-delimited" class="btn-tonal" @click="exportCSV">
          Exportar CSV
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
          <v-chip color="success" size="small" label class="font-weight-600 chip-table">{{ item.seat }}</v-chip>
        </template>

        <template #item.presentAt="{ item }">
          <div class="d-flex align-center text-dim">
            <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
            <span class="font-mono">{{ formatDateTime(item.presentAt) }}</span>
          </div>
        </template>

        <template #no-data>
          <div class="py-8 text-medium-emphasis">Aún no hay presentes.</div>
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
            Ingresó al palco: <b>{{ formatDateTime(holder.presentAt) }}</b>
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
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'

const { smAndDown } = useDisplay()
const tableHeight = computed(() => (smAndDown.value ? 360 : 420))

const store = useSeatsStore()
onMounted(async () => { await store.ensureLoaded() })

/* ===== MAPA ===== */
function statusClass (code) { return store.seatStatus(code) }

const dialog = ref(false)
const currentSeat = ref(null)
const holder = computed(() => currentSeat.value ? store.seatHolder(currentSeat.value) : null)
const currentStatus = computed(() => currentSeat.value ? store.seatStatus(currentSeat.value) : 'free')

function openSeat (code) {
  currentSeat.value = code
  dialog.value = true
}

/* ===== UTILS ===== */
const initials = (name='') => {
  const p = String(name).trim().split(/\s+/).slice(0,2)
  return p.map(s => s[0]?.toUpperCase() || '').join('')
}

function formatDateTime (iso) {
  if (!iso) return '—'
  try {
    const dt = new Date(iso)
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(dt)
  } catch { return iso }
}

/* ===== TABLA PRESENTES ===== */
const headers = [
  { title: 'Asiento',   key: 'seat',      sortable: true },
  { title: 'Nombre',    key: 'name',      sortable: true },
  { title: 'DNI',       key: 'doc',       sortable: true },
  { title: 'Organismo', key: 'org',       sortable: true },
  { title: 'Ingreso',   key: 'presentAt', sortable: true },
]

const presentRows = computed(() =>
  store.people
    .filter(p => p.present)
    .map(p => ({ name: p.name, seat: p.seat, org: p.org, doc: p.doc, presentAt: p.presentAt }))
    .sort((a,b) => (a.presentAt || '').localeCompare(b.presentAt || ''))
)

const q = ref('')
const filteredRows = computed(() => {
  const needle = q.value.trim().toLowerCase()
  if (!needle) return presentRows.value
  return presentRows.value.filter(r =>
    [r.name, r.doc, r.org, r.seat].filter(Boolean).join(' ').toLowerCase().includes(needle)
  )
})

/* Export CSV simple para protocolo */
function exportCSV () {
  const rows = presentRows.value
  const header = ['Asiento','Nombre','DNI','Organismo','Ingreso']
  const csv = [
    header.join(','),
    ...rows.map(r => [
      r.seat,
      `"${(r.name||'').replace(/"/g,'""')}"`,
      r.doc || '',
      `"${(r.org||'').replace(/"/g,'""')}"`,
      formatDateTime(r.presentAt)
    ].join(','))
  ].join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `presentes-palco-${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* ===== Card & Titles con contraste ===== */
.card-contrast {
  background: #0e1230 !important;
  border: 1px solid rgba(255, 217, 81, .14);
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
}
.title-contrast {
  background: linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0));
  border-bottom: 1px solid rgba(255,217,81,.10);
}
.divider-contrast { border-color: rgba(255,217,81,.10) !important; }
.text-dim { color: rgba(234,240,255, .75); }

/* Botones del título */
.btn-tonal {
  background: rgba(255,217,81,.12) !important;
  color: #ffd951 !important;
  border: 1px solid rgba(255,217,81,.24) !important;
}

/* Chips más legibles sobre oscuro */
.chip-strong { font-weight: 700; color: #0b0d28 !important; }
.chip-outline {
  color: #eaf0ff !important;
  border-color: rgba(234,240,255,.28) !important;
}
.chip-count {
  font-weight: 800;
  color: #eaf0ff !important;
  background: #1b5e20 !important;
}

/* Avatar con borde para no perderse */
.avatar-contrast {
  background: rgba(255,217,81,.12);
  border: 1px solid rgba(255,217,81,.18);
  color: #ffd951;
}

/* ===== MAPA ===== */
.legend { gap: 6px; }

.grid-rows-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 6px;
}

.grid-rows {
  display: flex;
  flex-direction: column-reverse; /* 🔁 A abajo */
  gap: 12px;
  min-width: max(560px, 100%);
}

.row {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 44px repeat(10, 68px);
  gap: 8px;
  align-items: center;
}

/* Etiqueta de fila con contraste */
.row-label {
  position: sticky; left: 0; z-index: 1;
  text-align: center; font-weight: 800;
  color: #0b0d28;
  background: #ffd951;
  border: 1px solid rgba(255,217,81,.45);
  box-shadow: 0 2px 6px rgba(0,0,0,.25);
  border-radius: 10px; padding: 6px 0; width: 44px;
}

/* Botones de asiento */
.seat {
  min-width: 58px; height: 36px; border-radius: 18px;
  font-weight: 700; text-transform: none;
  box-shadow: 0 1px 2px rgba(0,0,0,.25);
}
.seat.present  { background: #4caf50 !important; color: #fff !important; }
.seat.assigned { background: #ffb300 !important; color: #0b0d28 !important; }
.seat.free     { background: #f3f5f9 !important; color: #0b0d28 !important; }

/* ===== TABLA ===== */
.table-wrap { width: 100%; overflow-x: auto; }

.present-table :deep(thead th) {
  position: sticky; top: 0; z-index: 2;
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
.chip-table { box-shadow: 0 0 0 1px rgba(255,217,81,.18) inset; }

.font-mono { font-variant-numeric: tabular-nums; }

/* ===== Responsive ===== */
@media (max-width: 960px) {
  .search-input { max-width: 320px; width: 100%; }
}
@media (max-width: 600px) {
  .legend :deep(.v-chip) { height: 22px; font-size: 11px; }
  .grid-rows { gap: 10px; min-width: max(480px, 100%); }
  .row {
    grid-template-columns: 36px repeat(10, 60px);
    gap: 6px;
  }
  .row-label { width: 36px; padding: 4px 0; }
  .seat { min-width: 54px; height: 32px; border-radius: 16px; font-size: 0.9rem; }
}
.btn-text { color: #ffd951 !important; }
</style>
