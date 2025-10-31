<template>
  <v-container class="mt-3 ml-1 ">
    <h2>ปรับดอกเบี้ย</h2>
    <v-form 
      ref="form"
      v-model="inputForm" 
      @submit.prevent="onSubmit">
      <v-simple-table>
        <colgroup>
          <col width="20%" />
          <col width="30%" />
          <col width="20%" />
          <col width="30%" />
        </colgroup>
        <tr>
          <td>
            <p class="mt-n2 mr-3 mlabel">วันที่มีผล<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-menu v-model="date1" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
              min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="transDate" label="" prepend-inner-icon="mdi-calendar" v-bind="attrs" v-on="on" solo>
                </v-text-field>
              </template>
              <v-date-picker v-model="transDate" locale="th" no-title :min="startDate" @input="date1 = false" @change="setDateTH"></v-date-picker>
            </v-menu>
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td>
            <p class="mt-n5">{{ transDateTH }}</p>
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>
            <p class="mt-n2 mr-3 mlabel">ตราสาร<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-select v-model="docType" :items="docTypeList" label="Document Type" item-text="name" item-value="id"
              :rules="[v => !!v || 'Document Type is required']" require solo>
            </v-select>
          </td>
          <td>
            <p class="mt-n2 mr-3 mlabel">เลขที่ตราสาร<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-autocomplete v-model="noteNo" clearable label="Note No." :items="listNoteNo"
              :rules="[v => !!v || 'Note number is required']" require solo></v-autocomplete>
          </td>
        </tr>
        <tr>
          <td>
            <p class="mt-n2 mr-3 mlabel">สถาบัน<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-select v-model="institute" :items="insList" label="Institue" item-text="name" item-value="id"
              :rules="[v => !!v || 'Institue is required']" require solo>
            </v-select>
          </td>
          <td>
            <p class="mt-n2 mr-3 mlabel">จำนวนเงิน<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-text-field v-model="amount" type="text" value="units * 6000 + 2500 | number" @focus="clickFormatNumber"
              @change="setFormatNumber" @click="clickFormatNumber" label="Amount" :rules="[v => !!v || 'Amount is required']"
              require solo></v-text-field>
          </td>
        </tr>
        <tr>
          <td>
            <p class="mt-n2 mr-3 mlabel">หมายเหตุ&nbsp;:</p>
          </td>
          <td colspan="3">
            <v-text-field v-model="description" solo></v-text-field>
          </td>
        </tr>
        <tr v-if="err_msg">
          <td colspan="4">
            <p style="color:red;font-size:0.9rem;">{{err_msg}}</p>
          </td>
        </tr>
        <tr>
          <td colspan="4" class="justify-center text-center">
            <v-btn elevation="2" large @click="$router.go(-1)">ยกเลิก</v-btn>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <v-btn type="submit" color="primary" elevation="2" large>บันทึกข้อมูล</v-btn>
          </td>
        </tr>
    </v-simple-table>
    </v-form>
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
  name: 'AdjustIntInputForm',
  data: ()=>({
    inputForm: true,
    err_msg:'',
    id: '',
    docType: '',
    institute: '',
    description: '',
    date1: '',
    noteNo: '',
    amount: '',
    transDateTH: '',
    startDate:'',
    transDate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10), 
    docTypeList: [],
    insList: [],
    listNoteNo: [],
    
  }),
  created() {
//  console.log("adj")
    axios
      .get(API_URL + "/master/doctype")
      .then(res => {
        this.docTypeList = res.data;
      })

    axios
      .get(API_URL + "/bond/getnote", { params: { lob: localStorage.lob, type: '13' } })
      .then(res => {
        // console.log(res.data)
        this.listNoteNo = res.data;
      })

    axios
      .get(API_URL + "/master/institute")
      .then(res => {
        // this.brokerList = res.data;
        this.insList = res.data;
      })

    axios
      .get(API_URL + "/bond/report_transection", { params: { lob: localStorage.lob, id: this.$route.query.bondid } })
      .then(res => {
        // console.log("get bond")
        // console.log(res.data)
        this.docType = res.data[0].DocTypeCode;
        this.noteNo = res.data[0].NoteNo;
        this.institute = res.data[0].Institute;
        this.startDate = res.data[0].startDate;
      })
    this.transDateTH = mylib.setDateTH(this.transDate)
  },
  methods: {
    validate() {
      this.$refs.form.validate()
    },
    reset() {
      this.$refs.form.reset()
    },
    resetValidation() {
      this.$refs.form.resetValidation()
    },
    setFormatNumber(e) {
      if (e != "") {
        this.amount = mylib.formatNumber(this.amount, 2)
      }
    },
    clickFormatNumber() {
      if (this.amount != "" && this.amount != null) {
        this.amount = this.amount.replaceAll(",", "");
      }
    },
    async onSubmit() {
      if (this.transDate != "" && this.institute !="" && this.docType!="" && this.noteNo !="" && this.amount!="") {
        await axios
          .post(API_URL + "/adjust/create", {
            params: {
              lob: localStorage.lob,
              id: this.id,
              insCode: this.institute,
              reportDate: this.transDate,
              docType: this.docType,
              noteNo: this.noteNo,
              amount: this.amount.replaceAll(",", ""),
              description : this.description,
              userId: localStorage.userID,
              bondId: this.$route.query.bondid 
            }
          })
          .then(res => {
            // console.log("success!!")
            this.$router.push({ name: '/bond/detail', query: { id: this.$route.query.bondid, doctype:this.docType, lob: localStorage.lob ,menu:this.$route.query.menu}}).catch(()=>{});
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
    setDateTH(e) {
      this.transDateTH = mylib.setDateTH(e)
    }
    
  }
  
}

</script>

