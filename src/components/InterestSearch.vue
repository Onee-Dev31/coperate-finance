<template>
  <v-container class="mt-3 ">
    <h2>ข้อมูลดอกเบี้ย</h2>
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
              <p class="mt-n2 mr-2 mlabel">เดือนที่รับจ่าย&nbsp;:</p>
            </td>
            <td>
              <v-menu v-model="date" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
                min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="report_date" label="Month" clearable prepend-inner-icon="mdi-calendar" readonly
                    v-bind="attrs" v-on="on" solo>
                  </v-text-field>
                </template>
                <v-date-picker v-model="report_date" locale="th" type="month" no-title @input="date = false" @change="setDateTH"></v-date-picker>
              </v-menu>
            </td>
            <td>
              <p class="mt-n2 mr-2 mlabel">ประเภทดอกเบี้ย&nbsp;:</p>
            </td>
            <td>
              <v-select v-model="int_type" :items="intType" label="Interest Type" item-text="name" item-value="id" clearable solo>
              </v-select>
            </td>
          </tr>
          <tr>
            <td></td>
            <td><p class="mt-n5">{{ reportDateTH }}</p></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
          <td>
            <p class="mt-n2 mr-2 mlabel">เลขที่ตราสาร&nbsp;:</p>
          </td>
          <td>
            <v-autocomplete v-model="noteNo" clearable label="Note No." :items="listNoteNo" solo></v-autocomplete>
          </td>
          <td>
            <p class="mt-n2 mr-2 mlabel">สถาบันธนาคาร&nbsp;:</p>
          </td>
          <td>
            <v-select v-model="institute" :items="institueList" label="Institue" item-text="name" item-value="id" clearable solo>
            </v-select>
          </td>
        </tr>
        <tr style="height:50px">
          <td colspan="4" class="justify-center text-center">
            <v-btn color="default" elevation="2" large alt="Search" @click="searchInt">ค้นหาข้อมูล</v-btn>
          </td>
        </tr>
        </v-simple-table>
      </v-form>
    </v-card>
    <br/>
    <!-- <v-row class="mt-1 ">
      <v-col class="d-flex justify-end mb-6">
        <v-btn class="primary" elevation="2" large alt="Add Transection" @click="addInterest">เพิ่มข้อมูล</v-btn>
      </v-col>
    </v-row> -->
    <br/>
    <v-spacer></v-spacer>
<template class="mt-6">
  <div>
    <v-data-table 
      :headers="headers"
      :items="interest" 
      :options.sync="options" 
      :server-items-length="totalInterest"
      hide-default-footer
      :loading="loading" 
      class="elevation-1">
      <template v-slot:item.benefitAmt="{ item }" >
        <p class="text-right mt-4">{{  formatNumber(item.benefitAmt)  }}</p>
      </template>
      <template v-slot:item.tools="{item}">
        <v-btn @click="getDetail(item.bondId)" alt="รายละเอียด">รายละเอียด</v-btn>&nbsp;&nbsp;
        <!-- <v-btn @click="delItem(item.id)" v-if="(item.companyCode == lob)" alt="ลบ" color="red">ลบ</v-btn> -->
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
// import pdfMake from 'pdfmake'
// import pdfFonts from '../assets/custom-fonts.js'
import axios from 'axios'
import * as mylib from '@/app'
// const API_URL = "http://localhost:3001/api"
const API_URL = "http://corf.oneeclick.co:3002/api";
export default {
  name: 'InterestSearch',
  data: () => ({
    search: '',
    rs_search: '',
    searchForm:'',
    singleSelect: false,
    lob: localStorage.lob,
    date:'',
    report_date: '', 
    institute: '',
    reportDateTH:'',
    totalInterest: 0,
    interest: [],
    allInterest: [],
    institueList: [],
    loading: false,
    options: {},
    noteNo: '',
    listNoteNo:[],
    int_type:'',
    intType: [{
      id: 'ALL',
      name: 'ทั้งหมด',
    }, {
      id: 'INT',
      name: "ดอกเบี้ยรับ"
    }, {
      id: 'INTEXP',
      name: "ดอกเบี้ยจ่าย"
    }],
    
    headers: [
      { text: 'ประเภทดอกเบี้ย', value: 'benefitType' },
      { text: 'เลขที่ตั๋ว', value: 'noteNo' },
      { text: 'วันที่รับจ่าย', value: 'transactionDate' },
      { text: 'ประเภทการชำระ', value: 'recType' },
      { text: 'จำนวนเงิน', value: 'benefitAmt' },
      { text: '', value: 'tools' },
    ],
    
  }),
  watch: {
    options: {
      handler() {
        this.searchInt();
      },
      deep: true,
    },
    
  },
  created(){
    axios
      .get(API_URL + "/bond/getnote", { params: { lob: localStorage.lob, type: '13' } })
      .then(res => {
        this.listNoteNo = res.data;
      })
    axios
      .get(API_URL + "/master/institute")
      .then(res => {
        // this.brokerList = res.data;
        this.institueList = res.data;
      })
  },
  methods: {
    formatNumber(num) {
      return mylib.formatNumber(num, 2);
    },
    delItem(id) {
      if (confirm("ต้องการยืนยันลบข้อมูล ใช่หรือไม่")) {
        axios
          .post(API_URL + "/interest/del", { params: { id: id } })
          .then(res => {
            this.searchInt();
          })
      }
    },
    getDetail(bondId) {
      this.$router.push({ name: '/bond/detail', query: { id: bondId, lob: localStorage.lob ,menu:'int'} }).catch(()=>{});
    },
    addInterest() {
      this.$router.push({ name: '/interest/add', query: { lob: localStorage.lob } }).catch(()=>{});
    },
    searchInt() {
      this.loading = true
        this.getInt().then(data => {
          this.interest = data.items
          this.totalInterest = data.total
          this.loading = false
        })
    },
    async getInt() {
      if(this.report_date ==''){
        let dNow = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10);
        let tDate = dNow.split("-");
        this.report_date = tDate[0] + "-" + tDate[1];
        this.reportDateTH = mylib.setMonthTH(this.report_date)
      }
      return new Promise((resolve, reject) => {
        try {
          axios
            .get(API_URL + '/interest', { params: { date: this.report_date, lob: localStorage.lob, inttype: this.int_type, noteno: this.noteNo , key: 'N' ,ins : this.institute} })
            .then(res => {
              const { sortBy, sortDesc, page, itemsPerPage } = this.options
              let items = res.data;
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
        } catch (error) {
          console.error(error);
        }
      })
    },
    setDateTH(e) {
      this.reportDateTH = mylib.setMonthTH(e)
    }
  }
    
}
</script>

