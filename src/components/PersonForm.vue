<template>
  <v-card rounded="xl" :title="title">
    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.name" label="Nombre completo" required />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="form.doc" label="Documento" />
          </v-col>
          <v-col cols="12" md="3">
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
            />
          </v-col>

          <v-col cols="12" md="4" class="d-flex align-end">
            <v-btn type="submit" color="primary" :loading="loading" prepend-icon="mdi-content-save">
              {{ submitLabel }}
            </v-btn>
            <v-btn v-if="canReset" class="ml-2" variant="text" @click="reset">Limpiar</v-btn>
          </v-col>
        </v-row>
      </v-form>

      <v-alert v-if="msg" :type="msgType" density="comfortable" class="mt-3">{{ msg }}</v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useSeatsStore } from '../stores'

const props = defineProps({ modelValue: { type: Object, default: null } })
const emit = defineEmits(['saved','update:modelValue'])

const store = useSeatsStore()
if (!store.seats.length) store.initSeats(['A','B','C','D'], 10)

const empty = { name: '', doc: '', org: '', seat: '' }
const form = reactive({ ...empty })
const loading = ref(false)
const msg = ref('')
const msgType = ref('info')

watch(() => props.modelValue, (val) => { Object.assign(form, val ? { ...val } : { ...empty }); msg.value = '' })

const flatSeats = computed(() => store.seats.flat())

function seatProps(code) {
  const status = store.seatStatus(code)
  return {
    title: code,
    subtitle: status === 'free' ? 'Libre' : status === 'assigned' ? 'Asignado' : 'Presente',
    disabled: status !== 'free' && (!props.modelValue || props.modelValue?.seat !== code)
  }
}

const title = computed(() => props.modelValue ? 'Editar persona' : 'Nueva persona')
const submitLabel = computed(() => props.modelValue ? 'Guardar cambios' : 'Crear persona')
const canReset = computed(() => !props.modelValue)

async function submit() {
  loading.value = true; msg.value = ''
  try {
    if (props.modelValue) {
      await store.updatePerson(props.modelValue.id, form)
      msgType.value = 'success'; msg.value = 'Cambios guardados.'; emit('saved', { id: props.modelValue.id })
    } else {
      const id = await store.createPerson(form)
      Object.assign(form, { ...empty })
      msgType.value = 'success'; msg.value = `Persona creada (#${id}).`; emit('saved', { id })
    }
  } catch (e) {
    msgType.value = 'error'; msg.value = e.message || 'Error al guardar.'
  } finally { loading.value = false }
}

function reset() { Object.assign(form, { ...empty }); msg.value = '' }
</script>
