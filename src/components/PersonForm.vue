<!-- src/components/PersonForm.vue -->
<template>
  <v-card class="card-contrast" rounded="xl">
    <!-- ===== HEADER ===== -->
    <v-card-title class="title-contrast d-flex align-center flex-wrap">
      <v-icon class="mr-2">mdi-account-plus</v-icon>
      <span class="font-weight-800">
        {{ isEdit ? 'Editar persona' : 'Nueva persona' }}
      </span>

      <v-spacer />

      <v-chip v-if="isEdit && personSeat" size="small" color="success" label>
        {{ personSeat }}
      </v-chip>
    </v-card-title>

    <!-- ===== FORM ===== -->
    <v-form ref="formRef" @submit.prevent="onSubmit">
      <v-card-text class="pb-0">
        <v-row class="g-12">
          <!-- NOMBRE -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.trim="form.name"
              :rules="nameRules"
              label="Nombre completo"
              placeholder="Nombre y apellido"
              clearable
              :density="smAndDown ? 'comfortable' : 'default'"
              class="field-contrast"
              prepend-inner-icon="mdi-account"
              hide-details="auto"
              required
              :error="nameError"
              :error-messages="nameError ? ['Requerido'] : []"
            />
          </v-col>

          <!-- CARGO -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model.trim="form.cargo"
              label="Cargo"
              placeholder="Jerarquía / Cargo (opcional)"
              clearable
              class="field-contrast"
              prepend-inner-icon="mdi-briefcase"
              hide-details="auto"
            />
          </v-col>

          <!-- ORGANISMO -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model.trim="form.org"
              label="Organismo"
              placeholder="Organismo / Institución"
              clearable
              class="field-contrast"
              prepend-inner-icon="mdi-town-hall"
              hide-details="auto"
            />
          </v-col>

          <!-- PALCO -->
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="selectedPalcoId"
              :items="palcoItems"
              item-title="name"
              item-value="id"
              label="Palco"
              placeholder="Elegí el palco"
              class="field-contrast"
              prepend-inner-icon="mdi-seat"
              hide-details="auto"
              :loading="loadingPalcos"
              :disabled="loadingPalcos"
              :menu-props="menuProps"
            >
              <template #selection="{ item }">
                <span v-if="item && item.raw">{{ item.raw.name }}</span>
              </template>
            </v-select>
          </v-col>

          <!-- ASIENTO -->
          <v-col cols="12" sm="6" md="8">
            <v-select
              :key="selectedPalcoId"
              v-model="form.seat"
              :items="seatOptions"
              item-title="title"
              item-value="value"
              label="Asiento asignado"
              placeholder="Seleccioná un asiento"
              clearable
              class="field-contrast"
              prepend-inner-icon="mdi-seat-recline-normal"
              hide-details="auto"
              :loading="loadingPalcos || loadingPeople"
              :disabled="!selectedPalcoId || loadingPalcos || loadingPeople"
              :menu-props="menuProps"
            >
              <!-- ítems del menú -->
              <template #item="{ props, item }">
                <v-list-item v-bind="props" density="comfortable">
                  <template #title>
                    <div class="d-flex align-center">
                      <span class="font-weight-700">{{ item.raw.code }}</span>
                      <v-chip
                        class="ml-2"
                        size="x-small"
                        :color="statusColor(item.raw.status)"
                        :variant="statusVariant(item.raw.status)"
                        label
                      >
                        {{ statusLabel(item.raw.status) }}
                      </v-chip>
                    </div>
                  </template>
                </v-list-item>
              </template>

              <!-- valor elegido -->
              <template #selection="{ item }">
                <span v-if="item && item.raw">{{ item.raw.code }}</span>
              </template>
            </v-select>
          </v-col>

          <!-- ESTADO SOLO EN EDICIÓN -->
          <v-col v-if="isEdit" cols="12" md="4" class="d-flex align-end">
            <div class="w-100">
              <div class="text-dim mb-1">Estado actual</div>
              <div class="d-flex align-center gap-8 flex-wrap">
                <v-chip
                  :color="personPresent ? 'success' : 'grey-darken-1'"
                  size="small"
                  label
                  class="chip-strong"
                >
                  {{ personPresent ? 'Presente' : '—' }}
                </v-chip>

                <v-chip
                  v-if="personSeat"
                  :color="statusColor(seatStatus(personSeat))"
                  :variant="statusVariant(seatStatus(personSeat))"
                  size="small"
                  label
                  class="chip-strong"
                >
                  {{ personSeat }}
                </v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- ===== FOOTER / ACCIONES ===== -->
      <v-divider class="mt-6 mb-0" />
      <div class="actions-wrap">
        <div class="left">
          <v-btn variant="text" class="btn-text ml-0 mt-2 mt-md-0" @click="$emit('cancel')" :disabled="loading">
            Cancelar
          </v-btn>
        </div>
        <div class="right">
          <v-btn
            type="submit"
            color="primary"
            class="btn-strong"
            :loading="loading"
            :disabled="loading"
            prepend-icon="mdi-content-save"
          >
            {{ isEdit ? 'Guardar persona' : 'Crear persona' }}
          </v-btn>
        </div>
      </div>
    </v-form>

    <!-- ===== TOAST / SNACKBAR ===== -->
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
import { computed, reactive, ref, watch, nextTick, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'
import api from '../services/api'

/* ===================== PROPS / EMITS ===================== */
/* ACEPTA person + mode="edit" (o infiere por person.id) */
const props = defineProps({
  person: { type: Object, default: null },
  mode: { type: String, default: 'create' } // 'create' | 'edit'
})
const emit = defineEmits(['saved','cancel'])

/* ===================== UI STATE ===================== */
const { smAndDown } = useDisplay()
const formRef = ref(null)
const loading = ref(false)
const loadingPalcos = ref(false)
const loadingPeople = ref(false)
const triedSubmit = ref(false)

/* snackbar / toast */
const snackbar = reactive({ show:false, text:'', ok:true })
function showToast (text, ok = true) {
  snackbar.text = text
  snackbar.ok = ok
  snackbar.show = true
}

/* ===================== PINIA STORE ===================== */
const store = useSeatsStore()

async function ensurePeopleLoaded () {
  loadingPeople.value = true
  try {
    if (typeof store.ensureLoaded === 'function') {
      await store.ensureLoaded()
    } else if (typeof store.refresh === 'function') {
      await store.refresh()
    }
  } finally {
    loadingPeople.value = false
  }
}

/* ===================== PALCOS ===================== */
const palcos = ref([])
const selectedPalcoId = ref(null)
const palcoItems = computed(() => palcos.value)

async function fetchPalcos() {
  loadingPalcos.value = true
  try {
    const res = await api.get('/palcos')
    palcos.value = Array.isArray(res.data) ? res.data : []
    if (!selectedPalcoId.value && palcos.value.length > 0) {
      selectedPalcoId.value = palcos.value[0].id
    }
  } catch (err) {
    console.error('fetchPalcos error', err)
    showToast('No se pudieron cargar los palcos', false)
  } finally {
    loadingPalcos.value = false
  }
}

/* ===================== FORM MODEL ===================== */
const empty = { name:'', cargo:'', org:'', seat:null }
const form = reactive({ ...empty })

const isEdit = computed(() => props.mode === 'edit' || !!props.person?.id)
const personSeat = computed(() => props.person?.seat ?? null)
const personPresent = computed(() => !!props.person?.present)

/* ===================== VALIDACIÓN ===================== */
const nameRules = [
  v => !!(v && String(v).trim()) || 'Requerido',
  v => String(v || '').trim().length >= 3 || 'Mínimo 3 caracteres'
]
const nameError = computed(() => {
  if (!triedSubmit.value) return false
  return !form.name || String(form.name).trim().length < 3
})

/* ===================== MAPEO DE FILAS POR PALCO ===================== */
function rowsForPalco(id) {
  if (id === 1) return ['A','B','C','D','E','F','G']
  if (id === 2) return ['H','I','J','K','L']
  if (id === 3) return ['M','N','O','P','Q']
  return ['A','B','C','D']
}
const COLS = 12

/* ===================== STATUS DE ASIENTO ===================== */
function seatStatusFromStore(code) {
  if (!code) return 'free'
  const p = (store.people || []).find(p => p.seat === code)
  if (!p) return 'free'
  return p.present ? 'present' : 'assigned'
}
function statusLabel (st) {
  if (st === 'present')  return 'Presente'
  if (st === 'assigned') return 'Asignado'
  return 'Libre'
}
function statusColor (st) {
  if (st === 'present')  return 'success'
  if (st === 'assigned') return 'warning'
  return undefined
}
function statusVariant (st) {
  return st === 'free' ? 'outlined' : 'flat'
}

/* ===================== OPCIONES DE ASIENTOS ===================== */
const seatOptions = computed(() => {
  const palcoId = selectedPalcoId.value
  if (!palcoId) return []
  const rows = rowsForPalco(palcoId)
  const codes = []
  for (const r of rows) for (let i = 1; i <= COLS; i++) codes.push(`${r}${i}`)
  return codes.map(code => {
    const st = seatStatusFromStore(code)
    return { code, status: st, title: code, value: code }
  })
})

/* menú props (responsive) */
const menuProps = computed(() => ({
  maxHeight: smAndDown.value ? 260 : 360,
  offset: smAndDown.value ? 6 : 8
}))

/* al cambiar de PALCO, limpio asiento elegido */
watch(selectedPalcoId, () => { form.seat = null })

/* ===================== SYNC PROPS -> FORM ===================== */
watch(
  () => props.person,
  (p) => {
    Object.assign(form, p ? { ...empty, ...p, seat: p.seat ?? null } : { ...empty })
    triedSubmit.value = false
    if (p && p.seat) {
      const firstLetter = String(p.seat).charAt(0).toUpperCase()
      if ('ABCDEFG'.includes(firstLetter)) selectedPalcoId.value = 1
      else if ('HIJKL'.includes(firstLetter)) selectedPalcoId.value = 2
      else if ('MNOPQ'.includes(firstLetter)) selectedPalcoId.value = 3
    }
  },
  { immediate: true }
)

/* ===================== HELPERS SUBMIT ===================== */
function normalizePayload(payload) {
  const out = { ...payload }
  if (out.seat === '') out.seat = null
  return out
}
async function refreshStore() {
  if (typeof store.refresh === 'function') await store.refresh()
  else if (typeof store.ensureLoaded === 'function') await store.ensureLoaded()
}
function safeResetForm() {
  if (formRef.value?.reset) formRef.value.reset()
  if (formRef.value?.resetValidation) formRef.value.resetValidation()
  Object.assign(form, { ...empty })
}

/* ===================== ACCIONES ===================== */
async function onSubmit() {
  triedSubmit.value = true
  loading.value = true
  try {
    const result = await formRef.value?.validate?.()
    const valid = typeof result === 'object' ? result.valid : !!result
    if (!valid) { loading.value = false; return }

    const payload = normalizePayload(form)

    if (isEdit.value) {
      await store.updatePerson(props.person.id, payload)
      showToast('Cambios guardados.', true)
      emit('saved', { id: props.person.id })
    } else {
      const created = await store.createPerson(payload)
      const newId = created?.id ?? created ?? null
      showToast(newId ? `Persona creada (#${newId}).` : 'Persona creada correctamente.', true)
      safeResetForm()
      await nextTick()
      triedSubmit.value = false
      emit('saved', { id: newId })
    }

    await refreshStore()
  } catch (e) {
    console.error('onSubmit error', e)
    showToast(e?.message || 'Error al guardar.', false)
  } finally {
    loading.value = false
  }
}

/* ===================== LIFECYCLE ===================== */
onMounted(async () => {
  await ensurePeopleLoaded()
  await fetchPalcos()
})
</script>

<style scoped>
.card-contrast{ background:#0e1230 !important; border:1px solid rgba(255,217,81,.14); box-shadow:0 6px 18px rgba(0,0,0,.25); color:#eaf0ff; }
.title-contrast{ background:linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0)); border-bottom:1px solid rgba(255,217,81,.10); font-weight:800; line-height:1.2; }
.text-dim{ color:rgba(234,240,255,.78); }

/* Inputs */
.field-contrast :deep(.v-field){ background:rgba(255,255,255,0.06) !important; border-radius:12px !important; }
.field-contrast :deep(.v-icon){ color:#ffd951 !important; }

/* Chips/tags */
.chip-strong{ font-weight:800; border-radius:10px; }

/* Footer */
.actions-wrap{
  display:flex; flex-wrap:wrap; align-items:flex-start; justify-content:space-between; gap:12px;
  padding:12px 16px;
  background:linear-gradient(180deg, rgba(11,13,40,0), rgba(11,13,40,.85) 30%, rgba(11,13,40,1));
  border-top:1px solid rgba(255,217,81,.10);
}
.btn-strong{ font-weight:800; }
.btn-text{ color:#eaf0ff !important; font-weight:500; letter-spacing:.03em; }

/* Snackbar fuerte */
.snackbar-strong{
  font-weight:600; letter-spacing:.02em; text-transform:none; max-width:360px;
  border-radius:12px !important; box-shadow:0 20px 40px rgba(0,0,0,.6);
}

/* gaps */
.g-12{ row-gap:12px; }

/* responsive footer */
@media (max-width: 960px){ .actions-wrap{ position: static; } }
</style>
