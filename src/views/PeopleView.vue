<template>
  <v-container class="py-6" fluid>
    <!-- ALERTA ARRIBA -->
    <v-row justify="center" class="mb-4">
      <v-col cols="12" lg="10">
        <v-alert
          type="info"
          variant="tonal"
          class="mb-4"
        >
          Gestioná el <b>personal</b> que asistirá al palco. Podés crear, editar,
          eliminar y <b>asignar asientos</b>. No se permiten asientos duplicados.
        </v-alert>
      </v-col>
    </v-row>

    <!-- CONTENIDO PRINCIPAL EN COLUMNA -->
    <v-row justify="center" align="start" dense>
      <v-col cols="12" lg="10" class="mb-6">
        <!-- FORM NUEVA / EDITAR PERSONA -->
        <PersonForm
          :model-value="editing"
          @saved="onSaved"
        />
      </v-col>

      <v-col cols="12" lg="10">
        <!-- TABLA LISTADO DE PERSONAL -->
        <PeopleTable
          @edit="startEdit"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSeatsStore } from '../stores'
import PersonForm from '../components/PersonForm.vue'
import PeopleTable from '../components/PeopleTable.vue'

const store = useSeatsStore()

// cargamos datos iniciales una sola vez
onMounted(() => {
  store.ensureLoaded()
})

// persona que se está editando en el formulario
const editing = ref(null)

// cuando clickeás "editar" desde la tabla
function startEdit(item) {
  editing.value = item
}

// cuando el form guarda (crear o editar) reseteamos edición
function onSaved() {
  editing.value = null
}
</script>
