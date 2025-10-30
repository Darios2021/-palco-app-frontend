<template>
  <v-card class="ck-wrap" rounded="2xl" elevation="2">
    <!-- ===== HEADER ===== -->
    <header class="ck-header">
      <div class="ck-h-left">
        <v-icon size="22" class="mr-2">mdi-account-search</v-icon>
        <span class="ck-title">Control de ingreso al palco</span>
      </div>
    </header>

    <v-divider class="ck-divider" />

    <v-card-text class="ck-body">
      <!-- ===== BUSCADOR + CTA PRESENTE / YA REGISTRADO ===== -->
      <v-form ref="formRef" @submit.prevent="handleSubmit" class="ck-form">
        <div class="ck-form-row">
          <v-autocomplete
            class="ck-search"
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
          >
            <!-- ITEM EN DROPDOWN -->
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                density="comfortable"
                class="ck-item"
              >
                <template #prepend>
                  <v-avatar :size="avatarSize" class="elevated avatar-chip">
                    <span class="avatar-text">{{ initials(item.raw.title) }}</span>
                  </v-avatar>
                </template>

                <template #title>
                  <div class="row-title">
                    <span class="name text-truncate">{{ item.raw.title }}</span>

                    <v-chip
                      v-if="item.raw.seatCode"
                      size="x-small"
                      class="ml-2 seat-chip"
                      :color="item.raw.present ? 'success' : 'warning'"
                      label
                    >
                      {{ item.raw.seatCode }}
                    </v-chip>

                    <v-chip
                      v-else
                      size="x-small"
                      class="ml-2 seat-chip"
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

            <!-- LO QUE QUEDA EN EL INPUT CUANDO ESTÁ SELECCIONADO -->
            <template #selection="{ item }">
              <div class="sel-wrap">
                <v-avatar :size="22" class="mr-2 elevated avatar-chip">
                  <span class="avatar-text tiny">{{ initials(item.raw.title) }}</span>
                </v-avatar>
                <span class="text-truncate">{{ item.raw.title }}</span>

                <v-chip
                  v-if="item.raw.seatCode"
                  size="x-small"
                  class="ml-2 seat-chip"
                  :color="item.raw.present ? 'success' : 'warning'"
                  label
                >
                  {{ item.raw.seatCode }}
                </v-chip>

                <v-chip
                  v-else
                  size="x-small"
                  class="ml-2 seat-chip"
                  variant="outlined"
                  label
                >
                  Libre
                </v-chip>
              </div>
            </template>
          </v-autocomplete>

          <!-- CTA / YA REGISTRADO -->
          <div class="ck-cta-cell">
            <v-btn
              v-if="!isAlreadyPresent"
              class="ck-primary"
              type="submit"
              size="large"
              rounded="lg"
              prepend-icon="mdi-check"
              :loading="submitting"
              :disabled="submitting || !selected"
              block
            >
              REGISTRAR
            </v-btn>

            <v-chip
              v-else
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
        </div>
      </v-form>

      <!-- ===== TARJETA DETALLE ===== -->
      <v-expand-transition>
        <v-sheet
          v-if="selected"
          class="cd-card"
          rounded="2xl"
        >
          <!-- CABECERA -->
          <div class="cd-head">
            <div class="cd-head-left">
              <v-avatar size="54" class="elevated cd-avatar">
                <span class="avatar-text">{{ initials(selected.title) }}</span>
              </v-avatar>

              <div class="cd-namewrap">
                <div class="cd-title">{{ selected.title }}</div>
                <div class="cd-sub">{{ selected.subtitle }}</div>
              </div>
            </div>

            <!-- CHIP DE ESTADO -->
            <div class="cd-head-right">
              <v-chip
                :color="isAlreadyPresent ? 'success' : (selectedSeatCode ? 'warning' : undefined)"
                size="small"
                class="cd-chip"
                label
                variant="flat"
              >
                {{ chipText }}
              </v-chip>
            </div>
          </div>

          <v-divider class="cd-divider" />

          <!-- GRID DE DATOS -->
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

          <!-- ACCIONES -->
          <div class="cd-actions">
            <!-- ASIGNAR / CAMBIAR ASIENTO -->
            <v-btn
              variant="tonal"
              color="primary"
              prepend-icon="mdi-seat"
              class="cd-action"
              :loading="assigning"
              :disabled="assigning || !selectedId"
              @click="openSeatPicker"
            >
              {{ selectedSeatCode ? 'Cambiar asiento' : 'Asignar asiento' }}
            </v-btn>

            <!-- LIBERAR ASIENTO -->
            <v-btn
              v-if="selectedSeatCode"
              variant="tonal"
              color="warning"
              prepend-icon="mdi-seat-passenger"
              class="cd-action"
              :loading="releasing"
              :disabled="releasing"
              @click="confirmRelease = true"
            >
              Liberar asiento
            </v-btn>

            <!-- QUITAR PRESENTE -->
            <v-btn
              v-if="isAlreadyPresent"
              variant="tonal"
              color="error"
              prepend-icon="mdi-close-circle-outline"
              class="cd-action"
              :loading="unmarking"
              :disabled="unmarking"
              @click="onRemovePresenceLikeTable"
            >
              Quitar presente
            </v-btn>
          </div>
        </v-sheet>
      </v-expand-transition>
    </v-card-text>

    <!-- ===== DIALOGO CONFIRMAR LIBERAR ASIENTO ===== -->
    <v-dialog v-model="confirmRelease" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="pt-4 pb-0">
          <v-icon class="mr-2">mdi-seat-passenger</v-icon>
          Confirmar liberación
        </v-card-title>
        <v-card-text class="pt-2">
          ¿Liberar el asiento
          <strong>{{ selectedSeatCode }}</strong>
          para <strong>{{ selected?.title }}</strong>?
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmRelease = false">Cancelar</v-btn>
          <v-btn
            color="warning"
            :loading="releasing"
            :disabled="releasing"
            @click="onReleaseSeat"
          >
            Liberar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== MODAL PICKER DE ASIENTO ===== -->
    <v-dialog
      v-model="seatPickerOpen"
      :fullscreen="isMobile"
      :max-width="isMobile ? undefined : 640"
      scrollable
      persistent
      class="seat-dialog"
    >
      <template #activator></template>

      <v-card class="seat-card" rounded="xl">
        <!-- HEADER -->
        <header class="seat-header">
          <div class="seat-header-top">
            <v-icon size="20" class="mr-2 seat-header-icon">mdi-seat</v-icon>

            <div class="seat-header-text">
              <div class="seat-header-title">
                {{ selected?.title ? `Asignar asiento a ${selected.title}` : 'Asignar asiento' }}
              </div>

              <div class="seat-header-sub">
                Elegí un asiento libre o reasigná uno existente.
              </div>
            </div>

            <!-- close X en mobile -->
            <v-btn
              icon
              size="small"
              class="seat-close-btn"
              variant="text"
              :disabled="assigning"
              @click="closeSeatPicker"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <div class="seat-legend">
            <v-chip color="success" label size="x-small" class="chip-strong">Presente</v-chip>
            <v-chip color="warning" label size="x-small" class="chip-strong">Asignado</v-chip>
            <v-chip variant="outlined" label size="x-small" class="chip-outline">Libre</v-chip>
          </div>
        </header>

        <!-- BODY SCROLLEABLE -->
        <section class="seat-body">
          <div class="grid-rows-wrap">
            <div class="grid-rows">
              <div
                v-for="(row, rIdx) in store.seats"
                :key="rIdx"
                class="row"
              >
                <div class="row-label">{{ row[0][0] }}</div>

                <v-btn
                  v-for="code in row"
                  :key="code"
                  :class="[
                    'seat',
                    seatStatusLocal(code),
                    { 'seat-selected': pickedSeat === code }
                  ]"
                  variant="flat"
                  size="small"
                  :aria-label="`Asiento ${code}`"
                  :disabled="assigning"
                  @click="pickedSeat = code"
                >
                  {{ code }}
                </v-btn>
              </div>
            </div>
          </div>

          <div class="seat-info" v-if="pickedSeat">
            <div class="seat-info-title">
              Asiento seleccionado:
              <span class="text-accent">{{ pickedSeat }}</span>
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

          <!-- espacio fantasma para que nada quede tapado por el footer fijo -->
          <div class="seat-bottom-spacer" />
        </section>

        <!-- FOOTER FIJO CON BOTONES -->
        <footer class="seat-footer">
          <v-btn
            variant="text"
            class="btn-cancel"
            :disabled="assigning"
            @click="closeSeatPicker"
          >
            Cancelar
          </v-btn>

          <v-btn
            class="btn-confirm"
            color="primary"
            :disabled="assigning || !pickedSeat"
            :loading="assigning"
            @click="confirmAssignSeat"
          >
            Confirmar
          </v-btn>
        </footer>
      </v-card>
    </v-dialog>

    <!-- ===== TOAST GLOBAL (MISMO QUE 'NUEVA PERSONA') ===== -->
    <v-snackbar
      v-model="snackbar.show"
      :timeout="3000"
      :color="snackbar.ok ? 'success' : 'error'"
      location="bottom right"
      rounded="lg"
      elevation="8"
      class="snackbar-strong"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2" size="20">
          {{ snackbar.ok ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <span class="font-weight-600">{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'

const store = useSeatsStore()

const { smAndDown } = useDisplay()
const isMobile = computed(() => smAndDown.value)

/* ===== STATE ===== */
const loading     = ref(false)
const submitting  = ref(false)
const releasing   = ref(false)
const unmarking   = ref(false)

const seatPickerOpen = ref(false)
const assigning  = ref(false)
const pickedSeat = ref(null)

const search      = ref('')
const selected    = ref(null)

const selectedSeatCode = ref(null)
const selectedSeatId   = ref(null)
const selectedPresent  = ref(false)
const selectedDoc      = ref('')
const selectedOrg      = ref('')

const confirmRelease = ref(false)

const lastSeat    = ref(null)

const snackbar = ref({
  show: false,
  text: '',
  ok: true
})

/* ===== COMPUTED ===== */
const menuProps = computed(() => ({
  maxHeight: smAndDown.value ? 320 : 380,
  offset: smAndDown.value ? 0 : 8,
  eager: true,
  location: 'bottom start',
  transition: false,
  contentClass: 'ck-menu-content'
}))

const avatarSize = computed(() => (smAndDown.value ? 28 : 32))

const selectedId = computed(() => selected.value?.value ?? null)
const isAlreadyPresent = computed(() => !!selectedPresent.value)

const chipText = computed(() => {
  if (isAlreadyPresent.value) return 'Presente'
  if (selectedSeatCode.value) return 'Asignado'
  return 'Sin asignar'
})

/* ===== LIFECYCLE ===== */
onMounted(async () => {
  loading.value = true
  try {
    if (typeof store.ensureLoaded === 'function') {
      await store.ensureLoaded()
    }
  } finally {
    loading.value = false
  }
})

/* ===== HELPERS ===== */
const norm = s =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const initials = name =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(x => x[0]?.toUpperCase() ?? '')
    .join('')

const items = computed(() =>
  (store.people ?? []).map(p => ({
    title: p.name,
    value: p.id,
    seatId:  p.seatId   ?? p.seat_id   ?? null,
    seatCode:p.seatCode ?? p.seat      ?? p.seat_code ?? null,
    present: !!p.present,
    subtitle: [p.org, p.doc].filter(Boolean).join(' · ') || '—',
    doc: p.doc || '',
    org: p.org || '',
    _keywords: norm([p.name, p.doc, p.org].filter(Boolean).join(' '))
  }))
)

function filterFn (_title, _query, item) {
  const q = norm(search.value)
  if (!q) return true
  return item?.raw?._keywords?.includes(q)
}

function onSelected (obj) {
  selectedSeatCode.value = obj?.seatCode || null
  selectedSeatId.value   = obj?.seatId   || null
  selectedPresent.value  = !!obj?.present
  selectedDoc.value      = obj?.doc || ''
  selectedOrg.value      = obj?.org || ''
  hideToast()
}

/* limpiar si borran el search */
watch(search, v => {
  if (!v) {
    resetSelection()
  }
})

function resetSelection () {
  selected.value         = null
  selectedSeatCode.value = null
  selectedSeatId.value   = null
  selectedPresent.value  = false
  selectedDoc.value      = ''
  selectedOrg.value      = ''
  hideToast()
}

async function tryCall (name, ...args) {
  const fn = store?.[name]
  if (typeof fn !== 'function') return undefined
  try {
    return await fn(...args)
  } catch {
    return undefined
  }
}

async function refreshStore () {
  await (
    store.refresh?.() ||
    store.ensureLoaded?.() ||
    Promise.resolve()
  )
}

function syncFromPerson (p) {
  selectedSeatCode.value = p.seatCode ?? p.seat ?? p.seat_code ?? null
  selectedSeatId.value   = p.seatId   ?? p.seat_id ?? selectedSeatId.value ?? null
  selectedPresent.value  = !!p.present
  selectedDoc.value      = p.doc || selectedDoc.value
  selectedOrg.value      = p.org || selectedOrg.value

  selected.value = {
    title: p.name,
    value: p.id,
    seatId: p.seatId ?? p.seat_id ?? null,
    seatCode: p.seatCode ?? p.seat ?? p.seat_code ?? null,
    present: p.present,
    subtitle: [p.org, p.doc].filter(Boolean).join(' · ') || '—',
    doc: p.doc,
    org: p.org
  }
}

function syncFromStoreById (idLike) {
  const fresh = (store.people ?? []).find(p => p.id == idLike)
  if (fresh) {
    syncFromPerson(fresh)
    return true
  }
  return false
}

/* snack helper */
function showToast(message, ok = true) {
  snackbar.value.text = message
  snackbar.value.ok = ok
  snackbar.value.show = true
}
function hideToast() {
  snackbar.value.show = false
}

/* asiento status local */
function seatStatusLocal(code) {
  const holder = store.people.find(p => p.seat === code)
  if (!holder) return 'free'
  if (holder.present) return 'present'
  return 'assigned'
}

/* abrir modal asiento */
function openSeatPicker() {
  pickedSeat.value = selectedSeatCode.value || null
  seatPickerOpen.value = true
}

/* cerrar modal asiento */
function closeSeatPicker() {
  if (assigning.value) return // evito cerrar mientras guarda
  seatPickerOpen.value = false
  pickedSeat.value = null
}

/* quién tiene actualmente el asiento elegido */
const currentHolder = computed(() => {
  if (!pickedSeat.value) return null
  return store.people.find(p => p.seat === pickedSeat.value) || null
})

/* ===== submit helpers con bail ===== */
function bailSubmit(msg, ok) {
  showToast(msg, ok)
  submitting.value = false
}
function bailAssign(msg, ok) {
  showToast(msg, ok)
  assigning.value = false
}
function bailRelease(msg, ok) {
  showToast(msg, ok)
  releasing.value = false
  confirmRelease.value = false
}
function bailUnmark(msg, ok) {
  showToast(msg, ok)
  unmarking.value = false
}

/* ===== CONFIRMAR ASIENTO ===== */
async function confirmAssignSeat() {
  if (!selectedId.value) return bailAssign('Seleccioná una persona', false)
  if (!pickedSeat.value) return bailAssign('Seleccioná un asiento', false)

  assigning.value = true
  try {
    const targetId = selectedId.value
    const newSeat  = pickedSeat.value

    // liberar si alguien más lo tenía
    const other = store.people.find(p => p.id !== targetId && p.seat === newSeat)
    if (other) {
      await store.updatePerson(other.id, { seat: null })
    }

    // asignar a la persona actual
    await store.updatePerson(targetId, { seat: newSeat })

    await refreshStore()
    syncFromStoreById(targetId)

    showToast('Asiento asignado', true)
  } catch (err) {
    showToast('Error al asignar asiento', false)
  } finally {
    assigning.value = false
    closeSeatPicker()
  }
}

/* ===== MARCAR PRESENTE ===== */
async function handleSubmit () {
  if (submitting.value) return
  submitting.value = true

  if (!selected.value) return bailSubmit('Seleccioná una persona', false)

  try {
    const id = selectedId.value

    // refresco live para no tener que hacer dos clicks
    const live = (store.people ?? []).find(p => p.id == id)

    if (live?.present || selectedPresent.value) {
      return bailSubmit('Ya estaba presente', true)
    }

    const updated =
      await tryCall('checkInById', id) ??
      await tryCall('setPresent', id, true) ??
      await tryCall('updatePerson', id, { present: true })

    if (updated) {
      syncFromPerson(updated)
    } else {
      // fallback
      selectedPresent.value = true
      if (selected.value) selected.value.present = true
    }

    lastSeat.value = selectedSeatCode.value || null

    await refreshStore()
    syncFromStoreById(id)

    return bailSubmit('Registrado correctamente', true)
  } catch (e) {
    return bailSubmit('No se pudo registrar', false)
  }
}

/* ===== LIBERAR ASIENTO ===== */
async function onReleaseSeat () {
  if (releasing.value) return
  releasing.value = true

  if (!selectedId.value || !selectedSeatCode.value) {
    return bailRelease('No hay asiento para liberar', false)
  }

  try {
    const personId = selectedId.value
    await store.updatePerson(personId, { seat: null })

    await refreshStore()
    syncFromStoreById(personId)

    return bailRelease('Asiento liberado', true)
  } catch (e) {
    return bailRelease('Error al liberar el asiento', false)
  }
}

/* ===== QUITAR PRESENTE ===== */
async function onRemovePresenceLikeTable () {
  if (unmarking.value) return
  unmarking.value = true

  if (!selectedId.value) {
    return bailUnmark('No hay persona seleccionada', false)
  }

  try {
    const personId = selectedId.value
    await store.updatePerson(personId, { present: false })

    selectedPresent.value = false
    if (selected.value) selected.value.present = false

    await refreshStore()
    syncFromStoreById(personId)

    return bailUnmark('Presencialidad desactivada', true)
  } catch (e) {
    return bailUnmark('No se pudo desactivar presencialidad', false)
  }
}
</script>

<style scoped>
/* ===== CONTENEDOR GENERAL ===== */
.ck-wrap {
  overflow: hidden;
  background:#0f1631;
  color:#fff;
  width:100%;
  max-width:100%;
}
.ck-header {
  display:flex;
  align-items:center;
  padding:16px 18px;
  gap:12px;
  border-bottom:1px solid rgba(255,255,255,.1);
  background:#0f1631;
  color:#fff;
}
.ck-title {
  font-weight:700;
  font-size:clamp(1rem, .96rem + .3vw, 1.12rem);
  letter-spacing:.2px;
  color:#fff;
}
.ck-divider { opacity:.08; }

.ck-body {
  padding:20px;
  color:#fff;
}

/* ===== FORM BUSCADOR WRAPPER ===== */
.ck-form {
  background:#1a234a;
  border-radius:12px;
  padding:12px;
  border:1px solid rgba(255,255,255,.1);
  color:#fff;
}

/* fila interna del form */
.ck-form-row{
  display:grid;
  grid-template-columns: 1fr minmax(180px,220px);
  gap:12px;
}
@media (max-width: 600px){
  .ck-form-row{
    grid-template-columns:1fr;
  }
}

/* el contenedor del autocomplete lo hacemos relativo
   para que el dropdown pueda alinearse sin gap */
.ck-search {
  position: relative;
}

/* campo autocomplete */
.ck-search :deep(.v-field){
  border-radius:12px !important;
  background:rgba(255,255,255,.06) !important;
  color:#fff !important;
  border:1px solid rgba(255,255,255,.18) !important;
}
.ck-search :deep(.v-icon){
  color:#fff !important;
}
.ck-search :deep(input){
  color:#fff !important;
}
.ck-search :deep(.v-field-label){
  color:rgba(255,255,255,.6) !important;
}

/* menú del autocomplete:
   - mismo ancho
   - misma paleta
   - pegado al input (sin gap)
   - sin redondeo arriba para que parezca "una sola caja"
*/
.ck-menu-content{
  background:#1a234a !important;
  border:1px solid rgba(255,255,255,.18) !important;
  border-radius:12px !important;
  border-top-left-radius:0 !important;
  border-top-right-radius:0 !important;
  box-shadow:0 14px 32px rgba(0,0,0,.8) !important;
  overflow:hidden !important;
  color:#fff !important;

  min-width:100% !important;
  max-width:100% !important;

  margin-top:-1px !important; /* une visualmente con el borde del input */
}
@media (min-width:601px){
  .ck-menu-content{
    min-width:320px !important;
    max-width:360px !important;
  }
}

/* items del dropdown */
.ck-item{
  background:#1b244e !important;
  color:#fff !important;
  border-bottom:1px solid rgba(255,255,255,.06);
}
.ck-item:last-child{
  border-bottom:none;
}
.row-title{
  display:inline-flex;
  align-items:center;
  min-width:0;
  color:#fff;
  font-size:.95rem;
  font-weight:600;
  line-height:1.3;
}
.name{
  font-weight:600;
  color:#fff;
}
.muted{
  opacity:.75;
  color:#fff;
  font-size:.8rem;
  line-height:1.2;
}
.state-dot{
  width:10px;
  height:10px;
  border-radius:999px;
}
.state-dot.is-present{ background:#2e7d32; }
.state-dot.is-assigned{ background:#ffb300; }
.state-dot.is-free{ background:#9e9e9e; }

.elevated{
  background:#27316b;
  color:#fff;
  font-weight:800;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 2px 6px rgba(0,0,0,.4);
  border-radius:999px;
}
.avatar-chip{
  min-width:28px;
}
.avatar-text{
  font-size:13px;
  letter-spacing:.5px;
  font-weight:700;
  line-height:1;
  color:#fff;
}
.avatar-text.tiny{
  font-size:11px;
}
.sel-wrap{
  display:inline-flex;
  align-items:center;
  min-width:0;
  max-width:100%;
  color:#fff;
}
.seat-chip{
  font-weight:700 !important;
  letter-spacing:.03em;
}

/* CTA cell */
.ck-cta-cell{
  display:flex;
  align-items:stretch;
}
@media (max-width:600px){
  .ck-cta-cell{
    width:100%;
  }
}
.ck-primary{
  background:#0a456b !important;
  color:#fff !important;
  font-weight:700 !important;
  text-transform:uppercase !important;
  letter-spacing:.03em !important;
  border-radius:10px !important;
  width:100%;
}
.already-chip{
  width:100%;
  font-weight:600;
  justify-content:center;
  background:rgba(40,167,69,.25) !important;
  color:#bfffc2 !important;
  border-radius:10px !important;
  text-transform:uppercase;
  letter-spacing:.03em;
  display:flex;
  align-items:center;
  justify-content:center;
}

/* ===== CARD DETALLE ===== */
.cd-card{
  margin-top:16px;
  background:#121a3a;
  border:1px solid rgba(255,255,255,.1);
  border-radius:16px;
  padding:16px 16px 12px;
  box-shadow:0 4px 20px rgba(0,0,0,.3);
  color:#fff;
}
.cd-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  flex-wrap:wrap;
  gap:12px;
  color:#fff;
}
.cd-head-left{
  display:flex;
  align-items:flex-start;
  gap:12px;
  min-width:0;
  flex:1;
}
.cd-avatar{
  flex-shrink:0;
}
.cd-namewrap{
  min-width:0;
  word-break:break-word;
}
.cd-title{
  font-weight:800;
  font-size:1.05rem;
  line-height:1.3;
  color:#fff;
}
.cd-sub{
  font-size:.9rem;
  opacity:.75;
  color:#fff;
  word-break:break-word;
}
.cd-head-right{
  display:flex;
  align-items:flex-start;
}
@media (max-width:600px){
  .cd-head{
    flex-direction:column;
    align-items:flex-start;
  }
  .cd-head-right{
    order:2;
  }
}
.cd-chip{
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.04em;
  color:#fff;
}
.cd-divider{
  opacity:.15;
  margin:12px 0;
  border-color:rgba(255,255,255,.15);
}
.cd-grid{
  display:grid;
  gap:10px 16px;
  grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
  color:#fff;
}
.cd-field{
  display:flex;
  align-items:center;
  gap:6px;
  min-width:0;
  color:#fff;
  font-size:.9rem;
}
.cd-field .lbl{
  opacity:.7;
  font-size:.85rem;
  color:#fff;
}
.cd-field .val{
  font-weight:700;
  color:#fff;
  word-break:break-word;
}
.cd-actions{
  margin-top:16px;
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
  gap:10px;
  color:#fff;
}
.cd-action{
  width:100%;
  font-weight:700 !important;
  border-radius:10px !important;
  background:rgba(255,255,255,.06) !important;
  border:1px solid rgba(255,255,255,.1) !important;
  color:#fff !important;
  text-transform:none !important;
  box-shadow:0 2px 6px rgba(0,0,0,.2);
}
@media (max-width:900px){
  .cd-actions{
    grid-template-columns:1fr;
  }
}

/* ===== SNACKBAR GLOBAL ===== */
.snackbar-strong {
  font-weight: 600;
  letter-spacing: .02em;
  text-transform: none;
  max-width: 360px;
  border-radius: 12px !important;
  box-shadow: 0 20px 40px rgba(0,0,0,.6);
  color:#fff;
}

/* ===== MODAL ASIENTOS ===== */
.seat-dialog :deep(.v-overlay__scrim){
  background: rgba(0,0,0,.65) !important;
}
.seat-card {
  background: #151d44 !important;
  color: #eaf0ff;
  border: 2px solid rgba(255, 217, 81, .4);
  box-shadow: 0 20px 40px rgba(0,0,0,.8);

  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 100%;
  border-radius: 16px !important;
  overflow: hidden;
  position: relative;
}
@media (max-width: 960px) {
  .seat-card {
    height: 80vh;
    max-height: 80vh;
  }
}
@media (min-width: 961px) {
  .seat-card {
    height: auto;
    max-height: 80vh;
    min-width: 560px;
    max-width: 640px;
  }
}
.seat-header {
  flex-shrink: 0;
  background: radial-gradient(
    circle at 0% 0%,
    rgba(255,217,81,.18) 0%,
    rgba(21,29,68,0) 60%
  );
  border-bottom: 1px solid rgba(255,217,81,.25);
  color:#fff;
  padding:16px;
  padding-bottom:12px;
  box-shadow:0 6px 16px rgba(0,0,0,.7);
}
.seat-header-top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  flex-wrap:nowrap;
  min-width:0;
  color:#fff;
}
.seat-header-icon{
  flex-shrink:0;
  color:#ffd951;
}
.seat-header-text{
  min-width:0;
  flex:1;
  color:#fff;
}
.seat-header-title{
  font-weight:800;
  color:#fff;
  font-size:1rem;
  line-height:1.25;
  min-width:0;
}
.seat-header-sub{
  font-size:.8rem;
  line-height:1.3;
  opacity:.7;
  color:#fff;
  margin-top:2px;
}
.seat-close-btn{
  flex-shrink:0;
  color:#ffd951 !important;
  min-width:auto !important;
  width:32px;
  height:32px;
}
.seat-legend{
  display:flex;
  flex-wrap:wrap;
  row-gap:4px;
  column-gap:6px;
  margin-top:12px;
}
.chip-strong {
  font-weight: 800 !important;
  border-radius: 10px !important;
  line-height:1.1 !important;
  height:auto !important;
  padding:2px 8px !important;
  font-size:.7rem !important;
}
.chip-outline {
  color: #eaf0ff !important;
  border-color: rgba(234,240,255,.28) !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  line-height:1.1 !important;
  height:auto !important;
  padding:2px 8px !important;
  font-size:.7rem !important;
}
.seat-body {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding:16px;
  padding-top:12px;
  background:#151d44;
  color:#fff;
  min-height:0;
}
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
  grid-template-columns: 44px repeat(10, 68px);
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
  font-size:.8rem;
  line-height:1.1;
}
.seat {
  min-width: 58px;
  height: 36px;
  border-radius: 18px;
  font-weight: 700;
  text-transform: none;
  box-shadow: 0 1px 2px rgba(0,0,0,.25);
  background:#f3f5f9 !important;
  color:#0b0d28 !important;
  font-size:.9rem;
  line-height:1;
}
.seat.present  { background: #4caf50 !important; color: #fff !important; }
.seat.assigned { background: #ffb300 !important; color: #0b0d28 !important; }
.seat.free     { background: #f3f5f9 !important; color: #0b0d28 !important; }
.seat-selected {
  outline: 2px solid #ffd951;
  outline-offset: 0;
  box-shadow: 0 0 8px rgba(255,217,81,.75);
}
.seat-info{
  margin-top:16px;
  font-size:.9rem;
  line-height:1.4;
  color:#eaf0ff;
}
.seat-info-title{
  font-size:.9rem;
  font-weight:700;
  color:#fff;
  margin-bottom:4px;
}
.text-accent { color: #ffd951; font-weight: 700; }
.text-dim { color: rgba(234,240,255, .75); }
.seat-bottom-spacer{
  height:72px;
}
@media (min-width: 961px) {
  .seat-bottom-spacer{
    height:24px;
  }
}
.seat-footer {
  flex-shrink: 0;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:12px;

  padding:12px 16px;
  background:#0f1433;
  border-top:1px solid rgba(255,217,81,.3);
  box-shadow:0 -6px 16px rgba(0,0,0,.8);
}
@media (max-width: 960px) {
  .seat-footer {
    position: sticky;
    bottom:0;
    left:0;
    right:0;
    z-index:10;
    box-shadow:0 -4px 12px rgba(0,0,0,.8);
  }
}
@media (min-width: 961px) {
  .seat-footer {
    position: static;
    box-shadow:0 -4px 12px rgba(0,0,0,.6);
  }
}
.btn-cancel {
  color:#ffd951 !important;
  text-transform:none !important;
  font-weight:600 !important;
  min-width:auto !important;
}
.btn-confirm {
  font-weight:700 !important;
  text-transform:none !important;
  border-radius:10px !important;
  min-width:120px;
}
@media (max-width: 960px) {
  .grid-rows {
    gap: 10px;
    min-width: max(480px, 100%);
  }
  .row {
    grid-template-columns: 36px repeat(10, 60px);
    gap: 6px;
  }
  .row-label {
    width: 36px;
    padding: 4px 0;
    font-size:.7rem;
  }
  .seat {
    min-width: 54px;
    height: 32px;
    border-radius: 16px;
    font-size: 0.8rem;
  }
}
@media (max-width: 400px) {
  .grid-rows {
    min-width: max(400px, 100%);
  }
  .row {
    grid-template-columns: 32px repeat(10, 54px);
  }
  .row-label {
    width:32px;
    line-height:1.1;
    font-size:.7rem;
  }
  .seat {
    min-width:50px;
    height:30px;
    font-size:.75rem;
  }
}
</style>
