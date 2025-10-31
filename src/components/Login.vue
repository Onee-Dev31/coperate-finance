<template>
  <v-container class=" mt-4">
      <center><v-img src="../../public/CorPorate.png" width="400px"></v-img></center>  
      <form  @submit.prevent="login">
      <v-row class="mt-3 mb-6" >
        <v-col class="ml-3">
          <v-text-field v-model="username" label="Username" required ></v-text-field>
        </v-col>
      </v-row>
      <v-row class="mb-3">
        <v-col class="ml-3">
          <v-text-field v-model="pass" type="password" label="Password" required></v-text-field>
        </v-col>
      </v-row>
      <div v-if="errMsg">
        <font color="red" size="2">{{errMsg}}</font>
        <br/>
        <br/>
      </div>
      
      <v-row class="mb-6">
        <v-col>
          <v-btn block type="submit" color="#000000" ><font color="#ffffff">Login</font></v-btn>
        </v-col>
      </v-row>
      </form>
  </v-container>
</template>

<script>
// const API_URL = "http://localhost:3001/api"
const API_URL = "http://corf.oneeclick.co:3002/api";
import axios from 'axios'
export default {
  name: 'LOB',
  props: {
    msg: String
  },
  data: ()=>({
    username:'',
    pass: '',
    errMsg:'',
    lobList :[]
  }),
  created() {
    axios
      .get(API_URL + '/master/lob')
      .then(res => {
        this.lobList = res.data
      })
  },
  methods: {
    login() {
      // try{
        if(this.username!="" && this.pass!=""){
          axios({
            method: 'post',
            url: API_URL + '/user/login',
            credentials: 'include',
            data: {
              user: this.username,
              pass: this.pass,
            },
          }).then(res => {
            this.$store.dispatch('setAuth', true);
            localStorage.userID = res.data[0].user_id;
            // localStorage.name = res.data[0].name;
            // localStorage.lname = res.data[0].lastname;
            localStorage.lob = res.data[0].lob;
            localStorage.avatar = (res.data[0].name).substring(0, 1) + (res.data[0].lastname).substring(0, 1);
            localStorage.chkstamp = parseInt(Date.now()) +(4 * 60 * 60 * 1000); //expireIn 4h
            this.setLobName(this.lobList);
            window.location.href = '/lob'
          }).catch(error => {
            this.$store.dispatch('setAuth', false);
            // console.log(error.response.data.message)
            this.errMsg = error.response.data.message;
          }) 
        }
    },
    setLobName(list){
      list.forEach(e => {
        if(e.id===localStorage.lob){
          localStorage.lobName = e.name;
        }
      });
    }
  }
}
</script>

