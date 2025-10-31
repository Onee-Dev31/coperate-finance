<template>
  <v-container class="mt-3 ml-1 ">
    <h2>ตัดตราสาร : &nbsp;&nbsp;{{bond.NoteNo}}</h2>
    <br/>
    <v-form 
      ref="form"
      v-model="inputForm" 
      @submit.prevent="onSubmit">

      <v-simple-table>
        <colgroup>
          <col width="20%" />
          <col width="80%" />
        </colgroup>
        <tr>
          <td>
            <p class="mt-n2 mr-3 mlabel">วันที่ตัด<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-menu v-model="date1" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
              min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="expDate" label="Transaction Date" prepend-inner-icon="mdi-calendar" v-bind="attrs" v-on="on" style="width: 350px;" solo>
                </v-text-field>
              </template>
              <v-date-picker v-model="expDate" locale="th" no-title @input="date1 = false" @change="setDate" :min="bond.startDate" ></v-date-picker>
            </v-menu>
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <p class="mt-n5">{{ expDateTH }}</p>
          </td>
        </tr>
        <tr>
          <td>
            <p class="mt-n2 mr-3 mlabel">เหตุผล&nbsp;:</p>
          </td>
          <td>
            <v-combobox v-model="expReason" :items="descList" :search-input.sync="search" clearable label="" solo>
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      "<strong>{{ search }}</strong>". กรุณากดปุ่ม <kbd>enter</kbd> เพื่อสร้างข้อมูลใหม่
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-combobox>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <p style="color:red;font-size:0.9rem;">{{err_msg}}</p>
          </td>
        </tr>
        <tr>
          <td colspan="2" class="justify-center text-center">
            <v-btn elevation="2" large @click="$router.go(-1)">ยกเลิก</v-btn>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <v-btn type="submit" color="primary" elevation="2" large>บันทึกข้อมูล</v-btn>
          </td>
        </tr>
      </v-simple-table>
    </v-form>
    <br/>
    <v-simple-table >
      <template v-slot:default>
        <tbody>
          <tr>
            <td>เคลียร์เงินต้น</td>
            <td class="text-right">{{ formatNumber(bond.NoteAmt,2)}}</td>
          </tr>
          <tr>
            <td>ดอกเบี้ยทั้งหมด</td>
            <td class="text-right">{{ formatNumber(bond.SumNoteInt,2) }}</td>
          </tr>
          <tr>
            <td>รับดอกเบี้ย</td>
            <td class="text-right">{{ formatNumber(bond.SumBenefitAmt,2) }}</td>
          </tr>
          <tr>
            <td>ปรับปรุงดอกเบี้ย</td>
            <td class="text-right">{{ formatNumber(bond.AdjustInt,2) }}</td>
          </tr>
          <tr>
            <td>ดอกเบี้ยคงค้างสุทธิ</td>
            <td class="text-right">
              <font color="red">{{ formatNumber(bond.NoteIntAmt,2) }}</font>
            </td>
          </tr>
    
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>
<style>
.mlabel {
  text-align: right;
  font-size: 0.9rem;
}
</style>
<script>
import axios from "axios";
import * as mylib from '@/app'
// const API_URL = "http://localhost:3001/api"
const API_URL = "http://corf.oneeclick.co:3002/api";
export default {
  name: 'ExBondInputForm',
  data: ()=>({
    inputForm: true,
    id: '',
    docType: '',
    institute: '',
    expReason: '',
    expDate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10), 
    date1: '',
    noteNo: '',
    noteType: '',
    noteDate: '',
    interest: 0,
    benefitAmt: 0,
    adjInt: 0,
    intNet:0,
    totalBond: 0,
    bond: [],
    allBond: [],
    descList:[],
    loading: false,
    search: '',
    err_msg: '',
    expDateTH:''
  }),
  created() {

    this.id = this.$route.query.id;
    // console.log(this.expDate, "--", this.$route.query.id)
    
    this.getBondDetail();
    axios
      .get(API_URL + "/bond/getexpreason")
      .then(res => {
        this.descList = res.data;
      })
    this.expDateTH = mylib.setDateTH(this.expDate);
  },
  mounted() {
    
  },
  methods: {
    formatNumber(num) {
      return mylib.formatNumber(num, 2);
    },
    validate() {
      this.$refs.form.validate()
    },
    reset() {
      this.$refs.form.reset()
    },
    resetValidation() {
      this.$refs.form.resetValidation()
    },
    async onSubmit() {
      if (this.expDate != "") {
        await axios
          .post(API_URL + "/bond/update/exp", {
            params: {
              id: this.id,
              date: this.expDate,
              reason: this.expReason,
              userId : localStorage.userID,
              status:2
            }
          })
          .then(res => {
            // console.log("success!!")
            this.$router.push({ name: '/bond/detail', query: { id: this.id, lob: localStorage.lob, menu: this.$route.query.menu }}).catch(()=>{});
          })
          .catch(err => {
            console.error(err);
            // this.err_msg = (err.response.data.msg == null ? "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง..." : err.response.data.msg);
            // this.err_code = err.response.request.status;
          });
      }else{
        this.err_msg = "กรุณากรอกข้อมูลให้ครบ...";
      }
      
    },
    setDate(e){
      // console.log(e)
      this.expDate = e;
      this.getBondDetail();
      this.expDateTH = mylib.setDateTH(e);
    },
    getBondDetail(){
      // console.log("getBondDetail::",this.id,"-",this.expDate,"-",localStorage.lob)
      axios
      .get(API_URL + '/bond/report_transection', { params: { id: this.id, date: this.expDate, lob: localStorage.lob } })
      .then(res => {
        this.bond = res.data[0];
        // console.log(this.bond);
      })
    }
  }
  
}

</script>

