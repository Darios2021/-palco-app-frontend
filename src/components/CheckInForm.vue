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
      <v-form @submit.prevent="onSubmit" class="ck-form">
        <div class="ck-form-row">
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
            class="ck-search"
          >
            <!-- ITEM EN DROPDOWN -->
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

            <!-- LO QUE QUEDA EN EL INPUT CUANDO ESTÁ SELECCIONADO -->
            <template #selection="{ item }">
              <div class="sel-wrap">
                <v-avatar :size="22" class="mr-2 elevated">
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
              :disabled="!selected"
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
            <!-- ASIGNAR ASIENTO (si NO tiene) -->
            <v-btn
              v-if="!selectedSeatCode"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-seat"
              class="cd-action"
              @click="goAssignSeat()"
            >
              Asignar asiento
            </v-btn>

            <!-- LIBERAR ASIENTO (si TIENE) -->
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

            <!-- QUITAR PRESENTE (si está presente) -->
            <v-btn
              v-if="isAlreadyPresent"
              variant="tonal"
              color="error"
              prepend-icon="mdi-close-circle-outline"
              class="cd-action"
              :disabled="unmarking"
              :loading="unmarking"
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
          <v-btn color="warning" :loading="releasing" @click="onReleaseSeat">
            Liberar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== TOAST (ABAJO DERECHA) ===== -->
    <v-snackbar
      v-model="toast.open"
      location="bottom right"
      :timeout="2200"
      class="toast-snackbar"
    >
      <div class="toast-inner">
        <v-icon
          v-if="toast.type === 'ok'"
          size="18"
          class="mr-2 toast-icon ok"
        >
          mdi-check-circle
        </v-icon>
        <v-icon
          v-else-if="toast.type === 'warn'"
          size="18"
          class="mr-2 toast-icon warn"
        >
          mdi-alert
        </v-icon>
        <v-icon
          v-else-if="toast.type === 'err'"
          size="18"
          class="mr-2 toast-icon err"
        >
          mdi-alert-circle
        </v-icon>

        <span class="toast-text">{{ toast.text }}</span>
      </div>
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'
import { useRouter } from 'vue-router'

/* router para ir a /personas después de liberar asiento */
const router = useRouter()

const emit = defineEmits([
  'checked-in',
  'error',
  'assign-seat',
  'release-seat',
  'seat-released',
  'presence-removed'
])

const store = useSeatsStore()
const { smAndDown } = useDisplay()

/* ===== STATE ===== */
const loading     = ref(false)
const submitting  = ref(false)
const releasing   = ref(false)
const unmarking   = ref(false)

const search      = ref('')
const selected    = ref(null)

const selectedSeatCode = ref(null)
const selectedSeatId   = ref(null)
const selectedPresent  = ref(false)
const selectedDoc      = ref('')
const selectedOrg      = ref('')

const confirmRelease = ref(false)

const showSuccess = ref(false) // (lo dejé por si lo usás en otro lado)
const lastSeat    = ref(null)

/* Toast abajo derecha */
const toast = ref({
  open: false,
  text: '',
  type: 'ok' // 'ok' | 'warn' | 'err'
})

/* ===== COMPUTED ===== */
const menuProps = computed(() => ({
  maxHeight: smAndDown.value ? 320 : 380,
  offset: smAndDown.value ? 6 : 8
}))
const avatarSize = computed(() => (smAndDown.value ? 28 : 32))

const selectedId = computed(() => selected.value?.value ?? null)
const isAlreadyPresent = computed(() => !!selectedPresent.value)

const chipText = computed(() => {
  if (isAlreadyPresent.value) return 'Presente'
  if (selectedSeatCode.value) return 'Asignado'
  return 'Sin asiento'
})

/* ===== INIT LOAD ===== */
onMounted(async () => {
  loading.value = true
  try {
    await store.ensureLoaded?.()
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

/* Limpiar selección si limpio search */
watch(search, v => {
  if (!v) {
    resetSelection()
  }
})

function resetSelection () {
  selected.value        = null
  selectedSeatCode.value= null
  selectedSeatId.value  = null
  selectedPresent.value = false
  selectedDoc.value     = ''
  selectedOrg.value     = ''
  showSuccess.value     = false
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
    store.reload?.() ||
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

/* Toast helpers */
function showToast(message, type = 'ok') {
  toast.value = {
    open: true,
    text: message,
    type
  }
}
function hideToast() {
  toast.value.open = false
}

/* Navegar a PeopleView */
function goAssignSeat () {
  // Abrimos el flujo de asignación. Tu app ya usa este emit para abrir picker
  emit('assign-seat', selectedId.value)

  // Si querés forzar ir a la vista personas directamente al asignar:
  // router.push('/personas')
  // Por ahora lo dejo sólo como emit, porque me dijiste redirect explícito solo post-liberar.
}

/* ===== ACCIÓN: marcar presente ===== */
async function onSubmit () {
  if (!selected.value) return

  const personInStore = (store.people ?? []).find(
    p => p.id == selectedId.value
  )
  const already = selectedPresent.value || !!personInStore?.present
  if (already) {
    showToast('Ya estaba presente', 'warn')
    return
  }

  submitting.value = true
  try {
    const id = selectedId.value
    const p =
      await tryCall('checkInById', id) ??
      await tryCall('setPresent', id, true) ??
      await tryCall('updatePerson', id, { present: true })

    if (p) {
      syncFromPerson(p)
    } else {
      selectedPresent.value = true
      if (selected.value) selected.value.present = true
    }

    lastSeat.value = selectedSeatCode.value || null
    showSuccess.value = true

    emit('checked-in', { person: p ?? selected.value })

    await refreshStore()
    syncFromStoreById(id)

    showToast('Registrado correctamente', 'ok')
  } catch (e) {
    showToast('No se pudo registrar', 'err')
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

/* ===== ACCIÓN: liberar asiento ===== */
async function onReleaseSeat () {
  if (!selectedId.value || !selectedSeatCode.value) {
    confirmRelease.value = false
    return
  }

  releasing.value = true
  try {
    const personId = selectedId.value
    const seatId   = selectedSeatId.value
    const seatCode = selectedSeatCode.value

    const attempts = [
      () => tryCall('unassignSeat', personId),
      () => tryCall('releaseSeatById', personId),
      () => tryCall('freeSeatById', personId),
      () => tryCall('unassignSeatById', personId),
      () => tryCall('releaseSeatByPersonId', personId),
      () => tryCall('releaseSeat', { personId, seatId, seatCode }),
      () => tryCall('freeSeat',    { personId, seatId, seatCode }),
      () => tryCall('setSeat',    personId, null),
      () => tryCall('assignSeat', personId, null),
      () => (seatId ? tryCall('releaseSeatBySeatId', seatId) : undefined),
      () => tryCall('updatePerson', personId, { seat: null })
    ]

    let released
    for (const run of attempts) {
      // eslint-disable-next-line no-await-in-loop
      released = await run()
      if (released !== undefined) break
    }

    if (released) {
      syncFromPerson(released)
    } else {
      // fallback local
      selectedSeatCode.value = null
      selectedSeatId.value   = null
      if (selected.value) selected.value.seatCode = null
    }

    await refreshStore()
    syncFromStoreById(personId)

    emit('seat-released', {
      id: personId,
      person: released ?? selected.value
    })
    emit('release-seat', personId)

    showToast('Asiento liberado', 'ok')

    // si quedó sin asiento, voy a /personas
    if (!selectedSeatCode.value) {
      setTimeout(() => {
        router.push('/personas')
      }, 600)
    }
  } catch (e) {
    showToast('Error al liberar el asiento', 'err')
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

/* ===== ACCIÓN: quitar presente ===== */
async function onRemovePresenceLikeTable () {
  if (!selectedId.value || !isAlreadyPresent.value) return

  unmarking.value = true
  try {
    const personId = selectedId.value

    await tryCall('setPresent', personId, false) ??
    await tryCall('uncheckInById', personId) ??
    await tryCall('clearPresenceById', personId) ??
    await tryCall('updatePerson', personId, { present: false })

    // actualizar UI local
    selectedPresent.value = false
    if (selected.value) {
      selected.value.present = false
    }

    await refreshStore()
    syncFromStoreById(personId)

    emit('presence-removed', {
      id: personId,
      person: selected.value
    })

    showToast('Presencialidad desactivada', 'warn')
  } catch (e) {
    showToast('No se pudo desactivar presencialidad', 'err')
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
</script>

<style scoped>
/* ===== CONTENEDOR GENERAL ===== */
.ck-wrap {
  overflow: hidden;
  background:#0f1631;
  color:#fff;
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

/* fila interna del form: en desktop dos columnas, en mobile stack */
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

/* input autocomplete */
.ck-search :deep(.v-field){
  border-radius:12px !important;
  background:rgba(255,255,255,.06) !important;
  color:#fff !important;
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

/* celda CTA (botón registrar / chip ya registrado) */
.ck-cta-cell{
  display:flex;
  align-items:stretch;
}
@media (max-width:600px){
  .ck-cta-cell{
    width:100%;
  }
}

/* botón registrar */
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

/* dropdown list item */
.ck-item{
  background:#1b244e !important;
  color:#fff !important;
}
.row-title{
  display:inline-flex;
  align-items:center;
  min-width:0;
  color:#fff;
}
.name{
  font-weight:600;
  color:#fff;
}
.muted{
  opacity:.75;
  color:#fff;
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

/* header de la card */
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

/* chip estado */
.cd-chip{
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.04em;
  color:#fff;
}

/* divisor */
.cd-divider{
  opacity:.15;
  margin:12px 0;
  border-color:rgba(255,255,255,.15);
}

/* grid info */
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

/* acciones */
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

/* mobile: cada acción ocupa toda la fila */
@media (max-width:600px){
  .cd-actions{
    grid-template-columns:1fr;
  }
}

/* ===== TOAST ===== */
.toast-snackbar :deep(.v-overlay__content){
  padding:0 !important;
}
.toast-inner{
  display:flex;
  align-items:center;
  background:#1a234a;
  color:#fff;
  border:1px solid rgba(255,255,255,.18);
  border-radius:10px;
  font-size:.9rem;
  font-weight:600;
  padding:10px 14px;
  min-width:220px;
  max-width:320px;
  box-shadow:0 10px 24px rgba(0,0,0,.6);
}
.toast-icon.ok{
  color:#4caf50;
}
.toast-icon.warn{
  color:#ffb300;
}
.toast-icon.err{
  color:#ff5252;
}
.toast-text{
  line-height:1.3;
  color:#fff;
}
</style>
