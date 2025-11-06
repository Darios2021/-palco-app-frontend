<template>
  <v-container class="py-8" fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <CheckInForm @checked-in="onCheckedIn" @error="onError" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import CheckInForm from '../components/CheckInForm.vue'
function onCheckedIn () {}
function onError () {}
</script>