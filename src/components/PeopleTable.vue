<template>
  <v-card rounded="xl" title="Listado de personal">
    <v-card-text>
      <v-text-field
        v-model="q"
        label="Buscar por nombre, DNI u organismo"
        class="mb-4"
        prepend-inner-icon="mdi-magnify"
        clearable
      />

      <v-data-table
        :headers="headers"
        :items="filtered"
        item-key="id"
        :items-per-page="10"
        density="comfortable"
      >
        <template #item.present="{ item }">
          <v-chip :color="item.present ? 'success' : 'grey'" size="small" label>
            {{ item.present ? 'Presente' : '—' }}
          </v-chip>
        </template>

        <template #item.seat="{ item }">
          <v-chip v-if="item.seat" :color="seatColor(item.seat)" size="small" label>
            {{ item.seat }}
          </v-chip>
          <span v-else>—</span>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon="mdi-checkbox-marked-circle" variant="text" :title="'Marcar presente'"
                 @click="markPresent(item.id)" :disabled="item.present"/>
          <v-btn icon="mdi-pencil" variant="text" :title="'Editar'" @click="$emit('edit', item)"/>
          <v-btn icon="mdi-delete" variant="text" color="error" :title="'Eliminar'" @click="askRemove(item)"/>
        </template>
      </v-data-table>
    </v-card-text>

    <v-dialog v-model="confirmOpen" max-width="420">
      <v-card title="Confirmar eliminación">
        <v-card-text>¿Eliminar a <b>{{ toRemove?.name }}</b>? Esta acción no se puede deshacer.</v-card-text>
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
import { useSeatsStore } from '../stores'
const emit = defineEmits(['edit'])

const store = useSeatsStore()
if (!store.seats.length) store.initSeats(['A','B','C','D'], 10)

const headers = [
  { title: 'ID', key: 'id', width: 90 },
  { title: 'Nombre', key: 'name' },
  { title: 'DNI', key: 'doc', width: 140 },
  { title: 'Organismo', key: 'org' },
  { title: 'Asiento', key: 'seat', width: 120 },
  { title: 'Estado', key: 'present', width: 120 },
  { title: 'Acciones', key: 'actions', width: 140 }
]

const q = ref('')
const filtered = computed(() => {
  const k = q.value.trim().toLowerCase()
  if (!k) return store.people
  return store.people.filter(p =>
    p.name.toLowerCase().includes(k) ||
    (p.doc || '').toLowerCase().includes(k) ||
    (p.org || '').toLowerCase().includes(k) ||
    (p.seat || '').toLowerCase().includes(k)
  )
})

function seatColor(code) {
  const st = store.seatStatus(code)
  return st === 'present' ? 'success' : st === 'assigned' ? 'warning' : ''
}

function markPresent(id) {
  try { store.checkInById(id) } catch (e) { alert(e.message) }
}

const confirmOpen = ref(false)
const toRemove = ref(null)
function askRemove(item) { toRemove.value = item; confirmOpen.value = true }
function doRemove() {
  if (toRemove.value) store.removePerson(toRemove.value.id)
  confirmOpen.value = false; toRemove.value = null
}
</script>
