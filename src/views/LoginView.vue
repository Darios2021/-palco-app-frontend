<template>
  <div class="auth-wrap">
    <v-card class="auth-card" rounded="xl" elevation="4">
      <v-card-title class="py-4 px-6">
        <div class="d-flex align-center gap-2">
          <v-icon>mdi-lock</v-icon>
          <span class="text-h6">Ingresar</span>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="px-6 py-5">
        <v-form @submit.prevent="onSubmit">
          <v-text-field
            v-model="email"
            type="email"
            label="Email"
            autocomplete="username"
            prepend-inner-icon="mdi-email-outline"
            variant="solo-filled"
            density="comfortable"
            :disabled="auth.loading"
            required
          />
          <v-text-field
            v-model="password"
            :type="show ? 'text' : 'password'"
            label="Contraseña"
            autocomplete="current-password"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="show ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="show = !show"
            variant="solo-filled"
            density="comfortable"
            :disabled="auth.loading"
            required
          />
          <v-alert
            v-if="errorMsg"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-3"
          >
            {{ errorMsg }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            block
            class="text-white"
            :loading="auth.loading"
          >
            Ingresar
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/stores/auth'

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const email = ref('demo@acme.test')       // comodín para probar
const password = ref('Demo1234!')
const show = ref(false)
const errorMsg = ref('')

async function onSubmit () {
  errorMsg.value = ''
  try {
    const ok = await auth.login(email.value, password.value)
    if (ok) {
      // destino original o home
      const to = route.query.redirect || '/'
      router.replace(String(to))
    }
  } catch (e) {
    errorMsg.value = 'Credenciales inválidas'
  }
}

// Si ya está logueado y visita /login, redirigimos
onMounted(() => {
  if (auth.isAuth) router.replace(String(route.query.redirect || '/'))
})

// También redirige ni bien se loguea (por si el token llega asíncrono)
watch(() => auth.isAuth, (v) => {
  if (v) router.replace(String(route.query.redirect || '/'))
})
</script>

<style scoped>
.auth-wrap{
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(180deg, rgba(255,217,81,.06), rgba(11,13,40,0));
}
.auth-card{ width: min(440px, 95vw); }
</style>
