<template>
  <v-container class="py-8" fluid>
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <v-card rounded="xl" class="card-contrast">
          <v-card-title class="title-contrast d-flex align-center flex-wrap">
            <v-icon class="mr-2">mdi-database-import</v-icon>
            <span class="font-weight-800">Importar invitados desde Excel</span>
            <v-spacer />
            <v-switch
              v-model="withSeatAssign"
              inset
              color="success"
              :label="`Asignar asientos (ASIENTO/PALCO)`"
              :disabled="true"
            />
          </v-card-title>

          <v-card-text>
            <div class="mb-4 d-flex align-center gap-3">
              <input type="file" accept=".xlsx,.xls" @change="onFile" />
              <v-btn class="btn-tonal" :disabled="!rows.length" @click="clearAll" prepend-icon="mdi-broom">
                Limpiar
              </v-btn>
            </div>

            <v-alert variant="tonal" type="info" class="mb-4">
              Detecté columnas del Excel y las mapeé automáticamente. Ajustá si tus encabezados difieren.
            </v-alert>

            <v-row>
              <v-col cols="12" md="6">
                <v-select v-model="map.name" :items="colItems" label="Columna: Nombre" hide-details density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="map.dni" :items="colItems" label="Columna: DNI (opcional)" hide-details density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="map.cargo" :items="colItems" label="Columna: Cargo" hide-details density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="map.organismo" :items="colItems" label="Columna: Organismo → (se guarda en 'org')" hide-details density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="map.phone" :items="colItems" label="Columna: Teléfono (opcional)" hide-details density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="map.email" :items="colItems" label="Columna: Email (opcional)" hide-details density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="map.asiento" :items="colItems" label="Columna: ASIENTO (obligatorio)" hide-details density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="map.palco" :items="colItems" label="Columna: PALCO (obligatorio o inferido)" hide-details density="comfortable" />
              </v-col>
            </v-row>

            <div class="d-flex flex-wrap gap-3 mt-4">
              <v-btn color="primary" :disabled="!rows.length || importing" @click="startImport" prepend-icon="mdi-cloud-upload">
                Importar {{ rows.length }} registros
              </v-btn>
              <v-btn variant="outlined" color="secondary" :disabled="!importing" @click="cancelImport" prepend-icon="mdi-cancel">
                Cancelar
              </v-btn>
            </div>

            <div v-if="importing" class="mt-6">
              <v-progress-linear :model-value="progressPct" height="10" rounded />
              <div class="mt-2 text-dim">{{ done }}/{{ rows.length }} procesados</div>
            </div>

            <v-divider class="my-6 divider-contrast" />
            <div class="text-subtitle-1 mb-2">Preview (primeros 15)</div>
            <div class="table-wrap">
              <v-data-table :items="rows.slice(0, 15)" :headers="previewHeaders" density="compact" class="people-table" />
            </div>

            <v-divider class="my-6 divider-contrast" />
            <div class="text-subtitle-1 mb-2">Logs</div>
            <v-list class="bg-transparent">
              <v-list-item v-for="(l,i) in logs" :key="i" class="px-0">
                <pre class="mb-0 text-dim" style="white-space: pre-wrap;">{{ l }}</pre>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import * as XLSX from 'xlsx'
import { ref, computed } from 'vue'
import { usePeopleStore } from '@/stores/peopleStore'
import { useSeatsStore } from '@/stores/seatsStore'

const people = usePeopleStore()
const seats  = useSeatsStore()

const rows = ref([])
const headers = ref([])
const colItems = computed(() => headers.value)
const withSeatAssign = ref(true) // obligatorio
const importing = ref(false)
const done = ref(0)
const logs = ref([])
const abort = ref(null)

const map = ref({
  name: null,
  dni: null,
  cargo: null,
  organismo: null, // se guarda en org
  phone: null,
  email: null,
  asiento: null,   // obligatorio
  palco: null,     // obligatorio o inferido
})

const previewHeaders = computed(() => (headers.value || []).map(h => ({ title: h, key: h })))

function log(line) { logs.value.push(line) }

function clearAll() {
  rows.value = []; headers.value = []; logs.value = []; done.value = 0; importing.value = false
  map.value = { name:null, dni:null, cargo:null, organismo:null, phone:null, email:null, asiento:null, palco:null }
}

function onFile(e) {
  const file = e.target.files?.[0]; if (!file) return
  const fr = new FileReader()
  fr.onload = (evt) => {
    const data = new Uint8Array(evt.target.result)
    const wb = XLSX.read(data, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(ws, { defval: '' })
    if (!json.length) { log('El Excel no contiene filas en la hoja 1.'); return }

    rows.value = json
    headers.value = Object.keys(json[0])

    const H = headers.value.map(h => h.toLowerCase().replace(/\s+/g,' ').trim())
    const pick = (cands) => {
      const idx = H.findIndex(lc => cands.some(c => lc.includes(c)))
      return idx >= 0 ? headers.value[idx] : null
    }

    map.value.name      = pick(['nombre y apellido','nombre','apellidos','name'])
                        || headers.value.find(h => h.toLowerCase()==='nombre y apellido') || null
    map.value.cargo     = pick(['cargo','jerarquía','jerarquia','puesto','rol'])
    map.value.organismo = pick(['organismo','organismo / institución','organismo/ institución','organismo/institución','entidad','institución','institucion','dependencia','empresa','org'])
    map.value.dni       = pick(['dni','documento','doc'])
    map.value.phone     = pick(['telefono','teléfono','celular','whatsapp','phone'])
    map.value.email     = pick(['email','correo','mail'])
    map.value.asiento   = pick(['asiento','seat','butaca','codigo','código'])
    map.value.palco     = pick(['palco','sector'])

    log(`Filas cargadas: ${rows.value.length}`)
    log(`Detección: nombre=${map.value.name} cargo=${map.value.cargo} org=${map.value.organismo} dni=${map.value.dni} asiento=${map.value.asiento} palco=${map.value.palco}`)
  }
  fr.readAsArrayBuffer(file)
}

const progressPct = computed(() => rows.value.length ? Math.round((done.value / rows.value.length) * 100) : 0)

const normalizeText = (s) => (s == null ? '' : String(s).replace(/\s+/g,' ').trim())
const normalizeOrg  = (s) => normalizeText(s)
const normalizeCargo= (s) => normalizeText(s)

function normalizeSeatCode(s) {
  if (!s && s !== 0) return ''
  let t = String(s).toUpperCase().trim()
  // aceptar A 01, A-01, a01, A_1, etc → A1
  t = t.replace(/[\s\-_]+/g, '')
  const m = t.match(/^([A-L])0*([0-9]{1,2})$/i) || t.match(/^([A-L])([0-9]{1,2})$/i)
  if (m) {
    const letter = m[1].toUpperCase()
    const num = String(parseInt(m[2],10))
    return `${letter}${num}`
  }
  // último intento: primera letra + resto números
  const letter = (t.match(/[A-L]/i) || [''])[0].toUpperCase()
  const digits = (t.match(/\d+/) || [''])[0]
  return (letter && digits) ? `${letter}${parseInt(digits,10)}` : ''
}

function inferPalcoIdFromSeat(seatCode) {
  const first = String(seatCode || '').toUpperCase().charAt(0)
  if ('ABCDEF'.includes(first)) return 1
  if ('GHI'.includes(first))    return 2
  if ('JKL'.includes(first))    return 3
  return null
}

async function createPerson(p) { return await people.createPerson(p) }

async function assignSeat({ personId, seatCode, palcoName }) {
  try { if (!seats.palcos?.length) await seats.fetchPalcos() } catch {}

  let palcoId = null
  if (palcoName) {
    const found = (seats.palcos || []).find(
      p => normalizeText(p.name).toUpperCase() === normalizeText(palcoName).toUpperCase()
    )
    if (found) palcoId = found.id
  }
  if (!palcoId) palcoId = inferPalcoIdFromSeat(seatCode)
  if (!palcoId) throw new Error(`No se pudo resolver PALCO para asiento ${seatCode}`)

  const patch = {
    // enviamos todos los alias para máxima compatibilidad de back
    seat: seatCode,
    seatCode: seatCode,
    seat_code: seatCode,
    palcoId,
    palco_id: palcoId,
    palco: palcoName || null,
  }
  await people.updatePerson(personId, patch)
}

function cancelImport() {
  if (abort.value) { abort.value.abort(); log('Importación cancelada por el usuario.') }
  importing.value = false
}

async function startImport() {
  if (!rows.value.length) { log('No hay filas para importar.'); return }
  if (!map.value.name)    { log('⚠️ Debes mapear la columna de NOMBRE.'); return }
  if (!map.value.asiento) { log('⚠️ Debes mapear la columna ASIENTO.'); return }
  // PALCO puede no venir en Excel; si falta, se infiere por la letra del asiento.

  importing.value = true
  done.value = 0
  logs.value = []
  abort.value = new AbortController()

  try {
    for (let i = 0; i < rows.value.length; i++) {
      if (abort.value.signal.aborted) break

      const r = rows.value[i]
      const name = normalizeText(map.value.name ? r[map.value.name] : '')
      const cargo = map.value.cargo ? normalizeCargo(r[map.value.cargo]) : null
      const org   = map.value.organismo ? normalizeOrg(r[map.value.organismo]) : null
      const dni   = map.value.dni ? normalizeText(r[map.value.dni]) : null
      const phone = map.value.phone ? normalizeText(r[map.value.phone]) : null
      const email = map.value.email ? normalizeText(r[map.value.email]) : null

      const seatCode = normalizeSeatCode(r[map.value.asiento])
      const palcoName= map.value.palco ? normalizeText(r[map.value.palco]) : ''

      if (!name)     { log(`❌ [${i+1}] Falta NOMBRE en la fila.`); done.value++; continue }
      if (!seatCode) { log(`❌ [${i+1}] Falta/invalid ASIENTO para "${name}".`); done.value++; continue }

      const personPayload = {
        name,
        cargo: cargo || null,
        org:   org   || null,
        dni:   dni   || null,
        phone: phone || null,
        email: email || null,
      }

      let created
      try {
        created = await createPerson(personPayload)
      } catch (e) {
        log(`❌ [${i+1}] Error creando "${name}": ${e?.response?.data?.message || e.message}`)
        done.value++; continue
      }

      try {
        await assignSeat({ personId: created?.id, seatCode, palcoName })
      } catch (e) {
        log(`❌ [${i+1}] "${name}" creado pero falló asignar asiento ${seatCode}${palcoName?` (palco ${palcoName})`:''}: ${e?.response?.data?.message || e.message}`)
      }

      done.value++
      if ((i+1) % 25 === 0 || i === rows.value.length - 1) log(`✔️ Procesados: ${i+1}/${rows.value.length}`)
    }

    log('✅ Importación finalizada.')
  } catch (err) {
    log(`❌ Error global: ${err.message}`)
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.card-contrast { background:#0e1230 !important; border:1px solid rgba(255,217,81,.14); box-shadow:0 6px 18px rgba(0,0,0,.25); }
.title-contrast { background:linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0)); border-bottom:1px solid rgba(255,217,81,.10); }
.divider-contrast { border-color: rgba(255,217,81,.10) !important; }
.text-dim { color: rgba(234,240,255,.75); }
.btn-tonal { background: rgba(255,217,81,.12) !important; color:#ffd951 !important; border:1px solid rgba(255,217,81,.24) !important; }
.table-wrap { overflow-x: auto; }
.people-table :deep(table) { font-size: .85rem; }
</style>
