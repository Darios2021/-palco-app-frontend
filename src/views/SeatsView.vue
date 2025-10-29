<template>
  <v-container class="py-8" fluid>
    <v-row justify="center">
      <v-col cols="12" lg="8">
        <CheckInForm />
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-6">
      <v-col cols="12" lg="8">
        <SeatMap />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>

import SeatMap from '../components/SeatMap.vue'
</script>
