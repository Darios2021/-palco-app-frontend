<template>
  <v-card rounded="xl" class="card-contrast">
    <v-card-title class="title-contrast">
      Listado de personal
    </v-card-title>

    <v-card-text>
      <!-- BUSCADOR -->
      <div class="topbar">
        <v-text-field
          v-model="q"
          label="Buscar por nombre, DNI, organismo, palco o asiento"
          class="search"
          prepend-inner-icon="mdi-magnify"
          clearable
          :density="smAndDown ? 'comfortable' : 'default'"
        />
      </div>

      <!-- TABLA -->
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
          <!-- PALCO -->
          <template #item.palco="{ item }">
            <span class="nowrap">
              {{ palcoNameFromSeat(item.seat) || '—' }}
            </span>
          </template>

          <!-- ESTADO / PRESENCIA -->
          <template #item.present="{ item }">
            <v-chip
              :color="item.present ? 'success' : 'grey-darken-1'"
              size="small"
              label
              class="chip-strong nowrap"
            >
              {{ item.present ? 'Presente' : '—' }}
            </v-chip>
          </template>

          <!-- ASIENTO -->
          <template #item.seat="{ item }">
            <v-chip
              v-if="item.seat"
              :color="seatColor(item.seat)"
              :variant="seatVariant(item.seat)"
              size="small"
              label
              class="chip-strong nowrap"
            >
              {{ item.seat }}
            </v-chip>
            <span v-else class="text-dim nowrap">—</span>
          </template>

          <!-- ACCIONES -->
          <template #item.actions="{ item }">
            <!-- Desktop -->
            <div v-if="!smAndDown" class="actions-row">
              <!-- Asignar presente -->
              <v-tooltip text="Marcar presente">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-account-check"
                    variant="text"
                    class="btn-icon"
                    :disabled="busy || item.present"
                    @click="markPresent(item)"
                  />
                </template>
              </v-tooltip>

              <!-- Quitar presente -->
              <v-tooltip text="Quitar presente">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-account-off"
                    variant="text"
                    class="btn-icon"
                    :disabled="busy || !item.present"
                    @click="removePresent(item)"
                  />
                </template>
              </v-tooltip>

              <!-- Asignar / Cambiar asiento -->
              <v-tooltip text="Asignar / cambiar asiento">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-seat-recline-extra"
                    variant="text"
                    class="btn-icon"
                    :disabled="busy"
                    @click="openSeatPicker(item)"
                  />
                </template>
              </v-tooltip>

              <!-- Desasignar asiento -->
              <v-tooltip text="Desasignar asiento">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-seat-outline"
                    variant="text"
                    class="btn-icon"
                    :disabled="busy || !item.seat"
                    @click="clearSeat(item)"
                  />
                </template>
              </v-tooltip>

              <!-- Editar persona -->
              <v-tooltip text="Editar datos">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil"
                    variant="text"
                    class="btn-icon"
                    :disabled="busy"
                    @click="openEditDialog(item)"
                  />
                </template>
              </v-tooltip>

              <!-- Eliminar persona -->
              <v-tooltip text="Eliminar">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    class="btn-icon"
                    :disabled="busy"
                    @click="askRemove(item)"
                  />
                </template>
              </v-tooltip>
            </div>

            <!-- Mobile -->
            <div v-else>
              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    v-bind="props"
                    :aria-label="'Acciones'"
                    class="btn-icon"
                    :disabled="busy"
                  />
                </template>

                <v-list density="comfortable">
                  <v-list-item
                    prepend-icon="mdi-account-check"
                    title="Marcar presente"
                    :disabled="item.present || busy"
                    @click="markPresent(item)"
                  />
                  <v-list-item
                    prepend-icon="mdi-account-off"
                    title="Quitar presente"
                    :disabled="!item.present || busy"
                    @click="removePresent(item)"
                  />
                  <v-list-item
                    prepend-icon="mdi-seat-recline-extra"
                    title="Asignar / cambiar asiento"
                    :disabled="busy"
                    @click="openSeatPicker(item)"
                  />
                  <v-list-item
                    prepend-icon="mdi-seat-outline"
                    title="Desasignar asiento"
                    :disabled="!item.seat || busy"
                    @click="clearSeat(item)"
                  />
                  <v-list-item
                    prepend-icon="mdi-pencil"
                    title="Editar datos"
                    :disabled="busy"
                    @click="openEditDialog(item)"
                  />
                  <v-list-item
                    prepend-icon="mdi-delete"
                    title="Eliminar"
                    class="text-error"
                    :disabled="busy"
                    @click="askRemove(item)"
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

    <!-- CONFIRM ELIMINACIÓN -->
    <v-dialog v-model="confirmOpen" max-width="420">
      <v-card title="Confirmar eliminación" class="card-contrast">
        <v-card-text class="text-dim">
          ¿Eliminar a <b>{{ toRemove?.name }}</b>? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" class="btn-text" @click="confirmOpen=false">Cancelar</v-btn>
          <v-btn color="error" class="btn-strong" :disabled="busy" @click="doRemove">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL EDITAR PERSONA -->
    <v-dialog v-model="editDialogOpen" max-width="420">
      <v-card class="card-contrast">
        <v-card-title class="title-contrast">Editar datos</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveEdit">
            <v-text-field
              v-model="editBuffer.name"
              label="Nombre"
              density="comfortable"
              variant="solo-filled"
              class="edit-field"
              prepend-inner-icon="mdi-account"
              hide-details="auto"
            />
            <v-text-field
              v-model="editBuffer.doc"
              label="DNI"
              density="comfortable"
              variant="solo-filled"
              class="edit-field"
              prepend-inner-icon="mdi-card-account-details"
              hide-details="auto"
            />
            <v-text-field
              v-model="editBuffer.org"
              label="Organismo / Institución"
              density="comfortable"
              variant="solo-filled"
              class="edit-field"
              prepend-inner-icon="mdi-domain"
              hide-details="auto"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" class="btn-text" @click="editDialogOpen=false">Cancelar</v-btn>
          <v-btn class="btn-strong" color="primary" :disabled="busy" @click="saveEdit">
            Guardar cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL PICKER DE ASIENTO -->
    <v-dialog v-model="seatPickerOpen" max-width="640">
      <v-card rounded="xl" class="card-contrast">
        <v-card-title class="d-flex align-center flex-wrap gap-2 title-contrast">
          <v-icon class="mr-2">mdi-seat</v-icon>
          <span class="text-truncate">
            {{ seatTarget?.name ? `Asignar asiento a ${seatTarget.name}` : 'Asignar asiento' }}
          </span>
          <v-spacer />
          <div class="legend d-flex align-center gap-2">
            <v-chip color="success" label size="small" class="chip-strong">Presente</v-chip>
            <v-chip color="warning" label size="small" class="chip-strong">Asignado</v-chip>
            <v-chip variant="outlined" label size="small" class="chip-outline">Libre</v-chip>
          </div>
        </v-card-title>

        <v-card-text>
          <!-- Selector visual del PALCO -->
          <div class="mb-4 d-flex flex-wrap gap-2 palco-selector">
            <v-chip
              v-for="opt in palcoOptions"
              :key="opt.key"
              :color="pickerPalco === opt.key ? 'primary' : undefined"
              :class="['chip-palco', { active: pickerPalco === opt.key }]"
              label
              size="small"
              @click="pickerPalco = opt.key"
            >
              {{ opt.label }}
            </v-chip>
          </div>

          <!-- GRID DE ASIENTOS DEL PALCO SELECCIONADO -->
          <div class="grid-rows-wrap">
            <div class="grid-rows">
              <div
                v-for="(row, rIdx) in rowsForPicker"
                :key="rIdx"
                class="row"
              >
                <div class="row-label">{{ row.letter }}</div>

                <v-btn
                  v-for="code in row.codes"
                  :key="code"
                  :class="[
                    'seat',
                    seatStatusLocal(code),
                    { 'seat-selected': selectedSeat === code }
                  ]"
                  :disabled="busy"
                  variant="flat"
                  size="small"
                  :aria-label="`Asiento ${code}`"
                  @click="selectedSeat = code"
                >
                  {{ code }}
                </v-btn>
              </div>
            </div>
          </div>

          <div class="mt-5 text-dim" v-if="selectedSeat">
            <div class="mb-1 font-weight-bold">
              Asiento seleccionado:
              <span class="text-accent">{{ selectedSeat }}</span>
            </div>

            <div v-if="currentHolder">
              Actualmente asignado a:
              <b>{{ currentHolder.name }}</b>
              <span class="text-dim">
                · {{ currentHolder.org || '—' }} · {{ currentHolder.doc || '—' }}
              </span>
            </div>

            <div v-else>
              Este asiento está libre.
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" class="btn-text" :disabled="busy" @click="closeSeatPicker">
            Cancelar
          </v-btn>
          <v-btn
            class="btn-strong"
            color="primary"
            :disabled="busy || !selectedSeat"
            @click="confirmAssignSeat"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'

const { smAndDown } = useDisplay()
const store = useSeatsStore()

/* =====================
   HEADERS TABLA
===================== */
const headers = [
  { title: 'ID',         key: 'id',        width: 70 },
  { title: 'Nombre',     key: 'name',      minWidth: 200 },
  { title: 'DNI',        key: 'doc',       width: 120 },
  { title: 'Organismo',  key: 'org',       minWidth: 200 },
  { title: 'Palco',      key: 'palco',     width: 150 },
  { title: 'Asiento',    key: 'seat',      width: 110 },
  { title: 'Estado',     key: 'present',   width: 110 },
  { title: 'Acciones',   key: 'actions',   width: 260, sortable: false }
]

/* =====================
   MAPEO LETRA -> PALCO
===================== */
function palcoNameFromSeat(seatCode) {
  if (!seatCode) return null
  const first = String(seatCode).charAt(0).toUpperCase()

  if ('ABCDEFG'.includes(first)) return 'PALCO PRINCIPAL'
  if ('HIJKL'.includes(first))   return 'PALCO A'
  if ('MNOPQ'.includes(first))   return 'PALCO B'

  return '—'
}

/* También clave para el picker: nos da el palco KEY */
function palcoKeyFromSeat(seatCode) {
  if (!seatCode) return 'P' // default si no tiene asiento: principal? lo forzamos más abajo
  const first = String(seatCode).charAt(0).toUpperCase()
  if ('HIJKL'.includes(first))   return 'A'
  if ('MNOPQ'.includes(first))   return 'B'
  return 'P' // ABCDEFG => principal
}

/* =====================
   BUSCADOR / FILTRADO
===================== */
const q = ref('')
const busy = ref(false)

const filtered = computed(() => {
  const k = q.value.trim().toLowerCase()
  if (!k) return store.people

  return store.people.filter(p => {
    const palcoName = palcoNameFromSeat(p.seat) || ''
    return (
      p.name?.toLowerCase().includes(k) ||
      (p.doc || '').toLowerCase().includes(k) ||
      (p.org || '').toLowerCase().includes(k) ||
      (p.seat || '').toLowerCase().includes(k) ||
      palcoName.toLowerCase().includes(k)
    )
  })
})

const tableHeight = computed(() => (smAndDown.value ? 360 : 480))

/* =====================
   STATUS VISUAL ASIENTO
===================== */
function seatStatusLocal(code) {
  const holder = store.people.find(p => p.seat === code)
  if (!holder) return 'free'
  if (holder.present) return 'present'
  return 'assigned'
}

function seatColor(code) {
  const st = seatStatusLocal(code)
  return st === 'present'
    ? 'success'
    : st === 'assigned'
      ? 'warning'
      : undefined
}

function seatVariant(code) {
  const st = seatStatusLocal(code)
  return st === 'free' ? 'outlined' : 'flat'
}

/* =====================
   ASIENTOS - PICKER
===================== */
const seatPickerOpen = ref(false)
const seatTarget = ref(null)        // persona objetivo
const selectedSeat = ref(null)      // asiento elegido dentro del modal
const pickerPalco = ref('P')        // 'P' = Principal, 'A' = Palco A, 'B' = Palco B

// opciones de palco para las chips
const palcoOptions = [
  { key: 'A', label: 'PALCO A' },
  { key: 'P', label: 'PRINCIPAL' },
  { key: 'B', label: 'PALCO B' },
]

// generador de estructura de filas para cada palco
function genPalco(letters, perRow) {
  return letters.map(letter => {
    const codes = []
    for (let i = 1; i <= perRow; i++) {
      codes.push(`${letter}${i}`)
    }
    return { letter, codes }
  })
}

// definimos los 3 mapas
const palcoAmap        = genPalco(['L','K','J','I','H'], 10)
const palcoPrincipalMap = genPalco(['G','F','E','D','C','B','A'], 12)
const palcoBmap        = genPalco(['Q','P','O','N','M'], 10)

// filas que se van a renderizar según pickerPalco
const rowsForPicker = computed(() => {
  if (pickerPalco.value === 'A') return palcoAmap
  if (pickerPalco.value === 'B') return palcoBmap
  return palcoPrincipalMap
})

// persona que ya tiene ese asiento?
const currentHolder = computed(() => {
  if (!selectedSeat.value) return null
  return store.people.find(p => p.seat === selectedSeat.value) || null
})

// abrir modal
function openSeatPicker(person) {
  seatTarget.value   = person
  selectedSeat.value = person.seat || null
  // seteamos palco inicial según su asiento actual
  pickerPalco.value  = palcoKeyFromSeat(person.seat)
  seatPickerOpen.value = true
}

// cerrar modal
function closeSeatPicker() {
  seatPickerOpen.value = false
  seatTarget.value = null
  selectedSeat.value = null
}

// confirmar cambio / asignación
async function confirmAssignSeat() {
  if (!seatTarget.value || !selectedSeat.value) return
  busy.value = true

  const targetId    = seatTarget.value.id
  const newSeatCode = selectedSeat.value

  try {
    // liberar a otra persona que ya lo tenga
    const other = store.people.find(
      p => p.id !== targetId && p.seat === newSeatCode
    )
    if (other) {
      await store.updatePerson(other.id, { seat: null })
    }

    // asignar a la persona actual
    await store.updatePerson(targetId, { seat: newSeatCode })

    await store.refresh()
    closeSeatPicker()
  } catch (err) {
    console.error('confirmAssignSeat error', err)
  } finally {
    busy.value = false
  }
}

// limpiar asiento
async function clearSeat(person) {
  if (!person?.id) return
  busy.value = true
  try {
    await store.updatePerson(person.id, { seat: null })
    await store.refresh()
  } catch (err) {
    console.error('clearSeat error', err)
  } finally {
    busy.value = false
  }
}

/* =====================
   PRESENCIA
===================== */
async function markPresent(person) {
  if (!person?.id) return
  busy.value = true
  try {
    await store.checkInById(person.id)
    await store.refresh()
  } catch (err) {
    console.error('markPresent error', err)
  } finally {
    busy.value = false
  }
}

async function removePresent(person) {
  if (!person?.id) return
  busy.value = true
  try {
    await store.updatePerson(person.id, { present: false })
    await store.refresh()
  } catch (err) {
    console.error('removePresent error', err)
  } finally {
    busy.value = false
  }
}

/* =====================
   EDITAR PERSONA
===================== */
const editDialogOpen = ref(false)
const editBuffer = ref({ id: null, name: '', doc: '', org: '' })

function openEditDialog(person) {
  editBuffer.value = {
    id: person.id,
    name: person.name || '',
    doc: person.doc || '',
    org: person.org || ''
  }
  editDialogOpen.value = true
}

async function saveEdit() {
  busy.value = true
  try {
    const { id, name, doc, org } = editBuffer.value
    await store.updatePerson(id, { name, doc, org })
    await store.refresh()
    editDialogOpen.value = false
  } catch (err) {
    console.error('saveEdit error', err)
  } finally {
    busy.value = false
  }
}

/* =====================
   ELIMINAR PERSONA
===================== */
const confirmOpen = ref(false)
const toRemove = ref(null)

function askRemove(item) {
  toRemove.value = item
  confirmOpen.value = true
}

async function doRemove() {
  if (!toRemove.value?.id) {
    confirmOpen.value = false
    return
  }
  busy.value = true
  try {
    await store.removePerson(toRemove.value.id)
    await store.refresh()
  } catch (err) {
    console.error('doRemove error', err)
  } finally {
    busy.value = false
    confirmOpen.value = false
    toRemove.value = null
  }
}
</script>

<style scoped>
.card-contrast {
  background: #0e1230 !important;
  border: 1px solid rgba(255, 217, 81, .14);
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
  color: #eaf0ff;
}
.title-contrast {
  background: linear-gradient(
    180deg,
    rgba(255,217,81,.06),
    rgba(11,13,40,0)
  );
  border-bottom: 1px solid rgba(255,217,81,.10);
  font-weight: 800;
}
.text-dim { color: rgba(234,240,255, .75); }
.text-accent { color: #ffd951; font-weight: 700; }
.nowrap { white-space: nowrap; }

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.search {
  max-width: 520px;
  width: 100%;
}
.search :deep(.v-field) {
  background: rgba(255,255,255,0.06) !important;
  border-radius: 12px !important;
}
.search :deep(.v-icon) {
  color: #ffd951 !important;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 14px;
  border: 1px solid rgba(255,217,81,.10);
  background: #111433;
}
.people-table {
  background: transparent !important;
  border: none !important;
  border-radius: 0;
}
.people-table :deep(table) {
  table-layout: auto !important;
  min-width: 1100px;
  width: 100%;
  border-collapse: collapse;
}
.people-table :deep(th),
.people-table :deep(td) {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  vertical-align: middle !important;
  padding: 0 12px !important;
  height: 48px;
  font-size: 0.85rem;
  color: #eaf0ff;
}
.people-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #14183f !important;
  color: #ffd951 !important;
  border-bottom: 1px solid rgba(255,217,81,.2);
  font-weight: 800 !important;
  font-size: 0.8rem;
  line-height: 1.1;
  text-align: left;
  height: 44px;
}
.people-table :deep(tbody tr:hover) {
  background: rgba(255, 217, 81, 0.08) !important;
}

.actions-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 6px;
  min-width: 220px;
  justify-content: flex-start;
}

.chip-strong {
  font-weight: 800;
  border-radius: 10px;
}
.chip-outline {
  color: #eaf0ff !important;
  border-color: rgba(234,240,255,.28) !important;
}

.btn-icon {
  color: #ffd951 !important;
}
.btn-icon :deep(.v-icon) {
  color: #ffd951 !important;
}

.btn-text {
  color: #ffd951 !important;
}
.btn-strong {
  font-weight: 800;
}

/* Chips palco selector */
.palco-selector {
  gap: 6px;
}
.chip-palco {
  background: rgba(255,217,81,.07) !important;
  border: 1px solid rgba(255,217,81,.24) !important;
  color: #ffd951 !important;
  font-weight: 600 !important;
  cursor: pointer;
}
.chip-palco.active {
  background: rgba(255,217,81,.3) !important;
  color: #0b0d28 !important;
  border-color: rgba(255,217,81,.5) !important;
  box-shadow: 0 8px 20px rgba(0,0,0,.6);
}

.legend { gap: 6px; }

.grid-rows-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 6px;
}
.grid-rows {
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  min-width: max(560px, 100%);
}
.row {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 44px repeat(12, 68px);
  gap: 8px;
  align-items: center;
}
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
}
.seat {
  min-width: 58px;
  height: 36px;
  border-radius: 18px;
  font-weight: 700;
  text-transform: none;
  box-shadow: 0 1px 2px rgba(0,0,0,.25);
}
.seat.present  { background: #4caf50 !important; color: #fff !important; }
.seat.assigned { background: #ffb300 !important; color: #0b0d28 !important; }
.seat.free     { background: #f3f5f9 !important; color: #0b0d28 !important; }
.seat-selected {
  outline: 2px solid #ffd951;
  outline-offset: 0;
  box-shadow: 0 0 8px rgba(255,217,81,.75);
}

.edit-field :deep(.v-field) {
  background: rgba(255,255,255,0.06) !important;
  border-radius: 12px !important;
  color: #eaf0ff !important;
}
.edit-field :deep(.v-icon) {
  color: #ffd951 !important;
}

@media (max-width: 960px) {
  .search { max-width: 100%; }
  .actions-row {
    min-width: auto;
    flex-wrap: wrap;
    gap: 6px;
  }
  .grid-rows {
    gap: 10px;
    min-width: max(480px, 100%);
  }
  .row {
    grid-template-columns: 36px repeat(12, 60px);
    gap: 6px;
  }
  .row-label {
    width: 36px;
    padding: 4px 0;
  }
  .seat {
    min-width: 54px;
    height: 32px;
    border-radius: 16px;
    font-size: 0.9rem;
  }
  .people-table :deep(thead th) {
    font-size: 0.7rem;
    padding: 0 8px !important;
  }
  .people-table :deep(td) {
    font-size: 0.8rem;
    padding: 0 8px !important;
  }
}
@media (max-width: 600px) {
  .people-table :deep(.v-chip) {
    height: 22px;
    font-size: 12px;
  }
}
</style>
