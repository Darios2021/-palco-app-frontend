<template>
  <v-container class="py-10" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="text-h5">
            Bienvenido al Sistema de Control de Asistencia
          </v-card-title>

          <v-card-text class="text-body-1">
            <p>
              Esta aplicación permite gestionar el ingreso de invitados a un 
              <b>palco oficial</b> durante el evento gubernamental.
            </p>
            <ul>
              <li>Control de asistentes registrados previamente.</li>
              <li>Visualización del mapa de asientos y su ocupación.</li>
              <li>Asignación automática del asiento correspondiente.</li>
            </ul>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn color="primary" to="/checkin" prepend-icon="mdi-account-check">
              Ir al registro de asistencia
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
