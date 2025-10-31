<template>
  <v-card
    class="mx-auto"
    width="600"
    outlined
    elevation="8"
  >
    <Login />
  </v-card>
</template>
<script>
import Login from '@/components/Login.vue'
export default {
  name: 'LoginView',
  components: {
    Login
  }
}
</script>
