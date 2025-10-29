<template>
  <v-card rounded="xl" :title="title">
    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-row class="align-end">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.name"
              label="Nombre completo"
              required
              :hint="smAndDown ? 'Nombre y apellido' : ''"
              :persistent-hint="!!smAndDown"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="form.doc" label="Documento" />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="form.org" label="Organismo" />
          </v-col>

          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="form.seat"
              :items="flatSeats"
              label="Asiento asignado"
              clearable
              :chips="!!form.seat"
              :item-props="seatProps"
              hide-details="auto"
              :menu-props="menuProps"
              :closable-chips="true"
            >
              <!-- item con estado -->
              <template #item="{ props, item }">
                <v-list-item v-bind="props" density="comfortable">
                  <template #title>
                    <div class="d-flex align-center">
                      <span class="font-weight-600">{{ item?.raw }}</span>
                      <v-chip
                        class="ml-2"
                        size="x-small"
                        :color="seatColor(item?.raw)"
                        :variant="seatVariant(item?.raw)"
                        label
                      >
                        {{ seatLabel(item?.raw) }}
                      </v-chip>
                    </div>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="12" md="4" class="d-flex align-end">
            <v-btn
              type="submit"
              color="primary"
              :loading="loading"
              prepend-icon="mdi-content-save"
              :block="smAndDown"
              rounded="lg"
            >
              {{ submitLabel }}
            </v-btn>
            <v-btn
              v-if="canReset"
              class="ml-md-2 mt-2 mt-md-0"
              variant="text"
              @click="reset"
              :block="smAndDown"
            >
              Limpiar
            </v-btn>
          </v-col>
        </v-row>
      </v-form>

      <v-alert
        v-if="msg"
        :type="msgType"
        density="comfortable"
        class="mt-3"
        border="start"
        rounded="lg"
        variant="tonal"
      >
        {{ msg }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'

const { smAndDown } = useDisplay()

const props = defineProps({ modelValue: { type: Object, default: null } })
const emit = defineEmits(['saved','update:modelValue'])

const store = useSeatsStore()
if (!store.seats.length) store.initSeats(['A','B','C','D'], 10)

const empty = { name: '', doc: '', org: '', seat: '' }
const form = reactive({ ...empty })
const loading = ref(false)
const msg = ref('')
const msgType = ref('info')

watch(() => props.modelValue, (val) => {
  Object.assign(form, val ? { ...val } : { ...empty })
  msg.value = ''
})

const flatSeats = computed(() => store.seats.flat())

function seatProps (code) {
  const status = store.seatStatus(code)
  return {
    title: code,
    subtitle: status === 'free' ? 'Libre' : status === 'assigned' ? 'Asignado' : 'Presente',
    disabled: status !== 'free' && (!props.modelValue || props.modelValue?.seat !== code)
  }
}

const seatLabel = (code) => {
  const st = store.seatStatus(code)
  return st === 'present' ? 'Presente' : st === 'assigned' ? 'Asignado' : 'Libre'
}
const seatColor = (code) => {
  const st = store.seatStatus(code)
  return st === 'present' ? 'success' : st === 'assigned' ? 'warning' : undefined
}
const seatVariant = (code) => {
  const st = store.seatStatus(code)
  return st === 'free' ? 'outlined' : 'flat'
}

const menuProps = computed(() => ({
  maxHeight: smAndDown.value ? 260 : 360,
  offset: smAndDown.value ? 6 : 8
}))

const title = computed(() => props.modelValue ? 'Editar persona' : 'Nueva persona')
const submitLabel = computed(() => props.modelValue ? 'Guardar cambios' : 'Crear persona')
const canReset = computed(() => !props.modelValue)

async function submit () {
  loading.value = true; msg.value = ''
  try {
    if (props.modelValue) {
      await store.updatePerson(props.modelValue.id, form)
      msgType.value = 'success'; msg.value = 'Cambios guardados.'
      emit('saved', { id: props.modelValue.id })
    } else {
      const id = await store.createPerson(form)
      Object.assign(form, { ...empty })
      msgType.value = 'success'; msg.value = `Persona creada (#${id}).`
      emit('saved', { id })
    }
  } catch (e) {
    msgType.value = 'error'; msg.value = e?.message || 'Error al guardar.'
  } finally {
    loading.value = false
  }
}

function reset () {
  Object.assign(form, { ...empty })
  msg.value = ''
}
</script>

<style scoped>
/* micro-ajustes mobile */
@media (max-width: 600px) {
  :deep(.v-input) { margin-bottom: 2px; }
}
</style>
