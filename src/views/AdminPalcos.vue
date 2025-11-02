<template>
  <v-container fluid class="pa-4">
    <v-card class="card-contrast" rounded="xl">
      <!-- ===== HEADER ===== -->
      <v-card-title class="title-contrast d-flex flex-wrap align-center gap-3">
        <v-icon class="mr-2">mdi-seat</v-icon>
        <span class="font-weight-800 text-truncate">
          Administrar palcos y asientos
        </span>

        <v-spacer />

        <!-- SELECT PALCO -->
        <v-select
          v-model="selectedPalcoId"
          :items="palcoOptions"
          item-title="name"
          item-value="id"
          label="Palco"
          density="comfortable"
          class="field-contrast palco-select"
          prepend-inner-icon="mdi-account-group-outline"
          hide-details="auto"
          style="max-width:260px"
          :loading="loadingPalcos || loadingSeats"
        />
      </v-card-title>

      <v-card-text>
        <!-- LOADING -->
        <div v-if="loadingSeats" class="py-8 text-center text-dim">
          Cargando asientos…
        </div>

        <!-- SIN PALCO ELEGIDO -->
        <template v-else-if="!selectedPalcoId">
          <div class="py-8 text-center text-dim">
            Seleccioná un palco para administrar.
          </div>
        </template>

        <!-- PALCO CARGADO -->
        <template v-else>
          <!-- INFO PALCO -->
          <div class="mb-4 palco-meta text-dim">
            <div class="d-flex flex-wrap align-center gap-2">
              <b class="text-accent">{{ currentPalco?.name }}</b>
              <span> ID {{ currentPalco?.id }}</span>
            </div>
            <div class="mt-1 text-caption">
              Filas: {{ palcoRows.length }} · Total asientos: {{ totalSeats }}
            </div>
          </div>

          <!-- GRID -->
          <div class="grid-rows-wrap mb-6">
            <div class="grid-rows">
              <!-- === CADA FILA === -->
              <div
                v-for="(row, rIdx) in palcoRows"
                :key="rIdx"
                class="row-line"
              >
                <!-- LETRA -->
                <div class="row-label">{{ row.letter }}</div>

                <!-- ASIENTOS EXISTENTES -->
                <div class="row-seats">
                  <div
                    v-for="code in row.codes"
                    :key="code"
                    class="seat-admin-wrap"
                  >
                    <v-btn
                      class="seat-admin"
                      variant="flat"
                      size="small"
                      color="primary"
                      :class="statusClass(code)"
                    >
                      {{ code }}
                    </v-btn>

                    <v-btn
                      icon="mdi-close"
                      size="x-small"
                      variant="text"
                      class="seat-delete"
                      :disabled="busy"
                      @click="removeSeat(code)"
                    />
                  </div>
                </div>

                <!-- INLINE ADD (a la derecha de la fila) -->
                <div class="inline-add">
                  <div class="next-chip">
                    <span class="next-label">Próx</span>
                    <span class="next-code">{{ row.letter }}{{ nextNumber(row) }}</span>
                  </div>

                  <v-btn
                    class="btn-inline-add"
                    size="small"
                    color="primary"
                    prepend-icon="mdi-plus"
                    :disabled="busy"
                    @click="addNextSeat(row.letter)"
                  >
                    Agregar
                  </v-btn>

                  <v-btn
                    class="btn-inline-manual"
                    icon
                    size="small"
                    variant="flat"
                    :disabled="busy"
                    @click="openManualDialog(row.letter)"
                  >
                    <v-icon size="18">mdi-pencil</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>

          <!-- AGREGAR FILA COMPLETA -->
          <v-sheet class="add-row-card" rounded="lg">
            <div class="mb-2 font-weight-600 text-accent">
              Agregar fila nueva
            </div>

            <div class="d-flex flex-wrap align-center gap-3">
              <v-text-field
                v-model="newRow.letter"
                label="Letra fila (ej. R)"
                density="comfortable"
                class="field-contrast small-field"
                hide-details="auto"
                style="max-width:120px"
              />

              <v-text-field
                v-model.number="newRow.count"
                label="Cant. asientos"
                type="number"
                min="1"
                density="comfortable"
                class="field-contrast small-field"
                hide-details="auto"
                style="max-width:140px"
              />

              <v-btn
                class="btn-strong"
                color="primary"
                prepend-icon="mdi-plus"
                :disabled="busy || !validNewRow"
                @click="addFullRow"
              >
                Agregar fila
              </v-btn>
            </div>
          </v-sheet>
        </template>
      </v-card-text>
    </v-card>

    <!-- SNACKBAR -->
    <v-snackbar
      v-model="snackbar.show"
      :timeout="4000"
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

    <!-- DIALOGO ALTA MANUAL -->
    <v-dialog v-model="manualDialog.show" max-width="360">
      <v-card class="card-contrast" rounded="xl">
        <v-card-title class="title-contrast d-flex align-center">
          <v-icon class="mr-2">mdi-plus-circle-outline</v-icon>
          Agregar asiento manual
          <v-spacer />
          <v-chip class="chip-inline-letter" label>{{ manualDialog.letter }}</v-chip>
        </v-card-title>

        <v-card-text class="py-4">
          <div class="text-dim text-caption mb-2">
            Ingresá el número exacto que querés crear para la fila
            <b class="text-accent">{{ manualDialog.letter }}</b>.
          </div>

          <v-text-field
            v-model="manualDialog.number"
            label="N° de asiento"
            placeholder="ej. 14"
            type="number"
            density="comfortable"
            class="field-contrast"
            hide-details="auto"
          />
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" class="btn-text" @click="closeManualDialog">
            Cancelar
          </v-btn>
          <v-btn
            class="btn-strong"
            color="primary"
            prepend-icon="mdi-plus"
            :disabled="busy || !manualValid"
            @click="confirmManualAdd"
          >
            Agregar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watchEffect } from 'vue'
import api from '../services/api'
import { useSeatsStore } from '../stores'

const seatsStore = useSeatsStore()

/* ===== estado base UI ===== */
const palcoOptions    = ref([])          // [{id,name}, ...]
const selectedPalcoId = ref(null)        // id palco actual
const currentPalco    = ref(null)        // { id, name }
const palcoRows       = ref([])          // [{letter:'A', codes:['A1','A2',...]}]

const loadingPalcos   = ref(false)
const loadingSeats    = ref(false)
const busy            = ref(false)

/* ===== dialogo alta manual ===== */
const manualDialog = reactive({
  show: false,
  letter: '',
  number: ''
})

function openManualDialog(letter) {
  manualDialog.letter = letter
  manualDialog.number = ''
  manualDialog.show = true
}
function closeManualDialog() {
  manualDialog.show = false
  manualDialog.letter = ''
  manualDialog.number = ''
}
const manualValid = computed(() => {
  const n = manualDialog.number.trim()
  return /^[0-9]+$/.test(n)
})

/* ===== agregar fila entera ===== */
const newRow = reactive({
  letter: '',
  count: 10,
})

/* ===== snackbar ===== */
const snackbar = reactive({
  show: false,
  text: '',
  ok: true
})
function toast(msg, ok = true) {
  snackbar.text = msg
  snackbar.ok   = ok
  snackbar.show = true
}

/* ===== helpers numeritos ===== */
function extractNum(code) {
  const m = String(code).match(/^[A-Z]+(\d+)$/i)
  return m ? parseInt(m[1], 10) : null
}
function nextNumber(rowObj) {
  let max = 0
  for (const c of rowObj.codes) {
    const n = extractNum(c)
    if (n && n > max) max = n
  }
  return max + 1
}

/* ===== cargar lista de palcos ===== */
onMounted(async () => {
  loadingPalcos.value = true
  try {
    const { data } = await api.get('/palcos')
    palcoOptions.value = data || []
  } catch (err) {
    toast('Error cargando palcos', false)
  } finally {
    loadingPalcos.value = false
  }
})

/* ===== cargar asientos de un palco ===== */
async function loadSeats() {
  if (!selectedPalcoId.value) {
    currentPalco.value = null
    palcoRows.value = []
    return
  }

  loadingSeats.value = true
  try {
    const { data } = await api.get(`/palcos/${selectedPalcoId.value}/seats`)
    currentPalco.value = { id: data.palcoId, name: data.name }

    // normalizamos formato rows
    const rowsOut = data.seats.map(arr => {
      const letter = arr[0]?.charAt(0) || '?'
      return { letter, codes: arr }
    })

    palcoRows.value = rowsOut
  } catch (err) {
    toast('Error cargando asientos', false)
    currentPalco.value = null
    palcoRows.value = []
  } finally {
    loadingSeats.value = false
  }
}

// recargar cada vez que cambie selectedPalcoId
watchEffect(() => {
  loadSeats()
})

/* ===== resumen total seats ===== */
const totalSeats = computed(() =>
  palcoRows.value.reduce((acc, row) => acc + row.codes.length, 0)
)

/* ===== estilos visuales según ocupación real ===== */
function statusClass(code) {
  const holder = seatsStore.people.find(p => p.seat === code)
  if (!holder) return 'free'
  if (holder.present) return 'present'
  return 'assigned'
}

/* ===== alta AUTOMÁTICA: siguiente número libre ===== */
async function addNextSeat(letter) {
  if (!selectedPalcoId.value) return
  busy.value = true
  try {
    const rowObj = palcoRows.value.find(r => r.letter === letter)
    const seatNumber = nextNumber(rowObj)

    const { data } = await api.post(`/palcos/${selectedPalcoId.value}/seats`, {
      rowLetter: letter,
      seatNumber
    })

    if (data?.ok === false) {
      toast(data.error || 'No se pudo agregar', false)
    } else {
      toast(`Asiento ${letter}${seatNumber} agregado`, true)
    }

    await loadSeats()
  } catch (err) {
    toast('No se pudo agregar el asiento', false)
  } finally {
    busy.value = false
  }
}

/* ===== alta MANUAL (desde el dialog) ===== */
async function confirmManualAdd() {
  if (!selectedPalcoId.value) return
  if (!manualValid.value) return

  busy.value = true
  try {
    const seatNumber = parseInt(manualDialog.number.trim(), 10)

    const { data } = await api.post(`/palcos/${selectedPalcoId.value}/seats`, {
      rowLetter: manualDialog.letter,
      seatNumber
    })

    if (data?.ok === false) {
      toast(data.error || 'No se pudo agregar', false)
    } else {
      toast(`Asiento ${manualDialog.letter}${seatNumber} agregado`, true)
    }

    closeManualDialog()
    await loadSeats()
  } catch (err) {
    toast('No se pudo agregar el asiento', false)
  } finally {
    busy.value = false
  }
}

/* ===== eliminar asiento puntual ===== */
async function removeSeat(code) {
  if (!selectedPalcoId.value) return
  busy.value = true
  try {
    const { data } = await api.delete(
      `/palcos/${selectedPalcoId.value}/seats/${code}`
    )

    if (data?.ok) {
      toast(`Asiento ${code} eliminado`, true)
    } else {
      toast('No se pudo eliminar el asiento', false)
    }

    await loadSeats()
  } catch (err) {
    toast('No se pudo eliminar el asiento', false)
  } finally {
    busy.value = false
  }
}

/* ===== agregar FILA COMPLETA ===== */
const validNewRow = computed(() => {
  return (
    newRow.letter.trim().match(/^[A-Z]$/i) &&
    Number.isInteger(newRow.count) &&
    newRow.count > 0
  )
})

async function addFullRow() {
  if (!selectedPalcoId.value) return
  if (!validNewRow.value) return
  busy.value = true
  try {
    const rowLetter = newRow.letter.trim().toUpperCase()

    const { data } = await api.post(`/palcos/${selectedPalcoId.value}/seats`, {
      rowLetter,
      seatNumber: newRow.count,
      mode: 'fullRow'
    })

    if (data?.ok === false) {
      toast(data.error || 'No se pudo agregar la fila', false)
    } else {
      toast(`Fila ${rowLetter} agregada`, true)
    }

    newRow.letter = ''
    newRow.count  = 10
    await loadSeats()
  } catch (err) {
    toast('No se pudo agregar la fila', false)
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.card-contrast {
  background:#0e1230 !important;
  border:1px solid rgba(255,217,81,.14);
  box-shadow:0 6px 18px rgba(0,0,0,.25);
  color:#eaf0ff;
}
.title-contrast {
  background:linear-gradient(180deg,rgba(255,217,81,.06),rgba(11,13,40,0));
  border-bottom:1px solid rgba(255,217,81,.10);
  font-weight:800;
  line-height:1.2;
}
.text-dim { color:rgba(234,240,255,.78); }
.text-accent { color:#ffd951; font-weight:700; }
.font-weight-800 { font-weight:800; }
.font-weight-600 { font-weight:600; }

.field-contrast :deep(.v-field){
  background:rgba(255,255,255,.06) !important;
  border-radius:12px !important;
  color:#eaf0ff !important;
}
.field-contrast :deep(.v-icon){
  color:#ffd951 !important;
}

/* ===== GRID WRAP ===== */
.grid-rows-wrap{
  overflow-x:auto;
  -webkit-overflow-scrolling:touch;
  padding-bottom:6px;
  border:1px solid rgba(255,217,81,.14);
  border-radius:16px;
  background:#111433;
  box-shadow:0 12px 32px rgba(0,0,0,.6);
}
.grid-rows{
  display:flex;
  flex-direction:column;
  gap:16px;
  min-width:max(640px,100%);
  padding:16px;
}

/* CADA FILA */
.row-line{
  display:flex;
  flex-wrap:nowrap;
  align-items:flex-start;
  gap:12px;
  min-width:100%;
}

/* LETRA IZQ */
.row-label{
  flex:0 0 auto;
  text-align:center;
  font-weight:800;
  color:#0b0d28;
  background:#ffd951;
  border:1px solid rgba(255,217,81,.45);
  box-shadow:0 2px 6px rgba(0,0,0,.25);
  border-radius:10px;
  padding:6px 10px;
  min-width:44px;
}

/* ASIENTOS EXISTENTES (scroll-wrap flex) */
.row-seats{
  display:flex;
  flex-wrap:wrap;
  align-items:flex-start;
  gap:8px 12px;
  flex:1 1 auto;
  min-width:0;
}

/* BLOQUE INLINE DERECHA */
.inline-add{
  flex:0 0 auto;
  display:flex;
  flex-direction:column;
  align-items:stretch;
  gap:8px;
  min-width:110px;
  max-width:130px;
}
.next-chip{
  background:#2a2f4f;
  border-radius:8px;
  padding:8px 10px;
  border:1px solid rgba(255,217,81,.24);
  color:#eaf0ff;
  font-size:.75rem;
  line-height:1.2;
  box-shadow:0 8px 20px rgba(0,0,0,.7);
  display:flex;
  flex-direction:column;
  font-weight:600;
}
.next-label{
  font-size:.65rem;
  color:rgba(234,240,255,.6);
  text-transform:uppercase;
  letter-spacing:.05em;
  margin-bottom:2px;
}
.next-code{
  color:#ffd951;
  font-weight:700;
  font-size:.85rem;
  line-height:1.2;
}

/* BOTONES INLINE */
.btn-inline-add{
  background:#7d6720 !important;
  color:#fff !important;
  font-weight:700;
  border-radius:8px !important;
  text-transform:none;
  box-shadow:0 3px 12px rgba(0,0,0,.6) !important;
  justify-content:center;
}
.btn-inline-manual{
  background:#1f223c !important;
  color:#ffd951 !important;
  border:1px solid rgba(255,217,81,.3) !important;
  box-shadow:0 3px 12px rgba(0,0,0,.6) !important;
  border-radius:8px !important;
  min-width:40px !important;
  width:40px !important;
  height:36px !important;
  padding:0 !important;
}

/* ASIENTO PILL + X */
.seat-admin-wrap{
  display:flex;
  align-items:center;
}
.seat-admin{
  min-width:58px;
  height:36px;
  border-radius:18px;
  font-weight:700;
  text-transform:none;
  box-shadow:0 1px 2px rgba(0,0,0,.25);
  background:#f3f5f9 !important;
  color:#0b0d28 !important;
  border:0 !important;
  line-height:1.2;
  font-size:.8rem;
  justify-content:center;
}
.seat-admin.present{
  background:#4caf50 !important;
  color:#fff !important;
}
.seat-admin.assigned{
  background:#ffb300 !important;
  color:#0b0d28 !important;
}
.seat-delete{
  color:#ffd951 !important;
  min-width:28px !important;
  width:28px !important;
  height:28px !important;
  padding:0 !important;
  margin-left:4px;
}

/* ADD ROW CARD */
.add-row-card{
  background:rgba(11,13,40,.5);
  border:1px solid rgba(255,217,81,.24);
  padding:16px;
  box-shadow:0 12px 32px rgba(0,0,0,.6);
  color:#eaf0ff;
}
.small-field :deep(.v-field){
  background:rgba(255,255,255,.06) !important;
  border-radius:12px !important;
  min-height:44px !important;
  color:#eaf0ff !important;
}

/* SNACKBAR */
.snackbar-strong{
  font-weight:600;
  letter-spacing:.02em;
  text-transform:none;
  max-width:360px;
  border-radius:12px !important;
  box-shadow:0 20px 40px rgba(0,0,0,.6);
}
.snackbar-strong :deep(.v-icon){
  color:#fff !important;
}

/* dialog extra */
.chip-inline-letter{
  background:#ffd951 !important;
  color:#0b0d28 !important;
  font-weight:700 !important;
  border-radius:8px !important;
}

/* colores fallback por estado */
.present { background:#4caf50 !important; color:#fff !important; }
.assigned { background:#ffb300 !important; color:#0b0d28 !important; }
.free { background:#f3f5f9 !important; color:#0b0d28 !important; }

@media (max-width:600px){
  .grid-rows{
    min-width:max(480px,100%);
    gap:12px;
  }
  .row-line{
    flex-wrap:wrap;
  }
  .row-label{
    font-size:.8rem;
    padding:4px 8px;
  }

  /* En mobile, metemos el bloque inline debajo de la fila
     para que no quede apretado horizontal */
  .inline-add{
    order:3;
    flex-direction:row;
    flex-wrap:wrap;
    min-width:100%;
    max-width:100%;
    gap:8px;
  }
  .next-chip{
    flex:1 1 auto;
  }
  .btn-inline-add{
    flex:1 1 auto;
  }
  .btn-inline-manual{
    flex:0 0 auto;
  }

  .seat-admin{
    min-width:52px;
    height:32px;
    border-radius:16px;
    font-size:.75rem;
  }
}
.btn-text {
  color:#ffd951 !important;
}
</style>
