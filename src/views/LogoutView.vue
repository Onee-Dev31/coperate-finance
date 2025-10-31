<template>
  <div class="about">
    <h1>Loading...</h1>
  </div>
</template>
<script>
// const API_URL = "http://localhost:3001/api"
const API_URL = "http://corf.oneeclick.co:3002/api";
import axios from 'axios'
export default {
  // name: 'LOGOUT',
  mounted() {
    try {
      axios({
        method: 'post',
        url: API_URL + '/user/logout',
        credentials: 'include',
      }).then(res => {
        this.$store.dispatch('setAuth', false);
        this.removeState();
        window.location.href = '/login'
        // location.reload();
        // this.$router.push('/login').catch(() => { });
        
      });
    } catch (err) {
      console.error(err)
      this.$store.dispatch('setAuth', false);
    }
  },
  methods: {
    removeState() {
      localStorage.clear();
      localStorage.removeItem('userID');
      localStorage.removeItem('name');
      localStorage.removeItem('lname');
      localStorage.removeItem('lob');
      localStorage.removeItem('avatar');
      localStorage.removeItem('reportDate')
    }
  }
}
</script>
