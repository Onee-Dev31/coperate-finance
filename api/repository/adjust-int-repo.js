const { getConnection } = require("../config");
const DB = 'corporate_finance_onee'

const deleteAdjustInt = async (res, req, mConn = null) => {
    let conn = null;
    // console.log(req)
    var params = req.body.params;
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `update ${DB}.adjust_int 
                set
                    is_delete='1'
                where
                    id = ${params.id} `;
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

const updateAdjustInt = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.body.params;
    // console.log("in set>>>", params.docType)
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `update ${DB}.adjust_int 
                set
                    company_code = '${params.lob}', 
                    ins_code ='${params.insCode}',
                    transaction_date='${params.reportDate}',

                    doc_type_code = '${params.docType}',
                    note_no = '${params.noteNo}',
                    amount = '${params.amount}',
                    description = '${params.description}',
                    user_id = '1'
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

const setAdjustInt = async (res, req, mConn = null) => {
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
        var sql = `insert into ${DB}.adjust_int
                    ( bond_id,company_code,ins_code,transaction_date,doc_type_code,note_no,amount,description,user_id)
                    values
                    ('${params.bondId}','${params.lob}','${params.insCode}','${params.reportDate}','${params.docType}','${params.noteNo}','${params.amount}','${params.description}','${params.userId}')
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

const getAdjustInt = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.query;
    var condition = "";
    try {
        if (params.hasOwnProperty("lob")&&params.lob!="") {
            condition += " and com_code_old = '"+params.lob+"' ";
            // return res.status(500).json({ 'msg': "ไม่พบข้อมูล LOB" }).end();
        }
        if (params.hasOwnProperty('date')) {
            if (params.date != "") {
                condition += "and transaction_date like '" + params.date + "%' ";
            }
        }
        if (params.hasOwnProperty('doctype')) {
            if (params.doctype != "") {
                condition += "and doc_type_code ='" + params.doctype + "' ";
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
        var sql = `SELECT * FROM ${DB}.transaction_adjust_int where is_delete = '0' ${condition} order by transaction_date`;
        // console.log("getAdjustInt sql>>",sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result)));
            // console.log(rs)
            const adjInt = tranformAdjustInt(rs,params.key);
            // console.log(adjInt)
            return res.status(200).json(adjInt).end();
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

const tranformAdjustInt = (input,key) => {
    let ret = [];
    // var recType = "";
    let i = 1;
    input.forEach(resRow => {
        const row = {
            'no':i++,
            'id': resRow['id'], 
            'bondId':resRow['bond_id'],
            'noteNo' : resRow['note_no'],
            'docType': resRow['doc_type_code'],
            'docTypeName':resRow['doc_type_name'],
            'docDate': formatDateThai(resRow['doc_date']),
            'insCode': resRow['ins_code'],
            'insName': resRow['ins_name'],
            'amount': resRow['amount'], 
            'description': resRow['description']
        }
        ret.push(row)
    });
    
    return ret;
}

module.exports = {
    deleteAdjustInt,
    getAdjustInt,
    setAdjustInt,
    updateAdjustInt
}