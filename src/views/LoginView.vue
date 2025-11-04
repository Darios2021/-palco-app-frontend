<!-- src/views/LoginView.vue · Copy-Paste final -->
<template>
  <v-container fluid class="login-bg d-flex align-center justify-center">
    <v-card class="login-card" elevation="10" rounded="lg">
      <!-- Top accent like Axon (yellow line) -->
      <div class="accent-top" />

      <!-- Header: Organización + subdominio -->
      <header class="login-header">
        <h2 class="org">Control de Acceso de Palcos</h2>
        <div class="subdomain">Power by Carolina Contreras</div>
      </header>

      <v-divider class="divider" />

      <v-card-text class="pt-5 pb-1">
        <h3 class="form-title">Identificación</h3>

        <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
          <!-- Email -->
          <label class="field-label"
            >Usuario <span class="req">*</span></label
          >
          <v-text-field
            v-model="email"
            variant="outlined"
            color="yellow-darken-2"
            density="comfortable"
            class="mb-4 field"
            :rules="emailRules"
            autocomplete="email"
            prepend-inner-icon="mdi-email-outline"
            hide-details="auto"
          />

          <!-- Password -->
          <label class="field-label">Contraseña <span class="req">*</span></label>
          <v-text-field
            v-model="password"
            :type="show ? 'text' : 'password'"
            variant="outlined"
            color="yellow-darken-2"
            density="comfortable"
            class="mb-1 field"
            :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="show = !show"
            prepend-inner-icon="mdi-lock-outline"
            autocomplete="current-password"
            :rules="passwordRules"
            hide-details="auto"
          />

          <v-alert
            v-if="errorLogin"
            type="error"
            variant="tonal"
            class="mt-4"
          >
            Invalid email/username or password.
          </v-alert>

          <v-btn
            block
            size="large"
            color="yellow-darken-2"
            class="mt-6 text-none sign-btn"
            :loading="auth.loading"
            :disabled="!valid"
            type="submit"
          >
            Ingresar
          </v-btn>

          <div class="links mt-6">
            <a href="#" @click.prevent="onForgot">Olvidaste la contraseña?</a>
            <span class="sep">|</span>
            <a href="#" @click.prevent="onNoAccount">No tienes credenciales?</a>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'

const auth = useAuth()
const router = useRouter()

const email = ref('demo@acme.test')
const password = ref('Demo1234!')
const show = ref(false)
const valid = ref(false)
const form = ref(null)
const errorLogin = ref(false)

const emailRules = [
  v => !!v || 'Required',
  v => /.+@.+\..+/.test(v) || 'Enter a valid email',
]
const passwordRules = [v => !!v || 'Required']

async function onSubmit() {
  errorLogin.value = false
  const res = await form.value?.validate()
  if (!res?.valid) return
  try {
    const ok = await auth.login(email.value, password.value)
    if (ok) router.replace({ name: 'home' })
  } catch {
    errorLogin.value = true
  }
}

function onForgot() {
  // placeholder; enlazá a tu ruta/URL real si corresponde
  alert('Contactá al administrador para restablecer tu contraseña.')
}
function onNoAccount() {
  alert('Solicitá el alta de usuario al administrador del sistema.')
}
</script>

<style scoped>
/* ===== Lienzo oscuro y centrado */
.login-bg {
  min-height: 100vh;
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(255,217,81,.06), rgba(11,13,40,0)),
    #0b0d28;
  padding: 24px;
}

/* ===== Tarjeta estilo Axon */
.login-card {
  background: #1b1f33;                /* gris azulado profundo */
  border: 1px solid rgba(255,217,81,.12);
  max-width: 420px;
  width: 100%;
  overflow: hidden;
}
.accent-top {
  height: 6px;
  background: #ffd951;                 /* línea superior amarilla */
}

/* ===== Encabezado */
.login-header {
  padding: 18px 22px 14px;
  background: #20243a;
}
.org {
  margin: 0 0 6px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #eaf0ff;
  line-height: 1.25;
}
.subdomain {
  color: #97a0c0;
  font-size: 0.875rem;
}
.divider {
  border-color: rgba(255,217,81,.08) !important;
}

/* ===== Formulario */
.form-title {
  color: #eaf0ff;
  font-weight: 700;
  font-size: 1.15rem;
  margin-bottom: 14px;
}
.field-label {
  display: block;
  color: #c9d2ff;
  font-size: 0.85rem;
  margin-bottom: 6px;
}
.req { color: #ff6b6b; }

.field :deep(.v-field) {
  background: #242941 !important;
  border-radius: 8px;
}
.field :deep(.v-field--variant-outlined .v-field__outline__start),
.field :deep(.v-field--variant-outlined .v-field__outline__end) {
  border-color: rgba(151,160,192,.35) !important;
}
.field :deep(.v-field--focused .v-field__outline__start),
.field :deep(.v-field--focused .v-field__outline__end) {
  border-color: #ffd951 !important;
}
.field :deep(.v-field__input),
.field :deep(.v-label) {
  color: #eaf0ff !important;
}

/* Botón principal */
.sign-btn {
  color: #0b0d28 !important;
  font-weight: 700;
}

/* Links inferiores */
.links {
  display: flex;
  justify-content: center;
  gap: 10px;
  color: #a9b3d9;
  font-size: 0.92rem;
}
.links a {
  color: #a9b3d9;
  text-decoration: none;
}
.links a:hover { text-decoration: underline; }
.sep { opacity: .6; }

/* Ajustes responsivos suaves */
@media (max-width: 420px) {
  .login-card { max-width: 360px; }
  .org { font-size: .98rem; }
  .subdomain { font-size: .82rem; }
}
</style>
