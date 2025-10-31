<template>
  <v-container class="mt-3 ">
    <h2>ตัดตราสาร</h2>
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
                <p class="mt-n2 mr-2 mlabel">วันที่หมดอายุ&nbsp;:</p>
              </td>
              <td>
                <v-menu v-model="date" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
                  min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="report_date" label="Date" clearable prepend-inner-icon="mdi-calendar" readonly v-bind="attrs"
                      v-on="on" solo>
                    </v-text-field>
                  </template>
                  <v-date-picker v-model="report_date" locale="th" no-title @input="date = false" @change="setReportDateTH"></v-date-picker>
                </v-menu>
              </td>
              <td>
                <p class="mt-n2 mr-2 mlabel">ถึง&nbsp;:</p>
              </td>
              <td>
                <v-menu v-model="date2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
                  min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="to_date" label="Date" clearable prepend-inner-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"
                      solo>
                    </v-text-field>
                  </template>
                  <v-date-picker v-model="to_date" locale="th" no-title @input="date2 = false" @change="setToDateTH"></v-date-picker>
                </v-menu>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <p class="mt-n5">{{ reportDateTH }}</p>
              </td>
              <td></td>
              <td>
                <p class="mt-n5">{{ toDateTH }}</p>
              </td>
            </tr>
            <tr>
              <td>
                <p class="mt-n2 mr-2 mlabel">ตราสาร&nbsp;:</p>
              </td>
              <td>
                <v-select v-model="docType" :items="docTypeList" label="Document Type" item-text="name" item-value="id" clearable solo>
                </v-select>
              </td>
              <td>
                <p class="mt-n2 mr-2 mlabel">เลขที่ตราสาร&nbsp;:</p>
              </td>
              <td>
                <v-autocomplete v-model="noteNo" clearable label="Note No." :items="listNoteNo" solo></v-autocomplete>
              </td>
            </tr>
            <tr>
              <td>
                <p class="mt-n2 mr-2 mlabel">สถาบันธนาคาร&nbsp;:</p>
              </td>
              <td>
                <v-select v-model="institute" :items="institueList" label="Institute" item-text="name" item-value="id" clearable solo>
                </v-select>
              </td>
              <td>
                <p class="mt-n2 mr-2 mlabel">ประเภท&nbsp;:</p>
              </td>
              <td>
                <v-select v-model="mType" :items="mTypeList" label="Type" item-text="name" item-value="id" clearable solo></v-select>
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
    <br/>
    <v-spacer></v-spacer>
<hr/>
<template class="mt-6">
  <div>
    <v-data-table 
      :headers="headers"
      :items="bond" 
      :options.sync="options" 
      :server-items-length="totalBond"
      hide-default-footer
      :loading="loading" 
      class="elevation-1">
      <template v-slot:item.NoteAmt="{ item }">
        <p class="text-right mt-4">{{ formatNumber(item.NoteAmt) }}</p>
      </template>
      <template v-slot:item.StatusDesc="{ item }" >
        <v-chip :color="getColor(item.StatusDesc)" dark>
          {{ item.StatusDesc }}
        </v-chip>
      </template>
      <template v-slot:item.tools="{item}">
        <v-btn @click="getDetail(item.ID)" alt="รายละเอียด"><font size="2">รายละเอียด</font></v-btn>&nbsp;&nbsp;
      </template> 
    </v-data-table>
    <hr />
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
  name: 'ExBondSearch',
  data: () => ({
    noteNo: '',
    search: '',
    rs_search: '',
    searchForm: '',
    singleSelect: false,
    totalBond: 0,
    docType:'',
    institute: '',
    mType: '',
    reportDateTH: '',
    toDateTH:'',
    institueList:[],
    bond: [],
    allBond: [],
    docTypeList: [],
    mTypeList: [
      {
        id: 'all',
        name: "ทั้งหมด"
      },
      {
        id:'1',
        name: "บัญชีเงินฝาก"
      },
      {
        id: '3',
        name: "เงินให้กู้ยืม"
      }
    ],
    loading: false,
    options: {},
    date: '',
    date2: '',
    report_date:'',
    to_date: '',
    report_date_thai: '',
    company: localStorage.lobName,
    listTable: [],
    listNoteNo: [],
 
    headers: [
      {
        text: 'สถาบัน/ธนาคาร',
        align: 'start',
        sortable: false,
        value: 'InstituteName',
      },
      { text: 'เลขที่ตั๋ว', value: 'NoteNo' },
      { text: 'ตราสาร', value: 'DocTypeCode' },
      { text: 'วันที่ซื้อ', value: 'NoteDate' },
      { text: 'ครบกำหนด', value: 'EndingDate' },
      { text: 'ดอกเบี้ย %', value: 'InterestRate' },
      { text: 'จำนวนเงิน', value: 'NoteAmt' },
      { text: 'สถานะ', value: 'StatusDesc' },
      { text: '', value: 'tools' },
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
  created(){
    axios
      .get(API_URL + "/bond/getnote", { params: { lob: localStorage.lob ,type:'13' } })
      .then(res => {
        this.listNoteNo = res.data;
      })

    axios
      .get(API_URL + "/master/doctype")
      .then(res => {
        this.docTypeList = res.data;
      })

    axios
      .get(API_URL + "/master/institute")
      .then(res => {
        // this.brokerList = res.data;
        this.institueList = res.data;
      })
  },
  mounted() {
    if (localStorage.lob) {
      this.lob = localStorage.lob;
    }
  },
  methods: {
    formatNumber(num) {
      return mylib.formatNumber(num, 2);
    },
    getColor(status) {
      if (status == 'DELETE') return 'red'
      else if (status == 'PROCESS') return 'orange'
      else return 'green'
    },
    adjustBond(id) {
      this.$router.push({ name: '/expbond/update', query: { id: id ,lob: localStorage.lob } }).catch(()=>{});
    },
    getDetail(id) {
      this.$router.push({ name: '/bond/detail', query: { id: id, lob: localStorage.lob ,menu:'exbond'} }).catch(()=>{});
    },

    searchBond() {
      this.loading = true
      this.getBond().then(data => {
        this.bond = data.items
        this.totalBond = data.total
        this.loading = false
      })
    },
    async getBond() {
      if (this.report_date == "") {
        let dNow = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10);
        this.report_date = dNow;
        this.reportDateTH = mylib.setDateTH(dNow);
      }
      return new Promise((resolve, reject) => {
        try {
          axios
            .get(API_URL + '/bond/report_transection', { params: { date: this.report_date, to_date: this.to_date, lob: localStorage.lob, instype: this.$route.params.id, type: '13', noteno: this.noteNo, doc_type: this.docType, ins: this.institute } })
            .then(res => {
              const { sortBy, sortDesc, page, itemsPerPage } = this.options
              let items = [];
              let list = res.data;
              this.allBond = res.data;
              const total = items.length - 1
              list.forEach(l => {
                if (l.Key == 'D') {
                  items.push(l);
                }
              })
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
    setReportDateTH(e) {
      this.reportDateTH = mylib.setDateTH(e);
    },
    setToDateTH(e) {
      this.toDateTH = mylib.setDateTH(e);
    }
  }
    
}
</script>

