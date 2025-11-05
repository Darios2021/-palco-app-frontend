<template>
  <!-- === MAPA 3 PALCOS / RESPONSIVE === -->
  <v-card rounded="xl" class="mb-6 card-contrast">
    <!-- HEADER -->
    <v-card-title class="d-flex align-center flex-wrap gap-2 title-contrast">
      <v-icon class="mr-2">mdi-seat</v-icon>
      <span class="text-truncate">Mapa de Asientos</span>

      <v-spacer />

      <div class="legend d-flex align-center gap-2">
        <v-chip label size="small" class="chip-strong chip-presente">Presente</v-chip>
        <v-chip label size="small" class="chip-strong chip-asignado">Asignado</v-chip>
        <v-chip variant="outlined" label size="small" class="chip-outline">Libre</v-chip>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="globalLoading" class="py-6 text-center text-dim">
        Cargando…
      </div>

      <template v-else>
        <!-- DESKTOP / TABLET ANCHA -->
        <template v-if="!smAndDown">
          <div class="palcos-viewport">
            <div class="palcos-layout">
              <!-- PALCO A -->
              <section class="palco-block palco-lateral">
                <header class="palco-header">
                  <div class="palco-header-inner">
                    <v-icon size="18" class="mr-1">mdi-seat</v-icon>
                    <span class="palco-title">{{ palcoAmeta.name || 'PALCO A' }}</span>
                  </div>
                </header>

                <div class="palco-body main-palco-body">
                  <div class="grid-rows-wrap">
                    <div class="grid-rows">
                      <div v-for="(row, rIdx) in palcoArows" :key="'A-'+rIdx" class="row">
                        <div class="row-label">{{ row.letter }}</div>
                        <v-btn
                          v-for="code in row.codes"
                          :key="code"
                          :class="['seat', seatStatusClass(code)]"
                          variant="flat"
                          size="small"
                          :aria-label="`Asiento ${code}`"
                          @click="openSeat(code)"
                        >{{ code }}</v-btn>
                      </div>
                    </div>
                  </div>
                </div>

                <footer class="palco-footer">Autoridades media prioridad</footer>
              </section>

              <!-- PALCO PRINCIPAL -->
              <section class="palco-block palco-principal">
                <header class="palco-header">
                  <div class="palco-header-inner">
                    <v-icon size="18" class="mr-1">mdi-crown</v-icon>
                    <span class="palco-title">{{ palcoPrincipalMeta.name || 'PALCO PRINCIPAL' }}</span>
                  </div>
                </header>

                <div class="palco-body main-palco-body">
                  <div class="grid-rows-wrap">
                    <div class="grid-rows">
                      <div v-for="(row, rIdx) in palcoPrincipalRows" :key="'P-'+rIdx" class="row">
                        <div class="row-label">{{ row.letter }}</div>
                        <v-btn
                          v-for="code in row.codes"
                          :key="code"
                          :class="['seat', seatStatusClass(code)]"
                          variant="flat"
                          size="small"
                          :aria-label="`Asiento ${code}`"
                          @click="openSeat(code)"
                        >{{ code }}</v-btn>
                      </div>
                    </div>
                  </div>
                </div>

                <footer class="palco-footer">Autoridades alta prioridad</footer>
              </section>

              <!-- PALCO B -->
              <section class="palco-block palco-lateral">
                <header class="palco-header">
                  <div class="palco-header-inner">
                    <v-icon size="18" class="mr-1">mdi-seat-outline</v-icon>
                    <span class="palco-title">{{ palcoBmeta.name || 'PALCO B' }}</span>
                  </div>
                </header>

                <div class="palco-body main-palco-body">
                  <div class="grid-rows-wrap">
                    <div class="grid-rows">
                      <div v-for="(row, rIdx) in palcoBrows" :key="'B-'+rIdx" class="row">
                        <div class="row-label">{{ row.letter }}</div>
                        <v-btn
                          v-for="code in row.codes"
                          :key="code"
                          :class="['seat', seatStatusClass(code)]"
                          variant="flat"
                          size="small"
                          :aria-label="`Asiento ${code}`"
                          @click="openSeat(code)"
                        >{{ code }}</v-btn>
                      </div>
                    </div>
                  </div>
                </div>

                <footer class="palco-footer">Autoridades baja prioridad</footer>
              </section>
            </div>
          </div>
        </template>

        <!-- MOBILE -->
        <template v-else>
          <div class="palcos-tabs-wrap">
            <v-tabs
              v-model="activeTab"
              class="palcos-tabs tabs-compact"
              density="compact"
              slider-color="#ffd951"
              show-arrows
              center-active
            >
              <v-tab value="A" class="tab-compact">PALCO A</v-tab>
              <v-tab value="P" class="tab-compact">PRINCIPAL</v-tab>
              <v-tab value="B" class="tab-compact">PALCO B</v-tab>
            </v-tabs>

            <v-window v-model="activeTab" class="palcos-window" :touch="false">
              <v-window-item value="A" class="palco-window-item">
                <section class="palco-block palco-lateral">
                  <header class="palco-header">
                    <div class="palco-header-inner">
                      <v-icon size="18" class="mr-1">mdi-seat</v-icon>
                      <span class="palco-title">{{ palcoAmeta.name || 'PALCO A' }}</span>
                    </div>
                  </header>

                  <div class="palco-body main-palco-body">
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="(row, rIdx) in palcoArows" :key="'A-m-'+rIdx" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="['seat', seatStatusClass(code)]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            @click="openSeat(code)"
                          >{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer class="palco-footer">Autoridades media prioridad</footer>
                </section>
              </v-window-item>

              <v-window-item value="P" class="palco-window-item">
                <section class="palco-block palco-principal">
                  <header class="palco-header">
                    <div class="palco-header-inner">
                      <v-icon size="18" class="mr-1">mdi-crown</v-icon>
                      <span class="palco-title">{{ palcoPrincipalMeta.name || 'PALCO PRINCIPAL' }}</span>
                    </div>
                  </header>

                  <div class="palco-body main-palco-body">
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="(row, rIdx) in palcoPrincipalRows" :key="'P-m-'+rIdx" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="['seat', seatStatusClass(code)]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            @click="openSeat(code)"
                          >{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer class="palco-footer">Autoridades alta prioridad</footer>
                </section>
              </v-window-item>

              <v-window-item value="B" class="palco-window-item">
                <section class="palco-block palco-lateral">
                  <header class="palco-header">
                    <div class="palco-header-inner">
                      <v-icon size="18" class="mr-1">mdi-seat-outline</v-icon>
                      <span class="palco-title">{{ palcoBmeta.name || 'PALCO B' }}</span>
                    </div>
                  </header>

                  <div class="palco-body main-palco-body">
                    <div class="grid-rows-wrap">
                      <div class="grid-rows">
                        <div v-for="(row, rIdx) in palcoBrows" :key="'B-m-'+rIdx" class="row">
                          <div class="row-label">{{ row.letter }}</div>
                          <v-btn
                            v-for="code in row.codes"
                            :key="code"
                            :class="['seat', seatStatusClass(code)]"
                            variant="flat"
                            size="small"
                            :aria-label="`Asiento ${code}`"
                            @click="openSeat(code)"
                          >{{ code }}</v-btn>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer class="palco-footer">Autoridades baja prioridad</footer>
                </section>
              </v-window-item>
            </v-window>
          </div>
        </template>
      </template>
    </v-card-text>
  </v-card>

  <!-- === TABLA: PRESENTES EN EL PALCO === -->
  <v-card rounded="xl" elevation="2" class="card-contrast">
    <v-card-title class="d-flex flex-wrap align-start gap-2 title-contrast">
      <div class="d-flex align-center flex-wrap gap-2">
        <v-icon class="mr-2">mdi-account-check</v-icon>
        <span class="text-truncate">Presentes en el palco</span>
        <v-chip class="chip-count" color="success" label>{{ visibleRows.length }}</v-chip>
      </div>

      <v-spacer />

      <div class="title-actions">
        <v-tabs
          v-model="activePalcoTab"
          density="compact"
          slider-color="#ffd951"
          class="table-tabs-inner tabs-compact"
          show-arrows
          center-active
        >
          <v-tab value="1" class="tab-compact">PRINCIPAL</v-tab>
          <v-tab value="2" class="tab-compact">PALCO A</v-tab>
          <v-tab value="3" class="tab-compact">PALCO B</v-tab>
        </v-tabs>

        <v-text-field
          v-model="q"
          prepend-inner-icon="mdi-magnify"
          label="Buscar (nombre / DNI / organismo / asiento)"
          hide-details
          single-line
          density="comfortable"
          class="search-input"
        />

        <v-btn
          variant="tonal"
          size="small"
          icon="mdi-file-pdf-box"
          class="btn-tonal btn-icon"
          @click="exportPDF"
          :title="'Exportar PDF'"
        />
      </div>
    </v-card-title>

    <div class="table-wrap">
      <v-data-table
        :headers="headers"
        :items="filteredRows"
        :items-per-page="itemsPerPage"
        class="present-table"
        hover
        fixed-header
        :height="tableHeight"
        :mobile-breakpoint="0"
        density="comfortable"
      >
        <template #bottom></template>

        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="28" class="mr-2 avatar-contrast">
              <span class="avatar">{{ initials(item.name) }}</span>
            </v-avatar>
            <div class="font-weight-600 text-truncate">{{ item.name }}</div>
          </div>
        </template>

        <template #item.seat="{ item }">
          <v-chip color="success" size="x-small" label class="font-weight-600 chip-table">
            {{ item.seat }}
          </v-chip>
        </template>

        <template #item.presentAt="{ item }">
          <div class="d-flex align-center text-dim nowrap">
            <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
            <span class="font-mono">{{ formatDateTime(item.presentAt, smForTable.value) }}</span>
          </div>
        </template>

        <template #no-data>
          <div class="py-8 text-medium-emphasis">Aún no hay presentes en este palco.</div>
        </template>
      </v-data-table>
    </div>
  </v-card>

  <!-- === MODAL DETALLE DE ASIENTO === -->
  <v-dialog v-model="dialog" max-width="520">
    <v-card rounded="xl" class="card-contrast">
      <v-card-title class="d-flex align-center title-contrast">
        <v-icon class="mr-2">mdi-seat</v-icon>
        Asiento {{ currentSeat }}
        <v-spacer />
        <v-chip v-if="currentStatus === 'present'" size="small" color="success" label class="chip-strong">Presente</v-chip>
        <v-chip v-else-if="currentStatus === 'assigned'" size="small" color="warning" label class="chip-strong">Asignado</v-chip>
        <v-chip v-else size="small" variant="outlined" label class="chip-outline">Libre</v-chip>
      </v-card-title>

      <v-divider class="divider-contrast" />

      <v-card-text class="py-5">
        <template v-if="holder">
          <div class="d-flex align-center">
            <v-avatar size="40" class="mr-3 avatar-contrast">
              <span class="avatar">{{ initials(holder.name) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ holder.name }}</div>
              <div class="text-dim">{{ [holder.org, holder.doc].filter(Boolean).join(' · ') || '—' }}</div>
            </div>
          </div>

          <v-alert v-if="holder.present" type="success" variant="tonal" class="mt-4 alert-contrast" border="start" rounded="lg">
            Ingresó al palco: <b>{{ formatDateTime(holder.presentAt) }}</b>
          </v-alert>

          <v-alert v-else type="warning" variant="tonal" class="mt-4 alert-contrast" border="start" rounded="lg">
            Asiento asignado, aún <b>no ingresó</b>.
          </v-alert>
        </template>

        <template v-else>
          <v-alert variant="tonal" border="start" rounded="lg" class="alert-contrast">
            Este asiento está <b>libre</b>.
          </v-alert>
        </template>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" class="btn-text" @click="dialog=false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useSeatsStore } from '../stores'
import api from '../services/api'

const { smAndDown } = useDisplay()
const store = useSeatsStore()

const palcoMap = ref({
  1: { id: 1, name: 'PALCO PRINCIPAL', rows: [] },
  2: { id: 2, name: 'PALCO A', rows: [] },
  3: { id: 3, name: 'PALCO B', rows: [] },
})

const globalLoading = ref(true)
const activeTab = ref('P')
const activePalcoTab = ref('1')

function transformSeatsResponse(data){
  const rowsOut = data.seats.map(arr => {
    const letter = arr[0]?.charAt(0) || '?'
    return { letter, codes: arr }
  })
  return { id: data.palcoId, name: data.name, rows: rowsOut }
}

async function loadPalco(palcoId){
  const { data } = await api.get(`/palcos/${palcoId}/seats`)
  palcoMap.value[palcoId] = transformSeatsResponse(data)
}

const seatToPalcoId = ref({})
function rebuildSeatToPalco(){
  const map = {}
  Object.keys(palcoMap.value).forEach(pid => {
    const palco = palcoMap.value[Number(pid)]
    palco?.rows?.forEach(row => row.codes.forEach(code => { map[code] = Number(pid) }))
  })
  seatToPalcoId.value = map
}

onMounted(async ()=>{
  await Promise.all([ loadPalco(1), loadPalco(2), loadPalco(3), store.ensureLoaded() ])
  rebuildSeatToPalco()
  globalLoading.value = false
})

const palcoPrincipalRows = computed(()=>palcoMap.value[1]?.rows||[])
const palcoArows = computed(()=>palcoMap.value[2]?.rows||[])
const palcoBrows = computed(()=>palcoMap.value[3]?.rows||[])

const palcoPrincipalMeta = computed(()=>({ id:palcoMap.value[1]?.id, name:palcoMap.value[1]?.name }))
const palcoAmeta = computed(()=>({ id:palcoMap.value[2]?.id, name:palcoMap.value[2]?.name }))
const palcoBmeta = computed(()=>({ id:palcoMap.value[3]?.id, name:palcoMap.value[3]?.name }))

function seatStatusClass(code){ return store.seatStatus?.(code) || 'free' }

const dialog = ref(false)
const currentSeat = ref(null)
const holder = computed(()=> currentSeat.value ? store.seatHolder(currentSeat.value) : null)
const currentStatus = computed(()=> currentSeat.value ? (store.seatStatus(currentSeat.value) || 'free') : 'free')
function openSeat(code){ currentSeat.value = code; dialog.value = true }

const tabToPalcoId = { A: '2', P: '1', B: '3' }
const palcoIdToTab = { '1':'P', '2':'A', '3':'B' }
watch(activeTab, val => { const id = tabToPalcoId[val] || '1'; if (activePalcoTab.value !== id) activePalcoTab.value = id })
watch(activePalcoTab, val => { const t = palcoIdToTab[val] || 'P'; if (activeTab.value !== t) activeTab.value = t })

const headers = [
  { title:'Asiento', key:'seat', sortable:true },
  { title:'Nombre', key:'name', sortable:true },
  { title:'DNI', key:'doc', sortable:true },
  { title:'Organismo', key:'org', sortable:true },
  { title:'Ingreso', key:'presentAt', sortable:true },
]

const presentRowsByPalco = computed(()=>{
  const acc = { 1:[], 2:[], 3:[] }
  store.people.forEach(p => {
    if (!p.present) return
    const pid = seatToPalcoId.value[p.seat]
    if (!pid) return
    acc[pid].push({ name:p.name, seat:p.seat, org:p.org, doc:p.doc, presentAt:p.presentAt })
  })
  Object.keys(acc).forEach(pid => acc[pid].sort((a,b)=>(a.presentAt||'').localeCompare(b.presentAt||'')))
  return acc
})
const visibleRows = computed(()=> presentRowsByPalco.value[Number(activePalcoTab.value)] || [])

const q = ref('')
const filteredRows = computed(()=>{
  const needle = q.value.trim().toLowerCase()
  if (!needle) return visibleRows.value
  return visibleRows.value.filter(r =>
    [r.name, r.doc, r.org, r.seat].filter(Boolean).join(' ').toLowerCase().includes(needle)
  )
})

const { smAndDown: smForTable } = useDisplay()
const tableHeight = computed(()=> smForTable.value ? 340 : 420)
const itemsPerPage = computed(()=> smForTable.value ? 10 : 25)

const initials = (name='') => String(name).trim().split(/\s+/).slice(0,2).map(s => s[0]?.toUpperCase()||'').join('')

function formatDateTime(iso, compact=false){
  if (!iso) return '—'
  try{
    const dt = new Date(iso)
    if (compact){
      return new Intl.DateTimeFormat('es-AR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(dt).replace(',','')
    }
    return new Intl.DateTimeFormat('es-AR',{dateStyle:'medium',timeStyle:'short',hour12:false}).format(dt).replace(',','')
  }catch{ return iso }
}

function exportPDF(){
  const rows = filteredRows.value
  if (!rows.length){ alert('No hay datos para exportar.'); return }
  const palcoName =
    activePalcoTab.value==='1' ? (palcoPrincipalMeta.value.name||'Principal') :
    activePalcoTab.value==='2' ? (palcoAmeta.value.name||'Palco A') :
                                  (palcoBmeta.value.name||'Palco B')

  const htmlRows = rows.map(r => (
    '<tr>' +
      '<td>'+ (r.seat||'') +'</td>' +
      '<td>'+ String(r.name||'').replace(/</g,'&lt;') +'</td>' +
      '<td>'+ (r.doc||'') +'</td>' +
      '<td>'+ String(r.org||'').replace(/</g,'&lt;') +'</td>' +
      '<td>'+ formatDateTime(r.presentAt) +'</td>' +
    '</tr>'
  )).join('')

  const htmlHead = '<html><head><meta charset="utf-8"/><title>Presentes - '+palcoName+'</title>'+
  '<style>@page{size:A4;margin:14mm;}body{font-family:Arial,Helvetica,sans-serif;color:#0b0d28;}h1{font-size:18px;margin:0 0 6px 0;}h2{font-size:12px;margin:0 0 10px 0;color:#333;}table{width:100%;border-collapse:collapse;font-size:11px;}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;}th{background:#0b0d28;color:#ffd951;}tr:nth-child(odd) td{background:#fafafa;}.muted{color:#666;}</style></head>'

  const htmlBodyOpen = '<body onload="window.print(); setTimeout(function(){ window.close(); }, 300)">'
  const htmlBodyContent = '<h1>Presentes en Palco</h1>'+
    '<h2 class="muted">Palco: '+palcoName+' · Generado: '+ new Date().toLocaleString('es-AR') +'</h2>'+
    '<table><thead><tr><th>Asiento</th><th>Nombre</th><th>DNI</th><th>Organismo</th><th>Ingreso</th></tr></thead>'+
    '<tbody>'+ htmlRows +'</tbody></table>'
  const htmlClose = '</body></html>'

  const html = htmlHead + htmlBodyOpen + htmlBodyContent + htmlClose

  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (win){ win.document.open(); win.document.write(html); win.document.close(); }
  else{
    const blob = new Blob([html], { type:'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'presentes-'+palcoName+'.html'
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
  }
}
</script>

<style scoped>
.card-contrast{background:#0e1230!important;border:1px solid rgba(255,217,81,.14);box-shadow:0 6px 18px rgba(0,0,0,.25)}
.title-contrast{background:linear-gradient(180deg,rgba(255,217,81,.06),rgba(11,13,40,0));border-bottom:1px solid rgba(255,217,81,.10)}
.divider-contrast{border-color:rgba(255,217,81,.10)!important}.text-dim{color:rgba(234,240,255,.75)}
.btn-tonal{background:rgba(255,217,81,.12)!important;color:#ffd951!important;border:1px solid rgba(255,217,81,.24)!important}
.btn-icon{width:34px!important;height:34px!important;min-width:34px!important;border-radius:10px!important;padding:0!important;display:flex;align-items:center;justify-content:center}
.btn-icon :deep(.v-icon){font-size:20px!important}
.chip-strong{font-weight:700;color:#0b0d28!important}
.chip-outline{color:#eaf0ff!important;border-color:rgba(234,240,255,.28)!important;background:rgba(234,240,255,.07)!important;box-shadow:0 4px 12px rgba(0,0,0,.6);font-weight:600;height:22px;line-height:1;border-radius:6px;padding:0 8px;font-size:12px;display:inline-flex}
.chip-count{font-weight:800;color:#eaf0ff!important;background:#1b5e20!important}
.tabs-compact{overflow-x:auto}
.tab-compact{text-transform:none!important;font-weight:700!important;font-size:.78rem!important;letter-spacing:.02em!important;min-width:92px!important;padding:0 10px!important;height:34px!important}
:deep(.v-tab.v-tab--selected){background:rgba(255,217,81,.18)!important;box-shadow:inset 0 0 6px rgba(255,217,81,.25);color:#fff3bf!important;opacity:1!important;font-weight:800!important}
.palcos-viewport{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}
.palcos-layout{display:grid;grid-template-columns:1fr 2fr 1fr;gap:24px;width:100%;max-width:100%}
@media(min-width:1440px){.palcos-layout{grid-template-columns:1.1fr 2fr 1.1fr;gap:32px}}
@media(max-width:1100px){.palcos-layout{grid-template-columns:1fr 1.6fr 1fr;gap:20px}}
@media(max-width:900px){.palcos-layout{grid-template-columns:1fr;gap:16px}}
.palco-block{background:rgba(11,13,40,.5);border:1px solid rgba(255,217,81,.14);border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,.6);display:flex;flex-direction:column;min-width:0}
.palco-header{padding:12px 16px;background:#1a1d38;border-bottom:1px solid rgba(255,217,81,.18);border-top-left-radius:16px;border-top-right-radius:16px;color:#ffd951;font-size:.8rem;font-weight:600;text-transform:uppercase;letter-spacing:.03em;display:flex;align-items:center;justify-content:space-between}
.palco-header-inner{display:flex;align-items:center;font-weight:600;color:#ffd951}.palco-title{line-height:1.2}
.palco-body{padding:16px;overflow-x:auto}.main-palco-body{padding:0 16px 16px;background:#0f122a}
.palco-footer{font-size:.7rem;line-height:1.2;color:rgba(234,240,255,.55);border-top:1px solid rgba(255,217,81,.08);padding:8px 16px 12px;text-align:center;text-transform:uppercase;letter-spacing:.05em}
.palcos-tabs-wrap{display:flex;flex-direction:column;gap:12px}.palcos-tabs{background:rgba(11,13,40,.6);border:1px solid rgba(255,217,81,.24);border-radius:12px;box-shadow:0 10px 24px rgba(0,0,0,.7);overflow:hidden}.palcos-window{background:transparent}
.grid-rows-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:6px}
.grid-rows{display:flex;flex-direction:column-reverse;gap:12px;min-width:max(480px,100%)}
.row{display:grid;grid-auto-flow:column;grid-template-columns:38px repeat(auto-fit,minmax(54px,1fr));gap:6px;align-items:center}
.row-label{position:sticky;left:0;z-index:1;text-align:center;font-weight:800;color:#0b0d28;background:#ffd951;border:1px solid rgba(255,217,81,.45);box-shadow:0 2px 6px rgba(0,0,0,.25);border-radius:8px;padding:5px 0;width:38px;font-size:.75rem;line-height:1.2}
.seat{min-width:54px;height:32px;border-radius:16px;font-weight:700;text-transform:none;box-shadow:0 1px 2px rgba(0,0,0,.25);background:#f3f5f9!important;color:#0b0d28!important;border:0!important;font-size:.75rem;line-height:1.2;justify-content:center;padding:0 8px}
.seat.present{background:#4caf50!important;color:#fff!important}.seat.assigned{background:#ffb300!important;color:#0b0d28!important}
.legend{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
.legend :deep(.chip-strong){font-weight:700;border:1px solid rgba(255,217,81,.24)!important;box-shadow:0 4px 12px rgba(0,0,0,.6);height:22px;line-height:1;border-radius:6px;padding:0 8px;font-size:12px;display:inline-flex}
.legend :deep(.chip-presente){background-color:#4caf50!important;color:#0b0d28!important}
.legend :deep(.chip-asignado){background-color:#ffb300!important;color:#0b0d28!important}
.table-wrap{width:100%;overflow-x:auto}
.present-table :deep(thead th){position:sticky;top:0;z-index:2;background:#0e1230!important;color:#eaf0ff!important;border-bottom:1px solid rgba(255,217,81,.14)!important}
.present-table :deep(tbody tr:nth-child(odd)){background:rgba(255,217,81,.03)}
.present-table :deep(td){border-bottom:1px solid rgba(255,217,81,.06)!important}
.chip-table{box-shadow:0 0 0 1px rgba(255,217,81,.18) inset}.font-mono{font-variant-numeric:tabular-nums}
.btn-text{color:#ffd951!important}.alert-contrast{background:rgba(255,217,81,.07)!important;border-color:rgba(255,217,81,.18)!important;color:#ffd951!important}
@media(max-width:600px){.legend :deep(.v-chip){height:20px;font-size:11px}.grid-rows{gap:10px;min-width:max(400px,100%)}.row{grid-template-columns:32px repeat(auto-fit,minmax(50px,1fr));gap:6px}.row-label{width:32px;padding:4px 0;font-size:.7rem}.seat{min-width:50px;height:30px;border-radius:14px;font-size:.7rem;padding:0 6px}}
.palco-lateral .grid-rows{min-width:max(560px,100%)!important}
.palco-lateral .palco-body,.palco-lateral .grid-rows-wrap{overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch;padding-bottom:6px}
@media(max-width:1500px) and (min-width:901px){.palcos-layout{grid-template-columns:1fr 1.5fr 1fr;gap:14px}.palco-body{padding:10px;overflow-x:hidden!important;overflow-y:hidden!important}.main-palco-body{padding:0 10px 10px}.grid-rows{gap:4px;min-width:100%!important}.row{grid-template-columns:22px repeat(auto-fit,minmax(32px,1fr));gap:2px}.row-label{width:22px;padding:2px 0;border-radius:5px;font-size:.6rem;line-height:1.05;font-weight:700}.seat{min-width:32px;height:18px;border-radius:9px;font-size:.58rem;line-height:1.05;padding:0 2px;font-weight:700}.palco-lateral .palco-body,.palco-lateral .grid-rows-wrap,.palco-principal .palco-body,.palco-principal .grid-rows-wrap{overflow-x:auto!important}}
@media(max-width:1200px) and (min-width:901px){.palcos-layout{grid-template-columns:1fr 1.4fr 1fr;gap:10px}.palco-body{padding:8px}.main-palco-body{padding:0 8px 8px}.grid-rows{gap:3px}.row{grid-template-columns:20px repeat(auto-fit,minmax(30px,1fr));gap:2px}.row-label{width:20px;padding:2px 0;font-size:.55rem;line-height:1.05;border-radius:4px}.seat{min-width:30px;height:16px;border-radius:8px;font-size:.5rem;line-height:1.05;padding:0 2px}.palco-lateral .palco-body,.palco-lateral .grid-rows-wrap,.palco-principal .palco-body,.palco-principal .grid-rows-wrap{overflow-x:auto!important}}
@media(min-width:901px){.palcos-layout{min-width:1560px}.palco-body,.grid-rows-wrap{overflow-x:visible!important}}
@media(max-width:900px){.palcos-window .palco-body,.palcos-window .grid-rows-wrap{overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch}.palcos-window .grid-rows{min-width:max(480px,100%)!important}.palcos-window .palco-lateral .palco-body,.palcos-window .palco-lateral .grid-rows-wrap,.palcos-window .palco-principal .palco-body,.palcos-window .palco-principal .grid-rows-wrap{overflow-x:auto!important;overflow-y:hidden!important}.nowrap{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
</style>
