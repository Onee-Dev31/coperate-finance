<template>
  <v-container class="mt-3 ml-1 ">
    <h2>{{header_name}}</h2>
    <v-form 
      ref="form"
      v-model="inputForm" 
      @submit.prevent="onSubmit">

      <v-simple-table>
        <colgroup>
          <col width="13%" />
          <col width="20%" />
          <col width="13%" />
          <col width="20%" />
          <col width="13%" />
          <col width="20%" />
        </colgroup>
        <tr>
          <td>
            <p class="mt-n2 mr-2 mlabel">ตราสาร<font color="red">*</font>&nbsp;:&nbsp;&nbsp;</p>
          </td>
          <td>
            <v-select v-model="docType" :items="docTypeList" label="Document Type" item-text="name" item-value="id"
              :rules="[v => !!v || 'Document Type is required']" require solo>
            </v-select>
          </td>
          <td>
            <p v-if="mType==1" class="mt-n2 mr-2 mlabel">สถาบันธนาคาร<font color="red">*</font>&nbsp;:&nbsp;&nbsp;</p>
            <p v-if="mType==3" class="mt-n2 mr-2 mlabel">ผู้กู้ยืม<font color="red">*</font>&nbsp;:&nbsp;&nbsp;</p>
            <p v-if="mType==4" class="mt-n2 mr-2 mlabel">ผู้ให้กู้ยืม<font color="red">*</font>&nbsp;:&nbsp;&nbsp;</p>
          </td>
          <td>
            <v-select v-if="mType==1"  v-model="institute" :items="bankList" label="Bank" item-text="name" item-value="id"
              :rules="[v => !!v || 'Bank is required']" require solo>
            </v-select>
            <v-select  v-if="mType==3"  v-model="institute" :items="institueList" label="Borrower" item-text="name" item-value="id"
                :rules="[v => !!v || 'Borrower is required']" require solo>
              </v-select>
            <v-select v-if="mType==4"  v-model="institute" :items="institueList" label="Lender" item-text="name" item-value="id"
              :rules="[v => !!v || 'Lender is required']" require solo>
            </v-select>
          </td>
          <td>
            <p v-if="mType==1" class="mt-n2 mr-2 mlabel">สาขา&nbsp;:&nbsp;&nbsp;</p>
          </td>
          <td v-if="mType==1">
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
          <td v-else></td>
        </tr>
        <tr>
          <td>
            <p class="mt-n2 mr-2 mlabel">เลขที่ตราสาร<font color="red">*</font>&nbsp;:</p>
          </td>
          <td >
            <v-text-field v-model="noteNo" label="Note No." :rules="[v => !!v || 'Note number is required']" require
              solo ></v-text-field>
          </td>
          
          <!--  -->
          <td>
            <v-btn @click="chkBondNo" class="mt-n8 ml-4" >
              <v-icon :color="(statusBond==''?'black':(statusBond==0?'green':'red'))" right>
              mdi-checkbox-marked-circle
            </v-icon>&nbsp;&nbsp;ตรวจสอบ
          </v-btn>
          </td>
          <td><p class="mt-n2 ml-5" ><font :color="(statusMsgChkBond==0?'green':'red')">{{msgChkBond }}</font></p></td>
          <td>
            <p class="mt-n2 mr-2 mlabel">โบรคเกอร์&nbsp;:</p>
          </td>
          <td>
            <v-select v-model="broker" :items="brokerList" label="Broker" item-text="name" item-value="id" solo>
            </v-select>
          </td>
        </tr>
        <tr>
          <td>
            <p class="mt-n2 mr-2 mlabel">ประเภทอายุตราสาร<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-select v-model="aType" :items="ageType" label="Period Type" item-text="name" item-value="id"
              @change="calEnddate('AT')" :rules="[v => !!v || 'Period Type is required']" require solo>
            </v-select>
          </td>
          <td>
            <p class="mt-n2 mr-2 mlabel">ระยะเวลา&nbsp;:</p>
          </td>
          <td>
            <v-text-field v-model="times" type="number" label="Period" @keyup="calEnddate" @click="calEnddate('A')"
              solo></v-text-field>
          </td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <td>
            <p class="mt-n2 mr-2 mlabel">วันที่ซื้อตั๋ว<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-menu v-model="buy_date" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
              min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="note_date" label="Start Date" prepend-inner-icon="mdi-calendar" v-bind="attrs" v-on="on" solo>
                </v-text-field>
              </template>
              <v-date-picker v-model="note_date" locale="th" no-title @input="buy_date = false"
                @change="calEnddate('ND')"></v-date-picker>
            </v-menu>
            
          </td>
          <td>
            <p class="mt-n2 mr-2 mlabel">วันที่ออกตั๋ว<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-menu v-model="create_date" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
              min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="create_note_date" label="Start Date" prepend-inner-icon="mdi-calendar" v-bind="attrs" v-on="on"
                  solo>
                </v-text-field>
              </template>
              <v-date-picker v-model="create_note_date" locale="th" no-title @input="create_date = false"
                @change="calEnddate('CND')"></v-date-picker>
            </v-menu>
            
          </td>
          <td>
            <p class="mt-n2 mr-2 mlabel">วันที่สิ้นสุด&nbsp;:</p>
          </td>
          <td>
            <v-text-field
              v-model="ending_date"
              label="End Date"
              readonly solo
            ></v-text-field>
            <!-- <v-menu v-model="end_date" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y readonly
              min-width="auto">
              <template v-slot:activator="{ on, attrs }"> -->
                <!-- <v-text-field v-model="ending_date" label="End Date" prepend-inner-icon="mdi-calendar" v-bind="attrs" v-on="on" readonly solo>
                </v-text-field> -->
              <!-- </template>
              <v-date-picker v-model="ending_date" locale="th" no-title @input="end_date = false"></v-date-picker>
            </v-menu> -->
            
          </td>
        </tr>
        <tr>
          <td></td>
          <td><p class="mt-n5">{{ buyDateTH }}</p></td>
          <td></td>
          <td><p class="mt-n5">{{ createDateTH }}</p></td>
          <td></td>
          <td><p class="mt-n5">{{ endDateTH }}</p></td>
        </tr>
        
        <tr>
          <td>
           <p class="mt-n2 mr-2 mlabel"> ราคาตั๋ว<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-text-field v-model="noteAmt" type="text" value="units * 6000 + 2500 | number" label="Note Price"
              @focus="clickFormatNumber" @change="setFormatNumber" @click="clickFormatNumber"
              :rules="[v => !!v || 'Note Price is required']" require solo></v-text-field>
          </td>
          <td>
            <p class="mt-n2 mr-2 mlabel">จำนวนเงินที่จ่าย<font color="red">*</font>&nbsp;:</p>
          </td>
          <td>
            <v-text-field v-model="noteAmtPay" type="text" value="units * 6000 + 2500 | number" @focus="clickFormatNumber2"
              @change="setFormatNumber2" @click="clickFormatNumber2" label="Pay Amount"
              :rules="[v => !!v || 'Pay Amount is required']" require solo></v-text-field>
          </td>
          <td>
          <p class="mt-n2 mr-2 mlabel"> อัตราดอกเบี้ย  <font color="red">*</font>&nbsp;:<br />(%)&nbsp;&nbsp;&nbsp;&nbsp;</p>
          </td>
          <td>
            <v-text-field v-model="interestRate" type="number" label="Interest Rate"
              :rules="[v => !!v || 'Interest Rate is required']" style="width:150px" require solo></v-text-field>
          </td>
        </tr>
        <tr>
          <td>
            <p class="mt-n2 mr-2 mlabel">รายละเอียด&nbsp;:&nbsp;&nbsp;</p>
          </td>
          <td colspan="5">
            <v-text-field v-model="description" label="Description" solo></v-text-field>
          </td>
        </tr>
        <tr>
          <td colspan="6">
            <p style="color:red;font-size:0.9rem;">{{err_msg}}</p>
          </td>
        </tr>
        <tr>
          <td colspan="6" class="justify-center text-center">
            
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
// const API_URL = "http://10.10.0.46:3001/api";
const API_URL = "http://corf.oneeclick.co:3002/api";
export default {
  name: 'InputForm',
  props: {
    header_name: String,
    mType:String
  },
  data: ()=>({
    // l: 0,
    inputForm: true,
    company: [],
    insTypeList: [],
    insList: [],
    ageType: [{ id: 'C', name: 'ไม่มีกำหนด' }, { id: 'D', name: 'วัน' }, { id: 'M', name: 'เดือน' }, { id: 'Y', name: 'ปี' }],
    docTypeList: [],
    brokerList:[],
    branchList: [],
    bankList: [],
    institueList: [],
    exchangeRate: [],
    insBranch: [],
    buyDateTH: '',
    createDateTH: '',
    endDateTH:'',
    docType: '',
    institute: '',
    branch: '',
    searchBranch:'',
    broker: '',
    noteNo: '',
    aType: '',
    description: '',
    interestRate: '',
    noteAmt: '',
    noteAmtPay:'',
    times: '',
    fromExchangeRate: '',
    toExchangeRate: '',
    rate: '',
    err_msg: '',
    statusBond: '',
    statusMsgChkBond:0,
    msgChkBond: '',
    note_date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10), 
    ending_date: '',
    create_note_date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10), 
    percent: true,
    buy_date: false,
    create_date: false,
    end_date: false,
  }),
  created() {
    axios
      .get(API_URL + "/master/company")
      .then(res => {
        this.companyList = res.data;
      })
    axios
      .get(API_URL + "/master/doctype")
      .then(res => {
        this.docTypeList = res.data;
      })
    axios
      .get(API_URL + "/master/institute", { params: { type: 1} }) 
      .then(res => {
        this.bankList = res.data;
      })
    axios
      .get(API_URL + "/bond/getbranch")
      .then(res => {
        this.insBranch = res.data;
      })

    if ((this.$route.query.type == 3 && this.$route.query.instype == 4) || (this.$route.query.type == 4 && this.$route.query.instype == 4)) {
      axios
        .get(API_URL + "/master/lob", { params: { type: this.$route.query.instype, mtype: this.$route.query.type } })
        .then(res => {
          this.brokerList = res.data;
          this.institueList = res.data;
        })
    }else{
      axios
        .get(API_URL + "/master/institute", { params: { type: this.$route.query.instype, mtype: this.$route.query.type } })
        .then(res => {
          this.brokerList = res.data;
          this.institueList = res.data;
        })
    }
      if (this.note_date != "") {
        this.buyDateTH = mylib.setDateTH(this.note_date);
        this.createDateTH = mylib.setDateTH(this.note_date);
      }
    },
  mounted() {
    this.calEnddate()
  },
  methods: {
    // validate() {
    //   this.$refs.form.validate()
    // },
    // reset() {
    //   this.$refs.form.reset()
    // },
    // resetValidation() {
    //   this.$refs.form.resetValidation()
    // },
    chkBondNo() {
      if (this.noteNo != "") {
        this.msgChkBond = ""
        axios
          .get(API_URL + '/bond/chkbond', { params: { noteno: this.noteNo } })
          .then(res => {
            let data = res.data;
            if (data.length > 0) {
              this.statusBond = 1;
              this.msgChkBond = "มีเลขตราสารนี้ในระบบแล้ว"
              this.statusMsgChkBond = 1;
            } else {
              this.statusBond = 0;
              this.msgChkBond = ''
              this.statusMsgChkBond = 0;
            }
          })

      } else {
        this.statusBond = '';
        this.msgChkBond = "กรุณากรอกเลขตราสาร..."
        this.statusMsgChkBond = 1;
      }
    },
    async onSubmit() {
      // console.log("onsubmit:", localStorage.userID)
      if (this.docType != "" && this.institute != "" && this.noteNo != "" && this.aType != "" && this.noteAmt != "" && this.noteAmtPay != "" && this.interestRate != "" ) {
        // console.log("save")
        let noteAmt = this.noteAmt.replaceAll(",", "");
        let noteAmtPay = this.noteAmtPay.replaceAll(",", "");
        await axios
          .post(API_URL + "/bond/create", {
            params: {
              lob: localStorage.lob,
              mType: this.mType,
              docType: this.docType,
              ins: this.institute,
              branch: this.branch,
              noteNo: this.noteNo,
              broker: this.broker,
              ageType: this.aType,
              times: this.times,
              buyDate: this.note_date,
              createDate: this.create_note_date,
              endDate: this.ending_date,
              noteAmt: noteAmt,
              noteAmtPay: noteAmtPay,
              intRate: this.interestRate,
              fromExRate: this.fromExchangeRate,
              toExRate: this.toExchangeRate,
              rate: this.rate,
              userId: localStorage.userID,
              description: this.description
            }
          })
          .then(res => {
            // console.log("success!!")
            this.$router.push({ name: '/bond/detail', query: { id: res.data.id, lob: localStorage.lob, menu: this.$route.query.type } }).catch(() => { });
          })
          .catch(err => {
            console.error(err);
            // this.err_msg = (err.response.data.msg == null ? "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง..." : err.response.data.msg);
            // this.err_code = err.response.request.status;
          });
      } else {
        this.err_msg = "กรุณากรอกข้อมูลให้ครบ...";
      }

    },
    getBranch(e) {
      axios
        .get(API_URL + "/master/institute/branch/", { params: { bank: e } })
        .then(res => {
          this.branchList = res.data;
        })
    },
    setFormatNumber(e) {
      if (e != "") {
        this.noteAmt = mylib.formatNumber(this.noteAmt, 2)
      }
      if (this.noteAmtPay == "") {
        this.noteAmtPay = this.noteAmt
      }
    },
    clickFormatNumber() {
      if (this.noteAmt != "" && this.noteAmt != null) {
        this.noteAmt = this.noteAmt.replaceAll(",", "");
      }
    },
    setFormatNumber2(e) {
      if (this.noteAmtPay != "") {
        this.clickFormatNumber2();
        this.noteAmtPay = mylib.formatNumber(this.noteAmtPay, 2)
      }
    },
    clickFormatNumber2() {
      if (this.noteAmtPay != "" && this.noteAmtPay != null) {
        this.noteAmtPay = this.noteAmtPay.replaceAll(",", "");
      }
    },
    calEnddate(code) {
      if (code == 'ND') {
        this.create_note_date = this.note_date;
        this.buyDateTH = mylib.setDateTH(this.note_date);
        this.createDateTH = mylib.setDateTH(this.note_date);
      }

      const nDate = new Date(this.create_note_date);
      if (this.aType == 'D' && this.times != "") {
        this.ending_date = this.addDays(nDate, parseInt(this.times))
      } else if (this.aType == 'M' && this.times != "") {
        this.ending_date = this.addMonths(nDate, parseInt(this.times))
      } else if (this.aType == 'Y' && this.times != "") {
        this.ending_date = this.addYears(nDate, parseInt(this.times))
      } else if (this.aType == 'C') {
        this.ending_date = "";
        this.times = ""
      }
      if (this.times == "") {
        this.ending_date = "";
        this.endDateTH = ""
      } else {
        this.endDateTH = mylib.setDateTH(this.ending_date);
      }
      

    },
    // setDateTH(date) {
    //   if (date != '') {
    //     const months = ['','ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    //     let d = date.split('-');
    //     return d[2] + " " + months[parseInt(d[1])] + " " + (parseInt(d[0]) + 543);
    //   }
    //   return;
    // },
    addDays(date, days) {
      const copy = new Date(Number(date))
      copy.setDate(date.getDate() + days)
      return this.setFromatDBDate(copy)
    },
    addMonths(date, months) {
      const copy = new Date(Number(date))
      copy.setMonth(date.getMonth() + months)
      return this.setFromatDBDate(copy)
    },
    addYears(date, years) {
      const copy = new Date(Number(date))
      copy.setFullYear(date.getFullYear() +years )
      return this.setFromatDBDate(copy)
    },
    setFromatDBDate(date) {
      const d = date.toISOString();
      return d.substring(0,10)
    }
  }
  
}

</script>

