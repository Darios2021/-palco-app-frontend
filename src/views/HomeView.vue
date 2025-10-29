<!-- src/views/HomeView.vue -->
<template>
  <v-container class="home-wrap" fluid>
    <v-row class="justify-center">
      <!-- ===== HERO ===== -->
      <v-col cols="12" md="10" lg="9">
        <v-card class="hero" rounded="xl" elevation="2">
          <v-card-text class="py-8 px-6 px-md-10">
            <div class="d-flex flex-column flex-md-row align-center">
              <div class="flex-grow-1">
                <div class="hero-kicker mb-2">Sistema de Control de Asistencia</div>
                <h1 class="hero-title text-h5 text-md-h4 mb-3">
                  Gestión ágil de ingreso al <span class="accent">Palco Oficial</span>
                </h1>
                <p class="hero-sub text-body-1 text-medium-emphasis mb-6">
                  Registrá presentes, visualizá la ocupación de asientos y asigná lugares en segundos.
                </p>

                <!-- === BOTONES/CTAs === -->
                <div class="d-flex flex-wrap btn-row">
                  <v-btn
                    class="cta"
                    size="large"
                    rounded="xl"
                    :ripple="false"
                    prepend-icon="mdi-account-check"
                    :to="{ name: 'checkin' }"
                  >
                    Ir al Check-In
                  </v-btn>

                  <v-btn
                    class="cta-outline"
                    variant="outlined"
                    size="large"
                    rounded="xl"
                    :ripple="false"
                    prepend-icon="mdi-seat"
                    :to="{ name: 'asientos' }"
                  >
                    Ver mapa de asientos
                  </v-btn>
                </div>
              </div>

              <div class="hero-badge mt-8 mt-md-0 ml-md-8">
                <div class="badge-inner">
                  <v-icon size="40">mdi-shield-check</v-icon>
                  <div class="badge-text">
                    <strong>Operativo</strong>
                    <small>Optimizado para evento</small>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- ===== FEATURES / ACCESOS RÁPIDOS ===== -->
      <v-col cols="12" md="10" lg="9" class="mt-6">
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-card class="feature-card" rounded="xl" elevation="2" :to="{ name: 'checkin' }" link>
              <v-card-text class="py-5 d-flex align-center">
                <v-avatar size="40" class="mr-4 feature-ico">
                  <v-icon>mdi-qrcode-scan</v-icon>
                </v-avatar>
                <div>
                  <div class="feature-title">Registro de Asistencia</div>
                  <div class="feature-sub">Check-In rápido y confiable</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card class="feature-card" rounded="xl" elevation="2" :to="{ name: 'asientos' }" link>
              <v-card-text class="py-5 d-flex align-center">
                <v-avatar size="40" class="mr-4 feature-ico">
                  <v-icon>mdi-seat</v-icon>
                </v-avatar>
                <div>
                  <div class="feature-title">Mapa de Asientos</div>
                  <div class="feature-sub">Ocupación en tiempo real</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card class="feature-card" rounded="xl" elevation="2" :to="{ name: 'personas' }" link>
              <v-card-text class="py-5 d-flex align-center">
                <v-avatar size="40" class="mr-4 feature-ico">
                  <v-icon>mdi-account-group-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="feature-title">Gestión de Personas</div>
                  <div class="feature-sub">Altas, edición y asignación</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- ===== INFO BREVE ===== -->
      <v-col cols="12" md="10" lg="9" class="mt-4">
        <v-card rounded="xl" elevation="1" class="info-card">
          <v-card-text class="py-6 px-6">
            <div class="d-flex flex-column flex-md-row">
              <div class="flex-grow-1">
                <div class="info-title mb-2">
                  ¿Qué podés hacer acá?
                </div>
                <ul class="info-list">
                  <li>Controlar asistentes registrados y marcar presentes.</li>
                  <li>Visualizar el mapa por filas y estados <span class="chip present">Presente</span>, <span class="chip assigned">Asignado</span> y <span class="chip free">Libre</span>.</li>
                  <li>Asignar/editar asientos de manera segura y rápida.</li>
                </ul>
              </div>
              <div class="mt-6 mt-md-0 ml-md-8">
                <v-btn color="secondary" variant="tonal" :to="{ name: 'home' }" prepend-icon="mdi-information-outline">
                  Ver guía rápida
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// sin lógica extra
</script>

<style scoped>
/* ===== Layout base del Home ===== */
.home-wrap {
  padding-top: clamp(28px, 5vw, 48px);
  padding-bottom: clamp(24px, 5vw, 48px);
}

/* ===== HERO ===== */
.hero {
  background: linear-gradient(
      180deg,
      rgba(255, 217, 81, 0.06) 0%,
      rgba(11, 13, 40, 0.0) 100%
    ),
    var(--hero-surface, #0e1230);
  color: var(--hero-fore, #eaf0ff);
  border: 1px solid rgba(255, 217, 81, 0.12);
}

.hero-kicker {
  color: #ffd951;
  font-weight: 700;
  letter-spacing: .6px;
  text-transform: uppercase;
  font-size: .85rem;
}

.hero-title { font-weight: 800; line-height: 1.2; }
.hero-title .accent { color: #ffd951; }

.hero-sub { max-width: 58ch; }

/* badge lateral (desktop) / inferior (mobile) */
.hero-badge .badge-inner {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(255, 217, 81, 0.12);
  color: #ffd951;
  border: 1px solid rgba(255, 217, 81, 0.24);
}
.hero-badge .badge-text { display: inline-flex; gap: 6px; align-items: baseline; }
.hero-badge .badge-text small { opacity: .85; }

/* ===== BOTONES (CTAs) ===== */
.btn-row { gap: 12px; }

.cta {
  --btn-bg: #ffd951;
  --btn-fg: #0b0d28;
  background: var(--btn-bg) !important;
  color: var(--btn-fg) !important;
  font-weight: 800;
  text-transform: none;
  letter-spacing: .4px;
  padding-inline: 18px;
  border: 0 !important;
}
.cta :deep(.v-icon) { color: var(--btn-fg) !important; margin-right: 8px; }
.cta:hover { filter: brightness(0.96); }

.cta-outline {
  --btn-fg: #ffd951;
  color: var(--btn-fg) !important;
  border-color: var(--btn-fg) !important;
  border-width: 2px !important;
  font-weight: 800;
  text-transform: none;
  letter-spacing: .4px;
  padding-inline: 18px;
  background: transparent !important;
}
.cta-outline :deep(.v-icon) { color: var(--btn-fg) !important; margin-right: 8px; }
.cta-outline:hover { background: rgba(255, 217, 81, 0.12) !important; }

/* Evitar overlays/oscurecidos de Vuetify en botones */
.cta :deep(.v-btn__overlay),
.cta-outline :deep(.v-btn__overlay) { opacity: 0 !important; }

/* ===== FEATURES ===== */
.feature-card {
  background: #0e1230;
  color: #eaf0ff;
  border: 1px solid rgba(255, 217, 81, 0.12);
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,.20);
  border-color: rgba(255, 217, 81, 0.28);
}
.feature-ico {
  background: rgba(255, 217, 81, 0.18);
  color: #ffd951;
}
.feature-title { font-weight: 700; }
.feature-sub { opacity: .8; }

/* ===== INFO CARD ===== */
.info-card {
  background: #0e1230;
  color: #eaf0ff;
  border: 1px solid rgba(255, 217, 81, 0.10);
}
.info-title { font-weight: 800; font-size: 1.05rem; margin-bottom: 8px; }
.info-list { margin: 0; padding-left: 18px; }
.info-list li { margin: 6px 0; }

/* chips inline para leyenda */
.chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 700;
  font-size: .8rem;
  vertical-align: middle;
}
.chip.present  { background:#4caf50; color:#fff; }
.chip.assigned { background:#ffb300; color:#000; }
.chip.free     { background:#eeeeee; color:#333; }

/* ===== Responsive tweaks ===== */
@media (max-width: 600px) {
  .hero-title { font-size: 1.35rem !important; }
  .hero-sub { font-size: .98rem; }
  .feature-card { margin-bottom: 8px; }
  .cta, .cta-outline { width: 100%; justify-content: center; }
}
</style>
