<template>
  <v-container class="py-10" fluid>
    <!-- ===== MAPA DE ASIENTOS ===== -->
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="d-flex align-center flex-wrap gap-2">
            <v-icon class="mr-2">mdi-seat</v-icon>
            <span class="text-truncate">Mapa de Asientos</span>
            <v-spacer />
            <div class="legend d-flex align-center gap-2">
              <v-chip color="success" label size="small">Presente</v-chip>
              <v-chip color="warning" label size="small">Asignado</v-chip>
              <v-chip variant="outlined" label size="small">Libre</v-chip>
            </div>
          </v-card-title>

          <v-card-text>
            <div v-if="store.loading" class="py-6 text-center">Cargando…</div>

            <!-- 👇 mismo layout responsive que el mapa anterior -->
            <div v-else class="grid-rows-wrap">
              <div class="grid-rows">
                <div
                  v-for="(row, rIdx) in store.seats"
                  :key="rIdx"
                  class="row"
                >
                  <div class="row-label">{{ row[0][0] }}</div>
                  <v-btn
                    v-for="seat in row"
                    :key="seat"
                    :class="['seat', statusClass(seat)]"
                    variant="flat"
                    size="small"
                    rounded
                    :aria-label="`Asiento ${seat}`"
                    @click="openSeat(seat)"
                  >
                    {{ seat }}
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ===== TABLA DE PRESENTES ===== -->
    <v-row justify="center" class="mt-8">
      <v-col cols="12" md="10" lg="8">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="d-flex align-center flex-wrap gap-2">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            <span class="text-truncate">Asistentes Presentes en el Palco</span>
            <v-spacer />
            <v-chip color="primary" label>{{ presentList.length }} presentes</v-chip>
          </v-card-title>

          <div class="table-wrap">
            <v-data-table
              :headers="headers"
              :items="presentList"
              class="present-table"
              fixed-header
              hover
              :height="tableHeight"
              density="comfortable"
            >
              <template #item.presentAt="{ item }">
                <span class="font-mono">{{ formatHour(item.presentAt) }}</span>
              </template>

              <template #no-data>
                <div class="py-8 text-medium-emphasis">Aún no hay presentes.</div>
              </template>
            </v-data-table>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ===== MODAL DETALLE ASIENTO ===== -->
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-chair-school</v-icon>
          Detalle del Asiento
          <v-spacer />
          <v-chip v-if="selectedSeat" label>{{ selectedSeat }}</v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-6">
          <template v-if="holder">
            <div class="text-h6 mb-1">{{ holder.name }}</div>
            <div class="text-body-2 text-medium-emphasis mb-2">
              {{ [holder.org, holder.cargo, holder.doc].filter(Boolean).join(' · ') || '—' }}
            </div>
            <v-chip
              :color="holder.present ? 'success' : 'warning'"
              label
              size="small"
              class="mb-2"
            >
              {{ holder.present ? 'Presente' : 'Asignado' }}
            </v-chip>
            <div v-if="holder.presentAt" class="text-caption text-medium-emphasis">
              Ingreso: {{ formatDate(holder.presentAt) }}
            </div>
          </template>

          <template v-else>
            <v-alert type="info" variant="tonal" border="start" rounded="lg">
              Este asiento se encuentra <b>libre</b>.
            </v-alert>
          </template>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" color="primary" @click="dialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'

const { smAndDown } = useDisplay()

const store = useSeatsStore()
const dialog = ref(false)
const selectedSeat = ref(null)
const holder = ref(null)

const headers = [
  { title: 'Asiento',   key: 'seat' },
  { title: 'Nombre',    key: 'name' },
  { title: 'DNI',       key: 'doc' },
  { title: 'Organismo', key: 'org' },
  { title: 'Cargo',     key: 'cargo' },
  { title: 'Ingreso',   key: 'presentAt' },
]

onMounted(() => {
  store.ensureLoaded()
})

function statusClass (code) {
  return store.seatStatus(code) // 'present' | 'assigned' | 'free'
}

const presentList = computed(() => store.presentList)

function openSeat (code) {
  selectedSeat.value = code
  holder.value = store.seatHolder(code)
  dialog.value = true
}

function formatHour (dt) {
  if (!dt) return ''
  const date = new Date(dt)
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate (dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

const tableHeight = computed(() => (smAndDown.value ? 360 : 420))
</script>

<style scoped>
/* ===== Leyenda ===== */
.legend { gap: 6px; }

/* ===== MAPA (mismo layout responsive) ===== */
.grid-rows-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 6px;
}

.grid-rows {
  display: flex;
  flex-direction: column-reverse;   /* 🔁 A abajo, D arriba */
  gap: 12px;
  min-width: max(480px, 100%);
}

.row {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 40px repeat(10, 64px); /* etiqueta + 10 asientos (ajustá N si cambia) */
  gap: 8px;
  align-items: center;
}

/* Etiqueta pegajosa para que no “desaparezca” al scrollear */
.row-label {
  position: sticky;
  left: 0;
  z-index: 1;
  text-align: center;
  font-weight: 700;
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(2px);
  border-radius: 10px;
  padding: 6px 0;
  width: 40px;
}

/* Botones de asiento */
.seat {
  min-width: 56px;
  height: 36px;
  border-radius: 18px;
  font-weight: 600;
  text-transform: none;
  transition: transform .12s ease, box-shadow .12s ease;
}
.seat.present  { background: #4caf50 !important; color: #fff; }
.seat.assigned { background: #ffb300 !important; color: #000; }
.seat.free     { background: #eeeeee !important; color: #333; }
.seat:hover    { transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0,0,0,.15); }

/* ===== TABLA ===== */
.table-wrap { width: 100%; overflow-x: auto; }
.present-table :deep(thead th) { position: sticky; top: 0; background: #fff; z-index: 2; }
.font-mono { font-variant-numeric: tabular-nums; }

/* ===== Responsive tweaks ===== */
@media (max-width: 600px) {
  .legend :deep(.v-chip) { height: 22px; font-size: 11px; }
  .grid-rows { gap: 10px; min-width: max(420px, 100%); }
  .row {
    grid-template-columns: 32px repeat(10, 56px); /* compacta asientos en mobile */
    gap: 6px;
  }
  .row-label { width: 32px; padding: 4px 0; }
  .seat { min-width: 52px; height: 32px; border-radius: 16px; font-size: .9rem; }
}
</style>
