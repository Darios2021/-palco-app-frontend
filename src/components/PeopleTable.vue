<!-- src/views/PeopleList.vue -->
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
            <v-chip
              :color="item.present ? 'success' : 'grey-darken-1'"
              size="small"
              label
              class="chip-strong"
            >
              {{ item.present ? 'Presente' : '—' }}
            </v-chip>
          </template>

          <!-- Asiento -->
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
            <!-- Escritorio -->
            <div v-if="!smAndDown" class="d-flex">
              <!-- Editar -->
              <v-tooltip text="Editar datos" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil"
                    variant="text"
                    class="btn-icon"
                    @click="openEditor(item)"
                  />
                </template>
              </v-tooltip>

              <!-- Marcar presente -->
              <v-tooltip text="Marcar presente" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-checkbox-marked-circle"
                    variant="text"
                    class="btn-icon"
                    :disabled="item.present"
                    :loading="loadingId === item.id && pendingAction === 'present-on'"
                    @click="markPresent(item.id)"
                  />
                </template>
              </v-tooltip>

              <!-- Quitar presencialidad -->
              <v-tooltip text="Quitar presencialidad" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-close-circle"
                    variant="text"
                    class="btn-icon"
                    :loading="loadingId === item.id && pendingAction === 'present-off'"
                    :disabled="!item.present"
                    @click="removePresence(item)"
                  />
                </template>
              </v-tooltip>

              <!-- Cambiar / Asignar asiento -->
              <v-tooltip
                :text="item.seat ? 'Cambiar asiento' : 'Asignar asiento'"
                location="top"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-seat"
                    variant="text"
                    class="btn-icon"
                    :loading="loadingId === item.id && pendingAction === 'assign'"
                    @click="openPicker(item)"
                  />
                </template>
              </v-tooltip>

              <!-- Desasignar asiento -->
              <v-tooltip text="Desasignar asiento" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-seat-passenger"
                    variant="text"
                    class="btn-icon"
                    color="warning"
                    :disabled="!item.seat"
                    :loading="loadingId === item.id && pendingAction === 'unassign'"
                    @click="unassignSeat(item)"
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
                    class="btn-icon"
                  />
                </template>
                <v-list density="comfortable">
                  <v-list-item
                    @click="openEditor(item)"
                    prepend-icon="mdi-pencil"
                    title="Editar datos"
                  />
                  <v-list-item
                    :disabled="item.present"
                    @click="markPresent(item.id)"
                    prepend-icon="mdi-checkbox-marked-circle"
                    title="Marcar presente"
                  />
                  <v-list-item
                    :disabled="!item.present"
                    @click="removePresence(item)"
                    prepend-icon="mdi-close-circle"
                    title="Quitar presencialidad"
                  />
                  <v-list-item
                    @click="openPicker(item)"
                    prepend-icon="mdi-seat"
                    :title="item.seat ? 'Cambiar asiento' : 'Asignar asiento'"
                  />
                  <v-list-item
                    :disabled="!item.seat"
                    @click="unassignSeat(item)"
                    prepend-icon="mdi-seat-passenger"
                    title="Desasignar asiento"
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

    <!-- Picker de asientos -->
    <v-dialog v-model="picker.open" max-width="680">
      <v-card rounded="xl" class="card-contrast">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-seat</v-icon>
          {{ picker.person?.seat ? 'Cambiar asiento' : 'Asignar asiento' }}
          <v-spacer />
          <span
            v-if="picker.person?.name"
            class="text-dim text-caption"
          >{{ picker.person.name }}</span>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <div class="seat-grid">
            <v-btn
              v-for="code in flatSeats"
              :key="code"
              :text="code"
              class="seat-btn"
              :variant="seatStatus(code) === 'free' ? 'outlined' : 'flat'"
              :color="seatStatus(code) === 'present'
                ? 'success'
                : seatStatus(code) === 'assigned'
                  ? 'warning'
                  : undefined"
              :disabled="seatStatus(code) !== 'free' && code !== picker.person?.seat"
              @click="selectSeat(code)"
            />
          </div>

          <div class="legend mt-3 d-flex align-center gap-2">
            <v-chip size="small" color="success" label>Presente</v-chip>
            <v-chip size="small" color="warning" label>Asignado</v-chip>
            <v-chip size="small" variant="outlined" label>Libre</v-chip>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn
            variant="text"
            class="btn-text"
            @click="picker.open = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            class="btn-strong"
            :disabled="!picker.selectedCode"
            :loading="loadingId === picker.person?.id && pendingAction === 'assign'"
            @click="confirmPick"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Editor de persona -->
    <v-dialog v-model="editor.open" max-width="640" persistent>
      <v-card rounded="xl" class="card-contrast">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-account-edit</v-icon>
          Editar datos
          <v-spacer />
          <v-chip
            v-if="editor.model?.id"
            size="small"
            label
          >
            ID {{ editor.model.id }}
          </v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-form
            ref="editFormRef"
            v-model="editor.valid"
            @submit.prevent="saveEdit"
          >
            <div class="grid gap-3 sm:grid-cols-2">
              <v-text-field
                v-model="editor.model.name"
                label="Nombre y Apellido"
                :rules="[rules.required, rules.min3]"
                clearable
              />
              <v-text-field
                v-model="editor.model.doc"
                label="DNI"
                :rules="[rules.required, rules.dni]"
                clearable
              />
              <v-text-field
                v-model="editor.model.org"
                label="Organismo / Institución"
                clearable
                class="sm:col-span-2"
              />
              <v-switch
                v-model="editor.model.present"
                inset
                color="success"
                hide-details
                class="sm:col-span-2"
                :label="editor.model.present ? 'Presente' : 'No presente'"
              />
            </div>
          </v-form>

          <div class="text-dim text-caption mt-2">
            * La edición no modifica el asiento asignado. Usá el botón de
            “Asiento” para cambiarlo.
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4 action-bar">
          <v-spacer />

          <v-btn
            variant="text"
            class="btn-text"
            :disabled="editor.loading"
            @click="closeEditor"
          >
            Cancelar
          </v-btn>

          <v-btn
            class="btn-primary-strong"
            :loading="editor.loading"
            :disabled="!editor.valid || editor.loading"
            @click="saveEdit"
          >
            Guardar cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.open"
      location="top right"
      :timeout="2200"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'

const { smAndDown } = useDisplay()
const store = useSeatsStore()

/* Seats base de fallback */
if (!store.seats?.length) {
  store.initSeats?.(['A', 'B', 'C', 'D'], 10)
}

/* Columnas tabla */
const headers = [
  { title: 'ID',        key: 'id',      width: 90 },
  { title: 'Nombre',    key: 'name' },
  { title: 'DNI',       key: 'doc',     width: 140 },
  { title: 'Organismo', key: 'org' },
  { title: 'Asiento',   key: 'seat',    width: 120 },
  { title: 'Estado',    key: 'present', width: 120 },
  { title: 'Acciones',  key: 'actions', width: 240, sortable: false }
]

/* Búsqueda / filtro */
const q = ref('')
const filtered = computed(() => {
  const k = q.value.trim().toLowerCase()
  const items = store.people ?? []
  if (!k) return items
  return items.filter(p =>
    p.name?.toLowerCase().includes(k) ||
    (p.doc || '').toLowerCase().includes(k) ||
    (p.org || '').toLowerCase().includes(k) ||
    (p.seat || '').toLowerCase().includes(k)
  )
})

/* Altura de tabla responsive */
const tableHeight = computed(() => (smAndDown.value ? 360 : 420))

/* Estado visual del asiento */
function seatStatus(code) {
  if (typeof store.seatStatus === 'function') return store.seatStatus(code)
  const who = (store.people ?? []).find(
    p => (p.seat ?? p.seatCode) === code
  )
  if (!who) return 'free'
  return who.present ? 'present' : 'assigned'
}
function seatColor(code) {
  const st = seatStatus(code)
  return st === 'present'
    ? 'success'
    : st === 'assigned'
      ? 'warning'
      : undefined
}
function seatVariant(code) {
  const st = seatStatus(code)
  return st === 'free' ? 'outlined' : 'flat'
}

/* Helpers store seguros */
async function tryCall(name, ...args) {
  const fn = store?.[name]
  if (typeof fn !== 'function') return undefined
  try {
    return await fn(...args)
  } catch {
    return undefined
  }
}
async function refreshStore() {
  await (
    store.reload?.() ||
    store.ensureLoaded?.() ||
    Promise.resolve()
  )
}

/* Snackbar, loading, acción pendiente */
const loadingId = ref(null)
const pendingAction = ref(null) // 'present-on' | 'present-off' | 'assign' | 'unassign'
const snackbar = ref({ open: false, text: '' })

/* Presente ON */
async function markPresent(id) {
  loadingId.value = id
  pendingAction.value = 'present-on'
  try {
    await tryCall('checkInById', id) ??
    await tryCall('setPresent', id, true) ??
    await tryCall('updatePerson', id, { present: true })

    await refreshStore()
    snackbar.value = { open: true, text: 'Marcado presente' }
  } catch (e) {
    snackbar.value = {
      open: true,
      text: e?.message || 'No se pudo marcar presente.'
    }
  } finally {
    loadingId.value = null
    pendingAction.value = null
  }
}

/* Presente OFF (sin tocar seat) */
async function removePresence(item) {
  loadingId.value = item.id
  pendingAction.value = 'present-off'
  try {
    await tryCall('setPresent', item.id, false) ??
    await tryCall('uncheckInById', item.id) ??
    await tryCall('clearPresenceById', item.id) ??
    await tryCall('updatePerson', item.id, { present: false })

    await refreshStore()
    snackbar.value = {
      open: true,
      text: 'Presencialidad quitada'
    }
  } catch (e) {
    snackbar.value = {
      open: true,
      text: e?.message || 'No se pudo quitar la presencialidad.'
    }
  } finally {
    loadingId.value = null
    pendingAction.value = null
  }
}

/* Picker de asiento */
const picker = ref({
  open: false,
  person: null,
  selectedCode: null
})

const flatSeats = computed(() => store.seats?.flat() ?? [])

function openPicker(person) {
  picker.value = {
    open: true,
    person: {
      ...person,
      seat: person.seat ?? person.seatCode ?? null
    },
    selectedCode: person.seat ?? person.seatCode ?? null
  }
}

function selectSeat(code) {
  picker.value.selectedCode = code
}

async function confirmPick() {
  const p = picker.value.person
  const code = picker.value.selectedCode
  if (!p?.id || !code) return

  loadingId.value = p.id
  pendingAction.value = 'assign'

  try {
    await tryCall('assignSeat', p.id, code) ??
    await tryCall('reserveSeat', p.id, code) ??
    await tryCall('setSeat', p.id, code) ??
    await tryCall('updatePerson', p.id, { seat: code })

    await refreshStore()
    snackbar.value = {
      open: true,
      text: `Asiento asignado: ${code}`
    }
    picker.value.open = false
  } catch (e) {
    snackbar.value = {
      open: true,
      text: e?.message || 'No se pudo asignar el asiento.'
    }
  } finally {
    loadingId.value = null
    pendingAction.value = null
  }
}

/* Liberar asiento */
async function unassignSeat(item) {
  loadingId.value = item.id
  pendingAction.value = 'unassign'

  try {
    await tryCall('unassignSeat', item.id) ??
    await tryCall('releaseSeatById', item.id) ??
    await tryCall('freeSeatById', item.id) ??
    await tryCall('setSeat', item.id, null) ??
    await tryCall('updatePerson', item.id, { seat: null })

    await refreshStore()
    snackbar.value = {
      open: true,
      text: 'Asiento desasignado'
    }
  } catch (e) {
    snackbar.value = {
      open: true,
      text: e?.message || 'No se pudo desasignar el asiento.'
    }
  } finally {
    loadingId.value = null
    pendingAction.value = null
  }
}

/* ===== Editor persona ===== */
const editor = ref({
  open: false,
  loading: false,
  valid: false,
  model: null
})
const editFormRef = ref(null)

function openEditor(person) {
  editor.value = {
    open: true,
    loading: false,
    valid: true,
    model: {
      id: person.id,
      name: person.name ?? '',
      doc: person.doc ?? '',
      org: person.org ?? '',
      present: !!person.present
    }
  }
  nextTick(() => {
    // acá podrías hacer focus si querés
  })
}

function closeEditor() {
  editor.value.open = false
  editor.value.loading = false
}

async function saveEdit() {
  if (!editor.value.model) return
  const formOk = await editFormRef.value?.validate?.()
  if (!formOk || formOk.valid === false) return

  const { id, name, doc, org, present } = editor.value.model
  const payload = {
    name: name?.trim(),
    doc: (doc ?? '').trim(),
    org: (org ?? '').trim(),
    present: !!present
  }

  editor.value.loading = true
  try {
    await tryCall('updatePerson', id, payload) ??
    await tryCall('patchPerson', id, payload) ??
    await tryCall('savePerson', id, payload)

    await refreshStore()
    snackbar.value = {
      open: true,
      text: 'Datos actualizados'
    }
    closeEditor()
  } catch (e) {
    snackbar.value = {
      open: true,
      text: e?.message || 'No se pudo actualizar la persona.'
    }
  } finally {
    editor.value.loading = false
  }
}

/* Validaciones */
const rules = {
  required: v =>
    (!!v && String(v).trim().length > 0) || 'Campo requerido',
  min3: v =>
    (String(v ?? '').trim().length >= 3) ||
    'Mínimo 3 caracteres',
  dni: v => {
    const s = String(v ?? '').trim()
    return /^\d{6,12}$/.test(s) || 'DNI inválido'
  }
}
</script>

<style scoped>
/* ===== Card / dark theme ===== */
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
  color: #eaf0ff;
}

.text-dim {
  color: rgba(234,240,255, .78);
}

/* ===== Topbar / búsqueda ===== */
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

/* ===== Tabla ===== */
.table-wrap {
  width: 100%;
  overflow-x: auto;
}

.people-table {
  background: #111433 !important;
  border: 1px solid rgba(255,217,81,.10);
  border-radius: 14px;
}

.people-table :deep(thead th) {
  position: sticky;
  top: 0;
  background: #14183f !important;
  color: #ffd951 !important;
  z-index: 2;
  font-weight: 800 !important;
}

.people-table :deep(tbody tr:hover) {
  background: rgba(255, 217, 81, 0.08) !important;
}

/* Chips */
.chip-strong {
  font-weight: 800;
  border-radius: 10px;
}

/* Botones acción */
.btn-icon {
  color: #ffd951 !important;
}
.btn-icon :deep(.v-icon) {
  color: #ffd951 !important;
}

/* Botón texto (Cancelar) */
.btn-text {
  color: #eaf0ff !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: .04em;
}

/* CTA dorado (Guardar cambios) */
.btn-primary-strong {
  background-color: #ffd951 !important;
  color: #0e1230 !important;
  font-weight: 800 !important;
  border-radius: 10px !important;
  text-transform: uppercase;
  letter-spacing: .04em;
  min-width: 160px;
}

.btn-primary-strong:disabled,
.btn-primary-strong[disabled] {
  background-color: rgba(255,217,81,.28) !important;
  color: rgba(14,18,48,.5) !important;
}

/* Botón confirmar asiento (usa .btn-strong histórica) */
.btn-strong {
  font-weight: 800 !important;
  border-radius: 10px !important;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: #0e1230 !important;
  background-color: #ffd951 !important;
}
.btn-strong:disabled,
.btn-strong[disabled] {
  background-color: rgba(255,217,81,.28) !important;
  color: rgba(14,18,48,.5) !important;
}

/* footer acciones del modal */
.action-bar {
  background: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ===== Seat picker grid ===== */
.seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px,1fr));
  gap: 10px;
}
.seat-btn {
  width: 100%;
}

/* ===== Responsive ===== */
@media (max-width: 960px) {
  .search { max-width: 100%; }
}
@media (max-width: 600px) {
  .people-table :deep(.v-chip) {
    height: 22px;
    font-size: 12px;
  }
}
</style>
