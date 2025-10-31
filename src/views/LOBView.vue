<template>
  <v-card
    class="mx-auto"
    width="600"
    outlined
    elevation="8"
  >
    <LOB />
  </v-card>
</template>

<script>
import LOB from '@/components/LOB.vue'

export default {
  name: 'LOBView',
  components: {
    LOB
  }
}
</script>
