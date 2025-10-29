<!-- components/CheckInForm.vue -->
<template>
  <v-card class="ck-wrap" rounded="2xl" elevation="2">
    <!-- ===== HEADER ===== -->
    <header class="ck-header">
      <div class="ck-h-left">
        <v-icon size="22" class="mr-2">mdi-account-search</v-icon>
        <span class="ck-title">Control de ingreso al palco</span>
      </div>

      <v-chip
        v-if="selectedSeat"
        :color="selectedPresent ? 'success' : 'warning'"
        label
        size="small"
        class="ck-h-chip"
      >
        Asiento {{ selectedSeat }}
      </v-chip>
    </header>

    <v-divider class="ck-divider" />

    <v-card-text class="ck-body">
      <!-- ===== BUSCADOR + CTA ===== -->
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
          <!-- ITEM -->
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
                    v-if="item.raw.seat"
                    size="x-small"
                    class="ml-2"
                    :color="item.raw.present ? 'success' : 'warning'"
                    label
                  >
                    {{ item.raw.seat }}
                  </v-chip>
                  <v-chip v-else size="x-small" class="ml-2" variant="outlined" label>Libre</v-chip>
                </div>
              </template>
              <template #subtitle>
                <span class="muted text-truncate">{{ item.raw.subtitle }}</span>
              </template>
              <template #append>
                <div class="state-dot" :class="item.raw.present ? 'is-present' : (item.raw.seat ? 'is-assigned' : 'is-free')" />
              </template>
            </v-list-item>
          </template>

          <!-- SELECCIÓN -->
          <template #selection="{ item }">
            <div class="sel-wrap">
              <v-avatar :size="22" class="mr-2">
                <span class="avatar-text tiny">{{ initials(item.raw.title) }}</span>
              </v-avatar>
              <span class="text-truncate">{{ item.raw.title }}</span>
              <v-chip
                v-if="item.raw.seat"
                size="x-small"
                class="ml-2"
                :color="item.raw.present ? 'success' : 'warning'"
                label
              >
                {{ item.raw.seat }}
              </v-chip>
              <v-chip v-else size="x-small" class="ml-2" variant="outlined" label>Libre</v-chip>
            </div>
          </template>
        </v-autocomplete>

        <v-tooltip :text="isAlreadyPresent ? 'Esta persona ya fue registrada' : 'Registrar asistencia'" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="ck-primary"
              type="submit"
              size="large"
              rounded="lg"
              :prepend-icon="isAlreadyPresent ? 'mdi-check-decagram' : 'mdi-check'"
              :loading="submitting"
              :disabled="!selected || isAlreadyPresent"
              block
            >
              {{ isAlreadyPresent ? 'YA REGISTRADO' : 'REGISTRAR' }}
            </v-btn>
          </template>
        </v-tooltip>
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
                <div v-if="selected.subtitle" class="cd-sub muted text-truncate">{{ selected.subtitle }}</div>
              </div>
            </div>

            <div class="cd-badges">
              <v-chip
                size="small"
                :color="isAlreadyPresent ? 'success' : (selectedSeat ? 'warning' : '')"
                :variant="!selectedSeat ? 'outlined' : 'flat'"
                label
              >
                {{ isAlreadyPresent ? 'Presente' : selectedSeat ? 'Asignado' : 'Sin asiento' }}
              </v-chip>
              <v-chip v-if="selectedSeat" size="small" color="primary" label class="ml-2">
                {{ selectedSeat }}
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
                <span v-else-if="selectedSeat">Asignado</span>
                <span v-else>Sin asignar</span>
              </span>
            </div>
            <div class="cd-field">
              <v-icon size="16" class="mr-1 muted">mdi-seat</v-icon>
              <span class="lbl">Asiento</span>
              <span class="val">{{ selectedSeat || '—' }}</span>
            </div>
          </div>

          <!-- ACCIONES -->
          <div class="cd-actions">
            <v-btn
              variant="tonal"
              color="primary"
              prepend-icon="mdi-seat"
              class="cd-action"
              @click="emit('assign-seat', selectedId)"
            >
              Asignar / editar asiento
            </v-btn>

            <v-btn
              variant="tonal"
              color="warning"
              prepend-icon="mdi-seat-passenger"
              class="cd-action"
              :disabled="!selectedSeat || releasing"
              :loading="releasing"
              @click="confirmRelease = true"
            >
              Liberar asiento
            </v-btn>
          </div>
        </v-sheet>
      </v-expand-transition>

      <!-- ===== FEEDBACK ===== -->
      <v-expand-transition>
        <div v-if="showSuccess" class="success-banner" role="status" aria-live="polite">
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

      <transition name="fade-slide">
        <v-alert
          v-if="message"
          :type="messageType"
          class="mt-3"
          variant="tonal"
          density="comfortable"
          border="start"
          rounded="lg"
        >
          {{ message }}
        </v-alert>
      </transition>

      <v-snackbar v-model="snackbar.open" location="top right" :timeout="2200">
        {{ snackbar.text }}
      </v-snackbar>
    </v-card-text>

    <!-- ===== DIALOGO CONFIRMAR LIBERAR ===== -->
    <v-dialog v-model="confirmRelease" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="pt-4 pb-0">
          <v-icon class="mr-2">mdi-seat-passenger</v-icon>
          Confirmar liberación
        </v-card-title>
        <v-card-text class="pt-2">
          ¿Liberar el asiento <strong>{{ selectedSeat }}</strong> para
          <strong>{{ selected?.title }}</strong>?
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmRelease = false">Cancelar</v-btn>
          <v-btn color="warning" :loading="releasing" @click="onReleaseSeat">Liberar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'

/* Eventos hacia la vista */
const emit = defineEmits(['checked-in', 'error', 'assign-seat', 'release-seat', 'seat-released'])

const { smAndDown } = useDisplay()
const store = useSeatsStore()

/* Estado general */
const loading = ref(false)
const submitting = ref(false)
const releasing = ref(false)
const search = ref('')
const selected = ref(null)

/* Datos de la persona seleccionada */
const selectedSeat = ref(null)
const selectedPresent = ref(false)
const selectedDoc = ref('')
const selectedOrg = ref('')

/* Feedback */
const message = ref('')
const messageType = ref('info')
const showSuccess = ref(false)
const lastSeat = ref(null)
const snackbar = ref({ open: false, text: '' })

/* Dialogo liberar */
const confirmRelease = ref(false)

/* Responsivo */
const menuProps = computed(() => ({ maxHeight: smAndDown.value ? 320 : 380, offset: smAndDown.value ? 6 : 8 }))
const avatarSize = computed(() => (smAndDown.value ? 28 : 32))

onMounted(async () => {
  loading.value = true
  try { await store.ensureLoaded?.() } finally { loading.value = false }
})

/* Helpers */
const norm = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
const initials = (name = '') => String(name).trim().split(/\s+/).slice(0, 2).map(x => x[0]?.toUpperCase() ?? '').join('')

/* Items desde store */
const items = computed(() =>
  (store.people ?? []).map(p => ({
    title: p.name,
    value: p.id,
    seat: p.seat || null,
    present: !!p.present,
    subtitle: [p.org, p.doc].filter(Boolean).join(' · ') || '—',
    doc: p.doc || '',
    org: p.org || '',
    _keywords: norm([p.name, p.doc, p.org].filter(Boolean).join(' '))
  }))
)

/* Derivados */
const selectedId = computed(() => selected.value?.value ?? null)
const isAlreadyPresent = computed(() => !!selectedPresent.value)

/* Filtro local */
function filterFn (_title, _query, item) {
  const q = norm(search.value)
  if (!q) return true
  return item?.raw?._keywords?.includes(q)
}

/* Selección */
function onSelected (obj) {
  selectedSeat.value = obj?.seat || null
  selectedPresent.value = !!obj?.present
  selectedDoc.value = obj?.doc || ''
  selectedOrg.value = obj?.org || ''
  showSuccess.value = false
  message.value = ''
  messageType.value = 'info'
}

/* Limpiar al borrar búsqueda */
watch(search, v => {
  if (!v) {
    selected.value = null
    selectedSeat.value = null
    selectedPresent.value = false
    selectedDoc.value = ''
    selectedOrg.value = ''
    showSuccess.value = false
    message.value = ''
  }
})

/* Registrar asistencia */
async function onSubmit () {
  if (!selected.value) return

  // anti doble registro (UI + store)
  const personInStore = (store.people ?? []).find(p => p.id === selectedId.value)
  const already = selectedPresent.value || !!personInStore?.present
  if (already) {
    messageType.value = 'info'
    message.value = 'Esta persona ya fue registrada como presente.'
    snackbar.value = { open: true, text: 'Ya estaba presente.' }
    return
  }

  submitting.value = true
  try {
    const id = selectedId.value
    const p = await store.checkInById?.(id)

    if (p) {
      selectedSeat.value = p.seat || null
      selectedPresent.value = !!p.present
      selectedDoc.value = p.doc || selectedDoc.value
      selectedOrg.value = p.org || selectedOrg.value
      selected.value = {
        title: p.name, value: p.id, seat: p.seat, present: p.present,
        subtitle: [p.org, p.doc].filter(Boolean).join(' · ') || '—',
        doc: p.doc, org: p.org
      }
    }

    lastSeat.value = p?.seat || selectedSeat.value || null
    showSuccess.value = true
    messageType.value = 'success'
    message.value = `Asistencia registrada${lastSeat.value ? ` · Asiento ${lastSeat.value}.` : '.'}`
    snackbar.value = { open: true, text: 'Check-in confirmado ✅' }

    emit('checked-in', { person: p ?? selected.value })
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Error al registrar asistencia.'
    messageType.value = 'error'
    message.value = msg
    snackbar.value = { open: true, text: 'No se pudo registrar' }
    emit('error', { message: msg })
  } finally {
    submitting.value = false
  }
}

/* Liberar asiento (funcional + feedback + emisión) */
async function onReleaseSeat () {
  if (!selectedId.value || !selectedSeat.value) {
    confirmRelease.value = false
    return
  }
  releasing.value = true
  try {
    const id = selectedId.value

    // intentos según nombres típicos de método
    const released =
      (await store.releaseSeatById?.(id)) ??
      (await store.freeSeatById?.(id)) ??
      (await store.unassignSeatById?.(id)) ??
      null

    // Actualizo local: sin asiento, puede seguir presente o no (depende backend)
    selectedSeat.value = null
    if (released && typeof released.present === 'boolean') {
      selectedPresent.value = released.present
    }

    // Reflejo en item seleccionado
    selected.value = {
      ...selected.value,
      seat: null,
      present: selectedPresent.value,
      subtitle: [selectedOrg.value, selectedDoc.value].filter(Boolean).join(' · ') || '—'
    }

    snackbar.value = { open: true, text: 'Asiento liberado' }
    messageType.value = 'success'
    message.value = 'El asiento fue liberado correctamente.'
    emit('seat-released', { id, person: released ?? selected.value })
    emit('release-seat', id) // compat
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'No se pudo liberar el asiento.'
    messageType.value = 'error'
    message.value = msg
    snackbar.value = { open: true, text: 'Error al liberar' }
    emit('error', { message: msg })
  } finally {
    releasing.value = false
    confirmRelease.value = false
  }
}
</script>

<style scoped>
/* ===== Layout base ===== */
.ck-wrap { overflow: hidden; }
.ck-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 18px; gap:12px;
  background: linear-gradient(135deg, rgba(10,69,107,.10), rgba(215,219,69,.06));
}
.ck-title { font-weight:700; font-size:clamp(1rem, .96rem + .3vw, 1.12rem); letter-spacing:.2px; }
.ck-h-left { display:flex; align-items:center; }
.ck-h-chip { font-weight:600; }
.ck-divider { opacity:.08; }

.ck-body { padding:18px; }
.ck-form { display:grid; grid-template-columns: 1fr minmax(180px, 240px); gap:12px; }
.ck-search :deep(.v-field) { border-radius:14px !important; }
.ck-search :deep(.v-field__outline) { --v-field-border-width:2px; }
.ck-search :deep(.v-input__control){ transition: transform .15s ease; }
.ck-search:focus-within :deep(.v-input__control){ transform: translateY(-1px); }

/* ===== Dropdown items ===== */
.ck-item :deep(.v-list-item-title),
.ck-item :deep(.v-list-item-subtitle){
  max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
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

/* ===== Detail card ===== */
.cd-card{
  margin-top:14px;
  padding:16px;
  background: rgba(255,255,255,.02);
  border:1px solid rgba(255,255,255,.10);
  box-shadow: 0 2px 8px rgba(0,0,0,.08) inset;
  border-radius: 20px;
}
.cd-head{
  display:flex; align-items:center; justify-content:space-between; gap:12px; min-width:0;
}
.cd-ident{ display:flex; align-items:center; gap:12px; min-width:0; }
.cd-namewrap{ min-width:0; }
.cd-title{ font-weight:800; letter-spacing:.2px; }
.cd-sub{ font-size:.92rem; }
.cd-badges{ display:flex; align-items:center; }

.cd-divider{ opacity:.08; margin:10px 0; }

.cd-grid{
  display:grid; gap:10px 16px;
  grid-template-columns: repeat(4, minmax(0,1fr));
}
.cd-field{
  display:flex; align-items:center; gap:6px; min-width:0;
}
.cd-field .lbl{ opacity:.7; font-size:.85rem; }
.cd-field .val{ font-weight:700; }

/* Acciones: pegadas abajo y responsivas */
.cd-actions{
  display:grid; grid-template-columns: repeat(2, minmax(0, 220px));
  gap:10px; justify-content:flex-start; margin-top:12px;
}
.cd-action{ width:100%; }

/* Botón principal */
.ck-primary{ background:linear-gradient(135deg,#0a456b,#0a456b); color:#fff; letter-spacing:.3px; }

/* Banner éxito */
.success-banner{
  display:flex; align-items:center; gap:12px;
  padding:14px 16px; border-radius:14px; margin-top:14px;
  background:linear-gradient(135deg, rgba(46,125,50,.18), rgba(46,125,50,.12));
  border:1px solid rgba(46,125,50,.35);
  animation: pop-in .18s ease-out;
}
.icon-wrap{ width:36px; height:36px; border-radius:999px; display:grid; place-items:center; background:rgba(46,125,50,.25); }
.msg-wrap .title{ font-weight:700; }
.msg-wrap .subtitle{ opacity:.9; }
@keyframes pop-in{ from{ transform:scale(.98); opacity:0 } to{ transform:scale(1); opacity:1 } }

/* Animaciones */
.fade-slide-enter-active, .fade-slide-leave-active{ transition: all .18s ease; }
.fade-slide-enter-from, .fade-slide-leave-to{ opacity:0; transform: translateY(-4px); }

/* ===== Responsive ===== */
@media (max-width: 1100px){
  .cd-grid{ grid-template-columns: repeat(3, minmax(0,1fr)); }
}
@media (max-width: 900px){
  .ck-form{ grid-template-columns: 1fr; }
  .cd-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
  .cd-actions{ grid-template-columns: 1fr; } /* botones full-width */
}
@media (max-width: 600px){
  .ck-body{ padding:14px; }
  .avatar-text{ line-height:28px; font-size:11px; }
  .cd-grid{ grid-template-columns: 1fr; }
}
</style>
