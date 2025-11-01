<template>
  <v-card class="ck-shell" rounded="xl" elevation="2">
    <!-- HEADER -->
    <header class="ck-headbar">
      <div class="ck-head-left">
        <v-icon size="22" class="mr-2 ck-head-icon">mdi-account-check</v-icon>
        <div class="ck-head-text">
          <div class="ck-head-kicker">Registro de Asistencia</div>
          <div class="ck-head-title">Control de ingreso al Palco Oficial</div>
        </div>
      </div>
    </header>

    <v-divider class="ck-head-divider" />

    <v-card-text class="ck-inner">
      <!-- ================== BLOQUE BUSCADOR (solo si NO hay persona seleccionada) ================== -->
      <section v-if="!selected" class="block-card">
        <!-- INPUT BUSCADOR -->
        <div class="search-row">
          <v-text-field
            v-model="searchTerm"
            class="search-input"
            variant="solo-filled"
            density="comfortable"
            prepend-inner-icon="mdi-magnify"
            placeholder="Buscar persona…"
            hide-details="auto"
            color="primary"
            @keydown.down.prevent="moveHighlight(1)"
            @keydown.up.prevent="moveHighlight(-1)"
            @keydown.enter.prevent="confirmHighlighted"
          />

          <!-- LOADER TRES PUNTOS -->
          <div v-if="isTypingLoading" class="search-loader">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>

        <!-- RESULTADOS / ESTADO -->
        <div class="results-shell">
          <!-- LISTA DE RESULTADOS -->
          <template v-if="showResults && filteredResults.length">
            <div class="results-scroll">
              <div
                v-for="(p,idx) in filteredResults"
                :key="p.value"
                class="result-row"
                :class="{ 'is-active': idx === highlightedIndex }"
                @mousedown.prevent="pickPerson(p)"
              >
                <div class="result-left">
                  <v-avatar class="result-avatar" size="40">
                    <span class="ra-text">{{ initials(p.title) }}</span>
                  </v-avatar>

                  <div class="result-info">
                    <div class="result-top">
                      <span class="person-name text-truncate">{{ p.title }}</span>

                      <v-chip
                        v-if="p.seatCode"
                        size="x-small"
                        class="ml-2 seat-chip"
                        :color="p.present ? 'success' : 'warning'"
                        label
                      >
                        {{ p.seatCode }}
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

                    <div class="person-sub text-truncate">
                      {{ p.subtitle }}
                    </div>
                  </div>
                </div>

                <!-- dot estado -->
                <div
                  class="state-dot"
                  :class="p.present ? 'is-present' : (p.seatCode ? 'is-assigned' : 'is-free')"
                />
              </div>
            </div>
          </template>

          <!-- SIN RESULTADOS -->
          <template v-else-if="showResults && !isTypingLoading && !filteredResults.length">
            <div class="nores-row">
              <v-icon size="18" class="mr-2">mdi-alert-circle-outline</v-icon>
              <div class="nores-text">
                Sin coincidencias. Cargá la persona en la sección Personas.
              </div>
            </div>
          </template>

          <!-- AYUDA DINÁMICA (estado inicial) -->
          <template v-else>
            <div class="helpbox">
              <div class="help-inner">
                <div class="help-dynamic">
                  Probá con <span class="highlight-rot">{{ rotatingHint }}</span>
                </div>

                <div class="help-desc">
                  Podés escribir parte del DNI, apellido, organismo o jerarquía.
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- ================== BLOQUE DETALLE (solo si HAY persona seleccionada) ================== -->
      <v-expand-transition>
        <section
          v-if="selected"
          class="block-card"
        >
          <!-- HEADER PERSONA -->
          <div class="person-head">
            <div class="person-left">
              <v-avatar size="54" class="person-avatar">
                <span class="pa-text">{{ initials(selected.title) }}</span>
              </v-avatar>

              <div class="person-idtext">
                <div class="person-title">{{ selected.title }}</div>
                <div class="person-sub2">{{ selected.subtitle }}</div>
              </div>
            </div>

            <div class="person-right">
              <v-chip
                :color="isAlreadyPresent ? 'success' : (selectedSeatCode ? 'warning' : undefined)"
                size="small"
                class="status-chip"
                label
                variant="flat"
              >
                {{ chipText }}
              </v-chip>
            </div>
          </div>

          <!-- CTA registrar / ya registrado -->
          <div class="register-row">
            <v-btn
              v-if="!isAlreadyPresent"
              class="btn-primary-strong"
              size="large"
              rounded="lg"
              prepend-icon="mdi-check"
              :loading="submitting"
              :disabled="submitting || !selected"
              block
              @click="handleSubmit"
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

          <v-divider class="sec-divider" />

          <!-- GRID INFO -->
          <div class="info-grid">
            <div class="info-field">
              <v-icon size="16" class="mr-1 dim-icon">mdi-card-account-details</v-icon>
              <span class="lbl">DNI</span>
              <span class="val">{{ selectedDoc || '—' }}</span>
            </div>

            <div class="info-field">
              <v-icon size="16" class="mr-1 dim-icon">mdi-town-hall</v-icon>
              <span class="lbl">Organismo</span>
              <span class="val">{{ selectedOrg || '—' }}</span>
            </div>

            <div class="info-field">
              <v-icon size="16" class="mr-1 dim-icon">mdi-check</v-icon>
              <span class="lbl">Estado</span>
              <span class="val">
                <span v-if="isAlreadyPresent">Presente</span>
                <span v-else-if="selectedSeatCode">Asignado</span>
                <span v-else>Sin asignar</span>
              </span>
            </div>

            <div class="info-field">
              <v-icon size="16" class="mr-1 dim-icon">mdi-seat</v-icon>
              <span class="lbl">Asiento</span>
              <span class="val">{{ selectedSeatCode || '—' }}</span>
            </div>
          </div>

          <!-- ACCIONES -->
          <div class="actions-col">
            <!-- Cambiar / asignar asiento -->
            <v-btn
              variant="flat"
              class="action-btn"
              :class="{ 'action-warn': !selectedSeatCode }"
              :loading="assigning"
              :disabled="assigning || !selectedId"
              @click="openSeatPicker"
            >
              <v-icon class="mr-2" size="18">mdi-seat</v-icon>
              {{ selectedSeatCode ? 'Cambiar asiento' : 'Asignar asiento' }}
            </v-btn>

            <!-- Liberar asiento -->
            <v-btn
              v-if="selectedSeatCode"
              variant="flat"
              class="action-btn action-free"
              :loading="releasing"
              :disabled="releasing"
              @click="confirmRelease = true"
            >
              <v-icon class="mr-2" size="18">mdi-seat-passenger</v-icon>
              Liberar asiento
            </v-btn>

            <!-- Quitar presente -->
            <v-btn
              v-if="isAlreadyPresent"
              variant="flat"
              class="action-btn action-error"
              :loading="unmarking"
              :disabled="unmarking"
              @click="onRemovePresenceLikeTable"
            >
              <v-icon class="mr-2" size="18">mdi-close-circle-outline</v-icon>
              Quitar presente
            </v-btn>

            <!-- Buscar otra persona -->
            <v-btn
              variant="text"
              class="action-reset"
              @click="clearAll"
            >
              <v-icon class="mr-2" size="18">mdi-account-search</v-icon>
              Buscar otra persona
            </v-btn>
          </div>
        </section>
      </v-expand-transition>
    </v-card-text>

    <!-- ===== MODAL LIBERAR ASIENTO ===== -->
    <v-dialog v-model="confirmRelease" max-width="420">
      <v-card rounded="xl" class="modal-card">
        <v-card-title class="pt-4 pb-0 modal-title">
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

    <!-- ===== MODAL PICKER ASIENTO ===== -->
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

        <!-- BODY -->
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

          <div class="seat-bottom-spacer" />
        </section>

        <!-- FOOTER -->
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

    <!-- ===== TOAST ===== -->
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
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'

const store = useSeatsStore()

const { smAndDown } = useDisplay()
const isMobile = computed(() => smAndDown.value)

/* ===== STATE ===== */
const submitting        = ref(false)
const releasing         = ref(false)
const unmarking         = ref(false)

const seatPickerOpen    = ref(false)
const assigning         = ref(false)
const pickedSeat        = ref(null)

const searchTerm        = ref('')
const showResults       = ref(false)
const highlightedIndex  = ref(-1)
const isTypingLoading   = ref(false)
const typingTimer       = ref(null)

const selected          = ref(null)

const selectedSeatCode  = ref(null)
const selectedSeatId    = ref(null)
const selectedPresent   = ref(false)
const selectedDoc       = ref('')
const selectedOrg       = ref('')

const confirmRelease    = ref(false)
const lastSeat          = ref(null)

const snackbar = ref({
  show: false,
  text: '',
  ok: true
})

/* ===== TEXTO ROTATIVO DEL HINT ===== */
const hintWords = [
  'DNI',
  'Nombre',
  'Jerarquía',
  'Cargo',
  'Organismo'
]
const rotatingHint = ref(hintWords[0])
let hintIdx = 0
let hintTimer = null

function advanceHint() {
  hintIdx = (hintIdx + 1) % hintWords.length
  rotatingHint.value = hintWords[hintIdx]
}

/* ===== COMPUTED ===== */
const selectedId = computed(() => selected.value?.value ?? null)
const isAlreadyPresent = computed(() => !!selectedPresent.value)

const chipText = computed(() => {
  if (isAlreadyPresent.value) return 'Presente'
  if (selectedSeatCode.value) return 'Asignado'
  return 'Sin asignar'
})

/* normalizador búsqueda */
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

/* data de store -> formato buscador */
const allPeople = computed(() =>
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

/* filtrado live */
const filteredResults = computed(() => {
  const q = norm(searchTerm.value)
  if (!q) return []
  return allPeople.value
    .filter(p => p._keywords.includes(q))
    .slice(0, 20)
})

/* ===== LIFECYCLE ===== */
onMounted(async () => {
  // cargar data inicial
  await ensureStoreLoaded()

  // iniciar rotación del hint
  hintTimer = setInterval(advanceHint, 1000)
})

onBeforeUnmount(() => {
  if (hintTimer) clearInterval(hintTimer)
})

async function ensureStoreLoaded () {
  if (typeof store.ensureLoaded === 'function') {
    try {
      isTypingLoading.value = true
      await store.ensureLoaded()
    } finally {
      isTypingLoading.value = false
    }
  }
}

/* ===== WATCH TYPING ===== */
watch(searchTerm, (val) => {
  if (!val) {
    resetSelectionSoft()
    showResults.value = false
    highlightedIndex.value = -1
    stopTypingLoader()
    return
  }

  startTypingLoader()

  if (typingTimer.value) clearTimeout(typingTimer.value)
  typingTimer.value = setTimeout(() => {
    stopTypingLoader()

    if (filteredResults.value.length) {
      highlightedIndex.value = 0
    } else {
      highlightedIndex.value = -1
    }

    showResults.value = true
  }, 200)
})

/* ===== LOADER CONTROL ===== */
function startTypingLoader () {
  isTypingLoading.value = true
}
function stopTypingLoader () {
  isTypingLoading.value = false
}

/* ===== NAVEGACIÓN CON TECLADO ===== */
function moveHighlight (dir) {
  if (!showResults.value || !filteredResults.value.length) return
  const max = filteredResults.value.length - 1
  let next = highlightedIndex.value + dir
  if (next < 0) next = max
  if (next > max) next = 0
  highlightedIndex.value = next
}

function confirmHighlighted () {
  if (!showResults.value) return
  const p = filteredResults.value[highlightedIndex.value]
  if (p) pickPerson(p)
}

/* ===== SELECCIONAR PERSONA ===== */
function pickPerson (p) {
  selected.value         = p
  selectedSeatCode.value = p.seatCode || null
  selectedSeatId.value   = p.seatId   || null
  selectedPresent.value  = !!p.present
  selectedDoc.value      = p.doc || ''
  selectedOrg.value      = p.org || ''

  // al seleccionar escondemos el buscador (corta la vista de resultados)
  searchTerm.value = p.title
  showResults.value = false
}

/* ===== LIMPIEZA ===== */
/* soft: limpia resultados/toast pero no rompe la persona ya elegida */
function resetSelectionSoft () {
  hideToast()
}

/* hard: volver a modo "buscar otra persona" */
function clearAll () {
  searchTerm.value       = ''
  selected.value         = null
  selectedSeatCode.value = null
  selectedSeatId.value   = null
  selectedPresent.value  = false
  selectedDoc.value      = ''
  selectedOrg.value      = ''
  hideToast()
}

/* ===== STORE HELPERS ===== */
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

/* ===== TOAST ===== */
function showToast(message, ok = true) {
  snackbar.value.text = message
  snackbar.value.ok = ok
  snackbar.value.show = true
}
function hideToast() {
  snackbar.value.show = false
}

/* ===== MODAL ASIENTOS HELPERS ===== */
function seatStatusLocal(code) {
  const holder = store.people.find(p => p.seat === code)
  if (!holder) return 'free'
  if (holder.present) return 'present'
  return 'assigned'
}

function openSeatPicker() {
  pickedSeat.value = selectedSeatCode.value || null
  seatPickerOpen.value = true
}
function closeSeatPicker() {
  if (assigning.value) return
  seatPickerOpen.value = false
  pickedSeat.value = null
}

const currentHolder = computed(() => {
  if (!pickedSeat.value) return null
  return store.people.find(p => p.seat === pickedSeat.value) || null
})

/* ===== FLOW HELPERS ===== */
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

    // si otra persona tenía ese asiento, la desasignamos
    const other = store.people.find(p => p.id !== targetId && p.seat === newSeat)
    if (other) {
      await store.updatePerson(other.id, { seat: null })
    }

    // asignamos el asiento a esta persona
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

/* ===== REGISTRAR PRESENTE ===== */
async function handleSubmit () {
  if (submitting.value) return
  submitting.value = true

  if (!selected.value) return bailSubmit('Seleccioná una persona', false)

  try {
    const id = selectedId.value

    // chequeo estado vivo en store para evitar doble click
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
      // fallback optimista
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
/* ===== SHELL PRINCIPAL (igual lenguaje visual que hero/feature-card) ===== */
.ck-shell {
  background:#0e1230;
  color:#eaf0ff;
  border:1px solid rgba(255,217,81,.12);
  box-shadow:0 12px 32px rgba(0,0,0,.6);
  max-width:900px;
  margin-inline:auto;
}

/* HEADER de la tarjeta */
.ck-headbar{
  display:flex;
  align-items:flex-start;
  padding:16px 20px;
  border-bottom:1px solid rgba(255,217,81,.12);
  background:radial-gradient(circle at 0% 0%, rgba(255,217,81,.08) 0%, rgba(14,18,48,0) 60%);
  color:#eaf0ff;
}
.ck-head-left{
  display:flex;
  align-items:flex-start;
  gap:12px;
}
.ck-head-icon{
  color:#ffd951;
}
.ck-head-text{
  line-height:1.3;
}
.ck-head-kicker{
  color:#ffd951;
  font-weight:700;
  font-size:.8rem;
  letter-spacing:.6px;
  text-transform:uppercase;
}
.ck-head-title{
  font-weight:800;
  font-size:1rem;
  line-height:1.3;
  color:#eaf0ff;
}
@media(min-width:600px){
  .ck-head-title{ font-size:1.05rem; }
}
.ck-head-divider{
  opacity:.08;
  border-color:rgba(255,217,81,.12) !important;
}

/* body interno */
.ck-inner{
  padding:20px;
  display:flex;
  flex-direction:column;
  gap:20px;
  color:#eaf0ff;
}

/* ====== BLOQUES (cards internas tipo feature-card / info-card) ====== */
.block-card{
  background:#0f1433;
  border:1px solid rgba(255,217,81,.12);
  border-radius:16px;
  box-shadow:0 8px 24px rgba(0,0,0,.65);
  padding:16px 16px 20px;
  color:#eaf0ff;
  width:100%;
}

/* ================= BUSCADOR ================= */

/* fila input */
.search-row{
  position:relative;
  margin-bottom:16px;
}

/* input estilizado */
.search-input :deep(.v-field){
  border-radius:12px !important;
  background:rgba(14,18,48,.6) !important;
  border:1px solid rgba(255,255,255,.18) !important;
  min-height:54px !important;
  box-shadow:
    0 8px 24px rgba(0,0,0,.8),
    0 0 32px rgba(255,217,81,.08);
  color:#fff !important;
}
.search-input :deep(.v-field__prepend-inner .v-icon){
  color:#fff !important;
  opacity:.9;
}
.search-input :deep(input){
  color:#fff !important;
  font-weight:600;
  letter-spacing:.02em;
  font-size:1rem;
}
.search-input :deep(.v-field-label){
  color:rgba(255,255,255,.6) !important;
  font-weight:500;
  letter-spacing:.02em;
  font-size:.8rem;
}

/* loader puntitos dentro del input */
.search-loader{
  position:absolute;
  right:16px;
  top:0;
  bottom:0;
  display:flex;
  align-items:center;
  gap:4px;
  pointer-events:none;
}
.search-loader .dot{
  width:6px;
  height:6px;
  border-radius:999px;
  background:#fff;
  opacity:.4;
  animation:pulseDots 1s infinite;
}
.search-loader .dot:nth-child(2){ animation-delay:.15s; }
.search-loader .dot:nth-child(3){ animation-delay:.3s; }

@keyframes pulseDots {
  0%,80%,100% { opacity:.3; transform:scale(.8); }
  40%        { opacity:1; transform:scale(1); }
}

/* caja resultados / ayuda */
.results-shell{
  background:#0e1230;
  border:1px solid rgba(255,217,81,.12);
  border-radius:14px;
  box-shadow:0 16px 32px rgba(0,0,0,.7);
  color:#fff;
  min-height:88px;
  max-height:280px;
  display:flex;
  flex-direction:column;
  overflow:hidden;
}
.results-scroll{
  flex:1 1 auto;
  overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  max-height:280px;
}

/* fila resultado */
.result-row{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  padding:14px 16px;
  border-bottom:1px solid rgba(255,255,255,.07);
  background:#0e1230;
  color:#fff;
  cursor:pointer;
  transition:background .08s;
}
.result-row:last-child{
  border-bottom:none;
}
.result-row.is-active{
  background:#1a214a;
}
.result-left{
  display:flex;
  align-items:flex-start;
  gap:12px;
  min-width:0;
  flex:1;
}
.result-avatar{
  flex-shrink:0;
  background:rgba(255,217,81,.18) !important;
  border:1px solid rgba(255,217,81,.4);
  box-shadow:0 2px 6px rgba(0,0,0,.6);
  color:#ffd951;
  font-weight:800;
  letter-spacing:.05em;
}
.ra-text{
  font-size:.8rem;
  font-weight:700;
  line-height:1;
  color:#ffd951;
  text-shadow:0 0 8px rgba(255,217,81,.6);
}
.result-info{
  min-width:0;
  flex:1;
}
.result-top{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:6px;
  min-width:0;
  font-size:.9rem;
  line-height:1.3;
  font-weight:600;
  color:#fff;
}
.person-name{
  font-weight:600;
  color:#fff;
}
.person-sub{
  font-size:.8rem;
  line-height:1.2;
  opacity:.75;
  color:#fff;
  word-break:break-word;
}

/* estado sin resultados */
.nores-row{
  flex:1 1 auto;
  display:flex;
  align-items:flex-start;
  gap:8px;
  font-size:.9rem;
  line-height:1.4;
  color:#fff;
  background:#0e1230;
  padding:16px;
  justify-content:flex-start;
}
.nores-text{ opacity:.8; }

/* ayuda dinámica inicial */
.helpbox{
  flex:1 1 auto;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  background:radial-gradient(circle at 0% 0%, rgba(255,217,81,.12) 0%, rgba(14,18,48,0) 60%);
  background-color:#0e1230;
  padding:20px 16px;
}
.help-inner{
  max-width:420px;
}
.help-dynamic{
  font-size:1rem;
  line-height:1.35;
  font-weight:600;
  color:#fff;
  margin-bottom:6px;
}
.highlight-rot{
  color:#ffd951;
  font-weight:800;
  letter-spacing:.03em;
  text-shadow:0 0 8px rgba(255,217,81,.6);
  animation:fadeWord .4s ease;
}
@keyframes fadeWord {
  0%   { opacity:0; transform:translateY(4px) scale(.98); }
  100% { opacity:1; transform:translateY(0)   scale(1);   }
}
.help-desc{
  font-size:.85rem;
  line-height:1.4;
  color:rgba(255,255,255,.75);
  max-width:360px;
  margin-inline:auto;
}

/* puntito de estado presente/asignado/libre */
.state-dot{
  width:10px;
  height:10px;
  border-radius:999px;
  flex-shrink:0;
  margin-left:8px;
  margin-top:4px;
}
.state-dot.is-present{ background:#4caf50; }
.state-dot.is-assigned{ background:#ffb300; }
.state-dot.is-free{ background:#9e9e9e; }

.seat-chip{
  font-weight:700 !important;
  letter-spacing:.03em;
}

/* ================= DETALLE PERSONA ================= */

.person-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  flex-wrap:wrap;
  gap:16px;
  color:#fff;
}
.person-left{
  display:flex;
  align-items:flex-start;
  gap:12px;
  min-width:0;
  flex:1;
}
.person-avatar{
  flex-shrink:0;
  background:rgba(255,217,81,.18) !important;
  border:1px solid rgba(255,217,81,.4);
  box-shadow:0 2px 6px rgba(0,0,0,.6);
  color:#ffd951;
}
.pa-text{
  font-size:13px;
  font-weight:700;
  letter-spacing:.5px;
  line-height:1;
  color:#ffd951;
  text-shadow:0 0 8px rgba(255,217,81,.6);
}
.person-idtext{
  min-width:0;
  word-break:break-word;
  color:#fff;
}
.person-title{
  font-weight:800;
  font-size:1.05rem;
  line-height:1.3;
  color:#fff;
}
.person-sub2{
  font-size:.9rem;
  opacity:.75;
  color:#fff;
  word-break:break-word;
}
.person-right{
  display:flex;
  align-items:flex-start;
}
.status-chip{
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.04em;
  color:#fff;
  background:rgba(255,217,81,.15);
  border:1px solid rgba(255,217,81,.4);
}

/* botón registrar / chip YA REGISTRADO */
.register-row{
  margin-top:12px;
  margin-bottom:12px;
}
.btn-primary-strong{
  --btn-bg:#ffd951;
  --btn-fg:#0b0d28;
  background:var(--btn-bg) !important;
  color:var(--btn-fg) !important;
  font-weight:800 !important;
  text-transform:none !important;
  letter-spacing:.04em !important;
  border-radius:12px !important;
  width:100%;
  border:0 !important;
  box-shadow:0 8px 24px rgba(0,0,0,.8);
}
.btn-primary-strong :deep(.v-icon){
  color:var(--btn-fg) !important;
  margin-right:8px;
}
.btn-primary-strong :deep(.v-btn__overlay){
  opacity:0 !important;
}
.already-chip{
  width:100%;
  font-weight:700;
  justify-content:center;
  background:rgba(40,167,69,.25) !important;
  color:#bfffc2 !important;
  border-radius:12px !important;
  text-transform:uppercase;
  letter-spacing:.03em;
  display:flex;
  align-items:center;
  justify-content:center;
}

/* separador interno */
.sec-divider{
  opacity:.12;
  margin:12px 0;
  border-color:rgba(255,255,255,.15);
}

/* grid info DNI / organismo / etc */
.info-grid{
  display:grid;
  gap:10px 16px;
  grid-template-columns:repeat(auto-fit, minmax(180px,1fr));
  color:#fff;
}
.info-field{
  display:flex;
  align-items:flex-start;
  gap:6px;
  min-width:0;
  font-size:.9rem;
  line-height:1.3;
  color:#fff;
}
.info-field .lbl{
  opacity:.7;
  font-size:.85rem;
  color:#fff;
}
.info-field .val{
  font-weight:700;
  color:#fff;
  word-break:break-word;
}
.dim-icon{
  opacity:.6;
  color:#fff;
}

/* ACCIONES debajo */
.actions-col{
  margin-top:16px;
  display:grid;
  grid-template-columns:1fr;
  gap:10px;
  color:#fff;
}
.action-btn{
  background:rgba(255,255,255,.05) !important;
  border:1px solid rgba(255,255,255,.18) !important;
  color:#fff !important;
  font-weight:700 !important;
  border-radius:10px !important;
  text-transform:none !important;
  box-shadow:0 2px 6px rgba(0,0,0,.6) !important;
  justify-content:flex-start !important;
}
.action-warn{
  background:rgba(255,193,7,.15) !important;
  border-color:rgba(255,193,7,.4) !important;
  color:#fff !important;
}
.action-free{
  background:rgba(0,0,0,.4) !important;
  border-color:rgba(255,255,255,.2) !important;
}
.action-error{
  background:rgba(220,53,69,.18) !important;
  border-color:rgba(220,53,69,.5) !important;
  color:#fff !important;
}
.action-reset{
  color:#ffd951 !important;
  justify-content:flex-start !important;
  text-transform:none !important;
  font-weight:600 !important;
  padding-left:0 !important;
}

/* SNACKBAR / TOAST */
.snackbar-strong {
  font-weight:600;
  letter-spacing:.02em;
  text-transform:none;
  max-width:360px;
  border-radius:12px !important;
  box-shadow:0 20px 40px rgba(0,0,0,.6);
  color:#fff;
}

/* =============== MODAL ASIENTOS (se mantiene, pero dorado) =============== */

.seat-dialog :deep(.v-overlay__scrim){
  background:rgba(0,0,0,.65) !important;
}
.seat-card{
  background:#0e1230 !important;
  color:#eaf0ff;
  border:1px solid rgba(255,217,81,.4);
  box-shadow:0 20px 40px rgba(0,0,0,.8);
  display:flex;
  flex-direction:column;
  border-radius:16px !important;
  overflow:hidden;
  position:relative;
}
@media(max-width:960px){
  .seat-card{
    height:80vh;
    max-height:80vh;
  }
}
@media(min-width:961px){
  .seat-card{
    height:auto;
    max-height:80vh;
    min-width:560px;
    max-width:640px;
  }
}

.seat-header{
  flex-shrink:0;
  background:radial-gradient(
    circle at 0% 0%,
    rgba(255,217,81,.18) 0%,
    rgba(14,18,48,0) 60%
  );
  border-bottom:1px solid rgba(255,217,81,.25);
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
.chip-strong{
  font-weight:800 !important;
  border-radius:10px !important;
  line-height:1.1 !important;
  height:auto !important;
  padding:2px 8px !important;
  font-size:.7rem !important;
}
.chip-outline{
  color:#eaf0ff !important;
  border-color:rgba(234,240,255,.28) !important;
  font-weight:600 !important;
  border-radius:10px !important;
  line-height:1.1 !important;
  height:auto !important;
  padding:2px 8px !important;
  font-size:.7rem !important;
}

.seat-body{
  flex:1 1 auto;
  overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  padding:16px;
  padding-top:12px;
  background:#0e1230;
  color:#fff;
  min-height:0;
}
.grid-rows-wrap{
  overflow-x:auto;
  -webkit-overflow-scrolling:touch;
  padding-bottom:6px;
}
.grid-rows{
  display:flex;
  flex-direction:column-reverse;
  gap:12px;
  min-width:max(560px,100%);
}
.row{
  display:grid;
  grid-auto-flow:column;
  grid-template-columns:44px repeat(10,68px);
  gap:8px;
  align-items:center;
}
.row-label{
  position:sticky;
  left:0;
  z-index:1;
  text-align:center;
  font-weight:800;
  color:#0b0d28;
  background:#ffd951;
  border:1px solid rgba(255,217,81,.45);
  box-shadow:0 2px 6px rgba(0,0,0,.25);
  border-radius:10px;
  padding:6px 0;
  width:44px;
  font-size:.8rem;
  line-height:1.1;
}
.seat{
  min-width:58px;
  height:36px;
  border-radius:18px;
  font-weight:700;
  text-transform:none;
  box-shadow:0 1px 2px rgba(0,0,0,.25);
  background:#f3f5f9 !important;
  color:#0b0d28 !important;
  font-size:.9rem;
  line-height:1;
}
.seat.present  { background:#4caf50 !important; color:#fff !important; }
.seat.assigned { background:#ffb300 !important; color:#0b0d28 !important; }
.seat.free     { background:#f3f5f9 !important; color:#0b0d28 !important; }
.seat-selected{
  outline:2px solid #ffd951;
  outline-offset:0;
  box-shadow:0 0 8px rgba(255,217,81,.75);
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
.text-accent { color:#ffd951; font-weight:700; }
.text-dim { color:rgba(234,240,255,.75); }

.seat-bottom-spacer{ height:72px; }
@media(min-width:961px){
  .seat-bottom-spacer{ height:24px; }
}

.seat-footer{
  flex-shrink:0;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:12px;
  padding:12px 16px;
  background:#0b0d28;
  border-top:1px solid rgba(255,217,81,.3);
  box-shadow:0 -6px 16px rgba(0,0,0,.8);
}
@media(max-width:960px){
  .seat-footer{
    position:sticky;
    bottom:0;
    left:0;
    right:0;
    z-index:10;
    box-shadow:0 -4px 12px rgba(0,0,0,.8);
  }
}
@media(min-width:961px){
  .seat-footer{
    position:static;
    box-shadow:0 -4px 12px rgba(0,0,0,.6);
  }
}
.btn-cancel{
  color:#ffd951 !important;
  text-transform:none !important;
  font-weight:600 !important;
  min-width:auto !important;
}
.btn-confirm{
  font-weight:700 !important;
  text-transform:none !important;
  border-radius:10px !important;
  min-width:120px;
}

/* MODAL liberar asiento */
.modal-card{
  background:#0e1230 !important;
  color:#eaf0ff !important;
  border:1px solid rgba(255,217,81,.4);
}
.modal-title{
  color:#ffd951;
  font-weight:700;
  display:flex;
  align-items:center;
}

/* RESPONSIVE ajustes */
@media(max-width:600px){
  .ck-headbar{
    flex-direction:row;
    align-items:flex-start;
  }
  .ck-head-title{
    font-size:1rem;
  }

  .person-head{
    flex-direction:column;
    align-items:flex-start;
  }
  .person-right{
    order:2;
  }

  .btn-primary-strong{
    font-size:1rem !important;
  }
}
</style>



