<template>
  <v-card rounded="2xl" elevation="2" class="ck-card">
    <div class="ck-header">
      <div class="ck-header-left">
        <v-icon size="22" class="mr-2">mdi-account-search</v-icon>
        <span class="ck-title">Control de ingreso al palco</span>
      </div>
      <div class="ck-header-right" v-if="selectedSeat">
        <v-chip :color="selectedPresent ? 'success' : 'warning'" label size="small" class="font-semibold">
          Asiento {{ selectedSeat }}
        </v-chip>
      </div>
    </div>

    <v-divider class="opacity-10"></v-divider>

    <v-card-text class="pt-6">
      <v-form @submit.prevent="onSubmit">
        <v-row>
          <v-col cols="12" md="8">
            <v-autocomplete
              v-model="selected"
              v-model:search="search"
              :items="items"
              :loading="loading"
              class="ck-autocomplete"
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
              :menu-props="{ maxHeight: 360, offset: 8 }"
              :custom-filter="filterFn"
              no-data-text="Sin coincidencias. Cargá la persona en la sección Personas."
              @update:model-value="onSelected"
              @keydown.enter.prevent="onSubmit"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" density="comfortable">
                  <template #prepend>
                    <v-avatar size="32" class="elevated">
                      <span class="avatar-text">{{ initials(item.raw.title) }}</span>
                    </v-avatar>
                  </template>
                  <template #title>
                    <div class="row-title">
                      <span class="name">{{ item.raw.title }}</span>
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
                    <span class="muted">{{ item.raw.subtitle }}</span>
                  </template>
                  <template #append>
                    <div class="state-dot" :class="item.raw.present ? 'is-present' : (item.raw.seat ? 'is-assigned' : 'is-free')"></div>
                  </template>
                </v-list-item>
              </template>

              <template #selection="{ item }">
                <div class="sel-wrap">
                  <v-avatar size="22" class="mr-2">
                    <span class="avatar-text tiny">{{ initials(item.raw.title) }}</span>
                  </v-avatar>
                  <span>{{ item.raw.title }}</span>
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

            <div class="mt-2" v-if="selected">
              <v-chip
                size="small"
                :color="selectedPresent ? 'success' : (selectedSeat ? 'warning' : '')"
                :variant="!selectedSeat ? 'outlined' : 'flat'"
                label
                class="font-medium"
              >
                {{ selectedPresent ? 'Presente' : selectedSeat ? 'Asignado' : 'Sin asiento (Libre)' }}
              </v-chip>
              <span class="ml-2 muted" v-if="selected.subtitle">{{ selected.subtitle }}</span>
            </div>
          </v-col>

          <v-col cols="12" md="4" class="d-flex align-end">
            <v-btn
              class="ck-primary"
              type="submit"
              size="large"
              rounded="lg"
              prepend-icon="mdi-check"
              :loading="submitting"
              :disabled="!selected"
            >
              Registrar
            </v-btn>
          </v-col>
        </v-row>
      </v-form>

      <transition name="fade-slide">
        <v-alert
          v-if="message"
          :type="messageType"
          class="mt-4"
          variant="tonal"
          density="comfortable"
          border="start"
          rounded="lg"
        >
          {{ message }}
        </v-alert>
      </transition>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSeatsStore } from '../stores'

const store = useSeatsStore()
const loading = ref(false)
const submitting = ref(false)
const search = ref('')
const selected = ref(null)
const selectedSeat = ref(null)
const selectedPresent = ref(false)
const message = ref('')
const messageType = ref('info')

onMounted(async () => {
  loading.value = true
  try { await store.ensureLoaded() }
  finally { loading.value = false }
})

const norm = (s = '') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const initials = (name = '') => {
  const p = String(name).trim().split(/\s+/).slice(0, 2)
  return p.map(x => x[0]?.toUpperCase() ?? '').join('')
}

const items = computed(() =>
  store.people.map(p => ({
    title: p.name,
    value: p.id,
    seat: p.seat || null,
    present: !!p.present,
    subtitle: [p.org, p.doc].filter(Boolean).join(' · ') || '—',
    _keywords: norm([p.name, p.doc, p.org].filter(Boolean).join(' '))
  }))
)

function filterFn (_title, _query, item) {
  const q = norm(search.value)
  if (!q) return true
  return item?.raw?._keywords?.includes(q)
}

function onSelected (obj) {
  selectedSeat.value = obj?.seat || null
  selectedPresent.value = !!obj?.present
  message.value = ''
  messageType.value = 'info'
}

async function onSubmit () {
  if (!selected.value) return
  submitting.value = true
  try {
    const id = selected.value.value
    const p = await store.checkInById(id)
    selectedSeat.value = p.seat || null
    selectedPresent.value = !!p.present
    messageType.value = 'success'
    message.value = `Asistencia registrada: ${p.name} · Asiento ${p.seat || '—'}`
  } catch (e) {
    messageType.value = 'error'
    message.value = e?.response?.data?.message || e?.message || 'Error al registrar asistencia.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ck-card { overflow: hidden; backdrop-filter: saturate(120%) blur(2px); }
.ck-header { display:flex; align-items:center; justify-content:space-between; padding:18px 22px; background:linear-gradient(135deg, rgba(10,69,107,.08), rgba(215,219,69,.06)); }
.ck-title { font-weight:700; font-size:1.05rem; letter-spacing:.2px; }
.opacity-10 { opacity:.1; }

/* Autocomplete */
.ck-autocomplete :deep(.v-field){ border-radius:14px!important; }
.ck-autocomplete :deep(.v-field__outline){ --v-field-border-width:2px; }
.ck-autocomplete :deep(.v-input__control){ transition: transform .15s ease; }
.ck-autocomplete:focus-within :deep(.v-input__control){ transform: translateY(-1px); }

/* Items */
.row-title{ display:inline-flex; align-items:center; }
.name{ font-weight:600; }
.muted{ opacity:.7; }
.state-dot{ width:10px; height:10px; border-radius:999px; }
.state-dot.is-present{ background:#2e7d32; }
.state-dot.is-assigned{ background:#ffb300; }
.state-dot.is-free{ background:#9e9e9e; }
.elevated{ box-shadow:0 1px 2px rgba(0,0,0,.12); }
.avatar-text{ font-size:12px; font-weight:700; line-height:32px; }
.avatar-text.tiny{ font-size:11px; line-height:22px; }

/* Botón */
.ck-primary{ background:linear-gradient(135deg,#0a456b,#0a456b); color:#fff; letter-spacing:.3px; }

/* Animación */
.fade-slide-enter-active, .fade-slide-leave-active{ transition:all .18s ease; }
.fade-slide-enter-from, .fade-slide-leave-to{ opacity:0; transform:translateY(-4px); }
</style>
