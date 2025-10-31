<template>
  <v-container class="mt-3 ">
    <h2>{{ header }}</h2>
    <div class="d-flex justify-end ">
      <v-btn v-if="(bond.Status === '2' && bond.CompanyOld == lob )" elevation="2" class="red mr-2" @click="updateBond">
        <font size="2">ยกเลิกตัดตราสาร</font>
      </v-btn>
      <v-btn v-if="(bond.Status === '0' && bond.CompanyOld == lob)" elevation="2" class="green mr-2" @click="expBond">
        <font size="2">ตัดตราสาร</font>
      </v-btn>
      <v-btn v-if="(bond.CompanyOld == lob )" class="green mr-2" elevation="2" @click="addInterest">
        <font size="2">บันทึกดอกเบี้ย</font>
      </v-btn>
      <v-btn class="primary mr-2" v-if="(bond.CompanyOld == lob)" elevation="2" @click="addAdjustInt"><font size="2">ปรับดอกเบี้ย</font></v-btn>
      <v-btn v-if="(bond.Status != '2' && bond.CompanyOld == lob )" elevation="2" class="defatut mr-2" @click="delBond">
        <font size="2">ลบตราสาร</font>
      </v-btn>
    </div>
    <v-row class="mt-2">
      <v-col class="d-md-inline-flex" cols="4">
          ประเภทตราสาร&nbsp;:&nbsp;&nbsp;{{ bond.DocTypeCode }} - {{ bond.DocTypeName }}
      </v-col>
      <v-col class="d-md-inline-flex" cols="4">
        สถาบันธนาคาร&nbsp;:&nbsp;&nbsp;{{ companyName }}
      </v-col>
      <v-col class="d-md-inline-flex" cols="4">
        สาขา&nbsp;:&nbsp;&nbsp;{{ companyBranchName }}
      </v-col>
    </v-row>
    <v-row >
      <v-col class="d-md-inline-flex" cols="4">
        เลขที่ตราสาร&nbsp;:&nbsp;&nbsp;{{ bond.NoteNo }}
      </v-col>
      <v-col class="d-md-inline-flex" cols="4">
        โบรคเกอร์&nbsp;:&nbsp;&nbsp;{{ (bond.Broker == "" || bond.Broker == null ? "-" : bond.Broker )}}
      </v-col>
    </v-row>
    <v-row >
      <v-col class="d-md-inline-flex" cols="4">
        วันที่ซื้อตั๋ว&nbsp;:&nbsp;&nbsp;{{ bond.PayDate }}
      </v-col>
      <v-col class="d-md-inline-flex" cols="4">
        ระยะเวลา&nbsp;:&nbsp;&nbsp;
        <font v-if="bond.AgeType=='D'">{{ bond.AgeOfNote }}&nbsp;วัน</font>
        <font v-if="bond.AgeType=='M'">{{ bond.AgeOfNote }}&nbsp;เดือน</font>
        <font v-if="bond.AgeType=='Y'">{{ bond.AgeOfNote }}&nbsp;ปี</font>
        <font v-if="bond.AgeType=='C'"> ไม่มีกำหนด </font>
      </v-col>
    </v-row>
    <v-row >
      <v-col class="d-md-inline-flex" cols="4">
        วันที่ออกตั๋ว&nbsp;:&nbsp;&nbsp;{{ bond.NoteDate }}
      </v-col>
      <v-col class="d-md-inline-flex" cols="4">
        วันสิ้นอายุ&nbsp;:&nbsp;&nbsp;{{ (bond.EndingDate == "" || bond.EndingDate == null ? "-" : bond.EndingDate) }}
      </v-col>
    </v-row>
    <v-row >
      <v-col class="d-md-inline-flex" cols="4">
        อัตราดอกเบี้ย&nbsp;:&nbsp;&nbsp;{{ bond.InterestRate }} %
      </v-col>
      <v-col class="d-md-inline-flex" cols="4">
        ราคาตั๋ว&nbsp;:&nbsp;&nbsp;{{ formatNumber(bond.NoteAmt)}}
      </v-col>
      <v-col class="d-md-inline-flex" cols="4">
        จำนวนเงินที่จ่าย&nbsp;:&nbsp;&nbsp;{{ formatNumber(bond.NoteAmtPay) }}
      </v-col>
    </v-row>
    <v-row >
      <v-col class="d-md-inline-flex" cols="4">
        รายละเอียด&nbsp;:&nbsp;&nbsp;{{ (bond.Description == "" ? "-" : bond.Description)  }}
      </v-col>
    </v-row>
    <v-row v-if="(bond.Status ==='2')">
      <v-col class="d-md-inline-flex" cols="6">
        วันที่ตัดตราสาร&nbsp;:&nbsp;&nbsp;{{ (bond.ExpDate == "" || bond.ExpDate == null ? "-" : bond.ExpDate) }}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        
      </v-col>
    </v-row>
    <v-row v-if="(bond.Status ==='2')">
      <v-col class="d-md-inline-flex" cols="4">
        รายละเอียดการตัดตราสาร&nbsp;:&nbsp;&nbsp;{{ (bond.ExpReason == "" || bond.ExpReason == null ? "-" : bond.ExpReason) }}
      </v-col>
    </v-row>
    <br/>
   <hr  v-if="(interest.length>1)"/>
  <br  v-if="(interest.length>1)"/>
  <h4 v-if="(interest.length>1)">ดอกเบี้ยรับ/จ่าย</h4>
    <v-simple-table v-if="(interest.length>1)">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-center" width="3%">
              #
            </th>
            <th class="text-center" width="11%">
              ประเภท
            </th>
            <th class="text-center" width="9%">
              ประเภทการชำระ
            </th>
            <th class="text-center" width="15%">
              เลขที่เช็ค
            </th>
            <th class="text-center" width="10%">
              วันที่เช็ค
            </th>
            <th class="text-center" width="10%">
              สถาบันธนาคาร
            </th>
            <th class="text-center" width="15%">
              สาขา
            </th>
            <th class="text-center" width="10%">
              วันที่รับจ่าย
            </th>
            <th class="text-center" width="17%">
              จำนวนเงิน 
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in interest" :key="item.id">
            <td>{{ item.no}}</td>
            <td>{{ item.benefitType }}</td>
            <td >{{ item.recType }}</td>
            <td>{{ item.chequeNo }}</td>
            <td class="text-center">{{ item.chequeDate }}</td>
            <td>{{ item.bank }}</td>
            <td>{{ item.branch }}</td>
            <td class="text-center">{{ item.transactionDate }}</td>
            <td class="text-right">{{ formatNumber(item.benefitAmt) }}</td>
            <td>
              <v-btn v-if="(item.no < interest.length && item.companyCode == lob && bond.Status == '0')" @click="delItem(item.id)" alt="ลบ" color="red">ลบ</v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <br/>
    <hr v-if="(adjustInt.length>0)"/>
    <br v-if="(adjustInt.length>0)"/>
    <h4 v-if="(adjustInt.length>0)">ปรับดอกเบี้ย</h4>
    <v-simple-table v-if="(adjustInt.length>0)">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left" width="3%">
              #
            </th>
            <th class="text-center" width="20%">
              วันที่มีผล
            </th>
            <th class="text-right" width="50%">
              จำนวนเงิน
            </th>
            <th class="text-center" width="27%">
              หมายเหตุ
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in adjustInt" :key="item.id">  
            <td>{{ item.no}}</td>
            <td class="text-center">{{ item.docDate }}</td>
            <td class="text-right">{{ formatNumber( item.amount )}}</td>
            <td>{{ item.description}}</td>
            <td>
              <v-btn @click="delAdjustItem(item.id)" alt="ลบ" color="red">ลบ</v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <v-col class="d-flex justify-center mb-6">
      <v-btn class="default" elevation="2" large @click="backPath">ย้อนกลับ</v-btn>
    </v-col>
  </v-container>
</template>

<script>
import axios from 'axios';
import * as mylib from '@/app'
// const API_URL = "http://localhost:3001/api"
const API_URL = "http://corf.oneeclick.co:3002/api";
export default {
  name: 'BondDetail',
  data: () => ({
    lob: localStorage.lob,
    id:'',
    noteNo: '',
    note:'',
    bond: [],
    noteType: '',
    insType: '',
    interest: [],
    adjustInt:[],
    sumInt: 0,
    mType: 0,
    header: '',
    comCode:'',
    companyName: '',
    companyBranchName: '',
    menu:''
  }),
  created() {
    this.noteNo = this.$route.query.noteno;
    this.insType = this.$route.query.instype;
    this.id = this.$route.query.id;
    this.mType = this.$route.query.type;
    this.menu = this.$route.query.menu;
    this.getBond();
  },
  methods: {
    formatNumber(num) {
      return mylib.formatNumber(num, 2);
    },
    backPath() {
      // console.log(this.bond.NoteTypeID, "--", this.bond.InsType)
      // if (this.bond.NoteTypeID == 1) {
      if (this.menu == 1 || this.type==1) {         // console.log("case1");
        this.$router.push({ path: '/deposit' }).catch(() => { });
        // } else if ((this.bond.CompanyOld == this.lob && this.bond.NoteTypeID == 3) || (this.bond.Institute == this.lob && this.bond.NoteTypeID == 4)) {
      } else if (this.menu == 3 || this.type == 3) {
        if (this.bond.InsType == 4) {
          // console.log("case2");
          this.$router.push({ path: '/borrower/4'}).catch(() => { });
        } else {
          // console.log("case3");
          this.$router.push({ path: '/borrower/0' }).catch(() => { });
        }
        // } else if ((this.bond.CompanyOld == this.lob && this.bond.NoteTypeID == 4) || (this.bond.Institute == this.lob && this.bond.NoteTypeID == 3)) {
      } else if (this.menu == 4 || this.type == 4) {
        if (this.bond.InsType == 4) {
          // console.log("case4");
          this.$router.push({ path: '/lender/4' }).catch(() => { });
        } else {
          // console.log("case5");
          this.$router.push({ path: '/lender/0' }).catch(() => { });
        }
      } else if (this.menu == 'int') {
        this.$router.push({ path: '/interest/' }).catch(() => { });
      } else if (this.menu == 'exbond') {
        this.$router.push({ path: '/expbond/'}).catch(() => { });
      } else if (this.menu == 'adj') { 
        this.$router.push({ path: '/interest/adjust/' }).catch(() => { });
      } else {
        this.$router.push({ name: 'NotFound' }).catch(() => { });
      }
    },
    delItem(id) {
      if (confirm("ต้องการยืนยันลบข้อมูล ใช่หรือไม่")) {
        axios
          .post(API_URL + "/interest/del", { params: { id: id } })
          .then(res => {
            this.getInterest(this.id);
          });
      }
    },
    delAdjustItem(id) {
      if (confirm("ต้องการยืนยันลบข้อมูล ใช่หรือไม่")) {
        axios
          .put(API_URL + "/adjust/del", { params: { id: id } })
          .then(res => {
            this.getAdjustInt(this.id);
          });
      }
    },
    addAdjustInt() {
      this.$router.push({ name: '/interest/adjust/add', query: { lob: localStorage.lob, bondid: this.id, menu:this.menu } }).catch(()=>{});
    },
    addInterest() {
      this.$router.push({ name: '/interest/add', query: { lob: localStorage.lob, bondid: this.id, menu: this.menu,insid:this.comCode } }).catch(()=>{});
    },
    updateBond() {
      let status = 0;
      if (this.bond.Status == "PROCESS") {
        status = 2;
      }
      if (confirm("ต้องการยืนยันการตัดตราสาร ใช่หรือไม่")) {
        axios
          .post(API_URL + "/bond/update/exp", {
            params: {
              id: this.id,
              date: '',
              reason: '',
              status: status
            }
          })
          .then(res => {
            console.log("success!!")
            this.getBond();
          })
          .catch(err => {
            console.log(err);
          });
      }
    },
    delBond() {

      if (confirm("ต้องการยืนยันลบข้อมูล ใช่หรือไม่")) {
        axios
          .post(API_URL + "/bond/del", {
            params: {
              id: this.id,
              userId: localStorage.userID
            }
          })
          .then(res => {
            console.log("success!!")
            // this.getBond();
            this.$router.go(-1);
          })
          .catch(err => {
            console.error(err);
          });
      }
    },
    
    getBond() {
      axios
        .get(API_URL + '/bond/report_transection', { params: { id: this.id, noteno: this.noteNo, lob: localStorage.lob, instype: this.insType, type: this.type } })
        .then(res => {
          this.bond = res.data[0]
          console.log(this.bond);
          this.id = this.bond.ID;
          this.noteNo = this.bond.NoteNo;

          if (this.bond.NoteTypeID == 1) {
            this.header = "ข้อมูลบัญชีเงินฝาก";
            this.companyName = this.bond.InstituteName;
            this.comCode = this.bond.Institute;
            this.companyBranchName = this.bond.InstituteBranch;
          } else if ((this.bond.CompanyOld == this.lob && this.bond.NoteTypeID == 3) || (this.bond.Institute == this.lob && this.bond.NoteTypeID == 4)) {
            if (this.bond.CompanyOld == this.lob) {
              this.companyName = this.bond.InstituteName;
              this.comCode = this.bond.Institute;
              this.companyBranchName = (this.bond.InstituteBranch!="NULL"?this.bond.InstituteBranch:"");
            } else {
              this.companyName = this.bond.CompanyName;
              this.comCode = this.bond.CompanyCode;
              this.companyBranchName = "";
            }
            if (this.bond.InsType == 4) {
              this.header = "ข้อมูลเงินให้กู้ยืมกับบริษัทในเครือ";
            } else {
              this.header = "ข้อมูลเงินให้กู้ยืม";
            }
          } else if ((this.bond.CompanyOld == this.lob && this.bond.NoteTypeID == 4) || (this.bond.Institute == this.lob && this.bond.NoteTypeID == 3)) {
            if (this.bond.CompanyOld == this.lob) {
              this.companyName = this.bond.InstituteName;
              this.companyBranchName = this.bond.InstituteBranch;
            } else {
              this.companyName = this.bond.CompanyName;
              this.companyBranchName = "";
            }
            if (this.bond.InsType == 4) {
              this.header ="ข้อมูลเงินกู้ยืมกับบริษัทในเครือ"
            } else {
              this.header = "ข้อมูลเงินกู้ยืม"
            }
          }
          // console.log(this.bond.ID,"-----",this.bond.NoteNo,">>>",this.noteNo)
          this.getInterest(this.id);
          this.getAdjustInt(this.id);
        })
    },
    getInterest(bondId) {

      axios
        .get(API_URL + '/interest/', { params: { bondid: bondId, key: 'Y' } })
        .then(res => {
          this.interest = res.data
        })
    },
    expBond() {
      this.$router.push({ name: '/expbond/update', query: { id: this.id, lob: localStorage.lob, menu: this.menu } }).catch(()=>{});
    },
    getAdjustInt(bondId) {
      axios
        .get(API_URL + '/adjust/', { params: { bondid: bondId} })
        .then(res => {
          this.adjustInt = res.data
          // console.log(this.adjustInt)
        })
    }
  },
}
</script>

