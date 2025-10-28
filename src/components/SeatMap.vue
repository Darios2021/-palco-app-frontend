<template>
  <!-- === MAPA === -->
  <v-card rounded="xl" class="mb-6">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-seat</v-icon>
      Mapa de Asientos
      <v-spacer />
      <v-chip color="success" class="mr-2" label size="small">Presente</v-chip>
      <v-chip color="warning" class="mr-2" label size="small">Asignado</v-chip>
      <v-chip variant="outlined" label size="small">Libre</v-chip>
    </v-card-title>

    <v-card-text>
      <div v-if="store.loading" class="py-6 text-center">Cargando…</div>

      <!-- 👇 GRID invertido (A abajo, D arriba) -->
      <div v-else class="grid-rows">
        <div v-for="(row, rIdx) in store.seats" :key="rIdx" class="row">
          <div class="row-label">{{ row[0][0] }}</div>
          <v-btn
            v-for="code in row"
            :key="code"
            :class="['seat', statusClass(code)]"
            variant="flat"
            size="small"
            @click="openSeat(code)"
          >
            {{ code }}
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>

  <!-- === TABLA: PRESENTES EN EL PALCO === -->
  <v-card rounded="xl" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-account-check</v-icon>
      Presentes en el palco
      <v-chip class="ml-3" color="success" label>{{ presentRows.length }}</v-chip>
      <v-spacer />
      <v-text-field
        v-model="q"
        prepend-inner-icon="mdi-magnify"
        label="Buscar (nombre / DNI / organismo / asiento)"
        hide-details
        single-line
        density="comfortable"
        style="max-width: 360px"
      />
      <v-btn class="ml-3" variant="tonal" prepend-icon="mdi-file-delimited" @click="exportCSV">
        Exportar CSV
      </v-btn>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="filteredRows"
      :items-per-page="50"
      class="present-table"
      hover
      fixed-header
      height="420"
      density="comfortable"
    >
      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="32" class="mr-3">
            <span class="avatar">{{ initials(item.name) }}</span>
          </v-avatar>
          <div class="font-weight-600">{{ item.name }}</div>
        </div>
      </template>

      <template #item.seat="{ item }">
        <v-chip color="success" size="small" label class="font-weight-600">{{ item.seat }}</v-chip>
      </template>

      <template #item.presentAt="{ item }">
        <div class="d-flex align-center">
          <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
          <span class="font-mono">{{ formatDateTime(item.presentAt) }}</span>
        </div>
      </template>

      <template #no-data>
        <div class="py-8 text-medium-emphasis">Aún no hay presentes.</div>
      </template>
    </v-data-table>
  </v-card>

  <!-- === MODAL DETALLE DE ASIENTO === -->
  <v-dialog v-model="dialog" max-width="520">
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-seat</v-icon>
        Asiento {{ currentSeat }}
        <v-spacer />
        <v-chip
          v-if="currentStatus === 'present'"
          size="small" color="success" label
        >Presente</v-chip>
        <v-chip
          v-else-if="currentStatus === 'assigned'"
          size="small" color="warning" label
        >Asignado</v-chip>
        <v-chip
          v-else
          size="small" variant="outlined" label
        >Libre</v-chip>
      </v-card-title>

      <v-divider />

      <v-card-text class="py-5">
        <template v-if="holder">
          <div class="d-flex align-center">
            <v-avatar size="40" class="mr-3">
              <span class="avatar">{{ initials(holder.name) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ holder.name }}</div>
              <div class="text-medium-emphasis">
                {{ [holder.org, holder.doc].filter(Boolean).join(' · ') || '—' }}
              </div>
            </div>
          </div>

          <v-alert
            v-if="holder.present"
            type="success"
            variant="tonal"
            class="mt-4"
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
            class="mt-4"
            border="start"
            rounded="lg"
          >
            Asiento asignado, aún <b>no ingresó</b>.
          </v-alert>
        </template>

        <template v-else>
          <v-alert variant="tonal" border="start" rounded="lg">
            Este asiento está <b>libre</b>.
          </v-alert>
        </template>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="dialog=false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSeatsStore } from '../stores'

const store = useSeatsStore()
onMounted(async () => { await store.ensureLoaded() })

/* ===== MAPA ===== */
function statusClass(code) { return store.seatStatus(code) }

const dialog = ref(false)
const currentSeat = ref(null)
const holder = computed(() => currentSeat.value ? store.seatHolder(currentSeat.value) : null)
const currentStatus = computed(() => currentSeat.value ? store.seatStatus(currentSeat.value) : 'free')

function openSeat(code) {
  currentSeat.value = code
  dialog.value = true
}

const initials = (name='') => {
  const p = String(name).trim().split(/\s+/).slice(0,2)
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
function exportCSV() {
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
/* === MAPA (A abajo, D arriba) === */
.grid-rows {
  display: flex;
  flex-direction: column-reverse; /* 🔁 invierte el orden visual */
  gap: 12px;
}

.row {
  display: grid;
  grid-template-columns: 40px repeat(10, 1fr);
  gap: 8px;
  align-items: center;
}

.row-label { text-align: center; font-weight: 700; }
.seat { min-width: 56px; border-radius: 18px; }
.seat.present { background: #4caf50 !important; color: #fff; }
.seat.assigned { background: #ffb300 !important; color: #000; }
.seat.free { background: #eeeeee !important; color: #333; }

/* === MODAL === */
.avatar { font-size: 14px; font-weight: 800; line-height: 40px; }

/* === TABLA PRESENTES === */
.present-table :deep(thead th) { position: sticky; top: 0; background: #fff; z-index: 2; }
.font-mono { font-variant-numeric: tabular-nums; }
</style>
