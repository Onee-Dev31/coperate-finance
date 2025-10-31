<template>
  <v-container class="mt-4 ">
    <div class="pa-4">
      <center>
        <h2>Change Password</h2>
      </center>
      <v-row class="mt-4">

        <v-col class="d-md-inline-flex  " cols="12">
          <v-text-field v-model="cur_pass" label="รหัสผ่านปัจจุบัน" type="password" :rules="[v => !!v || 'กรุณากรอกรหัสผ่านปัจจุบัน', v => (v && v.length >= 8) || 'รหัสผ่านต้องไม่ต่ำกว่า 8 หลัก']" require solo>
          </v-text-field>
        </v-col>
        <v-col class="d-md-inline-flex  " cols="12">
          <v-text-field v-model="new_pass" label="รหัสผ่านใหม่" type="password" :rules="[v => !!v || 'กรุณากรอกรหัสผ่านใหม่', v => (v && v.length >= 8) || 'รหัสผ่านต้องไม่ต่ำกว่า 8 หลัก']" require solo>
          </v-text-field>
        </v-col>
        <v-col class="d-md-inline-flex  " cols="12">
          <v-text-field v-model="conf_pass" label="ยืนยันรหัสผ่าน" type="password" :rules="[v => !!v || 'กรุณายืนยันรหัสผ่าน', v => (v && v.length >= 8) || 'รหัสผ่านต้องไม่ต่ำกว่า 8 หลัก']" require solo>
          </v-text-field>
        </v-col>
        <v-col class="d-md-inline-flex  " cols="12">
          <v-btn block color="#010545" @click="changePass" large>
            <font color="#ffffff">บันทึก</font>
          </v-btn>
        </v-col>
      </v-row>
      <p v-if="msg_err" class="red--text">{{ msg_err }}</p>{{  }}
      <p v-if="msg" class="green--text">{{ msg }}</p>{{ }}
    </div>
  </v-container>
</template>

<script>
import axios from 'axios'
// const API_URL = "http://localhost:3001/api"
const API_URL = "http://corf.oneeclick.co:3002/api";
export default {
  name: 'ChangePass',

  data: () => ({
    cur_pass: "",
    new_pass: "",
    conf_pass: "",
    msg_err: "",
    msg:"",
  }),
 
  methods: {
 
    changePass() {
      if (this.new_pass != this.conf_pass) {
        this.msg_err = "รหัสผ่านไม่ตรงกัน กรุณาลองใหม่อีกครั้ง..."
      } else if (this.cur_pass == "" || this.new_pass == "" || this.conf_pass == "") {
        this.msg_err = "กรุณากรอกข้อมูลให้ครบ..."
      } else {
         axios
           .post(API_URL + '/user/changepass', { params: { user: localStorage.userID,c_pass: this.cur_pass, n_pass: this.new_pass} })
           .then(res => {
             console.log(res.data);
             this.msg = "เปลี่ยนรหัสผ่านเรียบร้อย กรุณาเข้าระบบใหม่อีกครั้ง..."
            // this.lobList = res.data
             setTimeout(() => {
               location.href = "/logout";
            },2000)
          })
      }
     
    },
  }
}
</script>

