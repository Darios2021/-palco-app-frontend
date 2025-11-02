<template>
  <v-container class="py-8" fluid>
    <!-- BLOQUE CHECK-IN -->
    <v-row justify="center">
      <v-col cols="12" lg="8" xl="6">
        <CheckInForm />
      </v-col>
    </v-row>

    <!-- BLOQUE MAPA + TABLA PRESENTES -->
    <v-row class="mt-6">
      <v-col cols="12" lg="12">
        <SeatMap />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import SeatMap from '../components/SeatMap.vue'
</script>
