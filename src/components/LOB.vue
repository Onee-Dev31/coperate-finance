<template>
  <v-container class="mt-4 ">
    <div class="pa-4">
      <center>
        <h2>Line Of Bussiness (LOB)</h2>
      </center>
      <v-row class="mt-4">
        <v-col class="d-md-inline-flex  " cols="9">
          <v-select v-model="lob" :items="lobList" label="LOB" item-text="name" item-value="id" solo>
          </v-select>
        </v-col>
        <v-col class="d-md-inline-flex  " cols="1">
          <v-btn block color="#010545" @click="setLOB" large>
            <font color="#ffffff">บันทึก</font>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import axios from 'axios'
// const API_URL = "http://localhost:3001/api"
const API_URL = "http://corf.oneeclick.co:3002/api";
export default {
  name: 'LOB',
  props: {
    msg: String
  },
  data: () => ({
    lob: "",
    lobList: [],
  }),
  created() {
    if (localStorage.lob) {
      this.lob = localStorage.lob;
      this.getLOB();
    }
    
  },
 
  methods: {
    setLOB() {
      localStorage.lob = this.lob;
      localStorage.lobName = this.lobList.find(x => x.id === this.lob).name
      location.reload();
    },
    getLOB() {
      axios
        .get(API_URL + '/master/lob')
        .then(res => {
          this.lobList = res.data
        })
    },
  }
}
</script>

