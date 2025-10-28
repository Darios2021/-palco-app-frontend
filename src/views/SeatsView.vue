<template>
  <v-container class="py-10" fluid>
    <!-- ===== MAPA DE ASIENTOS ===== -->
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-seat</v-icon>
            Mapa de Asientos
            <v-spacer />
            <v-chip color="success" class="mr-2" label size="small">Presente</v-chip>
            <v-chip color="warning" class="mr-2" label size="small">Asignado</v-chip>
            <v-chip variant="outlined" label size="small">Libre</v-chip>
          </v-card-title>

          <v-card-text>
            <div class="grid">
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
                  size="small"
                  rounded
                  @click="openSeat(seat)"
                >
                  {{ seat }}
                </v-btn>
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
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            Asistentes Presentes en el Palco
            <v-spacer />
            <v-chip color="primary" label>{{ presentList.length }} presentes</v-chip>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="presentList"
            class="elevation-0"
            dense
          >
            <template #item.presentAt="{ item }">
              <span>{{ formatHour(item.presentAt) }}</span>
            </template>
          </v-data-table>
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

        <v-divider></v-divider>

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
            <v-alert type="info" variant="tonal">
              Este asiento se encuentra <b>libre</b>.
            </v-alert>
          </template>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" color="primary" @click="dialog = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSeatsStore } from '../stores'

const store = useSeatsStore()
const dialog = ref(false)
const selectedSeat = ref(null)
const holder = ref(null)

const headers = [
  { title: 'Asiento', key: 'seat' },
  { title: 'Nombre', key: 'name' },
  { title: 'DNI', key: 'doc' },
  { title: 'Organismo', key: 'org' },
  { title: 'Cargo', key: 'cargo' },
  { title: 'Ingreso', key: 'presentAt' },
]

onMounted(() => {
  store.ensureLoaded()
})

function statusClass(code) {
  const status = store.seatStatus(code)
  return status
}

const presentList = computed(() => store.presentList)

function openSeat(code) {
  selectedSeat.value = code
  holder.value = store.seatHolder(code)
  dialog.value = true
}

function formatHour(dt) {
  if (!dt) return ''
  const date = new Date(dt)
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}
</script>

<style scoped>
.grid { display: grid; gap: 12px; }
.row { display: grid; grid-template-columns: 40px repeat(10, 1fr); gap: 8px; align-items: center; }
.row-label { text-align: center; font-weight: 600; }
.seat { min-width: 50px; text-align: center; transition: all .2s; }
.seat.present { background: #4caf50 !important; color: white; }
.seat.assigned { background: #ffb300 !important; color: black; }
.seat.free { background: #eeeeee !important; color: #333; }
.seat:hover { transform: scale(1.05); box-shadow: 0 3px 6px rgba(0,0,0,.15); }

.v-data-table { font-size: 0.9rem; }
.v-data-table th { font-weight: 600; }
.v-card-title { font-weight: 600; }
</style>
