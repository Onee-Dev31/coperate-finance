<template>
  <v-card
    class="mx-auto"
    width="600"
    outlined
    elevation="8"
  >
    <ChangePass />
  </v-card>
</template>

<script>
import ChangePass from '@/components/ChangePass.vue'

export default {
  name: 'ChangePassView',
  components: {
    ChangePass
  }
}
</script>
