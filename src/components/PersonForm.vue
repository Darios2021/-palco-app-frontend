<template>
  <v-card class="card-contrast" rounded="xl">
    <!-- HEADER -->
    <v-card-title class="title-contrast d-flex align-center flex-wrap">
      <v-icon class="mr-2">mdi-account-plus</v-icon>
      <span class="font-weight-800">{{ isEdit ? 'Editar persona' : 'Nueva persona' }}</span>
      <v-spacer />
      <v-chip
        v-if="isEdit && personSeat"
        size="small"
        color="success"
        label
      >
        {{ personSeat }}
      </v-chip>
    </v-card-title>

    <!-- FORM -->
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

          <!-- DNI -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model.trim="form.doc"
              label="Documento"
              placeholder="DNI"
              clearable
              :rules="docRules"
              inputmode="numeric"
              class="field-contrast"
              prepend-inner-icon="mdi-card-account-details"
              hide-details="auto"
            />
          </v-col>

          <!-- ORG -->
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

          <!-- ASIENTO -->
          <v-col cols="12" md="8">
            <v-select
              v-model="form.seat"
              :items="seatOptions"
              label="Asiento asignado"
              placeholder="Seleccioná un asiento (opcional)"
              clearable
              class="field-contrast"
              prepend-inner-icon="mdi-seat"
              hide-details="auto"
              :menu-props="menuProps"
            >
              <!-- Cómo se ven las opciones en el dropdown -->
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

              <!-- Cómo se ve el valor seleccionado en el input -->
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

      <!-- FOOTER / FEEDBACK -->
      <v-divider class="mt-6 mb-0" />

      <div class="actions-wrap">
        <!-- Mensaje de guardado / error -->
        <div class="left">
          <transition name="fade">
            <div v-if="feedback.text" class="feedback-msg" :class="feedback.ok ? 'ok' : 'err'">
              <v-icon size="18" class="mr-1">
                {{ feedback.ok ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              <span>{{ feedback.text }}</span>
            </div>
          </transition>

          <v-btn
            variant="text"
            class="btn-text ml-0 mt-2 mt-md-0"
            @click="onReset"
          >
            Limpiar
          </v-btn>
        </div>

        <div class="right">
          <v-btn
            type="submit"
            color="primary"
            class="btn-strong"
            :loading="loading"
            prepend-icon="mdi-content-save"
          >
            {{ isEdit ? 'Guardar persona' : 'Crear persona' }}
          </v-btn>
        </div>
      </div>
    </v-form>
  </v-card>
</template>

<script setup>
import { computed, reactive, ref, watch, nextTick } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'

/* --- props/emits --- */
const props = defineProps({
  modelValue: { type: Object, default: null }
})
const emit = defineEmits(['saved','update:modelValue'])

/* --- ui state --- */
const { smAndDown } = useDisplay()
const formRef = ref(null)
const loading = ref(false)
const triedSubmit = ref(false)          // para marcar error en "Nombre completo"
const feedback = ref({ text: '', ok: true })

/* --- store --- */
const store = useSeatsStore()
if (!store.seats?.length) store.initSeats?.(['A','B','C','D'], 10)

/* --- form data --- */
const empty = { name: '', doc: '', org: '', seat: null }
const form = reactive({ ...empty })

const isEdit = computed(() => !!props.modelValue?.id)
const personSeat = computed(() => props.modelValue?.seat ?? null)
const personPresent = computed(() => !!props.modelValue?.present)

/* --- seat helpers --- */
const seatStatus = (code) => {
  if (!code) return 'free'
  if (typeof store.seatStatus === 'function') return store.seatStatus(code)
  const who = (store.people ?? []).find(p => (p.seat ?? p.seatCode) === code)
  if (!who) return 'free'
  return who.present ? 'present' : 'assigned'
}

// opciones para el combo
const seatOptions = computed(() => {
  const allCodes = store.seats?.flat?.() ?? []
  return allCodes.map(code => ({
    code,
    status: seatStatus(code),
    title: code,    // v-select usa title/value internamente
    value: code
  }))
})

function statusLabel (st) {
  if (st === 'present') return 'Presente'
  if (st === 'assigned') return 'Asignado'
  return 'Libre'
}
function statusColor (st) {
  if (st === 'present') return 'success'
  if (st === 'assigned') return 'warning'
  return undefined
}
function statusVariant (st) {
  return st === 'free' ? 'outlined' : 'flat'
}

const menuProps = computed(() => ({
  maxHeight: smAndDown.value ? 260 : 360,
  offset: smAndDown.value ? 6 : 8
}))

/* --- validation rules --- */
const nameRules = [
  v => !!(v && String(v).trim()) || 'Requerido',
  v => String(v || '').trim().length >= 3 || 'Mínimo 3 caracteres'
]
const docRules = [
  v => !v || /^[0-9.\- ]{6,}$/.test(v) || 'Formato inválido'
]

/* error de nombre sólo si intentó guardar */
const nameError = computed(() => {
  if (!triedSubmit.value) return false
  return !form.name || String(form.name).trim().length < 3
})

/* --- sync external model to form --- */
watch(() => props.modelValue, (v) => {
  Object.assign(form, v ? { ...empty, ...v, seat: v.seat ?? null } : { ...empty })
  feedback.value = { text: '', ok: true }
  triedSubmit.value = false
}, { immediate: true })

/* al tipear algo nuevo reseteo feedback */
watch(form, () => {
  if (feedback.value.text) {
    feedback.value = { text: '', ok: true }
  }
}, { deep: true })

/* --- helpers --- */
function normalizePayload (payload) {
  const out = { ...payload }
  if (out.seat === '') out.seat = null
  return out
}

async function refreshStore () {
  await (store.reload?.() || store.ensureLoaded?.() || Promise.resolve())
}

/* --- submit --- */
async function onSubmit () {
  triedSubmit.value = true
  feedback.value = { text: '', ok: true }

  // validar con Vuetify (devuelve { valid })
  const result = await formRef.value?.validate?.()
  const valid = typeof result === 'object' ? result.valid : !!result
  if (!valid) return

  loading.value = true
  try {
    if (isEdit.value) {
      await store.updatePerson(props.modelValue.id, normalizePayload(form))

      feedback.value = { text: 'Cambios guardados.', ok: true }

      emit('saved', { id: props.modelValue.id })
      emit('update:modelValue', { ...props.modelValue, ...normalizePayload(form) })
    } else {
      const created = await store.createPerson(normalizePayload(form))
      const id = created?.id ?? created

      feedback.value = {
        text: id ? `Persona creada (#${id}).` : 'Persona creada correctamente.',
        ok: true
      }

      // limpio campos y validación visual
      formRef.value?.reset?.()
      await nextTick()
      Object.assign(form, { ...empty })
      triedSubmit.value = false

      emit('saved', { id })
    }

    await refreshStore()
  } catch (e) {
    feedback.value = {
      text: e?.message || 'Error al guardar.',
      ok: false
    }
  } finally {
    loading.value = false
  }
}

/* --- reset manual --- */
function onReset () {
  formRef.value?.reset?.()
  Object.assign(form, { ...empty })
  triedSubmit.value = false
  feedback.value = { text: '', ok: true }
}
</script>

<style scoped>
/* Card look & feel */
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
  line-height: 1.2;
}
.text-dim {
  color: rgba(234,240,255, .78);
}

/* Inputs */
.field-contrast :deep(.v-field) {
  background: rgba(255,255,255,0.06) !important;
  border-radius: 12px !important;
}
.field-contrast :deep(.v-icon) {
  color: #ffd951 !important;
}

/* Chips/tags */
.chip-strong {
  font-weight: 800;
  border-radius: 10px;
}

/* Footer */
.actions-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(
    180deg,
    rgba(11,13,40,0),
    rgba(11,13,40,.85) 30%,
    rgba(11,13,40,1)
  );
  border-top: 1px solid rgba(255,217,81,.10);
}
.btn-strong {
  font-weight: 800;
}
.btn-text {
  color: #eaf0ff !important;
  font-weight: 500;
  letter-spacing: .03em;
}

/* Mensaje de feedback inline */
.feedback-msg {
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  font-size: .9rem;
  line-height: 1.2;
  font-weight: 500;
  padding: 6px 10px;
  margin-bottom: 6px;
}
.feedback-msg.ok {
  background: rgba(46,125,50,.18);
  border: 1px solid rgba(46,125,50,.4);
  color: #6eff6e;
}
.feedback-msg.err {
  background: rgba(200,50,50,.18);
  border: 1px solid rgba(200,50,50,.4);
  color: #ff8f8f;
}

/* layout gaps */
.g-12 {
  row-gap: 12px;
}

/* fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: all .18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* responsive footer behaviour */
@media (max-width: 960px){
  .actions-wrap{
    position: static;
  }
}
</style>
