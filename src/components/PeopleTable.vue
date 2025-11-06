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
          label="Buscar por nombre, cargo, organismo, palco o asiento"
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
          <!-- PALCO (derivado de la letra del asiento) -->
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

    <!-- PICKER DE ASIENTO -->
    <SeatPickerDialog
      v-model="seatPickerOpen"
      :current-seat="seatTarget?.seat || ''"
      :person-name="seatTarget?.name || ''"
      :allow-assigned="false"
      @confirm="handleConfirmSeat"
    />

    <!-- EDITAR PERSONA -->
    <v-dialog v-model="editDialogOpen" max-width="720">
      <PersonEditForm
        v-if="editPerson"
        :person="editPerson"
        @update:person="editPerson = $event"
        @saved="onPersonSaved"
        @cancel="editDialogOpen = false"
      />
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { usePeopleStore } from '@/stores/peopleStore'
import SeatPickerDialog from './SeatPickerDialog.vue'
import PersonEditForm from './PersonEditForm.vue'

const { smAndDown } = useDisplay()
const people = usePeopleStore()

/* HEADERS */
const headers = [
  { title: 'ID',         key: 'id',        width: 70 },
  { title: 'Nombre',     key: 'name',      minWidth: 200 },
  { title: 'Cargo',      key: 'cargo',     width: 160 },
  { title: 'Organismo',  key: 'org',       minWidth: 200 },
  { title: 'Palco',      key: 'palco',     width: 150 },
  { title: 'Asiento',    key: 'seat',      width: 110 },
  { title: 'Estado',     key: 'present',   width: 110 },
  { title: 'Acciones',   key: 'actions',   width: 260, sortable: false }
]

/* MAPEO LETRA -> PALCO (ajustá nombres si querés) */
function palcoNameFromSeat(seatCode) {
  if (!seatCode) return null
  const first = String(seatCode).charAt(0).toUpperCase()
  // Tu distribución declarada en otros componentes:
  // 1: Principal (A-F) | 2: A Derecha (G-I) | 3: B Izquierda (J-L)
  if ('ABCDEF'.includes(first)) return 'PALCO PRINCIPAL'
  if ('GHI'.includes(first))    return 'PALCO A'
  if ('JKL'.includes(first))    return 'PALCO B'
  return '—'
}

/* BUSCADOR / FILTRADO */
const q = ref('')
const busy = ref(false)

const filtered = computed(() => {
  const k = q.value.trim().toLowerCase()
  const rows = people.list || []
  if (!k) return rows
  return rows.filter(p => {
    const palcoName = palcoNameFromSeat(p.seat) || ''
    return (
      p.name?.toLowerCase().includes(k) ||
      (p.cargo || '').toLowerCase().includes(k) ||
      (p.org || '').toLowerCase().includes(k) ||
      (p.seat || '').toLowerCase().includes(k) ||
      palcoName.toLowerCase().includes(k)
    )
  })
})

const tableHeight = computed(() => (smAndDown.value ? 360 : 480))

/* STATUS VISUAL ASIENTO */
function seatStatusLocal(code) {
  const holder = (people.list || []).find(p => p.seat === code)
  if (!holder) return 'free'
  return holder.present ? 'present' : 'assigned'
}
function seatColor(code) {
  const st = seatStatusLocal(code)
  return st === 'present' ? 'success' : st === 'assigned' ? 'warning' : undefined
}
function seatVariant(code) {
  const st = seatStatusLocal(code)
  return st === 'free' ? 'outlined' : 'flat'
}

/* ASIGNACIÓN DE ASIENTO */
const seatPickerOpen = ref(false)
const seatTarget = ref(null)

function openSeatPicker(person) {
  seatTarget.value = person
  seatPickerOpen.value = true
}

async function handleConfirmSeat(payload) {
  const seatCode = typeof payload === 'string' ? payload : payload?.seat
  if (!seatTarget.value || !seatCode) return
  busy.value = true
  try {
    const other = (people.list || []).find(p => p.id !== seatTarget.value.id && p.seat === seatCode)
    if (other) await people.updatePerson(other.id, { seat: null })
    await people.updatePerson(seatTarget.value.id, { seat: seatCode })
    await people.fetchAll()
    seatPickerOpen.value = false
  } catch (err) {
    console.error('handleConfirmSeat error', err)
  } finally {
    busy.value = false
  }
}

async function clearSeat(person) {
  if (!person?.id) return
  busy.value = true
  try {
    await people.updatePerson(person.id, { seat: null })
    await people.fetchAll()
  } catch (err) {
    console.error('clearSeat error', err)
  } finally {
    busy.value = false
  }
}

/* PRESENCIA */
async function markPresent(person) {
  if (!person?.id) return
  busy.value = true
  try {
    await people.markPresent(person.id)            // POST /people/:id/checkin
    await people.fetchAll()
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
    await people.updatePerson(person.id, { present: false })
    await people.fetchAll()
  } catch (err) {
    console.error('removePresent error', err)
  } finally {
    busy.value = false
  }
}

/* EDITAR PERSONA */
const editDialogOpen = ref(false)
const editPerson = ref(null)

function openEditDialog(person) {
  editPerson.value = { ...person }
  editDialogOpen.value = true
}
async function onPersonSaved() {
  try {
    busy.value = true
    await people.fetchAll()
  } finally {
    busy.value = false
    editDialogOpen.value = false
  }
}

/* ELIMINAR PERSONA */
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
    await people.removePerson(toRemove.value.id)
    await people.fetchAll()
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
  background: linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0));
  border-bottom: 1px solid rgba(255,217,81,.10);
  font-weight: 800;
}
.text-dim { color: rgba(234,240,255, .75); }
.text-accent { color: #ffd951; font-weight: 700; }
.nowrap { white-space: nowrap; }

.topbar { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
.search { max-width:520px; width:100%; }
.search :deep(.v-field){ background:rgba(255,255,255,0.06) !important; border-radius:12px !important; }
.search :deep(.v-icon){ color:#ffd951 !important; }

.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 14px;
  border: 1px solid rgba(255,217,81,.10);
  background: #111433;
}
.people-table { background: transparent !important; border: none !important; border-radius: 0; }
.people-table :deep(table){ table-layout:auto !important; min-width:1100px; width:100%; border-collapse:collapse; }
.people-table :deep(th), .people-table :deep(td){
  white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
  vertical-align: middle !important;
  padding: 0 12px !important; height: 48px; font-size: .85rem; color: #eaf0ff;
}
.people-table :deep(thead th){
  position: sticky; top: 0; z-index: 2;
  background: #14183f !important; color: #ffd951 !important;
  border-bottom: 1px solid rgba(255,217,81,.2);
  font-weight: 800 !important; font-size: .8rem; line-height: 1.1; text-align: left; height: 44px;
}
.people-table :deep(tbody tr:hover){ background: rgba(255, 217, 81, 0.08) !important; }

.actions-row { display:flex; flex-wrap:nowrap; align-items:center; gap:6px; min-width:220px; justify-content:flex-start; }

.chip-strong { font-weight: 800; border-radius: 10px; }
.chip-outline { color:#eaf0ff !important; border-color: rgba(234,240,255,.28) !important; }

.btn-icon, .btn-icon :deep(.v-icon){ color:#ffd951 !important; }
.btn-text { color:#ffd951 !important; }
.btn-strong { font-weight:800; }

@media (max-width: 960px) {
  .search { max-width: 100%; }
  .actions-row { min-width: auto; flex-wrap: wrap; gap: 6px; }
  .people-table :deep(thead th){ font-size:.7rem; padding:0 8px !important; }
  .people-table :deep(td){ font-size:.8rem; padding:0 8px !important; }
}
@media (max-width: 600px) {
  .people-table :deep(.v-chip){ height:22px; font-size:12px; }
}
</style>
