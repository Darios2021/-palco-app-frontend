<!-- src/views/PeopleList.vue (o el nombre que uses) -->
<template>
  <v-card rounded="xl" class="card-contrast">
    <v-card-title class="title-contrast">
      Listado de personal
    </v-card-title>

    <v-card-text>
      <div class="topbar">
        <v-text-field
          v-model="q"
          label="Buscar por nombre, DNI u organismo"
          class="search"
          prepend-inner-icon="mdi-magnify"
          clearable
          :density="smAndDown ? 'comfortable' : 'default'"
        />
      </div>

      <!-- wrapper con scroll horizontal en pantallas chicas -->
      <div class="table-wrap">
        <v-data-table
          :headers="headers"
          :items="filtered"
          item-key="id"
          :items-per-page="10"
          :height="tableHeight"
          fixed-header
          hover
          density="comfortable"
          class="people-table"
        >
          <!-- Estado -->
          <template #item.present="{ item }">
            <v-chip :color="item.present ? 'success' : 'grey-darken-1'"
                    size="small" label class="chip-strong">
              {{ item.present ? 'Presente' : '—' }}
            </v-chip>
          </template>

          <!-- Asiento con color según estado -->
          <template #item.seat="{ item }">
            <v-chip
              v-if="item.seat"
              :color="seatColor(item.seat)"
              :variant="seatVariant(item.seat)"
              size="small"
              label
              class="chip-strong"
            >
              {{ item.seat }}
            </v-chip>
            <span v-else class="text-dim">—</span>
          </template>

          <!-- Acciones -->
          <template #item.actions="{ item }">
            <div v-if="!smAndDown" class="d-flex">
              <v-btn icon="mdi-checkbox-marked-circle" variant="text"
                     :title="'Marcar presente'"
                     @click="markPresent(item.id)"
                     :disabled="item.present"
                     class="btn-icon" />
              <v-btn icon="mdi-pencil" variant="text"
                     :title="'Editar'"
                     @click="$emit('edit', item)"
                     class="btn-icon" />
              <v-btn icon="mdi-delete" variant="text" color="error"
                     :title="'Eliminar'"
                     @click="askRemove(item)"
                     class="btn-icon" />
            </div>

            <div v-else>
              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text"
                         v-bind="props" :aria-label="'Acciones'"
                         class="btn-icon"/>
                </template>
                <v-list density="comfortable">
                  <v-list-item
                    :disabled="item.present"
                    @click="markPresent(item.id)"
                    prepend-icon="mdi-checkbox-marked-circle"
                    title="Marcar presente"
                  />
                  <v-list-item
                    @click="$emit('edit', item)"
                    prepend-icon="mdi-pencil"
                    title="Editar"
                  />
                  <v-list-item
                    @click="askRemove(item)"
                    prepend-icon="mdi-delete"
                    title="Eliminar"
                    class="text-error"
                  />
                </v-list>
              </v-menu>
            </div>
          </template>

          <template #no-data>
            <div class="py-8 text-medium-emphasis">Sin resultados.</div>
          </template>
        </v-data-table>
      </div>
    </v-card-text>

    <v-dialog v-model="confirmOpen" max-width="420">
      <v-card title="Confirmar eliminación" class="card-contrast">
        <v-card-text class="text-dim">
          ¿Eliminar a <b>{{ toRemove?.name }}</b>? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" class="btn-text" @click="confirmOpen=false">Cancelar</v-btn>
          <v-btn color="error" class="btn-strong" @click="doRemove">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'

const emit = defineEmits(['edit'])
const { smAndDown } = useDisplay()

const store = useSeatsStore()
if (!store.seats.length) store.initSeats(['A','B','C','D'], 10)

const headers = [
  { title: 'ID',         key: 'id',        width: 90  },
  { title: 'Nombre',     key: 'name'                 },
  { title: 'DNI',        key: 'doc',       width: 140 },
  { title: 'Organismo',  key: 'org'                 },
  { title: 'Asiento',    key: 'seat',      width: 120 },
  { title: 'Estado',     key: 'present',   width: 120 },
  { title: 'Acciones',   key: 'actions',   width: 140, sortable: false }
]

const q = ref('')
const filtered = computed(() => {
  const k = q.value.trim().toLowerCase()
  if (!k) return store.people
  return store.people.filter(p =>
    p.name?.toLowerCase().includes(k) ||
    (p.doc || '').toLowerCase().includes(k) ||
    (p.org || '').toLowerCase().includes(k) ||
    (p.seat || '').toLowerCase().includes(k)
  )
})

const tableHeight = computed(() => (smAndDown.value ? 360 : 420))

function seatColor (code) {
  const st = store.seatStatus(code)
  return st === 'present' ? 'success' : st === 'assigned' ? 'warning' : undefined
}
function seatVariant (code) {
  const st = store.seatStatus(code)
  return st === 'free' ? 'outlined' : 'flat'
}

function markPresent (id) {
  try { store.checkInById(id) } catch (e) { alert(e.message) }
}

const confirmOpen = ref(false)
const toRemove = ref(null)
function askRemove (item) { toRemove.value = item; confirmOpen.value = true }
function doRemove () {
  if (toRemove.value) store.removePerson(toRemove.value.id)
  confirmOpen.value = false; toRemove.value = null
}
</script>

<style scoped>
/* ===== Card y títulos con contraste ===== */
.card-contrast {
  background: #0e1230 !important;
  border: 1px solid rgba(255, 217, 81, .14);
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
  color: #eaf0ff;
}
.title-contrast {
  background: linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0));
  border-bottom: 1px solid rgba(255,217,81,.10);
  font-weight: 800;
}
.text-dim { color: rgba(234,240,255, .78); }

/* ===== Topbar / búsqueda ===== */
.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.search { max-width: 520px; width: 100%; }
.search :deep(.v-field) {
  background: rgba(255,255,255,0.06) !important;
  border-radius: 12px !important;
}
.search :deep(.v-icon) { color: #ffd951 !important; }

/* ===== Tabla ===== */
.table-wrap { width: 100%; overflow-x: auto; }
.people-table {
  background: #111433 !important;
  border: 1px solid rgba(255,217,81,.10);
  border-radius: 14px;
}
.people-table :deep(thead th) {
  position: sticky; top: 0;
  background: #14183f !important;
  color: #ffd951 !important;
  z-index: 2;
  font-weight: 800 !important;
}
.people-table :deep(tbody tr:hover) {
  background: rgba(255, 217, 81, 0.08) !important;
}

/* Chips marcados */
.chip-strong {
  font-weight: 800;
  border-radius: 10px;
}

/* Botones de acción más visibles en dark */
.btn-icon { color: #ffd951 !important; }
.btn-icon :deep(.v-icon) { color: #ffd951 !important; }
.btn-text   { color: #eaf0ff !important; }
.btn-strong { font-weight: 800; }

/* ===== Responsive ===== */
@media (max-width: 960px) {
  .search { max-width: 100%; }
}
@media (max-width: 600px) {
  .people-table :deep(.v-chip) { height: 22px; font-size: 12px; }
}
</style>
