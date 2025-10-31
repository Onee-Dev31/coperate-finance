
<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app v-if="auth">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            Corporate Finance
          </v-list-item-title>
          <v-list-item-subtitle>
            ONEE
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-divider></v-divider>
      
      <v-list dense nav  v-if="auth">
        
        <v-list-item key="LOB" href="/lob" link >
          <v-list-item-content color="blue">
            <v-list-item-title>&nbsp;&nbsp;&nbsp;LOB</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item key="ข้อมูลเงินฝากสถาบันการเงิน" href="/deposit" link>
          <v-list-item-content>
            <v-list-item-title>&nbsp;&nbsp;&nbsp;ข้อมูลเงินฝากสถาบันการเงิน</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-group nav no-action key='ข้อมูลเงินให้กู้ยืม'>
          <v-list-item slot='activator'>
      
            <v-list-item-title>&nbsp;ข้อมูลเงินให้กู้ยืม</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <div>
            <v-list-item key="ให้กู้ยืมกับบริษัทในเครือ" href="/borrower/4" link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <v-list-item-title>&nbsp;&nbsp;-&nbsp;&nbsp;ให้กู้ยืมกับบริษัทในเครือ</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item key="ให้กู้ยืมกับบริษัทอื่นๆ" href="/borrower/0" link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <v-list-item-title>&nbsp;&nbsp;-&nbsp;&nbsp;ให้กู้ยืมกับบริษัทอื่นๆ</v-list-item-title>
            </v-list-item>
          </div>
        </v-list-group>
      
        <v-divider></v-divider>
        <v-list-group nav no-action key='ข้อมูลเงินกู้ยืม'>
          <v-list-item slot='activator'>
      
            <v-list-item-title>&nbsp;ข้อมูลเงินกู้ยืม</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <div>
            <v-list-item key="เงินกู้ยืมจากบริษัทในเครือ" href="/lender/4" link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <v-list-item-title>&nbsp;&nbsp;-&nbsp;&nbsp;เงินกู้ยืมจากบริษัทในเครือ</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item key="เงินกู้ยืมกับบริษัทอื่นๆ" href="/lender/0" link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <v-list-item-title>&nbsp;&nbsp;-&nbsp;&nbsp;เงินกู้ยืมกับบริษัทอื่นๆ</v-list-item-title>
            </v-list-item>
          </div>
        </v-list-group>
        <v-divider></v-divider>
      
        
         <v-list-item key="ChangePass" href="/changepass" link >
            <v-list-item-content color="blue">
              <v-list-item-title>&nbsp;&nbsp;&nbsp;เปลี่ยนรหัสผ่าน</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        <v-divider></v-divider>
        <v-list-item key="Manual" href="/files/CorporateFinance-UserManual.pdf" target="_blank" link >
              <v-list-item-content color="blue">
                <v-list-item-title>&nbsp;&nbsp;&nbsp;คู่มือการใช้งาน</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          <v-divider></v-divider>
        <v-list-item key='Log Out' href="/logout" link>
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
            <v-list-item-title>ออกจากระบบ</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="#000000" dark height="100">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <div class="d-flex align-center">
        <a href="/">
        <v-img alt="ONEE Logo" class="shrink mr-2" contain src="./assets/LogoCorF2.png" transition="scale-transition"
          width="300" /> 
        </a>
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex align-left">
        <v-row>
          <v-col>
            <v-chip v-if="lobName"  class="ma-2" color="#131313" href="/lob" label>
              {{lobName}}
            </v-chip>
          </v-col>
          <v-col>
            <v-chip v-if="lobName" class="ma-2" color="#131313" href="/logout" label>
              ออกจากระบบ
            </v-chip>
          </v-col>
          <!-- <v-col>
            <p>ออกจากระบบ</p>
          </v-col> -->
          <v-col>
            <v-avatar v-if="avatarName" color="#3f91dd" size="40">
              <span class="white--text text-h6">{{avatarName}}</span>
              <!-- <v-menu>
                <v-list-item key='Log Out' href="/logout" link>
                  <v-list-item-icon>
                    <v-icon>mdi-logout</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>ออกจากระบบ</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-menu>-->
            </v-avatar> 
          </v-col>
        </v-row>
      </div>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
    <v-footer padless color="#000000">
      <v-col class="text-center" cols="12">
        <font color="#cbcacc">Copyright © 2022 THE ONE ENTERPRISE PCL.. All Rights Reserved</font>
      </v-col>
    </v-footer>
  </v-app>
</template>
<style>
.v-application {
  font-family: "Kanit", sans-serif !important;
  font-size: 0.8rem !important;
  /* font-weight: normal; */
  letter-spacing: 0.009375em !important;
  line-height: 1.75rem;
  /* font-family: "Roboto", sans-serif !important; */
}
</style>
<script src="vue.min.js"></script>
<!-- must place this line after vue.js -->
<script src="dist/vue-json-to-csv.min.js"></script>
<script>
// import useStore from 'vuex'
import axios from 'axios'
const API_URL = "http://localhost:3001/api"
// const API_URL = "http://10.10.0.46:3001/api";
// const API_URL = "http://10.10.0.28:3002/api";
export default {
  name: 'App',
  data: () => ({
    avatarName:(localStorage.avatar?(localStorage.avatar).toUpperCase():''),
    showMenu:null,
    drawer: null,
    lobName : localStorage.lobName,
    name : localStorage.name,
    lname : localStorage.lname,
    company:[],
    auth:false,
    tStamp: Date.now(),
  }),
 created(){
  // console.log("app::",this.auth)
  // console.log("CurTime:",this.tStamp)
  // console.log("chkTime:",localStorage.chkstamp)
  if(!localStorage.lob||(this.tStamp>localStorage.chkstamp)){
    this.$store.dispatch('setAuth', false);
    this.$router.push('/logout').catch(()=>{});
  }else{
    this.$store.dispatch('setAuth', true);
  }
  this.chkAuth();
 },
 beforeDestroy() {
  window.onbeforeunload = function(){
    localStorage.clear();
  }
},
 methods:{
  chkAuth(){
    this.auth = this.$store.state.authenticated;
  },
 }
};
</script>
