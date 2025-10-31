const { getConnection } = require("../config");
const DB = 'corporate_finance_onee'

const updateInterest = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.body.params;
    // console.log("in set>>>", params.docType)
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `update ${DB}.interest 
                set
                    rec_type=${params.recType},
                    ins_code='${params.insCode}',
                    ins_branch='${params.insBranch}',
                    note_no='${params.noteNo}',
                    cheque_no='${params.chequeNo}',
                    cheque_date='${params.chequeDate}',
                    transaction_date='${params.transactionDate}',
                    doc_type_code='${params.docType}',
                    benefit_type=${params.benefitType},
                    benefit_amt=${params.benefitAmt},
                    description='${params.description}'
                where
                    id = ${params.id} `;
        // console.log("sql>>>", sql)
        conn.query(sql, (err, result) => {
            if(err) return res.status(500).end(); 
            // if(err) console.error(err)
            return res.status(200).json({'msg':"แก้ไขข้อมูลสำเร็จ"}).end();
        })
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const delInterest = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.body.params;
    // console.log("in del>>>", params)
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `update ${DB}.interest 
                set
                    is_delete='1'
                where
                    id = ${params.id} `;
        // console.log("sql>>>", sql)
        conn.query(sql, (err, result) => {
            if(err) return res.status(500).end(); 
            // if(err) console.error(err)
            return res.status(200).json({'msg':"ลบข้อมูลสำเร็จ"}).end();
        })
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const setInterest = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.body.params;
    // let comcode = '1091';
    // console.log("in set>>>", params)
    let diff = '';
    try {
        if (!params.hasOwnProperty("lob")) {
            return res.status(500).json({ 'msg': "ไม่พบข้อมูล LOB" }).end();
        }
        if (params == null) {
            return res.status(500).json({'msg':"กรุณากรอกข้อมูลก่อนทำรายการ"}).end();
        }
        conn = mConn ? mConn : await getConnection();
        var sql = `insert into ${DB}.interest 
                    (bond_id,company_code,rec_type,ins_code,ins_branch,cheque_no,cheque_date,transaction_date,doc_type_code,note_type,note_no,inttitue,benefit_type,benefit_amt,description,user_id)
                    values
                    ('${params.bondId}','${params.lob}','${params.recType}','${params.insCode}','${params.insBranch}','${params.chequeNo}','${params.chequeDate}','${params.transactionDate}','${params.docType}','${params.noteType}','${params.noteNo}','${params.inttitue}','${params.benefitType}','${params.benefitAmt}','${params.description}','${params.userId}')
                    `;
        // console.log("sql>>>", sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            return res.status(200).json({'msg':"บันทึกข้อมูลสำเร็จ"}).end();
        })
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const getInterest = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.query;
    var condition = "";
    // console.log(params)
    try {
        if (params.hasOwnProperty("lob")&&params.lob!="") {
            condition += " and com_code_old = '"+params.lob+"' ";
            // return res.status(500).json({ 'msg': "ไม่พบข้อมูล LOB" }).end();
        }
        if (params.hasOwnProperty('date')) {
            if (params.date != "") {
                condition += "and trans_date like '" + params.date + "%' ";
            }
        }
        if (params.hasOwnProperty('inttype')) {
            if (params.inttype != "" && params.inttype != "ALL") {
                condition += "and benefit_type ='" + params.inttype + "' ";
            }
        }
        if (params.hasOwnProperty('noteno')) {
            if (params.noteno != "") {
                condition += "and note_no = '" + params.noteno + "' ";
            }
        }
        if (params.hasOwnProperty('bondid')) {
            if (params.bondid != "") {
                condition += "and bond_id = '" + params.bondid + "' ";
            }
        }

        if (params.hasOwnProperty('ins')) {
            if (params.ins != "") {
                condition += "and ins_code = '" + params.ins + "' ";
            }
        }
        // console.log(params)
        // console.log("condition >> ",condition)
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT * FROM ${DB}.transaction_interest where is_delete = '0' ${condition} group by id order by trans_date`;
        // console.log("getInterest sql>>",sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result)));
            const interest = tranformInterest(rs,params.key);
            // console.log(interest)
            return res.status(200).json(interest).end();
        })
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const formatDateThai = (input) => {
    if (input != "" && input != "00/00/0000" && input != null) {
        let date = input.split("/");
        return date[0]+"/"+date[1]+"/"+(parseInt(date[2])+543)
    }
    return "";
}

// const formatNumber = (num) => {
//     if (num != "" && num!=null) {
//         num = parseFloat(num).toFixed(2);
//         return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
//     }
//     return "";
// }

const tranformInterest = (input,key) => {
    let ret = [];
    var recType = "";
    var sum = 0;
    let i = 1;
    input.forEach(resRow => {
        sum += parseFloat(resRow['benefit_amt']);
        if (resRow['rec_type'] == 1) {
            recType = "เช็ค";
        } else if (resRow['rec_type'] == 2) {
            recType = "เงินสด";
        } else if (resRow['rec_type'] == 3) {
            recType = "ฝากดอกเบี้ยต่อ";
        }
        const row = {
            'no': i++,
            'id': resRow['id'], 
            'bondId':resRow['bond_id'],
            'companyCode':resRow['com_code_old'],
            'noteNo' : resRow['note_no'],
            'benefitType': (resRow['benefit_type']=='INT'?"ดอกเบี้ยรับ":"ดอกเบี้ยจ่าย"), 
            'recType': recType, 
            'chequeNo': resRow['cheque_no'],
            'chequeDate': formatDateThai(resRow['cheque_date']),
            'bank': resRow['ins_code'],
            'branch': resRow['ins_branch'],
            'transactionDate': formatDateThai(resRow['transaction_date']), 
            'benefitAmt': resRow['benefit_amt'], 
        }
        ret.push(row)
    });
    
    if (key == "Y") {
         const row = {
            'id': "รวม", 
            'benefitType': '', 
            'recType': '', 
            'transactionDate': 'รวม', 
            'benefitAmt': sum, 
        }
        ret.push(row)
    }
   
    return ret;
}

module.exports = {
    getInterest,
    setInterest,
    updateInterest,
    delInterest
}