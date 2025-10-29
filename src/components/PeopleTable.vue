<template>
  <v-card rounded="xl" title="Listado de personal">
    <v-card-text>
      <div class="topbar">
        <v-text-field
          v-model="q"
          label="Buscar por nombre, DNI u organismo"
          class="mb-4 search"
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
            <v-chip :color="item.present ? 'success' : 'grey'" size="small" label>
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
            >
              {{ item.seat }}
            </v-chip>
            <span v-else>—</span>
          </template>

          <!-- Acciones: menú compacto en mobile, botones en desktop -->
          <template #item.actions="{ item }">
            <div v-if="!smAndDown" class="d-flex">
              <v-btn
                icon="mdi-checkbox-marked-circle"
                variant="text"
                :title="'Marcar presente'"
                @click="markPresent(item.id)"
                :disabled="item.present"
              />
              <v-btn
                icon="mdi-pencil"
                variant="text"
                :title="'Editar'"
                @click="$emit('edit', item)"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                :title="'Eliminar'"
                @click="askRemove(item)"
              />
            </div>

            <div v-else>
              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" :aria-label="'Acciones'"/>
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
      <v-card title="Confirmar eliminación">
        <v-card-text>
          ¿Eliminar a <b>{{ toRemove?.name }}</b>? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmOpen=false">Cancelar</v-btn>
          <v-btn color="error" @click="doRemove">Eliminar</v-btn>
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
.topbar { display: flex; align-items: center; gap: 12px; }
.search { max-width: 520px; width: 100%; }

/* tabla con scroll horizontal en móvil */
.table-wrap { width: 100%; overflow-x: auto; }
.people-table :deep(thead th) {
  position: sticky; top: 0; background: #fff; z-index: 2;
}

/* estrecha en pantallas chicas */
@media (max-width: 960px) {
  .search { max-width: 100%; }
}

/* chips y espaciado más compacto en móvil */
@media (max-width: 600px) {
  .people-table :deep(.v-chip) {
    height: 22px; font-size: 12px;
  }
}
</style>
