<template>
  <v-container class="py-6" fluid>
    <v-row justify="center" class="mb-4">
      <v-col cols="12" lg="10">
        <v-alert type="info" variant="tonal" class="mb-4">
          Gestioná el <b>personal</b> que asistirá al palco. Podés crear, editar, eliminar y
          <b>asignar asientos</b>. No se permiten asientos duplicados.
        </v-alert>
      </v-col>
    </v-row>

    <v-row justify="center" align="start" dense>
      <v-col cols="12" lg="4">
        <PersonForm :model-value="editing" @saved="onSaved" />
      </v-col>
      <v-col cols="12" lg="6">
        <PeopleTable @edit="startEdit" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useSeatsStore } from '../stores'
import PersonForm from '../components/PersonForm.vue'
import PeopleTable from '../components/PeopleTable.vue'

const store = useSeatsStore()
onMounted(() => store.ensureLoaded())   // fuente única de datos, reactividad total

const editing = ref(null)
function startEdit(item) { editing.value = item }
function onSaved() { editing.value = null }
</script>
