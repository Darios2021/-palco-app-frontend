<!-- src/components/PersonEditForm.vue -->
<template>
  <v-card class="card-contrast" rounded="xl">
    <v-card-title class="title-contrast d-flex align-center flex-wrap">
      <v-icon class="mr-2">mdi-account-edit</v-icon>
      <span class="font-weight-800">Editar persona</span>
      <v-spacer />
      <!-- CHIP ESTADO/ASIENTO (siempre, pero reflejando el form) -->
      <v-chip
        v-if="seatChipCode"
        size="small"
        :color="statusColor(seatStatusFromStore(seatChipCode))"
        :variant="statusVariant(seatStatusFromStore(seatChipCode))"
        label
      >
        {{ seatChipCode }}
      </v-chip>
    </v-card-title>

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
              label="Cargo (opcional)"
              placeholder="Jerarquía / Cargo"
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

          <!-- CONTROLES DE ASIENTO -->
          <v-col cols="12" sm="6" md="8" class="d-flex align-end">
            <div class="w-100">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-dim">Asiento</div>

                <div class="d-flex align-center gap-2">
                  <v-btn
                    v-if="!editingSeat && (initialSeat || form.seat)"
                    size="small"
                    variant="text"
                    class="btn-text px-2"
                    @click="startEditingSeat"
                  >
                    Cambiar asiento
                  </v-btn>

                  <v-btn
                    v-if="(initialSeat || form.seat) && !editingSeat"
                    size="small"
                    variant="text"
                    class="btn-text px-2"
                    @click="clearSeat"
                  >
                    Liberar asiento
                  </v-btn>
                </div>
              </div>

              <!-- SELECT SOLO SI: no hay asiento o el usuario eligió cambiar -->
              <v-select
                v-if="editingSeat || !initialSeat"
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
                <template #selection="{ item }">
                  <span v-if="item && item.raw">{{ item.raw.code }}</span>
                </template>
              </v-select>
            </div>
          </v-col>

          <!-- ESTADO -->
          <v-col cols="12" md="4" class="d-flex align-end">
            <div class="w-100">
              <div class="text-dim mb-1">Estado actual</div>
              <div class="d-flex align-center gap-8 flex-wrap">
                <v-chip :color="personPresent ? 'success' : 'grey-darken-1'" size="small" label class="chip-strong">
                  {{ personPresent ? 'Presente' : '—' }}
                </v-chip>
                <v-chip v-if="seatChipCode"
                        :color="statusColor(seatStatusFromStore(seatChipCode))"
                        :variant="statusVariant(seatStatusFromStore(seatChipCode))"
                        size="small" label class="chip-strong">
                  {{ seatChipCode }}
                </v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider class="mt-6 mb-0" />
      <div class="actions-wrap">
        <div class="left">
          <v-btn variant="text" class="btn-text ml-0 mt-2 mt-md-0" @click="$emit('cancel')" :disabled="loading">
            Cancelar
          </v-btn>
        </div>
        <div class="right">
          <v-btn type="submit" color="primary" class="btn-strong" :loading="loading" :disabled="loading"
                 prepend-icon="mdi-content-save">
            Guardar persona
          </v-btn>
        </div>
      </div>
    </v-form>

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
        <v-icon class="mr-2" size="20">{{ snackbar.ok ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
        <span class="font-weight-600">{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { usePeopleStore } from '@/stores/peopleStore'   // ✅ CRUD correcto
import api from '@/services/api'

const props = defineProps({ person: { type: Object, required: true } })
const emit  = defineEmits(['saved','cancel','update:person'])

const { smAndDown } = useDisplay()
const people = usePeopleStore()                         // ✅ fuente de verdad

/* ===== refs ===== */
const formRef = ref(null)
const loading = ref(false)
const loadingPalcos = ref(false)
const loadingPeople = ref(false)
const triedSubmit = ref(false)
const editingSeat = ref(false)   // controla si muestro el select de asiento

const snackbar = reactive({ show:false, text:'', ok:true })
const showToast = (t, ok=true)=>{ snackbar.text=t; snackbar.ok=ok; snackbar.show=true }

/* ===== palcos ===== */
const palcos = ref([])
const selectedPalcoId = ref(null)
const palcoItems = computed(()=>palcos.value)

async function fetchPalcos(){
  loadingPalcos.value = true
  try{
    const res = await api.get('/palcos')
    palcos.value = Array.isArray(res.data) ? res.data : []
    if (!selectedPalcoId.value && palcos.value.length) selectedPalcoId.value = palcos.value[0].id
  } finally { loadingPalcos.value = false }
}
async function ensurePeopleLoaded(){
  loadingPeople.value = true
  try{
    if (typeof people.fetchAll === 'function') await people.fetchAll()
  } finally { loadingPeople.value = false }
}

/* ===== form ===== */
const empty = { name:'', cargo:'', org:'', seat:null }
const form = reactive({ ...empty })

const personPresent = computed(()=> !!props.person?.present)
const initialSeat   = computed(()=> props.person?.seat ?? null)

/* chip usa el valor que el usuario ve: si edita, el del form; sino, el original */
const seatChipCode  = computed(()=> form.seat || initialSeat.value || null)

const nameRules = [
  v => !!(v && String(v).trim()) || 'Requerido',
  v => String(v || '').trim().length >= 3 || 'Mínimo 3 caracteres'
]
const nameError = computed(()=> triedSubmit.value && (!form.name || String(form.name).trim().length < 3))

/* filas/cols por palco */
function rowsForPalco(id){
  if (id===1) return ['A','B','C','D','E','F']
  if (id===2) return ['G','H','I']
  if (id===3) return ['J','K','L']
  return []
}
function colsForRow(letter){
  if ('ABCDEF'.includes(letter)) return 10
  if ('GHIJKL'.includes(letter)) return 4
  return 0
}

/* status asiento: mirar people.list */
function seatStatusFromStore(code){
  if (!code) return 'free'
  const p = (people.list || []).find(p => p.seat === code)
  if (!p) return 'free'
  return p.present ? 'present' : 'assigned'
}
const statusLabel   = st => st==='present' ? 'Presente' : st==='assigned' ? 'Asignado' : 'Libre'
const statusColor   = st => st==='present' ? 'success' : st==='assigned' ? 'warning' : undefined
const statusVariant = st => st==='free' ? 'outlined' : 'flat'

/* opciones de asientos */
const seatOptions = computed(()=>{
  const pid = selectedPalcoId.value
  if (!pid) return []
  const rows = rowsForPalco(pid)
  const codes=[]
  for (const r of rows){
    const n = colsForRow(r)
    for (let i=1;i<=n;i++) codes.push(`${r}${i}`)
  }
  return codes.map(code=>({ code, status: seatStatusFromStore(code), title: code, value: code }))
})
const menuProps = computed(()=>({ maxHeight: smAndDown.value ? 260 : 360, offset: smAndDown.value ? 6 : 8 }))
watch(selectedPalcoId, ()=>{ if (editingSeat.value) form.seat = null })

/* sync externo -> form */
watch(()=>props.person, (v)=>{
  Object.assign(form, v ? { ...empty, ...v, seat: v.seat ?? null } : { ...empty })
  triedSubmit.value = false

  // Inferir palco por letra de fila
  const seat = v?.seat ? String(v.seat) : ''
  const L = seat.charAt(0).toUpperCase()
  if ('ABCDEF'.includes(L)) selectedPalcoId.value = 1
  else if ('GHI'.includes(L)) selectedPalcoId.value = 2
  else if ('JKL'.includes(L)) selectedPalcoId.value = 3

  // Si tiene asiento, no estamos editando el campo hasta que toque "Cambiar"
  editingSeat.value = !v?.seat
}, { immediate:true })

/* acciones asiento */
function startEditingSeat(){ editingSeat.value = true }
function clearSeat(){ form.seat = null; editingSeat.value = true }

/* helpers */
function normalizePayload(p){ const out={...p}; if (out.seat==='') out.seat=null; return out }
async function refreshPeople(){ if (typeof people.fetchAll === 'function') await people.fetchAll() }

/* submit */
async function onSubmit(){
  triedSubmit.value = true
  loading.value = true
  try{
    const vr = await formRef.value?.validate?.()
    const valid = typeof vr==='object'? vr.valid : !!vr
    if (!valid){ loading.value=false; return }

    await people.updatePerson(props.person.id, normalizePayload(form)) // ✅ FIX: usar peopleStore
    showToast('Cambios guardados.', true)
    await refreshPeople()
    emit('update:person', { ...props.person, ...form })
    emit('saved', { id: props.person.id })
  }catch(e){
    console.error(e); showToast(e?.message || 'Error al guardar.', false)
  }finally{ loading.value = false }
}

onMounted(async()=>{ await ensurePeopleLoaded(); await fetchPalcos() })
</script>

<style scoped>
.card-contrast{ background:#0e1230 !important; border:1px solid rgba(255,217,81,.14); box-shadow:0 6px 18px rgba(0,0,0,.25); color:#eaf0ff; }
.title-contrast{ background:linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0)); border-bottom:1px solid rgba(255,217,81,.10); font-weight:800; line-height:1.2; }

.field-contrast :deep(.v-field){ background:rgba(255,255,255,.06) !important; border-radius:12px !important; }
.field-contrast :deep(.v-icon){ color:#ffd951 !important; }

.actions-wrap{ display:flex; flex-wrap:wrap; align-items:flex-start; justify-content:space-between; gap:12px; padding:12px 16px;
  background:linear-gradient(180deg, rgba(11,13,40,0), rgba(11,13,40,.85) 30%, rgba(11,13,40,1)); border-top:1px solid rgba(255,217,81,.10); }
.btn-strong{ font-weight:800; }
.btn-text{ color:#eaf0ff !important; font-weight:600; letter-spacing:.03em; }

.snackbar-strong{ font-weight:600; letter-spacing:.02em; text-transform:none; max-width:360px; border-radius:12px !important; box-shadow:0 20px 40px rgba(0,0,0,.6); }
.g-12{ row-gap:12px; }
.text-dim{ color:rgba(234,240,255,.78); }
.chip-strong{ font-weight:800; border-radius:10px; }
</style>
