<template>
  <v-container class="mt-3 ml-1 ">
    <h2>บันทึกดอกเบี้ย</h2>
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
            <p class="mt-n2 mr-3 mlabel">ประเภท&nbsp;:</p>
          </td>
          <td>
            <v-select v-model="int_type" :items="intType" label="Interest Type" item-text="name" item-value="id"
              :rules="[v => !!v || 'Interest Type is required']" disabled solo></v-select>
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>
            <p class="mt-n2 mr-3 mlabel">ตราสาร&nbsp;:</p>
          </td>
          <td>
            <v-select v-model="docType" :items="docTypeList" label="Document Type" item-text="name" item-value="id"
              :rules="[v => !!v || 'Document Type is required']" disabled solo>
            </v-select>
          </td>
          <td>
            <p class="mt-n2 mr-3 mlabel">เลขที่ตราสาร&nbsp;:</p>
          </td>
          <td>
            <v-autocomplete v-model="noteNo" clearable label="Note No." :items="listNoteNo"
              :rules="[v => !!v || 'Note number is required']" disabled solo></v-autocomplete>
          </td>
        </tr>
        <tr>
          <td>
            <p class="mt-3 mr-3 mlabel">ประเภทการชำระ<font color="red">*</font>&nbsp;:</p>
          </td>
          <td colspan="3">
          <!-- <div class="d-flex justify-center"> -->
            <v-radio-group v-model="recType" row mandatory>
              <v-radio label="เช็ค" value="1"></v-radio>
              <v-radio label="เงินสด" value="2"></v-radio>
              <v-radio label="ฝากดอกเบี้ยต่อ" value="3"></v-radio>
            </v-radio-group>
          <!-- </div> -->
          </td>
        </tr>
        
        <tr v-if="(recType ==1)">
          <td>
            <p class="mt-n2 mr-3 mlabel">เช็คของธนาคาร<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-select v-model="institute" :items="bankList" label="Bank" item-text="name" item-value="id"
              :rules="[v => !!v || 'Bank is required']" require solo>
            </v-select>
          </td>
          <td>
            <p class="mt-n2 mr-3 mlabel">สาขา&nbsp;:</p>
          </td>
          <td>
            <v-combobox v-model="branch" :items="insBranch" :search-input.sync="searchBranch" label="Branch" clearable solo>
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      "<strong>{{ searchBranch }}</strong>". กรุณากดปุ่ม <kbd>enter</kbd> เพื่อสร้างข้อมูลใหม่
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-combobox>
          </td>
        </tr>
       
        <tr v-if="(recType ==1)">
          <td>
            <p class="mt-n2 mr-3 mlabel">เลขที่เช็ค<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-combobox v-model="cheque_no" :items="listChequeNo" :search-input.sync="searchCheque" label="Cheque No."
              :rules="[v => !!v || 'Cheque No is required']" require clearable solo>
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      "<strong>{{ searchCheque }}</strong>". กรุณากดปุ่ม <kbd>enter</kbd> เพื่อสร้างข้อมูลใหม่
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-combobox>
          </td>
          <td>
            <p class="mt-n2 mr-3 mlabel">วันที่เช็ค<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-menu v-model="date1" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
              min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="cheque_date" label="Cheque Date" prepend-inner-icon="mdi-calendar" v-bind="attrs"
                  :rules="[v => !!v || 'Cheque Date is required']" require v-on="on" solo>
                </v-text-field>
              </template>
              <v-date-picker v-model="cheque_date" locale="th" no-title @input="date1 = false" @change="setChequeDateTH"></v-date-picker>
            </v-menu>
          </td>
        </tr>
        <tr v-if="(recType ==1)">
          <td></td>
          <td></td>
          <td></td>
          <td>
            <p class="mt-n5">{{ chequeDateTH }}</p>
          </td>
        </tr>
        <tr>
          <td>
            <p class="mt-n2 mr-3 mlabel">วันที่รับจ่าย<font color="red">*</font>&nbsp;:</p>
          </td>
        <td>
          <v-menu v-model="date2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
            min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="transaction_date" label="Transaction Date" prepend-inner-icon="mdi-calendar" v-bind="attrs"
                v-on="on" solo>
              </v-text-field>
            </template>
            <v-date-picker v-model="transaction_date" locale="th" no-title @input="date2= false"  @change="setTransDateTH"></v-date-picker>
          </v-menu>
        </td>
        <td>
          <p class="mt-n2 mr-3 mlabel">จำนวนเงิน<font color="red">*</font>&nbsp;:</p>
        </td>
        <td>
          <v-text-field v-model="benefitAmt" type="text" value="units * 6000 + 2500 | number" @focus="clickFormatNumber"
            @change="setFormatNumber" @click="clickFormatNumber" label="Amount" :rules="[v => !!v || 'Amount is required']"
            require solo></v-text-field>
        </td>
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
            <p class="mt-n2 mr-3 mlabel">หมายเหตุ&nbsp;:</p>
          </td>
          <td colspan="3">
          <v-text-field v-model="description" label="Description" solo></v-text-field>
          </td>
        </tr>
        <tr>
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
  name: 'InterestInputForm',
  data: ()=>({
    err_msg:'',
    inputForm: true,
    noteNo: '',
    noteType:'',
    docType: '',
    institute: '',
    branch:'',
    cheque_no: '',
    description: '',
    transaction_date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10), 
    cheque_date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
    date1: false,
    date2: false,
    int_type: '',
    recType: '',
    searchCheque: '',
    searchBranch: '',
    transDateTH: '',
    chequeDateTH:'',
    benefitAmt: 0,
    company: [],
    insTypeList: [],
    insList: [],
    insBranch: [],
    listNoteNo: [],
    listChequeNo: [],
    bankList: [],
    docTypeList: [],
    intType: [{
      id: 'INT',
      name: "ดอกเบี้ยรับ"
    }, {
      id: 'INTEXP',
      name: "ดอกเบี้ยจ่าย"
    }],
  }),
  created() {
    axios
      .get(API_URL + "/master/doctype")
      .then(res => {
        this.docTypeList = res.data;
      })

    axios
      .get(API_URL + "/master/bank") 
      .then(res => {
        this.bankList = res.data;
      })

    axios
    .get(API_URL + "/bond/getnote", { params: { lob: localStorage.lob, type: '13' } })
      .then(res => {
        this.listNoteNo = res.data;
      })

    axios
      .get(API_URL + "/bond/getbranch")
      .then(res => {
        this.insBranch = res.data;
      })

    axios
      .get(API_URL + "/bond/getcheque")
      .then(res => {
        this.listChequeNo = res.data;
      })
    // console.log(this.$route.query.bondid)
    if (this.$route.query.bondid) {
      axios
        .get(API_URL + "/bond/report_transection", { params: { lob: localStorage.lob, id: this.$route.query.bondid } })
        .then(res => {
          console.log(res.data[0])
          this.int_type = (res.data[0].NoteTypeID == '1' || res.data[0].NoteTypeID == '3' ? 'INT' : 'INTEXP');
          this.docType = res.data[0].DocTypeCode;
          this.noteNo = res.data[0].NoteNo;
          this.noteType = res.data[0].NoteTypeID;
        })
    }

    if (this.chequeDate != "") {
      this.chequeDateTH = mylib.setDateTH(this.cheque_date);
    }
    this.transDateTH = mylib.setDateTH(this.transaction_date);
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
        this.benefitAmt = mylib.formatNumber(this.benefitAmt, 2)
      }
    },
    clickFormatNumber() {
      if (this.benefitAmt != "" && this.benefitAmt != null) {
        this.benefitAmt = this.benefitAmt.replaceAll(",", "");
      }
    },
    async onSubmit() {
      if (this.int_type != "" && this.benefitAmt !="" && this.transaction_date !="") {
        if(this.recType==1 && this.institute!="" && this.cheque_no !="" && this.cheque_date!="" ){
          await axios
          .post(API_URL + "/interest/create", {
            params: {
              lob: localStorage.lob,
              recType: this.recType,
              insCode : this.institute,
              insBranch: this.branch,
              chequeNo: this.cheque_no,
              chequeDate: this.cheque_date,
              transactionDate: this.transaction_date,
              docType: this.docType,
              inttitue: this.$route.query.insid,
              noteNo: this.noteNo,
              noteType: this.noteType,
              benefitType : this.int_type,
              benefitAmt: this.benefitAmt.replaceAll(",", ""),
              userId : localStorage.userID,
              description: this.description,
              bondId: this.$route.query.bondid 
            }
          })
          .then(res => {
            // console.log("success!!")
            this.$router.push({ name: '/bond/detail', query: { id: this.$route.query.bondid, lob: localStorage.lob, menu: this.$route.query.menu }}).catch(()=>{});
          })
          .catch(err => {
            console.error(err);
            // this.err_msg = (err.response.data.msg == null ? "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง..." : err.response.data.msg);
            // this.err_code = err.response.request.status;
          });
        }else if(this.recType!=1){
          await axios
          .post(API_URL + "/interest/create", {
            params: {
              lob: localStorage.lob,
              recType: this.recType,
              insCode : '',
              insBranch: '',
              chequeNo: '',
              chequeDate: '',
              transactionDate: this.transaction_date,
              docType: this.docType,
              noteNo: this.noteNo,
              noteType: this.noteType,
              inttitue: this.$route.query.insid,
              benefitType : this.int_type,
              benefitAmt: this.benefitAmt.replaceAll(",", ""),
              userId : localStorage.userID,
              description: this.description,
              bondId: this.$route.query.bondid 
            }
          })
          .then(res => {
            // console.log("success!!")
            this.$router.push({ name: '/bond/detail', query: { noteno: this.noteNo, lob: localStorage.lob, menu: this.$route.query.menu }}).catch(()=>{});
          })
          .catch(err => {
            console.error(err);
            // this.err_msg = (err.response.data.msg == null ? "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง..." : err.response.data.msg);
            // this.err_code = err.response.request.status;
          });
        }else{
          this.err_msg = "กรุณากรอกข้อมูลให้ครบ...";
        }
      }else{
          this.err_msg = "กรุณากรอกข้อมูลให้ครบ...";
      }
    },
    getBranch(e) {
      axios
        .get(API_URL + "/master/institute/branch/",{params:{bank:e}})
        .then(res => {
          this.branchList = res.data;
        })
    },
    setChequeDateTH(e) {
      this.chequeDateTH = mylib.setDateTH(e);
    },
    setTransDateTH(e) {
      this.transDateTH = mylib.setDateTH(e);
    }
  }
}
</script>

