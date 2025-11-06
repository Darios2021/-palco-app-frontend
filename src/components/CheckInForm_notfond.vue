<!-- src/components/CheckInForm.vue -->
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
      <!-- ================== BUSCADOR ================== -->
      <section v-if="!selected" class="block-card">
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
            @keydown.enter.prevent="confirmOrCreate"
          />
          <div v-if="isTypingLoading" class="search-loader">
            <div class="dot"></div><div class="dot"></div><div class="dot"></div>
          </div>
        </div>

        <div class="results-shell">
          <!-- ====== CON RESULTADOS ====== -->
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
                        v-if="p.seatCode && p.palcoName"
                        size="x-small"
                        class="ml-1 palco-chip"
                        label
                        variant="flat"
                      >
                        {{ p.palcoName }}
                      </v-chip>

                      <v-chip
                        v-else-if="!p.seatCode"
                        size="x-small"
                        class="ml-2 seat-chip"
                        variant="outlined"
                        label
                      >
                        Libre
                      </v-chip>
                    </div>

                    <div v-if="p.subtitle" class="person-sub text-truncate">
                      {{ p.subtitle }}
                    </div>
                  </div>
                </div>

                <div
                  class="state-dot"
                  :class="p.present ? 'is-present' : (p.seatCode ? 'is-assigned' : 'is-free')"
                />
              </div>
            </div>
          </template>

          <!-- ====== SIN RESULTADOS ====== -->
          <template v-else-if="showResults && !isTypingLoading && !filteredResults.length">
            <div class="nores-wrap">
              <div class="nores-row">
                <v-icon size="18" class="mr-2">mdi-alert-circle-outline</v-icon>
                <div class="nores-text">
                  Sin coincidencias. Podés crearla con el botón de abajo.
                </div>
              </div>

              <div class="nores-actions">
                <v-btn
                  color="success"
                  class="create-btn"
                  prepend-icon="mdi-account-plus"
                  @click="openCreatePerson"
                >
                  Crear persona
                </v-btn>
              </div>
            </div>
          </template>

          <!-- ====== AYUDA ====== -->
          <template v-else>
            <div class="helpbox">
              <div class="help-inner">
                <div class="help-dynamic">
                  Probá con <span class="highlight-rot">{{ rotatingHint }}</span>
                </div>
                <div class="help-desc">
                  Podés escribir parte del nombre, <strong>cargo</strong> u organismo.
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- ================== DETALLE ================== -->
      <v-expand-transition>
        <section v-if="selected" class="block-card">
          <div class="person-head">
            <div class="person-left">
              <v-avatar size="54" class="person-avatar">
                <span class="pa-text">{{ initials(selected.title) }}</span>
              </v-avatar>

              <div class="person-idtext">
                <div class="person-title">{{ selected.title }}</div>
                <div v-if="selected.subtitle" class="person-sub2">{{ selected.subtitle }}</div>
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
              INGRESO
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
              PRESENTE
            </v-chip>
          </div>

          <v-divider class="sec-divider" />

          <!-- INFO -->
          <div class="info-grid">
            <div class="info-field">
              <v-icon size="16" class="mr-1 dim-icon">mdi-briefcase</v-icon>
              <span class="lbl">Cargo</span>
              <span class="val">{{ selectedCargo || '—' }}</span>
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
              <span class="val">
                <template v-if="selectedSeatCode">
                  <span class="seat-palco-wrap">
                    <span class="seat-code">{{ selectedSeatCode }}</span>
                    <span class="palco-inline">· {{ selectedPalcoName }}</span>
                  </span>
                </template>
                <template v-else>—</template>
              </span>
            </div>
          </div>

          <!-- ACCIONES -->
          <div class="actions-col">
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

            <v-btn
              variant="flat"
              class="action-btn action-create"
              @click="openCreatePerson"
            >
              <v-icon class="mr-2" size="18">mdi-account-plus</v-icon>
              Crear persona
            </v-btn>

            <v-btn
              variant="flat"
              class="action-btn action-edit"
              :disabled="!selectedId"
              @click="openEditPerson"
            >
              <v-icon class="mr-2" size="18">mdi-account-edit</v-icon>
              Editar persona
            </v-btn>
          </div>
        </section>
      </v-expand-transition>
    </v-card-text>

    <!-- ===== BOTÓN BUSCAR OTRA PERSONA ===== -->
    <div v-if="selected" class="below-reset">
      <v-btn variant="text" class="below-reset-btn" @click="clearAll">
        <v-icon class="mr-2" size="18">mdi-account-search</v-icon>
        Buscar otra persona
      </v-btn>
    </div>

    <!-- ===== MODALES ===== -->
    <v-dialog
  v-model="seatPickerOpen"
  :fullscreen="isMobile"
  :max-width="isMobile ? undefined : 1024"
  scrollable
  class="seat-dialog"
  eager
  retain-focus="false"
>
  <div v-if="seatPickerOpen" class="pa-2">
    <SeatMapPicker
      :model-value="selectedSeatCode"
      @update:modelValue="val => (selectedSeatCode = val)"
      @select="onSeatPicked"
    />
  </div>
</v-dialog>

    <v-dialog
  v-model="seatPickerOpen"
  :fullscreen="isMobile"
  :max-width="isMobile ? undefined : 1024"
  scrollable
  class="seat-dialog"
  eager
  retain-focus="false"
>
  <div v-if="seatPickerOpen" class="pa-2">
    <SeatMapPicker
      :model-value="selectedSeatCode"
      @update:modelValue="val => (selectedSeatCode = val)"
      @select="onSeatPicked"
    />
  </div>
</v-dialog>

    <v-dialog
  v-model="seatPickerOpen"
  :fullscreen="isMobile"
  :max-width="isMobile ? undefined : 1024"
  scrollable
  class="seat-dialog"
  eager
  retain-focus="false"
>
  <div v-if="seatPickerOpen" class="pa-2">
    <SeatMapPicker
      :model-value="selectedSeatCode"
      @update:modelValue="val => (selectedSeatCode = val)"
      @select="onSeatPicked"
    />
  </div>
</v-dialog>

    <!-- MODAL EDITAR -->
    <v-dialog
  v-model="seatPickerOpen"
  :fullscreen="isMobile"
  :max-width="isMobile ? undefined : 1024"
  scrollable
  class="seat-dialog"
  eager
  retain-focus="false"
>
  <div v-if="seatPickerOpen" class="pa-2">
    <SeatMapPicker
      :model-value="selectedSeatCode"
      @update:modelValue="val => (selectedSeatCode = val)"
      @select="onSeatPicked"
    />
  </div>
</v-dialog>

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
import SeatPickerDialog from './SeatPickerDialog.vue'
import PersonForm from './PersonForm.vue'              // crear
import PersonEditForm from './PersonEditForm.vue'      // editar

const store = useSeatsStore()
const { smAndDown } = useDisplay()
const isMobile = computed(() => smAndDown.value)

/* ===== STATE ===== */
const submitting = ref(false)
const releasing = ref(false)
const unmarking = ref(false)

const seatPickerOpen = ref(false)
const assigning = ref(false)
const createPersonOpen = ref(false)

/* edición */
const editPersonOpen = ref(false)
const editablePerson = ref(null)

const searchTerm = ref('')
const showResults = ref(false)
const highlightedIndex = ref(-1)
const isTypingLoading = ref(false)
const typingTimer = ref(null)

const selected = ref(null)

const selectedSeatCode = ref(null)
const selectedSeatId = ref(null)
const selectedPresent = ref(false)
const selectedCargo = ref('')   // reemplaza selectedDoc
const selectedOrg = ref('')

const confirmRelease = ref(false)
const lastSeat = ref(null)

const snackbar = ref({ show:false, text:'', ok:true })

/* ===== PALCO ===== */
function inferPalcoFromSeat (seatCode) {
  if (!seatCode) return ''
  const rowLetter = String(seatCode)[0]?.toUpperCase() || ''
  const principalSet = new Set(['A','B','C','D','E','F','G'])
  const palcoASet    = new Set(['H','I','J','K','L'])
  const palcoBSet    = new Set(['M','N','O','P','Q'])
  if (principalSet.has(rowLetter)) return 'Palco Principal'
  if (palcoASet.has(rowLetter))    return 'Palco A'
  if (palcoBSet.has(rowLetter))    return 'Palco B'
  return 'Palco Principal'
}

/* ===== HINT ===== */
const hintWords = ['Nombre','Cargo','Organismo','Jerarquía']
const rotatingHint = ref(hintWords[0])
let hintIdx = 0, hintTimer = null
function advanceHint(){ hintIdx = (hintIdx + 1) % hintWords.length; rotatingHint.value = hintWords[hintIdx] }

/* ===== COMPUTED ===== */
const selectedId = computed(() => selected.value?.value ?? null)
const isAlreadyPresent = computed(() => !!selectedPresent.value)
const chipText = computed(() => isAlreadyPresent.value ? 'Presente' : (selectedSeatCode.value ? 'Asignado' : 'Sin asignar'))
const selectedPalcoName = computed(() => selectedSeatCode.value ? inferPalcoFromSeat(selectedSeatCode.value) : '')

/* ===== UTILS ===== */
const norm = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
const initials = name => String(name || '').trim().split(/\s+/).slice(0,2).map(x => x[0]?.toUpperCase() ?? '').join('')

/* ===== PEOPLE ===== */
const allPeople = computed(() =>
  (store.people ?? []).map(p => {
    const seatCode = p.seatCode ?? p.seat ?? p.seat_code ?? null
    const cleanSubtitle = p.rank || p.cargo || p.role || ''
    return {
      title: p.name,
      value: p.id,
      seatId:   p.seatId    ?? p.seat_id    ?? null,
      seatCode: seatCode,
      present:  !!p.present,
      palcoName: seatCode ? inferPalcoFromSeat(seatCode) : '',
      subtitle: cleanSubtitle,
      cargo: p.cargo || '',
      org: p.org || '',
      _keywords: norm([p.name, p.cargo, p.org, cleanSubtitle].filter(Boolean).join(' '))
    }
  })
)

/* ===== FILTRO ===== */
const filteredResults = computed(() => {
  const q = norm(searchTerm.value)
  if (!q) return []
  return allPeople.value.filter(p => p._keywords.includes(q)).slice(0, 20)
})

/* ===== LIFECYCLE ===== */
onMounted(async () => {
  await ensureStoreLoaded()
  hintTimer = setInterval(advanceHint, 1000)
})
onBeforeUnmount(() => { if (hintTimer) clearInterval(hintTimer) })

async function ensureStoreLoaded () {
  if (typeof store.ensureLoaded === 'function') {
    try { isTypingLoading.value = true; await store.ensureLoaded() }
    finally { isTypingLoading.value = false }
  }
}

/* ===== TYPING ===== */
watch(searchTerm, (val) => {
  if (!val) { resetSelectionSoft(); showResults.value = false; highlightedIndex.value = -1; stopTypingLoader(); return }
  startTypingLoader()
  if (typingTimer.value) clearTimeout(typingTimer.value)
  typingTimer.value = setTimeout(() => {
    stopTypingLoader()
    highlightedIndex.value = filteredResults.value.length ? 0 : -1
    showResults.value = true
  }, 200)
})
function startTypingLoader(){ isTypingLoading.value = true }
function stopTypingLoader(){ isTypingLoading.value = false }

/* ===== NAV TECLADO ===== */
function moveHighlight (dir) {
  if (!showResults.value || !filteredResults.value.length) return
  const max = filteredResults.value.length - 1
  let next = highlightedIndex.value + dir
  if (next < 0) next = max
  if (next > max) next = 0
  highlightedIndex.value = next
}
function confirmOrCreate () {
  if (!showResults.value) return
  const p = filteredResults.value[highlightedIndex.value]
  if (p) pickPerson(p)
  else if (!filteredResults.value.length) openCreatePerson()
}

/* ===== SELECT ===== */
function pickPerson (p) {
  selected.value         = p
  selectedSeatCode.value = p.seatCode || null
  selectedSeatId.value   = p.seatId   || null
  selectedPresent.value  = !!p.present
  selectedCargo.value    = p.cargo || ''
  selectedOrg.value      = p.org || ''
  searchTerm.value = p.title
  showResults.value = false
}

/* ===== LIMPIEZA ===== */
function resetSelectionSoft () { hideToast() }
function clearAll () {
  searchTerm.value = ''
  selected.value = null
  selectedSeatCode.value = null
  selectedSeatId.value = null
  selectedPresent.value = false
  selectedCargo.value = ''
  selectedOrg.value = ''
  hideToast()
}

/* ===== STORE HELPERS ===== */
async function tryCall (name, ...args) {
  const fn = store?.[name]
  if (typeof fn !== 'function') return undefined
  try { return await fn(...args) } catch { return undefined }
}
async function refreshStore () { await (store.refresh?.() || store.ensureLoaded?.() || Promise.resolve()) }

function syncFromPerson (p) {
  const seatCode = p.seatCode ?? p.seat ?? p.seat_code ?? null
  selectedSeatCode.value = seatCode
  selectedSeatId.value   = p.seatId   ?? p.seat_id ?? selectedSeatId.value ?? null
  selectedPresent.value  = !!p.present
  selectedCargo.value    = p.cargo || selectedCargo.value
  selectedOrg.value      = p.org || selectedOrg.value
  const cleanSubtitle = p.rank || p.cargo || p.role || ''
  selected.value = {
    title: p.name,
    value: p.id,
    seatId: p.seatId ?? p.seat_id ?? null,
    seatCode: seatCode,
    present: p.present,
    palcoName: seatCode ? inferPalcoFromSeat(seatCode) : '',
    subtitle: cleanSubtitle,
    cargo: p.cargo,
    org: p.org
  }
}
function syncFromStoreById (idLike) {
  const fresh = (store.people ?? []).find(p => p.id == idLike)
  if (fresh) { syncFromPerson(fresh); return true }
  return false
}

/* ===== TOAST ===== */
function showToast(message, ok = true){ snackbar.value = { text: message, ok, show: true } }
function hideToast(){ snackbar.value.show = false }

/* ===== SEAT PICKER ===== */
function openSeatPicker(){ seatPickerOpen.value = true }
async function onSeatPicked(newSeat) {
  if (!selectedId.value) { showToast('Seleccioná una persona', false); seatPickerOpen.value = false; return }
  if (!newSeat) { showToast('Seleccioná un asiento', false); seatPickerOpen.value = false; return }
  assigning.value = true
  try {
    const targetId = selectedId.value
    const other = store.people.find(p => p.id !== targetId && (p.seat === newSeat || p.seatCode === newSeat || p.seat_code === newSeat))
    if (other) await store.updatePerson(other.id, { seat: null })
    await store.updatePerson(targetId, { seat: newSeat })
    await refreshStore(); syncFromStoreById(targetId)
    showToast('Asiento asignado', true)
  } catch { showToast('Error al asignar asiento', false) }
  finally { assigning.value = false; seatPickerOpen.value = false }
}

/* ===== REGISTRAR ===== */
async function handleSubmit () {
  if (submitting.value) return
  submitting.value = true
  if (!selected.value) { showToast('Seleccioná una persona', false); submitting.value = false; return }
  try {
    const id = selectedId.value
    const live = (store.people ?? []).find(p => p.id == id)
    if (live?.present || selectedPresent.value) { showToast('Ya estaba presente', true); submitting.value = false; return }
    const updated =
      await tryCall('checkInById', id) ??
      await tryCall('setPresent', id, true) ??
      await tryCall('updatePerson', id, { present: true })
    if (updated) { syncFromPerson(updated) } else { selectedPresent.value = true; if (selected.value) selected.value.present = true }
    lastSeat.value = selectedSeatCode.value || null
    await refreshStore(); syncFromStoreById(id)
    showToast('Registrado correctamente', true)
  } catch { showToast('No se pudo registrar', false) }
  finally { submitting.value = false }
}

/* ===== LIBERAR ===== */
async function onReleaseSeat () {
  if (releasing.value) return
  releasing.value = true
  if (!selectedId.value || !selectedSeatCode.value) {
    showToast('No hay asiento para liberar', false)
    releasing.value = false; confirmRelease.value = false; return
  }
  try {
    const personId = selectedId.value
    await store.updatePerson(personId, { seat: null })
    await refreshStore(); syncFromStoreById(personId)
    showToast('Asiento liberado', true)
  } catch { showToast('Error al liberar el asiento', false) }
  finally { releasing.value = false; confirmRelease.value = false }
}

/* ===== QUITAR PRESENTE ===== */
async function onRemovePresenceLikeTable () {
  if (unmarking.value) return
  unmarking.value = true
  if (!selectedId.value) { showToast('No hay persona seleccionada', false); unmarking.value = false; return }
  try {
    const personId = selectedId.value
    await store.updatePerson(personId, { present: false })
    selectedPresent.value = false
    if (selected.value) selected.value.present = false
    await refreshStore(); syncFromStoreById(personId)
    showToast('Presencialidad desactivada', true)
  } catch { showToast('No se pudo desactivar presencialidad', false) }
  finally { unmarking.value = false }
}

/* ===== CREAR / EDITAR PERSONA ===== */
function openCreatePerson(){ createPersonOpen.value = true }
async function onPersonCreated(newPerson){
  createPersonOpen.value = false
  await refreshStore()
  if (newPerson?.id && syncFromStoreById(newPerson.id)) {
    showToast('Persona creada', true)
  } else {
    showToast('Persona creada. Actualizá la búsqueda para seleccionarla.', true)
  }
}

function openEditPerson () {
  if (!selectedId.value) { showToast('Seleccioná una persona', false); return }
  const fresh = (store.people ?? []).find(p => p.id == selectedId.value)
  if (!fresh) { showToast('No se pudo cargar la persona', false); return }
  // Clon para no mutar el store por ref superficial
  editablePerson.value = JSON.parse(JSON.stringify(fresh))
  editPersonOpen.value = true
}
async function onPersonEdited (updated) {
  editPersonOpen.value = false
  await refreshStore()
  if (updated?.id && syncFromStoreById(updated.id)) {
    showToast('Datos actualizados', true)
  } else if (selectedId.value) {
    syncFromStoreById(selectedId.value)
    showToast('Datos actualizados', true)
  } else {
    showToast('Actualización realizada', true)
  }
}
</script>

<style scoped>
/* ===== SHELL PRINCIPAL ===== */
.ck-shell{ background:#0e1230; color:#eaf0ff; border:1px solid rgba(255,217,81,.12); box-shadow:0 12px 32px rgba(0,0,0,.6); max-width:900px; margin-inline:auto; }

/* HEADER */
.ck-headbar{ display:flex; align-items:flex-start; padding:16px 20px; border-bottom:1px solid rgba(255,217,81,.12);
  background:radial-gradient(circle at 0% 0%, rgba(255,217,81,.08) 0%, rgba(14,18,48,0) 60%); color:#eaf0ff; }
.ck-head-left{ display:flex; align-items:flex-start; gap:12px; }
.ck-head-icon{ color:#ffd951; }
.ck-head-text{ line-height:1.3; }
.ck-head-kicker{ color:#ffd951; font-weight:700; font-size:.8rem; letter-spacing:.6px; text-transform:uppercase; }
.ck-head-title{ font-weight:800; font-size:1rem; line-height:1.3; color:#eaf0ff; }
@media(min-width:600px){ .ck-head-title{ font-size:1.05rem; } }
.ck-head-divider{ opacity:.08; border-color:rgba(255,217,81,.12) !important; }

/* BODY */
.ck-inner{ padding:20px; display:flex; flex-direction:column; gap:20px; color:#eaf0ff; }

/* CARD */
.block-card{ background:#0f1433; border:1px solid rgba(255,217,81,.12); border-radius:16px; box-shadow:0 8px 24px rgba(0,0,0,.65); padding:16px 16px 20px; color:#eaf0ff; width:100%; }

/* ===== BUSCADOR ===== */
.search-row{ position:relative; margin-bottom:16px; }
.search-input :deep(.v-field){ border-radius:12px !important; background:rgba(14,18,48,.6) !important; border:1px solid rgba(255,255,255,.18) !important;
  min-height:54px !important; box-shadow:0 8px 24px rgba(0,0,0,.8), 0 0 32px rgba(255,217,81,.08); color:#fff !important; }
.search-input :deep(.v-field__prepend-inner .v-icon){ color:#fff !important; opacity:.9; }
.search-input :deep(input){ color:#fff !important; font-weight:600; letter-spacing:.02em; font-size:1rem; }
.search-input :deep(.v-field-label){ color:rgba(255,255,255,.6) !important; font-weight:500; letter-spacing:.02em; font-size:.8rem; }

/* loader */
.search-loader{ position:absolute; right:16px; top:0; bottom:0; display:flex; align-items:center; gap:4px; pointer-events:none; }
.search-loader .dot{ width:6px; height:6px; border-radius:999px; background:#fff; opacity:.4; animation:pulseDots 1s infinite; }
.search-loader .dot:nth-child(2){ animation-delay:.15s; } .search-loader .dot:nth-child(3){ animation-delay:.3s; }
@keyframes pulseDots{ 0%,80%,100%{opacity:.3; transform:scale(.8)} 40%{opacity:1; transform:scale(1)} }

/* resultados */
.results-shell{ background:#0e1230; border:1px solid rgba(255,217,81,.12); border-radius:14px; box-shadow:0 16px 32px rgba(0,0,0,.7);
  color:#fff; min-height:88px; max-height:280px; display:flex; flex-direction:column; overflow:hidden; }
.results-scroll{ flex:1 1 auto; overflow-y:auto; -webkit-overflow-scrolling:touch; max-height:280px; }

.result-row{ display:flex; align-items:flex-start; justify-content:space-between; padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.07);
  background:#0e1230; color:#fff; cursor:pointer; transition:background .08s; }
.result-row:last-child{ border-bottom:none; }
.result-row.is-active{ background:#1a214a; }
.result-left{ display:flex; align-items:flex-start; gap:12px; min-width:0; flex:1; }
.result-avatar{ flex-shrink:0; background:rgba(255,217,81,.18) !important; border:1px solid rgba(255,217,81,.4); box-shadow:0 2px 6px rgba(0,0,0,.6);
  color:#ffd951; font-weight:800; letter-spacing:.05em; }
.ra-text{ font-size:.8rem; font-weight:700; line-height:1; color:#ffd951; text-shadow:0 0 8px rgba(255,217,81,.6); }
.result-info{ min-width:0; flex:1; }
.result-top{ display:flex; flex-wrap:wrap; align-items:center; gap:6px; min-width:0; font-size:.9rem; line-height:1.3; font-weight:600; color:#fff; }
.person-name{ font-weight:700; color:#fff; }
.person-sub{ font-size:.8rem; line-height:1.2; opacity:.78; color:#fff; word-break:break-word; }

/* ===== DETALLE PERSONA ===== */
.person-head{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
.person-avatar{ background:rgba(255,217,81,.18) !important; border:1px solid rgba(255,217,81,.4); color:#ffd951; font-weight:800; }
.pa-text{ font-size:.95rem; letter-spacing:.04em; }
.person-idtext{ min-width:0; }
.person-title{
  font-weight:800;
  font-size:1.15rem;
  line-height:1.25;
  color:#ffffff;
  letter-spacing:.01em;
  margin-bottom:2px;
}
.person-sub2{ font-size:.9rem; opacity:.8; }

/* chips */
.seat-chip{ font-weight:700 !important; letter-spacing:.03em; }
.palco-chip{ background:rgba(255,217,81,.15) !important; border:1px solid rgba(255,217,81,.4) !important; font-weight:700 !important; color:#ffd951 !important;
  text-transform:none !important; letter-spacing:.03em !important; line-height:1.1 !important; height:auto !important; padding:2px 6px !important; font-size:.7rem !important; border-radius:8px !important; }

/* estado */
.state-dot{ width:10px; height:10px; border-radius:999px; flex-shrink:0; margin-left:8px; margin-top:4px; }
.state-dot.is-present{ background:#4caf50; } .state-dot.is-assigned{ background:#ffb300; } .state-dot.is-free{ background:#9e9e9e; }

/* no results */
.nores-wrap{ display:flex; flex-direction:column; background:#0e1230; }
.nores-row{ flex:0 0 auto; display:flex; align-items:flex-start; gap:8px; font-size:.9rem; line-height:1.4; color:#fff; padding:16px; }
.nores-text{ opacity:.85; }
.nores-actions{ padding:0 16px 16px; }
.create-btn{ font-weight:800 !important; text-transform:none !important; border-radius:10px !important; }

/* ayuda */
.helpbox{ flex:1 1 auto; display:flex; align-items:center; justify-content:center; text-align:center;
  background:radial-gradient(circle at 0% 0%, rgba(255,217,81,.12) 0%, rgba(14,18,48,0) 60%); background-color:#0e1230; padding:20px 16px; }
.help-inner{ max-width:420px; }
.help-dynamic{ font-size:1rem; line-height:1.35; font-weight:600; color:#fff; margin-bottom:6px; }
.highlight-rot{ color:#ffd951; font-weight:800; letter-spacing:.03em; text-shadow:0 0 8px rgba(255,217,81,.6); animation:fadeWord .4s ease; }
@keyframes fadeWord{ 0%{opacity:0; transform:translateY(4px) scale(.98)} 100%{opacity:1; transform:translateY(0) scale(1)} }
.help-desc{ font-size:.85rem; line-height:1.4; color:rgba(255,255,255,.75); max-width:360px; margin-inline:auto; }

/* registrar */
.register-row{ margin-top:12px; margin-bottom:12px; }
.btn-primary-strong{
  --btn-bg:#ffd951; --btn-fg:#0b0d28;
  background:var(--btn-bg) !important; color:var(--btn-fg) !important; font-weight:800 !important;
  text-transform:none !important; letter-spacing:.04em !important; border-radius:12px !important; width:100%; border:0 !important;
  box-shadow:0 8px 24px rgba(0,0,0,.8);
}
.btn-primary-strong :deep(.v-icon){ color:var(--btn-fg) !important; margin-right:8px; }
.btn-primary-strong :deep(.v-btn__overlay){ opacity:0 !important; }
.already-chip{ width:100%; font-weight:700; justify-content:center; background:rgba(40,167,69,.25) !important; color:#bfffc2 !important;
  border-radius:12px !important; text-transform:uppercase; letter-spacing:.03em; display:flex; align-items:center; justify-content:center; }

/* separador */
.sec-divider{ opacity:.12; margin:12px 0; border-color:rgba(255,255,255,.15); }

/* info grid */
.info-grid{ display:grid; gap:10px 16px; grid-template-columns:repeat(auto-fit, minmax(180px,1fr)); color:#fff; }
.info-field{ display:flex; align-items:flex-start; gap:6px; min-width:0; font-size:.9rem; line-height:1.3; color:#fff; }
.info-field .lbl{ opacity:.7; font-size:.85rem; color:#fff; }
.info-field .val{ font-weight:700; color:#fff; word-break:break-word; }
.dim-icon{ opacity:.6; color:#fff; }
.seat-palco-wrap{ display:inline-flex; align-items:center; flex-wrap:nowrap; gap:6px; line-height:1.3; }
.seat-code{ font-weight:700; color:#fff; }
.palco-inline{ font-weight:600; color:#ffd951; white-space:nowrap; line-height:1.3; }

/* acciones */
.actions-col{ margin-top:16px; display:grid; grid-template-columns:1fr; gap:10px; color:#fff; }
.action-btn{
  background:rgba(255,255,255,.05) !important; border:1px solid rgba(255,255,255,.18) !important; color:#fff !important;
  font-weight:700 !important; border-radius:10px !important; text-transform:none !important; box-shadow:0 2px 6px rgba(0,0,0,.6) !important;
  justify-content:flex-start !important;
}
.action-warn{ background:rgba(255,193,7,.15) !important; border-color:rgba(255,193,7,.4) !important; color:#fff !important; }
.action-error{ background:rgba(220,53,69,.18) !important; border-color:rgba(220,53,69,.5) !important; color:#fff !important; }
.action-create{ background:rgba(76,175,80,.18) !important; border-color:rgba(76,175,80,.5) !important; }
.action-edit{ background:rgba(33,150,243,.18) !important; border-color:rgba(33,150,243,.5) !important; }

/* botón buscar afuera */
.below-reset{ display:flex; justify-content:flex-start; padding:0 20px 20px; }
.below-reset-btn{ color:#ffd951 !important; text-transform:none !important; font-weight:600 !important; padding-left:0 !important; }

/* TOAST & MODAL */
.snackbar-strong{ font-weight:600; letter-spacing:.02em; text-transform:none; max-width:360px; border-radius:12px !important;
  box-shadow:0 20px 40px rgba(0,0,0,.6); color:#fff; }
.modal-card{ background:#0e1230 !important; color:#eaf0ff !important; border:1px solid rgba(255,217,81,.4); }
.modal-title{ color:#ffd951; font-weight:700; display:flex; align-items:center; }

/* responsive */
@media(max-width:600px){
  .ck-headbar{ flex-direction:row; align-items:flex-start; }
  .ck-head-title{ font-size:1rem; }
  .person-head{ flex-direction:column; align-items:flex-start; }
  .person-right{ order:2; }
  .btn-primary-strong{ font-size:1rem !important; }
}
</style>
