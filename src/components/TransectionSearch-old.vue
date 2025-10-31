<template>
  <v-container class="mt-3 ">
    <h2>{{header_name}}{{ ((mType == 3 || mType == 4) ? ($route.params.id == '4'?" : บริษัทในเครือ":" : บริษัทอื่นๆ"):'')}}</h2>
    <br/>
    <v-card class="pa-3">
      <v-form v-model="searchForm">
        <v-simple-table>
          <colgroup>
            <col width="15%" />
            <col width="35%" />
            <col width="15%" />
            <col width="35%" />
          </colgroup>
          <tr>
            <td>
              <p class="mt-n2 mr-2 mlabel">วันที่ออกรายงาน&nbsp;:</p>
            </td>
            <td>
              <v-menu v-model="date" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
                min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="report_date" label="Start Date" prepend-inner-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"
                    solo>
                  </v-text-field>
                </template>
                <v-date-picker v-model="report_date" locale="th" no-title @input="date = false" @change="setDate"></v-date-picker>
              </v-menu>
            </td>
            <td>
              <p class="mt-n2 mr-2 mlabel">เลขที่ตราสาร&nbsp;:</p>
            </td>
            <td>
              <v-autocomplete v-model="noteNo" clearable label="Note No." :items="listNoteNo" solo></v-autocomplete>
            </td>
          </tr>
          <tr>
            <td></td>
            <td>
              <p class="mt-n5">{{ reportDateTH }}</p>
            </td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>
              <p v-if="mType == 1" class="mt-n2 mr-2 mlabel">สถาบันธนาคาร&nbsp;:</p>
              <p v-if="mType == 4" class="mt-n2 mr-2 mlabel">ผู้ให้กู้ยืม&nbsp;:</p>
              <p v-if="mType == 3" class="mt-n2 mr-2 mlabel">ผู้กู้ยืม&nbsp;:</p>
            </td>
            <td>
              <v-select v-model="institute" :items="institueList" label="Institue" item-text="name" item-value="id" clearable solo>
              </v-select>
            </td>
            <td >
            <p class="mt-n2 mr-2 mlabel">เรียงลำดับ&nbsp;:</p>
            </td>
            <td>
              <v-radio-group class="mt-n2" v-model="orderType" row mandatory>
                <v-radio label="เลขที่ตั๋ว" value="1"></v-radio>
                <v-radio label="วันที่ซื้อ" value="2"></v-radio>
                <v-radio label="วันที่ครบกำหนด" value="3"></v-radio>
              </v-radio-group>
            </td>
          </tr>
          <tr style="height:50px">
            <td colspan="4" class="justify-center text-center">
              <v-btn color="default" elevation="2" large alt="Search" @click="searchBond">ค้นหาข้อมูล</v-btn>
            </td>
          </tr>
          
        </v-simple-table>
      </v-form>
    </v-card>
    <br/>
    <v-row class="mt-1 ">
      <v-col class="d-flex justify-end mb-6">
        <v-btn class="success" elevation="2" large @click="this.export">PDF</v-btn>
        &nbsp;&nbsp;&nbsp;
        <v-btn v-if="(mType == 1 || (mType == 3 & $route.params.id == 4) || (mType ==4  & $route.params.id == 0))" class="primary" elevation="2" large @click="addTransection" alt="Add Transection">เพิ่มข้อมูล</v-btn>
      </v-col>
    </v-row>
    <br/>
    <v-spacer></v-spacer>
<template class="mt-6">
  <div>
    <v-data-table 
      :headers="(mType == 1 ? headers_deposit : (mType==3?headers_mType3:headers_mType4))"
      :items="bond" 
      :options.sync="options" 
      :server-items-length="totalBond"
      hide-default-footer
      :loading="loading" 
      class="elevation-1">
      <!-- (data.CompanyOld==localStorage.lob ? data.InstituteName : data.CompanyName) -->
      <template v-if="mType==4" v-slot:item.CompanyName="{ item }"> 
        <font style="font-size: 0.8rem">{{ (item.CompanyOld == lob ? item.InstituteName : item.CompanyName) }}</font>
      </template>
      <template v-slot:item.NoteNo="{item}">
          <font style="font-size: 0.8rem">{{ item.NoteNo }}</font>
      </template>
      <template v-slot:item.InterestRate="{ item }">
        <p class="text-right mt-4">{{ item.InterestRate }}</p>
      </template>
      <template v-slot:item.NoteAmt="{ item }">
          <p class="text-right mt-4">{{ formatNumber(item.NoteAmt) }}</p>
      </template>
      <template v-slot:item.StatusDesc="{ item }" >
        <v-chip :color="getColor(item.Status,item.exDate)" @click="getDetail(item.ID)" dark>
          {{ ((item.Status == '2' && (report_date <= item.exDate)) ? "ACTIVE":item.StatusDesc) }}
        </v-chip>
      </template>
      
    </v-data-table>
  </div>
</template>
  </v-container>
</template>
<style>
.mlabel {
  text-align: right;
  font-size: 0.9rem;
}
</style>
<script>
import pdfMake from 'pdfmake'
import pdfFonts from '../assets/custom-fonts.js'
import axios from 'axios'
import * as mylib from '@/app'
// const API_URL = "http://localhost:3001/api"
// const API_URL = "http://10.10.0.46:3001/api";
const API_URL = "http://corf.oneeclick.co:3002/api";
export default {
  name: 'TransectionSearch',
  props: {
    header_name: String,
    mType: String,
  },
  data: () => ({
    noteNo:'',
    search: '',
    rs_search: '',
    searchForm: '',
    insType: '',
    key:'',
    institute:'',
    singleSelect: false,
    totalBond: 0,
    bond: [],
    allBond: [],
    institueList: [],
    loading: false,
    options: {},
    date:'',
    report_date: '', 
    reportDateTH:'',
    report_date_thai: '',
    orderType:'',
    company: localStorage.lobName,
    listTable: [],
    listNoteNo:[],

    headers_deposit: [
      {
        text: 'สถาบัน/ธนาคาร',
        align: 'start',
        sortable: false,
        value: 'InstituteName',
      },
      { text: 'เลขที่ตั๋ว', value: 'NoteNo'},
      { text: 'ตราสาร', value: 'DocTypeCode' },
      { text: 'ระยะเวลา', value: 'AgeThai' },
      { text: 'วันที่ซื้อ', value: 'NoteDate' },
      { text: 'ครบกำหนด', value: 'EndingDate' },
      { text: 'ดอกเบี้ย %', value: 'InterestRate' },
      { text: 'จำนวนเงิน', value: 'NoteAmt' },
      // { text: 'สถานะ', value: 'StatusDesc' },
      { text: 'รายละเอียด', value: 'StatusDesc' },
    ],
    headers_mType3: [
      {
        text: 'ผู้กู้ยืม',
        align: 'start',
        sortable: false,
        value: 'InstituteName',
      },
      { text: 'เลขที่ตั๋ว', value: 'NoteNo' },
      { text: 'ประเภท', value: 'DocTypeCode' },
      { text: 'วันที่ซื้อ', value: 'NoteDate' },
      { text: 'ครบกำหนด', value: 'EndingDate' },
      { text: 'ดอกเบี้ย %', value: 'InterestRate' },
      { text: 'จำนวนเงิน', value: 'NoteAmt' },
      // { text: 'สถานะ', value: 'StatusDesc' },
      { text: 'รายละเอียด', value: 'StatusDesc' },
    ],
    headers_mType4: [
      {
        text: 'ผู้ให้กู้ยืม',
        align: 'start',
        sortable: false,
        value: 'CompanyName',
      },
      { text: 'เลขที่ตั๋ว', value: 'NoteNo' },
      { text: 'ประเภท', value: 'DocTypeCode' },
      { text: 'วันที่ซื้อ', value: 'NoteDate' },
      { text: 'ครบกำหนด', value: 'EndingDate' },
      { text: 'ดอกเบี้ย %', value: 'InterestRate' },
      { text: 'จำนวนเงิน', value: 'NoteAmt' },
      // { text: 'สถานะ', value: 'StatusDesc' },
      { text: 'รายละเอียด', value: 'StatusDesc' },
    ],
  }),
  watch: {
    options: {
      handler() {
        this.searchBond();
      },
      deep: true,
    },
  },
  created() {
    this.insType = this.$route.params.id
    // this.getListBond();
    if ((this.mType == 3 && this.insType == 4) || (this.mType == 4 && this.insType==4)) {
      axios
        .get(API_URL + '/master/lob')
        .then(res => {
          this.institueList = res.data
        })
    } else {
      if (this.mType == 1) {
        this.key = 1
      } else {
        this.key = this.insType;
      }
      axios
        .get(API_URL + "/master/institute", { params: { type: this.key } })
        .then(res => {
          this.institueList = res.data;
        })
    }
    
  },
  mounted() {
    if (localStorage.lob) {
      this.lob = localStorage.lob;
    }

    if (localStorage.reportDate) {
      // this.report_date = localStorage.reportDate;
      this.setDate(localStorage.reportDate);
    }
  },
  methods: {
    formatNumber(num) {
      return mylib.formatNumber(num,2);
    },
    setDate(e) {
      this.report_date = e;
      localStorage.reportDate = e;
      this.report_date_thai = this.formatDateThai(e);
      this.reportDateTH = mylib.setDateTH(this.report_date)
      this.searchBond();
    },
    setReportHeader(type,cols) {
      let reportName = "";
      if (type == '1') {
        reportName = "รายละเอียดเงินฝากสถาบันการเงิน";
      } else if (type == '3') {
        if (this.insType == '4') {
          reportName = "รายละเอียดเงินให้กู้ยืมกับบริษัทในเครือ"
        } else {
          reportName = "รายละเอียดเงินให้กู้ยืม"
        }
      } else if (type == '4') {
        if (this.insType == '4') {
          reportName = "รายละเอียดเงินกู้ยืมจากบริษัทในเครือ"
        } else {
          reportName = "รายละเอียดเงินกู้ยืม"
        }
      }
      let ret = [];
      let header1 = [];
      let header2 = [];
      let header3 = [];
      let header4 = [];
      if (cols == '13') {
        header1 = [
          { text: this.company, colSpan: 13, style: 'header', alignment: 'center', border: [0, 0, 0, 0] },
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
        ];
        header2 = [
          { text: reportName, colSpan: 13, style: 'subHeader', alignment: 'center', margin: [0, 2], border: [0, 0, 0, 0] },
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
        ];
        header3 = [
          { text: "ณ วันที่ " + this.report_date_thai, colSpan: 13, style: 'subHeader', alignment: 'center', margin: [0, 2], border: [0, 0, 0, 0] },
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
        ];
        header4 = [
          { text: "LOB. " + this.company, colSpan: 13, style: 'subHeader', margin: [0, 0, 0, 3], border: [0, 0, 0, 0] },
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
        ];
      } else { 
        header1 = [
          { text: this.company, colSpan: 14, style: 'header', alignment: 'center', border: [0, 0, 0, 0] },
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
        ];
        header2 = [
          { text: reportName, colSpan: 14, style: 'subHeader', alignment: 'center', margin: [0, 2], border: [0, 0, 0, 0] },
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
        ];
        header3 = [
          { text: "ณ วันที่ " + this.report_date_thai, colSpan: 14, style: 'subHeader', alignment: 'center', margin: [0, 2], border: [0, 0, 0, 0] },
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
        ];
        header4 = [
          { text: "LOB. " + this.company, colSpan: 14, style: 'subHeader', margin: [0, 0, 0, 3], border: [0, 0, 0, 0] },
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
        ];
      }
     
      
      ret.push(header1);
      ret.push(header2);
      ret.push(header3);
      ret.push(header4);
      return ret;
    },
    addTransection() {
      if (this.mType == 1) {
        this.$router.push({ name: '/deposit/add', query: { lob: localStorage.lob, instype: 1, type: this.mType, menu: this.mType } }).catch(()=>{});
      } else if (this.mType == 3) {
        this.$router.push({ name: '/borrower/add', query: { lob: localStorage.lob, instype: this.insType, type: this.mType, menu: this.mType } }).catch(()=>{});
      } else if (this.mType == 4) {
        this.$router.push({ name: '/lender/add', query: { lob: localStorage.lob, instype: this.insType, type: this.mType, menu: this.mType } }).catch(()=>{});
      }
    },
    getDetail(id) {
      this.$router.push({ name: '/bond/detail', query: { id: id, lob: localStorage.lob, instype: this.insType, type: this.mType, menu: this.mType } }).catch(()=>{});
    },
    getListBond() {
      this.listNoteNo = []
      // console.log(this.report_date)
      // console.log(this.bond)
      if(this.bond.length>0){
        this.bond.forEach(data=>{
          //  console.log(data.NoteNo)
          this.listNoteNo.push(data.NoteNo)
          // const row = {

          // }
        })
      }else{
        this.noteNo =""
      }
      
      // axios
      //   .get(API_URL + "/bond/getnote", { params: { lob: localStorage.lob, instype: 1, type: this.mType, date: this.report_date } })
      //   .then(res => {
      //     this.listNoteNo = res.data;
      //   })
    },
    searchBond() {
      // 
      if (this.report_date == "") {
        let dNow = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10);
        this.report_date = dNow;
        this.report_date_thai = this.formatDateThai(dNow);
        // console.log("Dnow>>",dNow)
        this.reportDateTH = mylib.setDateTH(dNow)
        // console.log("RPTH::",this.reportDateTH)
      }
      
      this.loading = true
      this.getBond().then(data => {
        // console.log(data.total)
        this.bond = data.items
        this.totalBond = data.total
        this.loading = false
        this.getListBond();
        // console.log(this.bond)
      })
    },

    formatDateThai(input) {
      let date = input.split('-')
      // console.log("date : ", date, " Month :", this.addZero(date[1]))
      return this.addZero(date[2]) + "/" + this.addZero(date[1])+"/"+(parseInt(date[0])+543)
    },
    getColor(status,exDate) {
      if (status == '1') return 'red'
      else if (status == '0'|| status=='2' && this.report_date<= exDate) return 'orange'
      else return 'green'
    },
    addZero(num) {
      var n = Math.abs(num);
      var zeros = Math.max(0, 2 - Math.floor(n).toString().length);
      var zeroString = Math.pow(10, zeros).toString().substr(1);
      if (num < 0) {
        zeroString = '-' + zeroString;
      }
      return zeroString + n;
    },
    // formatNumber(num,decimal) { 
    //   if (num != "" && num != null&&num.toFixed(2) == '0.00') {
    //     return "";
    //   }else if (num != "" && num != null) {
    //     // console.log(num)
    //     num = parseFloat(num).toFixed(decimal);
    //     return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    //   }
    //   return "";
    // },
    async getBond() {
        return new Promise((resolve, reject) => {
            try {
              axios
                .get(API_URL + '/bond/report_transection', { params: { date: this.report_date, lob: localStorage.lob, instype: this.insType, type: this.mType ,noteno : this.noteNo ,ins:this.institute ,ordertype:this.orderType} })
                .then(res => {
                  const { sortBy, sortDesc, page, itemsPerPage } = this.options
                  let items = [];
                  let list = res.data;
                  this.allBond = res.data;
                  
                  this.loading = false
                  if (list.length > 0){
                    list.forEach(l => {
                      if (l.Key == 'D') {
                        items.push(l);
                      }
                    })
                  }
                  const total = items.length
                if (sortBy.length === 1 && sortDesc.length === 1) {
                  items = items.sort((a, b) => {
                    const sortA = a[sortBy[0]]
                    const sortB = b[sortBy[0]]

                    if (sortDesc[0]) {
                      if (sortA < sortB) return 1
                      if (sortA > sortB) return -1
                      return 0
                    } else {
                      if (sortA < sortB) return -1
                      if (sortA > sortB) return 1
                      return 0
                    }
                  })
                }
                // if (itemsPerPage > 0) {
                //   items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
                // }
                setTimeout(() => {
                  resolve({
                    items,
                    total,
                  })
                }, 1000)
                  })
              } catch (error){
                console.error(error);
            }
        })
    },
    setTableDetail(input) {
      let ret = this.setReportHeader(1,'14');
      let header5 = [
          {
            text: 'สถาบัน/ธนาคาร',
            rowSpan: 2,
            alignment: 'center',
          fontSize: 6.5,
          margin: [0, 8]
          },
          {
            text: 'เลขที่ตั๋ว',
            rowSpan: 2,
            alignment: 'center',
          fontSize: 6.5,
        margin: [0, 8]

          },
          {
            text: 'ตราสาร',
            rowSpan: 2,
            alignment: 'center',
            fontSize: 6.5,
            margin: [0, 8]
          },
          {
            text: 'ระยะเวลา',
            rowSpan: 2,
            alignment: 'center',
            fontSize: 6.5,
            margin: [0, 8]
          },
          {
            text: 'วันที่ซื้อ',
            rowSpan: 2,
            alignment: 'center',
            fontSize: 6.5,
            margin: [0, 8]
          },
          {
            text: 'ครบกำหนด',
            rowSpan: 2,
            alignment: 'center',
            fontSize: 6.5,
            margin: [0, 8]
          },
          {
            text: 'ดอกเบี้ย\n%',
            rowSpan: 2,
            alignment: 'center',
            fontSize: 6.5,
            margin: [0, 8]
          },
          {
            text: 'จำนวนเงิน',
            rowSpan: 2,
            alignment: 'center',
            fontSize: 6.5,
            margin: [0, 8]
          },
          {
            text: 'จำนวน\nวัน',
            rowSpan: 2,
            alignment: 'center',
            fontSize: 6,
            margin: [0, 8]
          },
          {
            text: 'ดอกเบี้ย\nค้างรับยกมา',
            rowSpan: 2,
            alignment: 'center',
            fontSize: 6.5,
            margin: [0, 8]
          },
          {
            text: 'ประจำเดือน',
            colSpan: 3,
            alignment: 'center',
            fontSize: 6.5
          },
          {},
          {},
          {
            text: 'ดอกเบี้ย\nค้างรับสุทธิ',
            rowSpan: 2,
            alignment: 'center',
            fontSize: 6.5,
            margin: [0, 8]
          },

        ];
      let header6 =[
            { },
            { },
            { },
            { },
            { },
            { },
            { },
            { },
            { },
            { },
            {
              text: 'ดอกเบี้ย',
              alignment: 'center',
              fontSize: 6.5
            },
            {
              text: 'รับดอกเบี้ย',
              alignment: 'center',
              fontSize: 6.5
            },
            {
              text: 'ปรับ\nดอกเบี้ย',
              alignment: 'center',
              fontSize: 6.5
            },
            { },
        ];
        
      ret.push(header5);
      ret.push(header6);
      let old_ins = "";
      let old_ins_branch =""
      let noteAmt = 0;
      let noteIntPvr = 0;
      let noteIntCur = 0;
      let benefitAmt = 0;
      let adjustIntPrv = 0;
      let noteIntAmt = 0;
      let totalNoteAmt = 0;
      let totalNoteIntPrv = 0;
      let totalNoteIntCur = 0;
      let totalBenefitAmt = 0;
      let totalAdjustInt = 0;
      let totalNoteIntAmt = 0;
      if (input.length > 0) {
        input.forEach(data => {
          // console.log(data)
          if (data.InstituteName != old_ins && old_ins!="") {
            let total = [
              {
                text: 'รวม',
                alignment: 'right',
                colSpan: 7,
                border: [false, false, false, false],
                style: 'summary'
              },
              {},
              {},
              {},
              {},
              {},
              {},
              {
                text: (noteAmt == 0 ? '0.00' : (Math.sign(noteAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(noteAmt), 2) + ")" : mylib.formatNumber(noteAmt, 2))),
                alignment: 'right',
                style: 'summary'
              },
              {
                text: '',
                border: [false, false, false, false],
              },
              {
                text: (Math.sign(noteIntPvr) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntPvr), 2) + ")" : mylib.formatNumber(noteIntPvr, 2)),
                alignment: 'right',
                style: 'summary'
              },
              {
                text: (Math.sign(noteIntCur) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntCur), 2) + ")" : mylib.formatNumber(noteIntCur, 2)), 
                alignment: 'right',
                style: 'summary'
              },
              {
                text: (Math.sign(benefitAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(benefitAmt), 2) + ")" : mylib.formatNumber(benefitAmt, 2)), 
                alignment: 'right',
                style: 'summary'
              },
              {
                text: (Math.sign(adjustIntPrv) == -1 ? "(" + mylib.formatNumber(Math.abs(adjustIntPrv), 2) + ")" : mylib.formatNumber(adjustIntPrv, 2)),
                alignment: 'right',
                style: 'summary'
              },
              {
                text: (Math.sign(noteIntAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntAmt), 2) + ")" : mylib.formatNumber(noteIntAmt, 2)), 
                alignment: 'right',
                style: 'summary'
              },
            ]
            ret.push(total)
       
            totalNoteAmt += noteAmt;
            totalNoteIntPrv += noteIntPvr;
            totalNoteIntCur += noteIntCur;
            totalBenefitAmt += benefitAmt;
            totalAdjustInt += adjustIntPrv;
            totalNoteIntAmt += noteIntAmt;
            
            noteAmt = 0;
            noteIntPvr = 0;
            noteIntCur = 0;
            benefitAmt = 0;
            adjustIntPrv = 0;
            noteIntAmt = 0;
          }
          if (data.Key == 'D') { 
            noteAmt += parseFloat(data.NoteAmt);
            noteIntPvr += parseFloat(data.NoteIntPvr);
            noteIntCur += parseFloat(data.NoteIntCur);
            benefitAmt += (data.BenefitAmt==null?0:parseFloat(data.BenefitAmt));
            adjustIntPrv += parseFloat(data.AdjustIntPrv);
            noteIntAmt += parseFloat(data.NoteIntAmt);
           
            let detail = [
              {
                text: ((data.InstituteName != old_ins && data.InstituteBranch != old_ins_branch ? data.InstituteName + (data.InstituteBranch == "" || data.InstituteBranch == "NULL" ? "" : " สาขา" + data.InstituteBranch) : '')).substring(0,25),
                fontSize: 7,
                style: 'setHeight',
                border: [false, false, false, false],
              },
              {
                text: data.NoteNo, 
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 7
              },
              {
                text: data.DocTypeCode, 
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 7
              },
              {
                text: data.AgeThai,
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5
              },
              {
                text: data.NoteDate, 
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5
              },
              {
                text: data.EndingDate,
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5
              },
              {
                text: data.InterestRate, 
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                alignment: 'right',
                fontSize: 6.5
              },
              {
                text: (Math.sign(data.NoteAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(data.NoteAmt), 2) + ")" : mylib.formatNumber(data.NoteAmt, 2)), 
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                alignment: 'right',
                fontSize: 6.5
              },
              {
                text: data.Days,
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                alignment: 'right',
                fontSize: 6.5
              },
              {
                text: (Math.sign(data.NoteIntPvr) == -1 ? "(" + mylib.formatNumber(Math.abs(data.NoteIntPvr), 2) + ")" : mylib.formatNumber(data.NoteIntPvr, 2)), 
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                alignment: 'right',
                fontSize: 6.5
              },
              {
                text: (Math.sign(data.NoteIntCur) == -1 ? "(" + mylib.formatNumber(Math.abs(data.NoteIntCur), 2) + ")" : mylib.formatNumber(data.NoteIntCur, 2)), 
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                alignment: 'right',
                fontSize: 6.5
              },
              {
                text: (Math.sign(data.BenefitAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(data.BenefitAmt), 2) + ")" : mylib.formatNumber(data.BenefitAmt, 2)), 
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                alignment: 'right',
                fontSize: 6.5
              },
              {
                text: (Math.sign(data.AdjustIntPrv) == -1 ? "(" + mylib.formatNumber(Math.abs(data.AdjustIntPrv), 2) + ")" : mylib.formatNumber(data.AdjustIntPrv, 2)),
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                alignment: 'right',
                fontSize: 6.5
              },
              {
                text: (data.NoteIntAmt == 0 ? '' : (Math.sign(data.NoteIntAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(data.NoteIntAmt), 2) + ")" : mylib.formatNumber(data.NoteIntAmt, 2))), 
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                alignment: 'right',
                fontSize: 6.5
              },
              
            ];
            ret.push(detail)

            if (data.Status == '2' && this.report_date >= data.exDate) {
              let expBond = [
                {
                  text: '',
                  style: 'setHeight',
                  border: [false, false, false, false],
                },
                {
                  text: (data.ExpReason).substring(0,75),
                  fillColor: '#D7D7D7',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  colSpan:4,
                  fontSize: 6.5
                },
                {},
                {},
                {},
                {
                  text: data.ExpDate,
                  fillColor: '#D7D7D7',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  fontSize: 6.5
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  fillColor: '#D7D7D7'
                },
                {
                  text: "(" + mylib.formatNumber(data.NoteAmt, 2) + ")",
                  fillColor: '#D7D7D7',
                  alignment: 'right',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  fontSize: 6.5
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  fillColor: '#D7D7D7'
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  fillColor: '#D7D7D7'
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  fillColor: '#D7D7D7'
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  fillColor: '#D7D7D7'
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  fillColor: '#D7D7D7'
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  fillColor: '#D7D7D7'
                },
              ];
              noteAmt -= data.NoteAmt
              ret.push(expBond)
            }
            // console.log(benefitAmt)

            
            if (data.InstituteName != old_ins) {
              old_ins = data.InstituteName;
            }

            if (data.InstituteBranch != old_ins_branch) {
              old_ins_branch = data.InstituteBranch;
            }
            
          }

        })
        let total = [
          {
            text: 'รวม',
            alignment: 'right',
            border: [false, false, false, false],
            colSpan: 7,
            style: 'summary'
          },
          {},
          {},
          {},
          {},
          {},
          {},
          {
            text: (noteAmt == 0 ? '0.00' : (Math.sign(noteAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(noteAmt), 2) + ")" : mylib.formatNumber(noteAmt, 2))),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: '',
            border: [false, false, false, false],
          },
          {
            text: (Math.sign(noteIntPvr) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntPvr), 2) + ")" : mylib.formatNumber(noteIntPvr, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(noteIntCur) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntCur), 2) + ")" : mylib.formatNumber(noteIntCur, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(benefitAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(benefitAmt), 2) + ")" : mylib.formatNumber(benefitAmt, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(adjustIntPrv) == -1 ? "(" + mylib.formatNumber(Math.abs(adjustIntPrv), 2) + ")" : mylib.formatNumber(adjustIntPrv, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(noteIntAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntAmt), 2) + ")" : mylib.formatNumber(noteIntAmt, 2)),
            alignment: 'right',
            style: 'summary'
          },
        ]
        ret.push(total)

        totalNoteAmt += noteAmt;
        totalNoteIntPrv += noteIntPvr;
        totalNoteIntCur += noteIntCur;
        totalBenefitAmt += benefitAmt;
        totalAdjustInt += adjustIntPrv;
        totalNoteIntAmt += noteIntAmt;
        let net = [
          {
            text: 'รวมยอดทั้งสิ้น',
            alignment: 'right',
            colSpan: 7,
            style: 'summaryHeader',
            border: [false, false, false, false]
          },
          {},
          {},
          {},
          {},
          {},
          {},
          {
            text: totalNoteAmt == 0 ? '0.00' : (Math.sign(totalNoteAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(totalNoteAmt), 2) + ")" : mylib.formatNumber(totalNoteAmt, 2)),
            alignment: 'right',
            border: [false, false, false, true],
            style: 'summary'
          },
          {
            text: '',
            border: [false, false, false, false],
          },
          {
            text: (Math.sign(totalNoteIntPrv) == -1 ? "(" + mylib.formatNumber(Math.abs(totalNoteIntPrv), 2) + ")" : mylib.formatNumber(totalNoteIntPrv, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(totalNoteIntCur) == -1 ? "(" + mylib.formatNumber(Math.abs(totalNoteIntCur), 2) + ")" : mylib.formatNumber(totalNoteIntCur, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(totalBenefitAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(totalBenefitAmt), 2) + ")" : mylib.formatNumber(totalBenefitAmt, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(totalAdjustInt) == -1 ? "(" + mylib.formatNumber(Math.abs(totalAdjustInt), 2) + ")" : mylib.formatNumber(totalAdjustInt, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(totalNoteIntAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(totalNoteIntAmt), 2) + ")" : mylib.formatNumber(totalNoteIntAmt, 2)),
            alignment: 'right',
            style: 'summary'
          },
        ]

        ret.push(net)
        let detail2 = [
          {
            text: '',
            colSpan: 7,
            border: [false, false, false, false],
          },
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {
            text: '',
            border: [false, false, false, false],
          },
          {},
          {},
          {},
          {},
          {},
        ];

        ret.push(detail2);
      } else {
        let detail = [
          {
            text: ' ',
            style: 'setHeight',
          },
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
        ];

        ret.push(detail);
      }
        
        return ret;
    },
    setTableDetailEtc(input, type) {
      // console.log(this.bond)
      let ret = this.setReportHeader(type,'13');
      let header5 = [
        {
          text: (type ==3?'ผู้กู้ยืม':'ผู้ให้กู้ยืม'),
          rowSpan: 2,
          alignment: 'center',
          fontSize: 7,
          margin:[0,8]
        },
        {
          text: 'เลขที่ตั๋ว',
          rowSpan: 2,
          alignment: 'center',
          fontSize: 7,
          margin: [0, 8]
        },
        {
          text: 'ประเภท',
          rowSpan: 2,
          alignment: 'center',
          fontSize: 7,
          margin: [0, 8]
        },
  
        {
          text: 'วันที่ซื้อ',
          rowSpan: 2,
          alignment: 'center',
          fontSize: 7,
          margin: [0, 8]
        },
        {
          text: 'ครบกำหนด',
          rowSpan: 2,
          alignment: 'center',
          fontSize: 7,
          margin: [0, 8]
        },
        {
          text: 'ดอกเบี้ย\n%',
          rowSpan: 2,
          alignment: 'center',
          fontSize: 7,
          margin: [0, 8]
        },
        {
          text: 'จำนวนเงิน',
          rowSpan: 2,
          alignment: 'center',
          fontSize: 7,
          margin: [0, 8]
        },
        {
          text: 'จำนวน\nวัน',
          rowSpan: 2,
          alignment: 'center',
          fontSize: 6.3,
          margin: [0, 8]
        },
        {
          text: (type == 3 ? 'ดอกเบี้ยค้างรับ\nสุทธิยกมา' : 'ดอกเบี้ยค้างจ่าย\nสุทธิยกมา') ,
          rowSpan: 2,
          alignment: 'center',
          fontSize: 7,
          margin: [0, 8]
        },
        {
          text: 'ประจำเดือน',
          colSpan: 3,
          alignment: 'center',
          fontSize: 7,
        },
        {},
        {},
        {
          text: (type == 3 ? 'ดอกเบี้ย\nค้างรับสุทธิ' : 'ดอกเบี้ย\nค้างจ่ายสุทธิ') ,
          rowSpan: 2,
          alignment: 'center',
          fontSize: 7,
          margin: [0, 8],
        },

      ];
      let header6 = [
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {
          text: 'ดอกเบี้ย',
          alignment: 'center',
          fontSize: 7,
        },
        {
          text: (type ==3?'รับดอกเบี้ย':'จ่ายดอกเบี้ย'),
          alignment: 'center',
          fontSize: 7,
        },
        {
          text: 'ปรับ\nดอกเบี้ย',
          alignment: 'center',
          fontSize: 7,
        },
        {},
      ];

      ret.push(header5);
      ret.push(header6);
      if (input.length > 0) {
        let old_ins = "";
        let noteAmt = 0;
        let noteIntPvr = 0;
        let noteIntCur = 0;
        let benefitAmt = 0;
        let adjustIntPrv = 0;
        let noteIntAmt = 0;
        let totalNoteAmt = 0;
        let totalNoteIntPrv = 0;
        let totalNoteIntCur = 0;
        let totalBenefitAmt = 0;
        let totalAdjustInt = 0;
        let totalNoteIntAmt = 0;
        input.forEach(data => {
          //  if (data.InstituteName != old_ins && old_ins!="") {
            // (type ==3?'ผู้กู้ยืม':'ผู้ให้กู้ยืม'),
          if ((((type ==3 ||(type == 4 && data.InsType != 4)) && data.InstituteName != old_ins) || (type ==4 && data.InsType == 4 && data.CompanyName != old_ins)) && old_ins != "") {
            let total = [
              {
                text: 'รวม',
                alignment: 'right',
                colSpan: 6,
                border: [false, false, false, false],
                style: 'summary'
              },
              {},
              {},
              {},
              {},
              {},
              {
                text: (noteAmt == 0 ? '0.00' : (Math.sign(noteAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(noteAmt), 2) + ")" : mylib.formatNumber(noteAmt, 2))), 
                alignment: 'right',
                style: 'summary'
              },
              {
                text:'',
                border: [false, false, false, false],
              },
              {
                text: (Math.sign(noteIntPvr) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntPvr), 2) + ")" : mylib.formatNumber(noteIntPvr, 2)) ,
                alignment: 'right',
                style: 'summary'
              },
              {
                text: (Math.sign(noteIntCur) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntCur), 2) + ")" : mylib.formatNumber(noteIntCur, 2)),
                alignment: 'right',
                style: 'summary'
              },
              {
                text: (Math.sign(benefitAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(benefitAmt), 2) + ")" : mylib.formatNumber(benefitAmt, 2)), 
                alignment: 'right',
                style: 'summary'
              },
              {
                text: (Math.sign(adjustIntPrv) == -1 ? "(" + mylib.formatNumber(Math.abs(adjustIntPrv), 2) + ")" : mylib.formatNumber(adjustIntPrv, 2)),
                alignment: 'right',
                style: 'summary'
              },
              {
                text: (Math.sign(noteIntAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntAmt), 2) + ")" : mylib.formatNumber(noteIntAmt, 2)), 
                alignment: 'right',
                style: 'summary'
              },
            ]
            ret.push(total)

            totalNoteAmt += noteAmt;
            totalNoteIntPrv += noteIntPvr;
            totalNoteIntCur += noteIntCur;
            totalBenefitAmt += benefitAmt;
            totalAdjustInt += adjustIntPrv;
            totalNoteIntAmt += noteIntAmt;

            noteAmt = 0;
            noteIntPvr = 0;
            noteIntCur = 0;
            benefitAmt = 0;
            adjustIntPrv = 0;
            noteIntAmt = 0;
          }

          if (data.Key == 'D') {

            noteAmt += parseFloat(data.NoteAmt);
            noteIntPvr += parseFloat(data.NoteIntPvr);
            noteIntCur += parseFloat(data.NoteIntCur);
            benefitAmt += parseFloat(data.BenefitAmt);
            adjustIntPrv += parseFloat(data.AdjustIntPrv);
            noteIntAmt += parseFloat(data.NoteIntAmt);

            let detail = [
              {
                text: (((data.CompanyOld == localStorage.lob && data.InstituteName != old_ins ) ? data.InstituteName  : (data.CompanyOld != localStorage.lob && data.CompanyName != old_ins) ? data.CompanyName : '')).substring(0,38) ,
                fontSize: 7,
                style: 'setHeight',
                border: [false, false, false, false],
              },
              {
                text: data.NoteNo,
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 7,
              },
              {
                text: data.DocTypeCode,
                alignment: 'center',
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5,
              },
              {
                text: data.NoteDate,
                alignment: 'center',
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5,
              },
              {
                text: data.EndingDate,
                alignment: 'center',
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5,
              },
              {
                text: data.InterestRate,
                alignment: 'right',
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5,
              },
              {
                text: (Math.sign(data.NoteAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(data.NoteAmt), 2) + ")" : mylib.formatNumber(data.NoteAmt, 2)), 
                alignment: 'right',
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5,
              },
              {
                text: data.Days,
                alignment: 'right',
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5,
              },
              {
                text: (Math.sign(data.NoteIntPvr) == -1 ? "(" + mylib.formatNumber(Math.abs(data.NoteIntPvr), 2) + ")" : mylib.formatNumber(data.NoteIntPvr, 2)),
                alignment: 'right',
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5,
              },
              {
                text: (Math.sign(data.NoteIntCur) == -1 ? "(" + mylib.formatNumber(Math.abs(data.NoteIntCur), 2) + ")" : mylib.formatNumber(data.NoteIntCur, 2)),
                alignment: 'right',
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5,
              },
              {
                text: (Math.sign(data.BenefitAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(data.BenefitAmt), 2) + ")" : mylib.formatNumber(data.BenefitAmt, 2)),
                alignment: 'right',
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5,
              },
              {
                text: (Math.sign(data.AdjustIntPrv) == -1 ? "(" + mylib.formatNumber(Math.abs(data.AdjustIntPrv), 2) + ")" : mylib.formatNumber(data.AdjustIntPrv, 2)),
                alignment: 'right',
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5,
              },
              {
                text: (data.NoteIntAmt = 0 ? '' : (Math.sign(data.NoteIntAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(data.NoteIntAmt), 2) + ")" : mylib.formatNumber(data.NoteIntAmt, 2))), 
                alignment: 'right',
                fillColor: (data.Status == '2' && this.report_date >= data.exDate ? '#D7D7D7' : ''),
                border: [false, false, false, false],
                style: 'setHeight',
                fontSize: 6.5,
              },
            ]
            ret.push(detail)

            if (data.Status == '2' && this.report_date >= data.exDate) {
              let expBond = [
                {
                  text: '',
                  style: 'setHeight',
                  border: [false, false, false, false],
                },
                {
                  text: (data.ExpReason).substring(0, 75),
                  colSpan: 3,
                  fillColor: '#D7D7D7',
                  style: 'setHeight',
                  border: [false, false, false, false],
                  fontSize: 7,
                },
                {},
                {},
                {
                  text: data.ExpDate,
                  alignment: 'center',
                  fillColor: '#D7D7D7',
                  style: 'setHeight',
                  border: [false, false, false, false],
                  fontSize: 6.5,
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  fillColor: '#D7D7D7',
                },
                {
                  text: "(" + mylib.formatNumber(data.NoteAmt, 2) + ")",
                  alignment: 'right',
                  fillColor: '#D7D7D7',
                  border: [false, false, false, false],
                  style: 'setHeight',
                  fontSize: 6.5,
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  fillColor: '#D7D7D7',
                  style: 'setHeight',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  fillColor: '#D7D7D7',
                  style: 'setHeight',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  fillColor: '#D7D7D7',
                  style: 'setHeight',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  fillColor: '#D7D7D7',
                  style: 'setHeight',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  fillColor: '#D7D7D7',
                  style: 'setHeight',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  fillColor: '#D7D7D7',
                  style: 'setHeight',
                }, 
              ]
              ret.push(expBond)
              noteAmt -= data.NoteAmt
            }
        // type ==4 && ((localStorage.lob == data.CompanyOld && data.CompanyName != old_ins)||(localStorage.lob==data.Institute &&  data.InstituteName != old_ins))
            if  ((type ==3 || (type == 4 && data.InsType != 4)) && data.InstituteName != old_ins) {
              // console.log("H1")
              old_ins = data.InstituteName;
            }else if (type ==4 &&data.InsType == 4 && data.CompanyName != old_ins){
              // console.log("H2 type:",type," intT:",data.InsType)
              old_ins = data.CompanyName;
            }
            
          }
        })

        let total = [
          {
            text: 'รวม',
            alignment: 'right',
            colSpan: 6,
            border: [false, false, false, false],
            style: 'summary'
          },
          {},
          {},
          {},
          {},
          {},
          {
            text: (noteAmt == 0 ? '0.00' : (Math.sign(noteAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(noteAmt), 2) + ")" : mylib.formatNumber(noteAmt, 2))),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: '',
            border: [false, false, false, false],
          },
          {
            text: (Math.sign(noteIntPvr) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntPvr), 2) + ")" : mylib.formatNumber(noteIntPvr, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(noteIntCur) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntCur), 2) + ")" : mylib.formatNumber(noteIntCur, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(benefitAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(benefitAmt), 2) + ")" : mylib.formatNumber(benefitAmt, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(adjustIntPrv) == -1 ? "(" + mylib.formatNumber(Math.abs(adjustIntPrv), 2) + ")" : mylib.formatNumber(adjustIntPrv, 2)),
            alignment: 'right',
            style: 'summary'
          },
          {
            text: (Math.sign(noteIntAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(noteIntAmt), 2) + ")" : mylib.formatNumber(noteIntAmt, 2)),
            alignment: 'right',
            style: 'summary'
          }
        ]
        ret.push(total)

        totalNoteAmt += noteAmt;
        totalNoteIntPrv += noteIntPvr;
        totalNoteIntCur += noteIntCur;
        totalBenefitAmt += benefitAmt;
        totalAdjustInt += adjustIntPrv;
        totalNoteIntAmt += noteIntAmt;

        let net = [
          {
            text: 'รวมยอดทั้งสิ้น',
            alignment: 'right',
            colSpan: 6,
            style: 'summaryHeader',
            border : [false,false,false,false]
          },
          {},
          {},
          {},
          {},
          {},
          {
            text: totalNoteAmt == 0 ? '0.00':(Math.sign(totalNoteAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(totalNoteAmt), 2) + ")" : mylib.formatNumber(totalNoteAmt, 2)),
            alignment: 'right',
            style: 'summary',
          },
          {
            text: '',
            border: [false, false, false, false],
          },
          {
            text: (Math.sign(totalNoteIntPrv) == -1 ? "(" + mylib.formatNumber(Math.abs(totalNoteIntPrv), 2) + ")" : mylib.formatNumber(totalNoteIntPrv, 2)),
            alignment: 'right',
            style: 'summary',
          
          },
          {
            text: (Math.sign(totalNoteIntCur) == -1 ? "(" + mylib.formatNumber(Math.abs(totalNoteIntCur), 2) + ")" : mylib.formatNumber(totalNoteIntCur, 2)),
            alignment: 'right',
            style: 'summary',
            
          },
          {
            text: (Math.sign(totalBenefitAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(totalBenefitAmt), 2) + ")" : mylib.formatNumber(totalBenefitAmt, 2)),
            alignment: 'right',
            style: 'summary',
           
          },
          {
            text: (Math.sign(totalAdjustInt) == -1 ? "(" + mylib.formatNumber(Math.abs(totalAdjustInt), 2) + ")" : mylib.formatNumber(totalAdjustInt, 2)),
            alignment: 'right',
            style: 'summary',
       
          },
          {
            text: (Math.sign(totalNoteIntAmt) == -1 ? "(" + mylib.formatNumber(Math.abs(totalNoteIntAmt), 2) + ")" : mylib.formatNumber(totalNoteIntAmt, 2)),
            alignment: 'right',
            style: 'summary',
          
          },
      
        ]
        ret.push(net)
        let detail2 = [
          {
            text: '',
            border: [false, false, false, false],
            colSpan: 6,
          },
          {},
          {},
          {},
          {},
          {},
          {},
          {
            text: '',
            border: [false, false, false, false],
          },
          {},
          {},
          {},
          {},
          {},
          // {},
        ];

        ret.push(detail2);
      } else {
        let detail = [
          {
            text: ' '
          },
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          // {},
        ];

        ret.push(detail);
      }
      return ret;
    },
    export() {
      let detail = "";
      let wTable = [];
      if (this.mType == 1) {
        detail = this.setTableDetail(this.allBond);
        wTable.push(['15%', '9%', '7%', '5%', '6%', '6%', '5%', '9%', '3%', '8%', '7%', '7%', '7%', '8%']);
      } else {
        detail = this.setTableDetailEtc(this.allBond, this.mType);
        wTable.push(['16%', '11%', '5%', '6%', '6%', '5%', '10%', '3%', '8%', '7%', '7%', '7%', '8%']);
      }
      const docDefinition = {
        info: {
          title: 'Report'
        },
        header: function (currentPage, pageCount, pageSize) {
          return [
            { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right', fontSize: 9, margin: [0, 8, 18, 0] },
          ]
        },
        background: function (currentPage, pageSize, headerpageCount,) {
          let now = new Date();
          let month = parseInt(now.getMonth()) + 1;
  
          let date = ("0" + now.getDate()).slice(-2) + "/" + ("0" + month).slice(-2)+ "/" + (now.getFullYear() + 543);
          let time = ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2);
          
          return [
            {
              absolutePosition: { x: 720, y: 40 },
              table: {
                widths: ['25%', '40%'],
                // heights: [15, 15],
                body: [
                  [
                    {
                      text: "Date : ",
                      alignment: 'right',
                      fontSize: 6.5,
                      border: [false, false, false, false],
                    },
                    {
                      text: date,
                      fontSize: 6.5,
                      border: [false, false, false, false],
                    },
                  ],
                  [
                    {
                      text: "Time : ",
                      alignment: 'right',
                      fontSize: 6.5,
                      border: [false, false, false, false],
                    },
                    {
                      text: time,
                      fontSize: 6.5,
                      border: [false, false, false, false],
                    },
                  ],
                ]
              }
            },
            {
            // layout: 'lightHorizontalLines', // optional
            absolutePosition: { x: 10, y: 520 },
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              heights: [15, 15, 15],
              body: [
                [
                  {
                    text: "ผู้จัดทำ...................................................",
                    alignment: 'center',
                    fontSize: 8,
                    border: [false, false, false, false],
                  },
                  {
                    text: "การเงิน...................................................",
                    alignment: 'center',
                    border: [false, false, false, false],
                    fontSize: 8
                  },
                  {
                    text: "บัญชี.....................................................",
                    alignment: 'center',
                    border: [false, false, false, false],
                    fontSize: 8
                  },
                  {
                    text: "รับทราบ...................................................",
                    alignment: 'center',
                    border: [false, false, false, false],
                    fontSize: 8
                  }
                ],
                [
                  {
                    text: "(......................................................................)",
                    alignment: 'center',
                    border: [false, false, false, false],
                    fontSize: 6
                  },
                  {
                    text: "(......................................................................)",
                    alignment: 'center',
                    border: [false, false, false, false],
                    fontSize: 6
                  },
                  {
                    text: "(......................................................................)",
                    alignment: 'center',
                    border: [false, false, false, false],
                    fontSize: 6
                  },
                  {
                    text: "(......................................................................)",
                    alignment: 'center',
                    border: [false, false, false, false],
                    fontSize: 6
                  }
                ],
                [
                  {
                    text: "............/............/............",
                    alignment: 'center',
                    border: [false, false, false, false],
                    fontSize: 6
                  },
                  {
                    text: "............/............/............",
                    alignment: 'center',
                    border: [false, false, false, false],
                    fontSize: 6
                  },
                  {
                    text: "............/............/............",
                    alignment: 'center',
                    border: [false, false, false, false],
                    fontSize: 6
                  },
                  {
                    text: "............/............/............",
                    alignment: 'center',
                    border: [false, false, false, false],
                    fontSize: 6
                  }
                ]
              ]
            },
          },]
        },
        content: [
          {
            // style: 'tableExample',
            layout: 'lightHorizontalLines',
            // layout: 'headerLineOnly',
            table: {
              widths: wTable[0],
              headerRows: 6,
              border: true,
              lineHeight: 1,
              body:detail,
            }
          },
        ],
        styles: {
          setHeight: {
            lineHeight: 1,
            margin: [0, 4]
          },
          header: {
            fontSize: 12,
            bold: true
          },
          subHeader: {
            fontSize: 10,
            bold: false
          },
          anotherStyle: {
            italics: true,
            alignment: 'right'
          },
          sing: {
            fontSize: 10,
            bold: false
          },
          summaryHeader: {
            bold: true,
            lineHeight: 1,
            fontSize: 6.5,
            margin: [5, 4]
          },
          summary: {
            bold: true,
            lineHeight: 1,
            fontSize: 6.5,
            margin: [0, 4]
          }
        },
        defaultStyle: {
          font: 'Sarabun'
        },
        title: 'Report',
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [20, 20, 30, 85],
        // watermark: { text: 'test watermark', color: 'blue', opacity: 0.3, bold: true, italics: false },
      }
      
      pdfMake.vfs = pdfFonts.pdfMake.vfs
      pdfMake.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        },
        Sarabun: {
          normal: 'Sarabun-Regular.ttf',
          bold: 'Sarabun-Bold.ttf',
          italics: 'Sarabun-Italic.ttf',
          bolditalics: 'Sarabun-BoldItalic.ttf'
        },
      }
    pdfMake.createPdf(docDefinition).open({}, window.open('', '_blank'))
    
    },  
  },
    
}
</script>

