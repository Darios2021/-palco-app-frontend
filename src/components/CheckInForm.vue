<!-- components/CheckInForm.vue -->
<template>
  <v-card class="ck-wrap" rounded="2xl" elevation="2">
    <!-- ===== HEADER ===== -->
    <header class="ck-header">
      <div class="ck-h-left">
        <v-icon size="22" class="mr-2">mdi-account-search</v-icon>
        <span class="ck-title">Control de ingreso al palco</span>
      </div>
      <!-- limpio: sin chips duplicados -->
    </header>

    <v-divider class="ck-divider" />

    <v-card-text class="ck-body">
      <!-- ===== BUSCADOR + CTA PRESENTE ===== -->
      <v-form @submit.prevent="onSubmit" class="ck-form">
        <v-autocomplete
          v-model="selected"
          v-model:search="search"
          :items="items"
          :loading="loading"
          variant="solo-filled"
          density="comfortable"
          label="Nombre completo"
          placeholder="Buscá por nombre, DNI u organismo…"
          prepend-inner-icon="mdi-account"
          return-object
          clearable
          open-on-focus
          open-on-clear
          auto-select-first
          hide-details="auto"
          :menu-props="menuProps"
          :custom-filter="filterFn"
          no-data-text="Sin coincidencias. Cargá la persona en la sección Personas."
          @update:model-value="onSelected"
          @keydown.enter.prevent="onSubmit"
          aria-label="Buscar persona para registrar asistencia"
          class="ck-search"
        >
          <!-- ITEM EN LISTA -->
          <template #item="{ props, item }">
            <v-list-item v-bind="props" density="comfortable" class="ck-item">
              <template #prepend>
                <v-avatar :size="avatarSize" class="elevated">
                  <span class="avatar-text">{{ initials(item.raw.title) }}</span>
                </v-avatar>
              </template>

              <template #title>
                <div class="row-title">
                  <span class="name text-truncate">{{ item.raw.title }}</span>
                  <v-chip
                    v-if="item.raw.seatCode"
                    size="x-small"
                    class="ml-2"
                    :color="item.raw.present ? 'success' : 'warning'"
                    label
                  >
                    {{ item.raw.seatCode }}
                  </v-chip>
                  <v-chip
                    v-else
                    size="x-small"
                    class="ml-2"
                    variant="outlined"
                    label
                  >
                    Libre
                  </v-chip>
                </div>
              </template>

              <template #subtitle>
                <span class="muted text-truncate">{{ item.raw.subtitle }}</span>
              </template>

              <template #append>
                <div
                  class="state-dot"
                  :class="item.raw.present ? 'is-present' : (item.raw.seatCode ? 'is-assigned' : 'is-free')"
                />
              </template>
            </v-list-item>
          </template>

          <!-- LO QUE SE VE ADENTRO DEL INPUT CUANDO YA ELEGISTE -->
          <template #selection="{ item }">
            <div class="sel-wrap">
              <v-avatar :size="22" class="mr-2">
                <span class="avatar-text tiny">{{ initials(item.raw.title) }}</span>
              </v-avatar>
              <span class="text-truncate">{{ item.raw.title }}</span>
              <v-chip
                v-if="item.raw.seatCode"
                size="x-small"
                class="ml-2"
                :color="item.raw.present ? 'success' : 'warning'"
                label
              >
                {{ item.raw.seatCode }}
              </v-chip>
              <v-chip
                v-else
                size="x-small"
                class="ml-2"
                variant="outlined"
                label
              >
                Libre
              </v-chip>
            </div>
          </template>
        </v-autocomplete>

        <!-- BOTÓN MARCAR PRESENTE -->
        <v-tooltip
          v-if="!isAlreadyPresent"
          text="Registrar asistencia"
          location="top"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="ck-primary"
              type="submit"
              size="large"
              rounded="lg"
              prepend-icon="mdi-check"
              :loading="submitting"
              :disabled="!selected"
              block
            >
              REGISTRAR
            </v-btn>
          </template>
        </v-tooltip>

        <!-- CHIP YA REGISTRADO (REEMPLAZA EL BOTÓN) -->
        <div
          v-else
          class="already-wrap"
        >
          <v-chip
            color="success"
            label
            size="large"
            class="already-chip"
            variant="flat"
          >
            <v-icon start size="18">mdi-check-decagram</v-icon>
            YA REGISTRADO
          </v-chip>
        </div>
      </v-form>

      <!-- ===== PANEL DE DETALLE ===== -->
      <v-expand-transition>
        <v-sheet v-if="selected" class="cd-card" rounded="2xl">
          <!-- HEAD -->
          <div class="cd-head">
            <div class="cd-ident">
              <v-avatar size="46" class="elevated">
                <span class="avatar-text">{{ initials(selected.title) }}</span>
              </v-avatar>

              <div class="cd-namewrap">
                <div class="cd-title text-truncate">{{ selected.title }}</div>
                <div
                  v-if="selected.subtitle"
                  class="cd-sub muted text-truncate"
                >
                  {{ selected.subtitle }}
                </div>
              </div>
            </div>

            <div class="cd-badges">
              <!-- Estado general -->
              <v-chip
                size="small"
                :color="isAlreadyPresent ? 'success' : (selectedSeatCode ? 'warning' : '')"
                :variant="!selectedSeatCode ? 'outlined' : 'flat'"
                label
              >
                {{ chipText }} <!-- Presente / Asignado / Sin asiento -->
              </v-chip>

              <!-- Asiento -->
              <v-chip
                v-if="selectedSeatCode"
                size="small"
                color="primary"
                label
                class="ml-2"
              >
                {{ selectedSeatCode }}
              </v-chip>
            </div>
          </div>

          <v-divider class="cd-divider" />

          <!-- GRID CAMPOS -->
          <div class="cd-grid">
            <div class="cd-field">
              <v-icon size="16" class="mr-1 muted">mdi-card-account-details</v-icon>
              <span class="lbl">DNI</span>
              <span class="val">{{ selectedDoc || '—' }}</span>
            </div>

            <div class="cd-field">
              <v-icon size="16" class="mr-1 muted">mdi-town-hall</v-icon>
              <span class="lbl">Organismo</span>
              <span class="val">{{ selectedOrg || '—' }}</span>
            </div>

            <div class="cd-field">
              <v-icon size="16" class="mr-1 muted">mdi-check</v-icon>
              <span class="lbl">Estado</span>
              <span class="val">
                <span v-if="isAlreadyPresent">Presente</span>
                <span v-else-if="selectedSeatCode">Asignado</span>
                <span v-else>Sin asignar</span>
              </span>
            </div>

            <div class="cd-field">
              <v-icon size="16" class="mr-1 muted">mdi-seat</v-icon>
              <span class="lbl">Asiento</span>
              <span class="val">{{ selectedSeatCode || '—' }}</span>
            </div>
          </div>

          <!-- ACCIONES DINÁMICAS -->
          <div class="cd-actions">
            <!-- ASIGNAR ASIENTO (NO TIENE ASIENTO) -->
            <v-btn
              v-if="!selectedSeatCode"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-seat"
              class="cd-action"
              @click="emit('assign-seat', selectedId)"
            >
              Asignar asiento
            </v-btn>

            <!-- CAMBIAR ASIENTO (TIENE ASIENTO) -->
            <v-btn
              v-if="selectedSeatCode"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-seat"
              class="cd-action"
              @click="emit('assign-seat', selectedId)"
            >
              Cambiar asiento
            </v-btn>

            <!-- LIBERAR ASIENTO (TIENE ASIENTO) -->
            <v-btn
              v-if="selectedSeatCode"
              variant="tonal"
              color="warning"
              prepend-icon="mdi-seat-passenger"
              class="cd-action"
              :disabled="releasing"
              :loading="releasing"
              @click="confirmRelease = true"
            >
              Liberar asiento
            </v-btn>

            <!-- QUITAR PRESENTE (SÓLO SI ESTÁ PRESENTE) -->
            <v-btn
              v-if="isAlreadyPresent"
              variant="tonal"
              color="error"
              prepend-icon="mdi-close-circle-outline"
              class="cd-action"
              :disabled="unmarking"
              :loading="unmarking"
              @click="onUnmarkPresent"
            >
              Quitar presente
            </v-btn>
          </div>
        </v-sheet>
      </v-expand-transition>

      <!-- ===== FEEDBACK CHECK-IN OK ===== -->
      <v-expand-transition>
        <div
          v-if="showSuccess"
          class="success-banner"
          role="status"
          aria-live="polite"
        >
          <div class="icon-wrap"><v-icon size="28">mdi-check-circle</v-icon></div>
          <div class="msg-wrap">
            <div class="title">Asistencia registrada</div>
            <div class="subtitle">
              <span v-if="lastSeat">Asiento <strong>{{ lastSeat }}</strong>.</span>
              <span v-else>Sin asiento asignado.</span>
            </div>
          </div>
        </div>
      </v-expand-transition>

      <!-- Snackbar -->
      <v-snackbar v-model="snackbar.open" location="top right" :timeout="2200">
        {{ snackbar.text }}
      </v-snackbar>
    </v-card-text>

    <!-- ===== DIALOGO CONFIRMAR LIBERAR ASIENTO ===== -->
    <v-dialog v-model="confirmRelease" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="pt-4 pb-0">
          <v-icon class="mr-2">mdi-seat-passenger</v-icon>
          Confirmar liberación
        </v-card-title>
        <v-card-text class="pt-2">
          ¿Liberar el asiento <strong>{{ selectedSeatCode }}</strong> para
          <strong>{{ selected?.title }}</strong>?
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmRelease = false">Cancelar</v-btn>
          <v-btn color="warning" :loading="releasing" @click="onReleaseSeat">
            Liberar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'

/* Eventos al padre */
const emit = defineEmits([
  'checked-in',
  'error',
  'assign-seat',
  'release-seat',
  'seat-released',
  'presence-removed'
])

const { smAndDown } = useDisplay()
const store = useSeatsStore()

/* Estado base */
const loading = ref(false)
const submitting = ref(false)
const releasing = ref(false)
const unmarking = ref(false) // 👈 nuevo: para "Quitar presente"
const search = ref('')
const selected = ref(null)

/* Persona seleccionada */
const selectedSeatCode = ref(null)
const selectedSeatId = ref(null)
const selectedPresent = ref(false)
const selectedDoc = ref('')
const selectedOrg = ref('')

/* Feedback UI */
const showSuccess = ref(false)
const lastSeat = ref(null)
const snackbar = ref({ open: false, text: '' })

/* Diálogo liberar asiento */
const confirmRelease = ref(false)

/* Responsivo */
const menuProps = computed(() => ({
  maxHeight: smAndDown.value ? 320 : 380,
  offset: smAndDown.value ? 6 : 8
}))
const avatarSize = computed(() => (smAndDown.value ? 28 : 32))

onMounted(async () => {
  loading.value = true
  try {
    await store.ensureLoaded?.()
  } finally {
    loading.value = false
  }
})

/* Helpers */
const norm = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const initials = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(x => x[0]?.toUpperCase() ?? '')
    .join('')

/* Items para el autocomplete */
const items = computed(() =>
  (store.people ?? []).map(p => ({
    title: p.name,
    value: p.id,
    seatId: p.seatId ?? p.seat_id ?? null,
    seatCode: p.seatCode ?? p.seat ?? null,
    present: !!p.present,
    subtitle: [p.org, p.doc].filter(Boolean).join(' · ') || '—',
    doc: p.doc || '',
    org: p.org || '',
    _keywords: norm([p.name, p.doc, p.org].filter(Boolean).join(' '))
  }))
)

const selectedId = computed(() => selected.value?.value ?? null)
const isAlreadyPresent = computed(() => !!selectedPresent.value)

/* chip de estado */
const chipText = computed(() => {
  if (isAlreadyPresent.value) return 'Presente'
  if (selectedSeatCode.value) return 'Asignado'
  return 'Sin asiento'
})

/* filtro local */
function filterFn (_title, _query, item) {
  const q = norm(search.value)
  if (!q) return true
  return item?.raw?._keywords?.includes(q)
}

/* al seleccionar una persona */
function onSelected (obj) {
  selectedSeatCode.value = obj?.seatCode || null
  selectedSeatId.value = obj?.seatId || null
  selectedPresent.value = !!obj?.present
  selectedDoc.value = obj?.doc || ''
  selectedOrg.value = obj?.org || ''
  showSuccess.value = false
  snackbar.value.open = false
}

/* si limpio la búsqueda -> limpio todo */
watch(search, v => {
  if (!v) {
    selected.value = null
    selectedSeatCode.value = null
    selectedSeatId.value = null
    selectedPresent.value = false
    selectedDoc.value = ''
    selectedOrg.value = ''
    showSuccess.value = false
    snackbar.value.open = false
  }
})

/* marcar presente */
async function onSubmit () {
  if (!selected.value) return

  // anti doble marcado
  const personInStore = (store.people ?? []).find(
    p => p.id === selectedId.value
  )
  const already = selectedPresent.value || !!personInStore?.present
  if (already) {
    snackbar.value = { open: true, text: 'Ya estaba presente.' }
    return
  }

  submitting.value = true
  try {
    const id = selectedId.value
    const p = await store.checkInById?.(id)

    if (p) {
      syncFromPerson(p)
    }

    lastSeat.value = selectedSeatCode.value || null
    showSuccess.value = true
    snackbar.value = { open: true, text: 'Check-in confirmado ✅' }

    emit('checked-in', { person: p ?? selected.value })
  } catch (e) {
    snackbar.value = { open: true, text: 'No se pudo registrar' }
    emit('error', {
      message:
        e?.response?.data?.message ||
        e?.message ||
        'Error al registrar asistencia.'
    })
  } finally {
    submitting.value = false
  }
}

/* helper: probar variantes de métodos del store */
async function tryCall (name, ...args) {
  const fn = store?.[name]
  if (typeof fn !== 'function') return undefined
  try {
    return await fn(...args)
  } catch (err) {
    if (process?.env?.NODE_ENV !== 'production') {
      console.warn(`[CheckInForm] ${name}() falló:`, err)
    }
    return undefined
  }
}

/* liberar asiento */
async function onReleaseSeat () {
  if (!selectedId.value || !selectedSeatCode.value) {
    confirmRelease.value = false
    return
  }
  releasing.value = true
  try {
    const personId = selectedId.value
    const seatId = selectedSeatId.value
    const seatCode = selectedSeatCode.value

    const attempts = [
      () => tryCall('releaseSeatById', personId),
      () => tryCall('freeSeatById', personId),
      () => tryCall('unassignSeatById', personId),
      () => tryCall('releaseSeatByPersonId', personId),
      () => tryCall('releaseSeat', { personId, seatId, seatCode }),
      () => tryCall('freeSeat', { personId, seatId, seatCode }),
      () => tryCall('unassignSeat', { personId, seatId, seatCode }),
      () => tryCall('assignSeat', personId, null),
      () => tryCall('setSeat', personId, null),
      () => (seatId ? tryCall('releaseSeatBySeatId', seatId) : undefined)
    ]

    let released
    for (const run of attempts) {
      // eslint-disable-next-line no-await-in-loop
      released = await run()
      if (released !== undefined) break
    }

    // actualizar UI local después de liberar
    selectedSeatCode.value = null
    selectedSeatId.value = null
    if (released && typeof released.present === 'boolean') {
      selectedPresent.value = released.present
    }

    // reflejar cambios en el seleccionado actual
    selected.value = {
      ...selected.value,
      seatId: null,
      seatCode: null,
      present: selectedPresent.value,
      subtitle:
        [selectedOrg.value, selectedDoc.value]
          .filter(Boolean)
          .join(' · ') || '—'
    }

    await (store.reload?.() ||
      store.ensureLoaded?.() ||
      Promise.resolve())

    snackbar.value = { open: true, text: 'Asiento liberado' }

    emit('seat-released', {
      id: personId,
      person: released ?? selected.value
    })
    emit('release-seat', personId)
  } catch (e) {
    snackbar.value = { open: true, text: 'Error al liberar' }
    emit('error', {
      message:
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo liberar el asiento.'
    })
  } finally {
    releasing.value = false
    confirmRelease.value = false
  }
}

/* quitar presente */
async function onUnmarkPresent () {
  if (!selectedId.value || !isAlreadyPresent.value) return
  unmarking.value = true
  try {
    const personId = selectedId.value

    // probamos métodos posibles del store
    const attempts = [
      () => tryCall('uncheckInById', personId),
      () => tryCall('checkoutById', personId),
      () => tryCall('markNotPresentById', personId),
      () => tryCall('setPresent', personId, false),
      () => tryCall('togglePresent', { personId, present: false })
    ]

    let updated
    for (const run of attempts) {
      // eslint-disable-next-line no-await-in-loop
      updated = await run()
      if (updated !== undefined) break
    }

    // si la API devolvió persona actualizada, la usamos
    if (updated) {
      syncFromPerson(updated)
    } else {
      // si no devolvió nada asumimos que lo desmarcó
      selectedPresent.value = false
    }

    snackbar.value = { open: true, text: 'Presencia removida' }

    emit('presence-removed', {
      id: personId,
      person: updated ?? selected.value
    })
  } catch (e) {
    snackbar.value = { open: true, text: 'No se pudo quitar presente' }
    emit('error', {
      message:
        e?.response?.data?.message ||
        e?.message ||
        'Error al quitar presente.'
    })
  } finally {
    unmarking.value = false
  }
}

/* sync helper: trae datos de una persona devuelta por backend y actualiza UI */
function syncFromPerson (p) {
  selectedSeatCode.value = p.seatCode ?? p.seat ?? null
  selectedSeatId.value = p.seatId ?? p.seat_id ?? selectedSeatId.value ?? null
  selectedPresent.value = !!p.present
  selectedDoc.value = p.doc || selectedDoc.value
  selectedOrg.value = p.org || selectedOrg.value

  selected.value = {
    title: p.name,
    value: p.id,
    seatId: p.seatId ?? p.seat_id ?? null,
    seatCode: p.seatCode ?? p.seat ?? null,
    present: p.present,
    subtitle: [p.org, p.doc].filter(Boolean).join(' · ') || '—',
    doc: p.doc,
    org: p.org
  }
}
</script>

<style scoped>
.ck-wrap { overflow: hidden; }
.ck-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:16px 18px;
  gap:12px;
  background: linear-gradient(135deg, rgba(10,69,107,.10), rgba(215,219,69,.06));
}
.ck-title {
  font-weight:700;
  font-size:clamp(1rem, .96rem + .3vw, 1.12rem);
  letter-spacing:.2px;
}
.ck-h-left { display:flex; align-items:center; }
.ck-divider { opacity:.08; }

.ck-body { padding:18px; }
.ck-form {
  display:grid;
  grid-template-columns: 1fr minmax(180px, 240px);
  gap:12px;
}
.ck-search :deep(.v-field) { border-radius:14px !important; }
.ck-search :deep(.v-field__outline) { --v-field-border-width:2px; }
.ck-search :deep(.v-input__control){ transition: transform .15s ease; }
.ck-search:focus-within :deep(.v-input__control){ transform: translateY(-1px); }

.already-wrap {
  display:flex;
  align-items:center;
  justify-content:center;
}
.already-chip {
  width:100%;
  font-weight:600;
  justify-content:center;
  text-transform:uppercase;
  letter-spacing:.3px;
}

/* dropdown items */
.ck-item :deep(.v-list-item-title),
.ck-item :deep(.v-list-item-subtitle){
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.row-title{ display:inline-flex; align-items:center; min-width:0; }
.name{ font-weight:600; }
.muted{ opacity:.75; }
.state-dot{ width:10px; height:10px; border-radius:999px; }
.state-dot.is-present{ background:#2e7d32; }
.state-dot.is-assigned{ background:#ffb300; }
.state-dot.is-free{ background:#9e9e9e; }
.elevated{ box-shadow:0 1px 2px rgba(0,0,0,.12); }
.avatar-text{ font-size:12px; font-weight:700; line-height:32px; }
.avatar-text.tiny{ font-size:11px; line-height:22px; }
.sel-wrap{ display:inline-flex; align-items:center; min-width:0; max-width:100%; }
.sel-wrap > span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* detail card */
.cd-card{
  margin-top:14px;
  padding:16px;
  background: rgba(255,255,255,.02);
  border:1px solid rgba(255,255,255,.10);
  box-shadow: 0 2px 8px rgba(0,0,0,.08) inset;
  border-radius: 20px;
}
.cd-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  min-width:0;
}
.cd-ident{ display:flex; align-items:center; gap:12px; min-width:0; }
.cd-namewrap{ min-width:0; }
.cd-title{ font-weight:800; letter-spacing:.2px; }
.cd-sub{ font-size:.92rem; }
.cd-badges{ display:flex; align-items:center; }

.cd-divider{ opacity:.08; margin:10px 0; }

.cd-grid{
  display:grid;
  gap:10px 16px;
  grid-template-columns: repeat(4, minmax(0,1fr));
}
.cd-field{
  display:flex;
  align-items:center;
  gap:6px;
  min-width:0;
}
.cd-field .lbl{ opacity:.7; font-size:.85rem; }
.cd-field .val{ font-weight:700; }

/* acciones */
.cd-actions{
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(min(220px,100%), 1fr));
  gap:10px;
  justify-content:flex-start;
  margin-top:12px;
}
.cd-action{ width:100%; }

/* botón REGISTRAR */
.ck-primary{
  background:linear-gradient(135deg,#0a456b,#0a456b);
  color:#fff;
  letter-spacing:.3px;
  text-transform:uppercase;
  font-weight:600;
}

/* success banner */
.success-banner{
  display:flex;
  align-items:center;
  gap:12px;
  padding:14px 16px;
  border-radius:14px;
  margin-top:14px;
  background:linear-gradient(135deg, rgba(46,125,50,.18), rgba(46,125,50,.12));
  border:1px solid rgba(46,125,50,.35);
  animation: pop-in .18s ease-out;
}
.icon-wrap{
  width:36px;
  height:36px;
  border-radius:999px;
  display:grid;
  place-items:center;
  background:rgba(46,125,50,.25);
}
.msg-wrap .title{ font-weight:700; }
.msg-wrap .subtitle{ opacity:.9; }
@keyframes pop-in{
  from{ transform:scale(.98); opacity:0 }
  to{ transform:scale(1); opacity:1 }
}

/* responsive */
@media (max-width: 1100px){
  .cd-grid{ grid-template-columns: repeat(3, minmax(0,1fr)); }
}
@media (max-width: 900px){
  .ck-form{ grid-template-columns: 1fr; }
  .cd-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
  .cd-actions{ grid-template-columns: 1fr; }
}
@media (max-width: 600px){
  .ck-body{ padding:14px; }
  .avatar-text{ line-height:28px; font-size:11px; }
  .cd-grid{ grid-template-columns: 1fr; }
}
</style>
