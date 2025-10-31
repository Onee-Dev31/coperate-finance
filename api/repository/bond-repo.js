const { getConnection } = require("../config");
const readXlsxFile = require('read-excel-file/node');
const DB = 'corporate_finance_onee'

const updateBond = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.body.params;
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `update ${DB}.bond 
                set
                    ins_code='${params.ins}',
                    ins_type_id=${params.insType},
                    ins_branch_code='${params.branch}',
                    doc_type_code='${params.docType}',
                    note_no='${params.noteNo}',
                    age_of_note='${params.times}',
                    age_type='${params.ageType}',
                    note_date='${params.createDate}',
                    ending_date='${params.endDate}',
                    int_rate='${params.intRate}',
                    note_amt=${params.noteAmt},
                    note_amt_pay=${params.noteAmtPay},
                    status='${params.status}',
                    broker='${params.broker}',
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

const updateExpBond = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.body.params;

    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `update ${DB}.bond 
                set
                    exp_date=${(params.date==''?null: "'"+params.date+"'")},
                    exp_reason=${(params.reason==''?null:"'"+params.reason+"'")},
                    status = '${params.status}',
                    user_id='1'
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

const delBond = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.body.params;

    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `update ${DB}.bond 
                set
                    status = '1',
                    user_id='${params.userId}'
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

const setBond = async (res, req, mConn = null) => {
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
            return res.status(500).json({'msg':"กรุณากรอกข้อมูล"}).end();
        }
        if (params.ageType == 'D') {
            diff = params.times;
        } else if (params.ageType == 'M') {
            diff = getDateDiff(params.endDate, params.createDate)
        } else {
            diff= '99999'
        }
        // console.log("diff date >> ",diff)
        conn = mConn ? mConn : await getConnection();
        var sql = `insert into ${DB}.bond 
                    (company_code,ins_code,ins_type_id,ins_branch,note_type_id,doc_type_code,note_no,age_of_note,age_type,days_of_note,pay_date,note_date,ending_date,int_rate,int_rate_type,note_amt,note_amt_pay,status,broker,description,from_exchange_rate,to_exchange_rate,exchange_rate,user_id)
                    values
                    ('${params.lob}','${params.ins}','','${params.branch}','${params.mType}','${params.docType}','${params.noteNo}','${params.times}','${params.ageType}','${diff}','${params.buyDate}','${params.createDate}','${params.endDate}','${params.intRate}','P',${params.noteAmt},${params.noteAmtPay},'0','${params.broker}','${params.description}','${params.fromExRate}','${params.toExRate}','${params.rate}',${params.userId})`;
        // console.log("sql>>>", sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if (err) console.error(err)
            // console.log("rs>>>",  result.insertId)
            // console.log("err>>",err)
            return res.status(200).json({'msg':"บันทึกข้อมูลสำเร็จ",id:result.insertId}).end();
        })
        // console.log("rs>>>",  conn)
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const checkBond = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.query;
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT note_no,doc_type_code,doc_type_name FROM ${DB}.report_transaction where status <> '1' and note_no = '${params.noteno}'  `;
        console.log("chkBond sql>>",sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result)));
            // console.log(rs)
            const bond = tranformChkBond(rs);
            return res.status(200).json(bond).end();
        })
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const getBond = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.query;
    var condition = "";
    try {
        if (!params.hasOwnProperty("lob")) {
            return res.status(500).json({ 'msg': "ไม่พบข้อมูล LOB" }).end();
        }

        if (params.hasOwnProperty("type")&& params.type != "") {
           if (params.type == 1) {
                 condition += " and com_code_old = '" + params.lob + "' and note_type_id = '1'";
            } else if (params.type == 3) {    
                condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '4') or (com_code_old = '" + params.lob + "' and note_type_id = '3'))";
            } else if (params.type == 4) {
                condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '3') or (com_code_old = '" + params.lob + "' and note_type_id = '4'))";
            }
        }
        if (params.hasOwnProperty("id")&& params.id != "") {
            condition += " and id = '"+params.id+"' "
        }
        if (params.hasOwnProperty("noteno")&& params.noteno != "") {
            condition += " and note_no = '" + params.noteno + "'";
        }

        if (params.hasOwnProperty("doctype")&& params.doctype != "") {
            condition += " and doc_type_code = '" + params.doctype + "'";
        }
        if (params.hasOwnProperty("instype")&& params.instype != "") {
            if (params.instype == '4') {
                condition += " and  ins_type_id = 4 ";
            } else {
                condition += " and  ins_type_id <> 4 ";
            }
        }
        // console.log(params)
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT * FROM ${DB}.transaction_bond where status <> 'DELETE' ${condition} order by company_name,status,start_date,doc_type_code,note_no `;
        console.log("getBond sql>>",sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result)));
            // console.log(rs)
            const bond = tranformBond(rs);
            return res.status(200).json(bond).end();
        })
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const getReportTransaction_old = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.query;
    var condition = "";
    var conByDate = "";
    var calInt = "";
    let reportDate = "";
    let orderBy = "";
    // console.log("In function ",params)
    try {
        
        if (!params.hasOwnProperty("lob")) {
            return res.status(500).json({ 'msg': "ไม่พบข้อมูล LOB" }).end();
        }
        if (params.hasOwnProperty("date") && params.date != ""&& !params.hasOwnProperty("to_date")) {
            let sDate = params.date.substring(0, 8)+"01";
            reportDate = params.date;
            // if (params.hasOwnProperty("menu") && params.menu == 'exbond') {
            //     conByDate += "";
            // } else {
                // condition += " and (('" + params.date + "' BETWEEN start_date and end_date) or (age_type = 'C' and '" + params.date + "'>=start_date ) or (status = '2' and ex_date between '" + sDate + "' and '" + params.date + "'))"
            conByDate += " and ((age_type = 'C' and ((status='0' and '" + params.date + "'>=start_date ) or (status = '2' and '" + params.date + "' between start_date and last_day(ex_date) )))";
            conByDate += " or (age_type <> 'C' and (status = '2' and(isnull(ex_date) = 0  and '" + params.date + "' between start_date and last_day(ex_date)) "
            conByDate += " or(status = '0' and '" + params.date + "'  >= start_date)) )) "
            // }
            
            let lastDayPrvMonth = getLastDayPrvMonth(reportDate,'DB');
            let firstDate = getFirstDay(lastDayPrvMonth, 'DB');
            let firstReportDate = getFirstDay(reportDate, 'DB','');
            // let lastDayPrv = getLastDayPrvMonth(firstDate, 'DB');

            // console.log(reportDate,"--",firstDate,"--",lastDayPrvMonth)
            calInt += ",ifnull((select round(sum(benefit_amt),2) from " + DB + ".interest where  bond_id = a.id and transaction_date between a.note_date and '" + reportDate + "' and is_delete=0 group by note_no),0) as benefit_amt "
            calInt += ",ifnull((select round(sum(benefit_amt),2) from " + DB + ".interest where  bond_id = a.id and transaction_date between '"+firstReportDate+"' and '" + reportDate + "' and is_delete=0 group by note_no),0) as m_benefit_amt "
            calInt += ",ifnull((select round(sum(benefit_amt),2) from " + DB + ".interest where  bond_id = a.id and transaction_date between a.note_date and '" + lastDayPrvMonth + "' and is_delete=0 group by note_no),0) as prv_benefit_amt "
            calInt += ",ifnull((select round(sum(amount),2) from " + DB + ".adjust_int where  bond_id = a.id and transaction_date between a.note_date and '" + reportDate + "' and is_delete=0 group by note_no),0) as adjust_int "
            calInt += ",ifnull((select round(sum(amount),2) from " + DB + ".adjust_int where  bond_id = a.id and transaction_date between a.note_date and '" + lastDayPrvMonth + "' and is_delete=0 group by note_no),0) as prv_adjust_int "
            calInt += ",ifnull((select round(sum(amount),2) from "+ DB + ".adjust_int where  bond_id = a.id and transaction_date between '"+firstReportDate+"' and '" + reportDate + "' and is_delete=0 group by note_no),0) as m_adjust_int "
        } else if (params.hasOwnProperty("date") && params.date != ""&& params.hasOwnProperty("to_date")) {
            if (params.to_date != "") {
                conByDate += " and end_date between '" + params.date + "' and '" + params.to_date + "' ";
            } else {
                conByDate += " and end_date = '" + params.date + "' ";
            }
        }
        if(calInt==""){
            calInt += ",0 as benefit_amt";
            calInt += ",0 as m_benefit_amt "
            calInt += ",0 as prv_benefit_amt "
            calInt += ",0 as adjust_int "
            calInt += ",0 as prv_adjust_int "
            calInt += ",0 as m_adjust_int "
        }
        calInt += ",ifnull(round((a.note_amt*(a.int_rate/100)*if(isnull(exp_date)=0 && isnull(end_date) = 1,DATEDIFF(a.ex_date,a.start_date),DATEDIFF(a.end_date,a.start_date)))/365,2),0)as totalInt ";
        calInt += ",ifnull((SELECT round(SUM(amount),2) FROM corporate_finance_onee.adjust_int WHERE bond_id = a.id AND ((a.age_type = 'C' and transaction_date BETWEEN a.start_date AND a.ex_date)or (a.age_type <> 'C' and ((isnull(a.ex_date)=0 and transaction_date between a.start_date and a.ex_date)or (isnull(a.ex_date)=1 and a.start_date and a.end_date)) ) ) AND is_delete = 0 GROUP BY note_no),0) AS totalAdjInt ";
         if (params.hasOwnProperty("instype")&&params.instype!="") {
            if (params.instype == '4') {
                condition += " and ins_type_id = 4";
            } else {
                condition += " and ins_type_id <> 4";
            }
        }
        if (params.hasOwnProperty("type")&&params.type!="") {
            if (params.type == 1) {
                orderBy += "ins_name, ";
                condition += " and com_code_old = '" + params.lob + "' and note_type_id = '1'";
            } else if (params.type == 3) {
                orderBy += "ins_name, ";
                condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '4' and com_code_old = '"+params.ins+"' ) or (com_code_old = '" + params.lob + "' and note_type_id = '3' and ins_code= '"+params.ins+"'))";
            } else if (params.type == 4) {
                orderBy += "company_name, ";
                condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '3'and com_code_old = '"+params.ins+"' ) or (com_code_old = '" + params.lob + "' and note_type_id = '4' and ins_code= '"+params.ins+"'))";
            } else if (params.type == 'all') {
                orderBy += "ins_name, ";
                condition += " and (com_code_old = '" + params.lob + "' or ins_code = '" + params.lob + "' ) ";
            } else if (params.type == '13') {
                orderBy += "ins_name, ";
                condition += " and com_code_old = '" + params.lob + "' and note_type_id in ('1','3')";
            }
        }

        if (params.hasOwnProperty("ordertype") && params.ordertype != "") {
            if (params.ordertype == '1') {
                orderBy += 'note_no '
            } else if (params.ordertype == '2') {
                orderBy += 'start_date,note_no '
            } else if (params.ordertype == '3') {
                orderBy += 'end_date,note_no '
            }
        } else {
            orderBy += 'start_date,note_no '
        }

        if (params.hasOwnProperty("noteno")&& params.noteno != "") {
            condition += " and note_no = '" + params.noteno + "'";
        }
        if (params.hasOwnProperty("id")&& params.id != "") {
            condition += " and id = '"+params.id+"' "
        }
        if (params.hasOwnProperty("doc_type")&& params.doc_type != "") {
            condition += " and doc_type_code = '"+params.doc_type+"' "
        }
        // if (params.hasOwnProperty("ins")&& params.ins != "") {
        //     condition += " and ins_code = '"+params.ins+"' "
        // }
        // console.log("con ",condition)
        conn = mConn ? mConn : await getConnection();
        // var sql = `
        //     SELECT *${calInt},'C1' as row_type FROM ${DB}.report_transaction as a  where status in (0,2) ${condition} ${conByDate} GROUP BY id order by note_date,note_no  `;
        var sql = `SELECT * from (
                SELECT *${calInt},'C1' as row_type FROM ${DB}.report_transaction as a  where status in (0,2) ${condition} ${conByDate} 
            union all 
                SELECT *${calInt},'C2' as row_type FROM ${DB}.report_transaction as a  where status = 2 and '${params.date}' >= start_date ${condition} 
                HAVING ROUND((totalInt + adjust_int) - benefit_amt,2) <> 0 or m_benefit_amt > 0 or m_adjust_int > 0
            ) a 
            GROUP BY id order by ${orderBy}`;
            // union all
            // SELECT *${calInt},'C3' as row_type FROM ${DB}.report_transaction as a  where status = 2 ${condition}  
         console.log("getReporttransaction sql>>",sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result)));
            const report_deposit = tranformReportTransaction(rs,reportDate);
            // console.log(report_deposit)
            return res.status(200).json(report_deposit).end();
        })
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

function diff_months(startDate, endDate) {
  return (
    endDate.getMonth() -
    startDate.getMonth() +
    12 * (endDate.getFullYear() - startDate.getFullYear())
  );
}

const tranformAllData = async (input, reportDate, callback) => {
    const ret_item = [];
    let ret = [];
    let i = 0;
    let l = 0;
    let old_id = "";
    let old_data = [];
    let sumNoteAmt = 0;
    let lastSDate = "";
    let lastEDate = "";
    let old_days = [];
    let intCur = 0;
    let intPrv = 0;
 
    input.forEach((resRow) => {
        l = 0;
        sumNoteAmt = 0;
        // console.log("resRow : ",resRow);
        // console.log("-------------------",resRow['note_no'],"---------------------")
        setDataForReport(resRow['start_date'], resRow['end_date'], resRow['ex_date'], reportDate, resRow['id'], function (result) {
            result.forEach((resRow2) => {
                // console.log("resRow2 : ",resRow2);
                if (old_id != resRow2['id']) {
                    // console.log("1L= ",l)
                    if ((input.length > 1 && old_id != "") || (input.length == 1&& old_id=="")) {
                        old_data = resRow;
                        old_days = resRow2
                    }
                    // console.log("case1>> old_id: ", old_id, " | ", old_days['id'])
                    // console.log(old_days)
                    let days = old_days['days'];
                    let daysOfYear = old_days['daysOfYear'];
                    // let noteDate = new Date(old_data['start_date']);
                    // let firstDayOfyear = noteDate.getFullYear() + "-01-01";
                    // let lastDayOfyear = noteDate.getFullYear()+"-12-31"
                    // let daysOfYear = parseInt(getDateDiff(lastDayOfyear, firstDayOfyear)) + 1;
                    
                    // console.log("1firstDay : ", firstDayOfyear);
                    // console.log("1lastDay : ", lastDayOfyear)
                    // console.log("1-------------------")

                    intCur = parseFloat(((old_data['note_amt'] * (old_data['int_rate'] / 100)) * days / daysOfYear)).toFixed(2);
                   
                    if (l > 0) {
                        sumNoteAmt += parseFloat(intCur);
                        
                    } else {
                        sumNoteAmt = 0;
                    }
                    // console.log("1L= ",l," days: ",days," intCur: ",intCur," sumNote: ",sumNoteAmt)
                    // console.log("1L >> ",l)
                    // console.log("1daysOfYear>>>", daysOfYear)
                    // console.log("1days >>",days)
                    // console.log("1sumNoteAmt>> ", sumNoteAmt)
                    
                    old_id = resRow2['id'];
                    old_data = resRow;
                    old_days = resRow2
                    // 
                    // l = 0;
                } else {
                    let days = resRow2['days'];
                    let daysOfYear = resRow2['daysOfYear'];
                    // let noteDate = new Date(old_data['start_date']);
                    // let firstDayOfyear = noteDate.getFullYear() + "-01-01";
                    // let lastDayOfyear = noteDate.getFullYear()+"-12-31"
                    // let daysOfYear = parseInt(getDateDiff(lastDayOfyear, firstDayOfyear)) + 1;
                    intPrv = parseFloat(((old_data['note_amt'] * (old_data['int_rate'] / 100)) * old_days['days'] / old_days['daysOfYear'])).toFixed(2);
                    intCur = parseFloat(((resRow['note_amt'] * (resRow['int_rate'] / 100)) * days / daysOfYear)).toFixed(2);
                    sumNoteAmt += parseFloat(intPrv);
                    // console.log("2daysOfYear>>>", daysOfYear)
                    // console.log("2firstDay : ", firstDayOfyear);
                    // console.log("2lastDay : ", lastDayOfyear)
                    // console.log("2-------------------")
                    // console.log("2L= ",l," days: ",days," intCur: ",intCur," intPrv:",intPrv," sumNote: ",sumNoteAmt)
                    old_days = resRow2
                    // console.log("case2>>",resRow2['id']," -- ",resRow2," sum>>",sumNoteAmt)
                    // console.log(days," -- ",intCur)
                    // console.log("2L >> ",l)
                    // console.log("2daysOfYear>>>", daysOfYear)
                    // console.log("2days >>",days)
                    // console.log("2sumNoteAmt>> ", sumNoteAmt)
                }

                l++;
            })

            ////////////////////////////
            // console.log("3L= ",l)
            let days = old_days['days']
            let daysOfYear = old_days['daysOfYear'];
            // console.log("1: ", old_data['note_amt'], " | ", old_data['int_rate'])
            let dStart = new Date(old_days['dStart']);
            let dEnd = new Date(old_days['dEnd']); 
            // console.log("rpdate>",reportDate)
            let dRp = new Date(reportDate);

            let noteDate = new Date(old_data['start_date']);
            let noteEnd = new Date(old_data['end_date']);
            let noteExp = new Date(old_data['ex_date']);
            let dateS = new Date(dStart.getFullYear(), dStart.getMonth(), "1");
            let dateE = new Date(dEnd.getFullYear(), dEnd.getMonth(), '1');
            let dateRp = new Date(dRp.getFullYear(), dRp.getMonth(), "1");
            let dateN = new Date(noteDate.getFullYear(), noteDate.getMonth(), "1");

            // let firstDayOfyear = noteDate.getFullYear() + "-01-01";
            // let lastDayOfyear = noteDate.getFullYear()+"-12-31"
            // let daysOfYear = parseInt(getDateDiff(lastDayOfyear, firstDayOfyear)) + 1;
            // console.log("3daysOfYear>>>", daysOfYear)
            // console.log("3firstDay : ", firstDayOfyear);
            // console.log("3lastDay : ", lastDayOfyear)
            // console.log("3---------------/----")
            // console.log(dateE," --- ",dateRp)
            // console.log(dateE.getTime(), " --- ", dateRp.getTime())
            // console.log(noteEnd," --- ",noteExp)
            // console.log(noteEnd.getTime(), " --- ", noteExp.getTime())
            // console.log(isNaN(noteEnd),"---",isNaN(noteExp))
            // console.log("2sumNoteAmt>> ",sumNoteAmt)
            if (dateRp.getTime() > dateE.getTime()) {
                // console.log("dateReport > dEnd")
                if (((noteEnd.getTime() > 0 && noteEnd.getTime() <= dRp.getTime()) || (noteExp.getTime() > 0 && noteExp.getTime() <= dRp.getTime())) && (dateRp.getTime() == dateE.getTime())) {
                    // console.log("---A1")
                    days = parseInt(old_days['days']) - 1
                }
            }
            if (dateRp.getTime() <= dateE.getTime()) {
                intCur = parseFloat(((old_data['note_amt'] * (old_data['int_rate'] / 100)) * parseInt(days) / daysOfYear)).toFixed(2); //B
            } else {
                intCur = 0;
                let newInt = parseFloat(((old_data['note_amt'] * (old_data['int_rate'] / 100)) * parseInt(days) / daysOfYear)).toFixed(2);
                sumNoteAmt += parseFloat(newInt);
                // console.log("newInt::",newInt, " === ",sumNoteAmt)
            }
            
            // console.log("3L >> ",l)
            // console.log("3daysOfYear>>>", daysOfYear)
            // console.log("3days >>",days)
            // console.log("3sumNoteAmt>> ", sumNoteAmt)
            // console.log("2: ",old_days['id'], ">> dStart:", old_days['dStart'] + " dEnd:" + old_days['dEnd']," RpDate:",reportDate," noteDate:",old_data['start_date'], "=", days)
            //console.log(resRow['note_amt'], " : ", resRow['int_rate'], " = ", intCur)
            //console.log(resRow['benefit_amt'], " | ", resRow['adjust_int'])
            // console.log("3: ",old_data['id'],"<<oldDAta>>",sumNoteAmt,">>DOM",days," | DOY: ",daysOfYear," >>intCur :",intCur);
            // console.log(old_data)
            if (old_data['age_type'] == 'D') {
                ageThai = old_data['age_of_note'] + " วัน"
            } else if (old_data['age_type'] == 'M') {
                ageThai = old_data['age_of_note'] + " เดือน"
            } else if (old_data['age_type'] == 'Y') {
                ageThai = old_data['age_of_note'] + " ปี"
            } else {
                ageThai = "CALL"
            }
            // let noteIntPrv = parseFloat(sumNoteAmt) - (parseFloat(old_data['benefit_amt']) - parseFloat(old_data['m_benefit_amt'])) + (parseFloat(old_data['adjust_int']) - parseFloat(old_data['m_adjust_int']));
            //A
            //  console.log("3sumNoteAmt>> ",sumNoteAmt)
            //  console.log(dateE.getTime()," -- ",dateRp.getTime())
            let noteIntPrv = 0;
            if (dateS.getTime() <= dateN.getTime()) {
                noteIntPrv = (parseFloat(sumNoteAmt)) - (parseFloat(old_data['benefit_amt']) - parseFloat(old_data['m_benefit_amt'])) + (parseFloat(old_data['adjust_int']) - parseFloat(old_data['m_adjust_int']));    
                // console.log("start1 ",noteIntPrv)
            // } else if (dateE.getTime() < dateRp.getTime()) {
                
            //     noteIntPrv = (parseFloat(sumNoteAmt) + parseFloat(intCur)) - (parseFloat(old_data['benefit_amt']) - parseFloat(old_data['m_benefit_amt'])) + (parseFloat(old_data['adjust_int']) - parseFloat(old_data['m_adjust_int']));
            //     console.log("End1 ",noteIntPrv, " | ",old_data['benefit_amt']," | ",old_data['m_benefit_amt'])
            //     console.log("date ==== :",noteIntPrv," | ",parseFloat(sumNoteAmt)," |intCur ",parseFloat(intCur)," | ",(parseFloat(old_data['benefit_amt']) - parseFloat(old_data['m_benefit_amt']))," | ",(parseFloat(old_data['adjust_int']) - parseFloat(old_data['m_adjust_int'])))
            } else {
                // console.log("End2")
                noteIntPrv = (parseFloat(sumNoteAmt) ) - (parseFloat(old_data['benefit_amt']) - parseFloat(old_data['m_benefit_amt'])) + (parseFloat(old_data['adjust_int']) - parseFloat(old_data['m_adjust_int']));     
                // console.log("date ==== :",noteIntPrv," | ",parseFloat(sumNoteAmt)," |intCur ",parseFloat(intCur)," | ",(parseFloat(old_data['benefit_amt']) - parseFloat(old_data['m_benefit_amt']))," | ",(parseFloat(old_data['adjust_int']) - parseFloat(old_data['m_adjust_int'])))
            }
            
            let noteIntAmt = 0;
            // console.log("4: ",old_days['id'],">>"+sumNoteAmt,":"+(parseFloat(sumNoteAmt) + parseFloat(intCur))+" | ",old_data['benefit_amt']," | ",old_data['m_benefit_amt']," : ",(parseFloat(old_data['benefit_amt']) - parseFloat(old_data['m_benefit_amt']))," | ",old_data['adjust_int']," | ",old_data['m_adjust_int'])
            if (dateS.getTime() <= dateN.getTime()) {
                // console.log("noteIntAmt1")
                noteIntAmt = (parseFloat(noteIntPrv)+ parseFloat(intCur)) - parseFloat(old_data['m_benefit_amt']) + parseFloat(old_data['m_adjust_int'])
            } else if (dateE.getTime() < dateRp.getTime()) { 
                // console.log("noteIntAmt2")
                noteIntAmt = (parseFloat(noteIntPrv)) - parseFloat(old_data['m_benefit_amt']) + parseFloat(old_data['m_adjust_int'])
            } else {
                // console.log("noteIntAmt3 | noteIntPrv: ",noteIntPrv," | intCur: ",intCur ," | old_data['m_benefit_amt']: ",old_data['m_benefit_amt']," | old_data['m_adjust_int']: ",old_data['m_adjust_int'])
                noteIntAmt = parseFloat(noteIntPrv)+ parseFloat(intCur) - parseFloat(old_data['m_benefit_amt']) + parseFloat(old_data['m_adjust_int'])
            }
            // console.log("3L= ",l," days: ",days," intCur: ",intCur," intPrv:",intPrv," sumNote: ",sumNoteAmt," noteIntAmt:",noteIntAmt," adjInt:",old_data['adjust_int'])
            // if (dRp.getTime() >= dEnd.getTime()) {
            //     console.log("dateReport >= dEnd")
            //     if ((noteEnd.getTime() > 0 && noteEnd.getTime() <= dRp.getTime())||(noteExp.getTime() > 0 && noteExp.getTime() <= dRp.getTime())|| (dateRp.getTime()==dateE.getTime())){
            //         days = parseInt(old_days['days']) - 1
            //     } else {
            //         if (dateRp.getTime() > dateE.getTime()) {
            //             days = 0;
            //         }
            //     }
            // } else {
            //     console.log("dateReport < dEnd")
            // }
            // console.log(dateE," <= ",dateRp," : ",(dateRp.getTime() <=  dateE.getTime())," == ", (noteIntPrv > 0 || old_data['m_benefit_amt']>0 || old_data['m_adjust_int']>0 || noteIntAmt >0 ||parseFloat(old_data['benefit_amt'])==parseFloat(sumNoteAmt.toFixed(2)))," : ",noteIntAmt)
            // console.log(" noteIntPrv > 0  ",noteIntPrv > 0 )
            // console.log("dateRp.getTime() <=  dateE.getTime() ",dateRp.getTime() <=  dateE.getTime() )
            // console.log(" old_data['m_benefit_amt']>0  ",old_data['m_benefit_amt']>0 )
            // console.log(" old_data['m_adjust_int']>0 ",old_data['m_adjust_int']>0)
            // console.log(" noteIntAmt >0  ",noteIntAmt >0 )
            // console.log(old_data['note_no']," parseFloat(old_data['benefit_amt'])!=parseFloat(sumNoteAmt.toFixed(2))+parseFloat(old_data['adjust_int'])  ",parseFloat(old_data['benefit_amt'])!=parseFloat((parseFloat(sumNoteAmt)+parseFloat(old_data['adjust_int'])).toFixed(2))," = ",(parseFloat(sumNoteAmt)+parseFloat(old_data['adjust_int'])).toFixed(2),"  noteIntAmt>",noteIntAmt ," | benfit_ame>",old_data['benefit_amt']," | adj_int>",parseFloat(old_data['adjust_int'])," | sumNote>",sumNoteAmt.toFixed(2))
            if ( dateRp.getTime() <=  dateE.getTime() || (old_data['m_benefit_amt']>0 || old_data['m_adjust_int']>0 || parseFloat(old_data['benefit_amt'].toFixed(2))!=parseFloat((parseFloat(sumNoteAmt)+parseFloat(old_data['adjust_int'])).toFixed(2)))) {
                // console.log("Yes")
                const row = {
                    'Key':"D", //detail
                    'ID': old_data['id'],
                    'CompanyCode': old_data['ledger_name'],
                    'CompanyOld': old_data['com_code_old'],
                    'CompanyName': old_data['company_name'], 
                    'Institute': old_data['ins_code'], 
                    'InstituteName': old_data['ins_name'],  
                    'InstituteBranch': old_data['ins_branch'], 
                    'InsType':old_data['ins_type_id'],
                    'DocTypeCode':old_data['doc_type_code'],
                    'DocTypeName': old_data['doc_type_name'],
                    'NoteNo': old_data['note_no'],
                    // 'NoteType': resRow['note_type_id'],
                    'NoteTypeID' : old_data['note_type_id'],
                    'NoteType': old_data['note_type_id'] + "-" + old_data['note_type_name'],
                    'AgeOfNote': old_data['age_of_note'],
                    'AgeType': old_data['age_type'],
                    'AgeThai': ageThai,
                    'NoteDate': formatDateThai(old_data['note_date']),
                    'PayDate': formatDateThai(old_data['pay_date']),
                    'EndingDate': formatDateThai(old_data['ending_date']),
                    'startDate': old_data['start_date'],
                    'endDate':old_data['end_date'],
                    'InterestRate': old_data['int_rate'].toFixed(4),
                    'NoteAmt': old_data['note_amt'],
                    'NoteAmtPay' : old_data['note_amt_pay'],
                    'Days': (old_data['row_type']=='C1'&& days>0?(dateRp.getTime() <= dateE.getTime()?days:''):''),
                    'NoteIntPvr':  (Math.abs((parseFloat(noteIntPrv)) == 0),0,parseFloat(noteIntPrv.toFixed(2))), //(intPrvMonth+intPrv-benefitAmt), //A ยกมา
                    'NoteIntCur': (old_data['row_type']=='C1'?(Math.abs((parseFloat(intCur)) == 0),0,parseFloat(intCur)):0),    //Bปัจจุบัน
                    'NoteIntAmt': (Math.abs((parseFloat(noteIntAmt)) == 0),0,parseFloat(noteIntAmt.toFixed(2))),//ค่้างรับ/จ่าย
                    'AdjustInt': old_data['adjust_int'], //ปรับดอกเบี้ยรวม
                    'AdjustIntPrv' : old_data['m_adjust_int'], //ปรับดอกเบี้ยเดือนปัจจุบัน
                    'Status': old_data['status'],
                    'StatusDesc' : old_data['status_name'],
                    'Description': old_data['description'],
                    'BenefitDate': formatDateThai(old_data['transaction_date']),
                    'BenefitAmt':(old_data['m_benefit_amt']==null||old_data['m_benefit_amt']==''?0:old_data['m_benefit_amt']), //Cรับดอกเบี้ย
                    'SumBenefitAmt': old_data['benefit_amt'],
                    'SumNoteInt': sumNoteAmt,
                    'BenefitType': old_data['benefit_type'],
                    'exDate':old_data['ex_date'],
                    'ExpDate': formatDateThai(old_data['exp_date']),
                    'ExpReason': old_data['exp_reason'],
                    'FromExcRate': old_data['from_exc_rate'],
                    'ToExcRate': old_data['to_exc_rate'],
                    'ExcRate': (old_data['exc_rate']==0?'':old_data['exc_rate']),
                }
                ret.push(row)
            // }else{
            //     console.log("No")
            }
            ///////////////////////////
                
        })
       
       i++; 
    })
    callback(ret)
  
};

const setDataForReport = async (startDate, endDate,expDate, reportDate, id, callback) => {
    // console.log(id,">> setDataForReport:  ",startDate," | ",endDate," | "+expDate+" | ",reportDate)
    let ret = []
    let benefit_amt = 0;
    let adjust_int = 0;
    let con = []
    let firstDate = "";
    let lastDate = "";
    let thisMonth = 0;
    
    try {
        // let month = month;
        let dStart = new Date(startDate);
        
        lastDate = new Date(dStart.getFullYear(), dStart.getMonth()+1, '0')
        
        let dEnd = new Date((endDate == null || endDate == "0000-00-00" ? reportDate : endDate));
        let dExp = new Date((expDate == null || expDate == "0000-00-00" ? reportDate : expDate));
        let dateEnd = "";
        let dateExp = "";
        reportDate = reportDate.split("-");
        let dReport = new Date(reportDate[0],reportDate[1]-1,parseInt(reportDate[2]),0,0,0,0);
        if(endDate!=null&&endDate != "0000-00-00" ){
            endDate =endDate.split("-")
            dateEnd = new Date(endDate[0],endDate[1]-1,parseInt(endDate[2]-1),0,0,0,0);
        }else{
            dateEnd = dReport;
        }
        // let dateExp = new Date(expDate);
        if(expDate!=null&&expDate != "0000-00-00"){
            expDate =expDate.split("-")
            dateExp = new Date(expDate[0],expDate[1]-1,parseInt(expDate[2]-1),0,0,0,0);
        }else{
            dateExp = dReport;
        }
        // console.log("dStart>>",dStart," | lastDate>>",lastDate," | ",dateEnd," | ",dateExp)
        let month ="";
        if(dEnd.getTime()<dReport.getTime()){
            // console.log("M-1")
            if(dEnd.getTime()<dExp.getTime()){
                let s = new Date(dStart.getFullYear(),dStart.getMonth(),"1")
                let e = new Date(dEnd.getFullYear(),dEnd.getMonth()+1,0)
                month = diff_months(s,e)
                // console.log("M-1-1:: s>",s," | e>",e," | m>",month)
            }else{
                let s = new Date(dStart.getFullYear(),dStart.getMonth(),"1")
                let e = new Date(dExp.getFullYear(),dExp.getMonth()+1,0)
                month = diff_months(s,e)
                // console.log("M-1-2:: s>",s," | e>",e," | m>",month)
            }
        }else if(dExp.getTime()<dReport.getTime()){
            // console.log("M-2")
            if(dEnd.getTime()<dExp.getTime()){
                let s = new Date(dStart.getFullYear(),dStart.getMonth(),"1")
                let e = new Date(dEnd.getFullYear(),dEnd.getMonth()+1,0)
                month = diff_months(s,e)
                // console.log("M-2-1:: s>",s," | e>",e," | m>",month)
            }else{
                let s = new Date(dStart.getFullYear(),dStart.getMonth(),"1")
                let e = new Date(dExp.getFullYear(),dExp.getMonth()+1,0)
                month = diff_months(s,e)
                // console.log("M-2-2:: s>",s," | e>",e," | m>",month)
            }
        } else {
            // console.log("M-3")
            let e=""
            let s = new Date(dStart.getFullYear(),dStart.getMonth(),"1")
            e = new Date(dReport.getFullYear(), dReport.getMonth() + 1, 0)
            if (dReport.getTime() < e.getTime()) {
                e = new Date(dReport.getFullYear(), dReport.getMonth() , dReport.getDate())
            }
            month = diff_months(s,e)
            // console.log("M-3 :: s>",s," | e>",e," | m>",month)
        }

        // console.log(id,">> setDataForReport:  s:",dStart," | en:",dEnd," | ex:"+dExp+" | rp:",dReport," | ",month)
        let mStart = new Date(dStart.getFullYear(), dStart.getMonth());
        let mEnd = new Date(dEnd.getFullYear(), dEnd.getMonth());
        let mExp = new Date(dExp.getFullYear(), dExp.getMonth());
        let mReport = new Date(dReport.getFullYear(),dReport.getMonth())
        // thisMonth =month;
        // let dReport = new Date(reportDate);
        if (month == 0) {
            // console.log("month == 0")
            if (mEnd.getTime() <= mStart.getTime()) {
                // console.log("1month == 0")
                thisMonth = 1;
            } else if (mExp.getTime() <= mStart.getTime()) {
                // console.log("2month == 0")
                thisMonth = 1;
            } else if (mReport.getTime() < mEnd.getTime()) {
                // console.log("4month == 0")
                thisMonth = 1
            } else {
                // console.log("3month == 0")
                thisMonth = 2; 
            }
        } else {
            // console.log("month > 0")
            thisMonth = month+1;
        }
        // console.log("thisMonth >> ", typeof thisMonth, " || ", month)
        let text = "";
        for (let i = 0; i < thisMonth; i++) {
        //    console.log(thisMonth,"<<i>>"+i)
        // console.log("last >>",lastDate," RP>>",dReport)
          if(lastDate.getTime()<dReport.getTime()){
            if (i == 0) {
                // console.log("1")
                // console.log("dStart>>",dStart," | lastDate>>",lastDate," | dateEnd>>",dateEnd," | dateExp>>",dateExp)
                // firstDate = new Date(startDate);
                if(!isNaN(dateEnd.getTime())&& dateEnd.getTime()>0 &&dateEnd.getTime()<=lastDate.getTime()){
                
                    if(!isNaN(dateExp.getTime())&& dateExp.getTime()>0&&dateExp.getTime()<=dateEnd.getTime()){
                        lastDate = new Date(dExp.getFullYear(),dExp.getMonth(),dExp.getDate()-1);
                    }else{
                        lastDate = new Date(dEnd.getFullYear(),dEnd.getMonth(),dEnd.getDate()-1);
                    }
                }else if(!isNaN(dateExp.getTime())&& dateExp.getTime()>0&&dateExp.getTime()<=lastDate.getTime()){
                    // console.log("L2")
                    lastDate = new Date(dateExp.getFullYear(),dateExp.getMonth(),dateExp.getDate());
                }
                // console.log(!isNaN(dateExp.getTime())," : ",)
                // console.log(lastDate.getTime()+"---"+dStart.getTime())
                // console.log(lastDate+"---"+dReport)
                let days = getDateDiff(lastDate.getFullYear() + "-" + (parseInt(lastDate.getMonth()) + 1) + "-" + lastDate.getDate(), dStart.getFullYear() + "-" + (parseInt(dStart.getMonth()) + 1) + "-" + dStart.getDate())
                let firstDayOfyear = lastDate.getFullYear() + "-01-01";
                let lastDayOfyear = lastDate.getFullYear()+"-12-31"
                let daysOfYear = parseInt(getDateDiff(lastDayOfyear, firstDayOfyear)) + 1;
                // console.log("1---days >",days)
                const row = {
                    'id': id,
                    'dStart': dStart.getFullYear() + "-" + (parseInt(dStart.getMonth())+1) + "-" + parseInt(dStart.getDate())-1,
                    'dEnd': lastDate.getFullYear() + "-" + (parseInt(lastDate.getMonth()) + 1) + "-" + (parseInt(lastDate.getDate())),
                    'days': days + 1,
                    'daysOfYear': daysOfYear,
                    'key': 1
                }
                con.push(row);
                
            } else {
                // lastDate = new Date(dStart.getFullYear(), dStart.getMonth()+1, '0')
                let mNext = new Date(lastDate.getFullYear(), lastDate.getMonth()+1)
                // console.log("mNext: ", mNext ," | mRp: ",mReport)
                firstDate = new Date(lastDate.getFullYear(), lastDate.getMonth()+1, '1')
                // console.log("firstDate: ",firstDate)
                if (mEnd.getTime() <= mNext.getTime() || mExp.getTime() <= mNext.getTime()) {
                    // console.log("2-1-1 >> dateEnd :",dateEnd," | dReport: ",dReport)
                    if(!isNaN(dateEnd.getTime())&& dateEnd.getTime()>0 &&dReport.getTime()<=dateEnd.getTime()){
                        // console.log("2-1-2 :: ",dReport," | ",dateExp," | ",dateEnd)
                        if(dReport.getTime()<=dateExp.getTime()){
                            // console.log("2-1-2-1")
                            lastDate = new Date(dReport.getFullYear(),dReport.getMonth(),dReport.getDate());
                        }else {
                            // console.log("2")
                            lastDate = new Date(dateExp.getFullYear(),dateExp.getMonth(),dateExp.getDate());
                        }
                    }else if(!isNaN(dateExp.getTime())&& dateExp.getTime()>0&&dReport.getTime()<=dateExp.getTime()){
                        // console.log("2-1-4")
                        //  console.log(dateExp.getTime(),"<2-1-2 :",isNaN(dateExp.getTime()))
                        if(dEnd.getTime()<dExp.getTime()){
                            // console.log("2-1-4-1")
                            lastDate = new Date(dEnd.getFullYear(),dEnd.getMonth(),dEnd.getDate()-1);
                        }else{
                            // console.log("2-1-4-2")
                            lastDate = new Date(dExp.getFullYear(),dExp.getMonth(),dExp.getDate()-1);
                        }
                    }else{
                        // console.log("2-1-3")
                        if(!isNaN((dateExp.getTime())&& dateExp.getTime()>0)||(!isNaN(dateEnd.getTime())&& dateEnd.getTime()>0)){
                            if(dEnd.getTime()<dExp.getTime()){
                                // console.log("2-1-2-1")
                                lastDate = new Date(dEnd.getFullYear(),dEnd.getMonth(),dEnd.getDate()-1);
                            }else{
                                // console.log("2-1-2-2")
                                lastDate = new Date(dExp.getFullYear(),dExp.getMonth(),dExp.getDate()-1);
                            }
                        }else{
                            lastDate = new Date(dReport.getFullYear(),dReport.getMonth(),dReport.getDate())
                        }
                        
                        // 
                    }

                } else {
                    // console.log("2-2")
                    if (mReport.getTime() <= mNext.getTime()) {
                        // console.log("2-2-1 ",dReport)
                        lastDate = new Date(dReport.getFullYear(),dReport.getMonth(),dReport.getDate())
                    }else if (mReport.getTime()> mNext.getTime()) {
                        // console.log("--3")
                        lastDate = new Date(firstDate.getFullYear(),firstDate.getMonth()+1,'0')
                        if(dReport.getTime()<=lastDate.getTime()){
                            if(!isNaN(dateEnd.getTime())&& dateEnd.getTime()>0 &&dateEnd.getTime()<=dReport.getTime()){
                                if(dEnd.getTime()<dExp.getTime()){
                                    lastDate = new Date(dEnd.getFullYear(),dEnd.getMonth(),dEnd.getDate()-1);
                                }else{
                                    lastDate = new Date(dExp.getFullYear(),dExp.getMonth(),dExp.getDate()-1);
                                }
                            }else if(!isNaN(dateExp.getTime())&& dateExp.getTime>0&&dateExp.getTime()<=dReport.getTime()){
                                if(dEnd.getTime()<dExp.getTime()){
                                    lastDate = new Date(dEnd.getFullYear(),dEnd.getMonth(),dEnd.getDate()-1);
                                }else{
                                    lastDate = new Date(dExp.getFullYear(),dExp.getMonth(),dExp.getDate()-1);
                                }
                            }else{
                                lastDate = new Date(dReport.getFullYear(),dReport.getMonth(),dReport.getDate())
                            }
                        }
                    } else {
                        // console.log("2-2-2")
                        if(mReport.getTime()<=mEnd.getTime()||mReport<=mExp.getTime()){
                            // console.log("--1")
                            lastDate = new Date(dReport.getFullYear(),dReport.getMonth(),dReport.getDate())
                        }else{
                            // console.log("--2")
                            lastDate = new Date(firstDate.getFullYear(),firstDate.getMonth()+1,'0')
                        }
                    }
                }
                let days = getDateDiff(lastDate.getFullYear() + "-" + (parseInt(lastDate.getMonth()) + 1) + "-" + lastDate.getDate(), firstDate.getFullYear() + "-" + (parseInt(firstDate.getMonth()) + 1) + "-" + firstDate.getDate())
                let firstDayOfyear = lastDate.getFullYear() + "-01-01";
                let lastDayOfyear = lastDate.getFullYear()+"-12-31"
                let daysOfYear = parseInt(getDateDiff(lastDayOfyear, firstDayOfyear)) + 1;
                //  console.log("days >",days)
                // console.log("2---days >",days)
                 const row = {
                    'id': id,
                    'dStart': firstDate.getFullYear() + "-" + (parseInt(firstDate.getMonth())+1) + "-" + firstDate.getDate(),
                    'dEnd': lastDate.getFullYear() + "-" + (parseInt(lastDate.getMonth()) + 1) + "-" + lastDate.getDate(),
                    'days': days + 1,
                    'daysOfYear': daysOfYear,
                    'key': 2
                }
                con.push(row);
                // console.log(i,"::row>>",row)
              }
            //   console.log("---")
          } else {
            
              let s = new Date(dStart.getFullYear(),dStart.getMonth(),parseInt(dStart.getDate())+1)
            //   console.log(s," dStart>>",dStart," | lastDate>>",lastDate," | dateEnd>>",dateEnd," | dateExp>>",dateExp," |dateReport>>"+dReport)
            //   lastDate = new Date(dReport.getFullYear(), dReport.getMonth(), dReport.getDate())
            if(!isNaN(dateEnd.getTime())&& dateEnd.getTime()>0 &&dateEnd.getTime()<=lastDate.getTime()){
                // console.log("L1")

                if(!isNaN(dateExp.getTime())&& dateExp.getTime()>0&&dateExp.getTime()<=dateEnd.getTime()){
                    // console.log("L1-1")
                    lastDate = new Date(dateExp.getFullYear(),dateExp.getMonth(),dateExp.getDate());
                    // console.log(s," dStart>>",dStart," | lastDate>>",lastDate," | dateEnd>>",dateEnd," | dateExp>>",dateExp," |dateReport>>"+dReport)
                }else{
                    // console.log("L1-2")
                    lastDate = new Date(dateEnd.getFullYear(),dateEnd.getMonth(),dateEnd.getDate());
                }
            }else if(!isNaN(dateExp.getTime())&& dateExp.getTime()>0&&dateExp.getTime()<=lastDate.getTime()){
                // console.log("L2")
                lastDate = new Date(dExp.getFullYear(),dExp.getMonth(),dExp.getDate());
            }else if(!isNaN(dateEnd.getTime())&& dateEnd.getTime()>0 &&dReport.getTime()<=dateEnd.getTime()){
                // console.log("L3")
                if(dReport.getTime()<= dateExp.getTime()){
                    // console.log("L3-1")
                    if(dReport.getTime()<=lastDate.getTime()){
                        // console.log("L3-1-1")
                        lastDate = new Date(dReport.getFullYear(),dReport.getMonth(),dReport.getDate())
                    // }else{
                    //     console.log("L3-1-2")
                    }
                }else{
                    // console.log("L3-2")
                    if(dEnd.getTime()<dExp.getTime()){
                        lastDate = new Date(dEnd.getFullYear(),dEnd.getMonth(),dEnd.getDate()-1);
                    }else{
                        lastDate = new Date(dExp.getFullYear(),dExp.getMonth(),dExp.getDate()-1);
                    }
                    
                }
                
            }else if(!isNaN(dateEnd.getTime())&& dateEnd.getTime()>0 &&dReport.getTime()<=dateExp.getTime()){
                console.log("L4")
            }


                
                let days = getDateDiff(lastDate.getFullYear() + "-" + (parseInt(lastDate.getMonth()) + 1) + "-" + lastDate.getDate(), dStart.getFullYear() + "-" + (parseInt(dStart.getMonth()) + 1) + "-" + dStart.getDate())
                let firstDayOfyear = lastDate.getFullYear() + "-01-01";
                let lastDayOfyear = lastDate.getFullYear()+"-12-31"
                let daysOfYear = parseInt(getDateDiff(lastDayOfyear, firstDayOfyear)) + 1;
                //  console.log("days >",days)
                // console.log("3---days >",days)
                // console.log(dStart.getFullYear() + "-" + (parseInt(s.getMonth())) + "-" + parseInt(s.getDate()))
                const row = {
                    'id': id,
                    'dStart': dStart.getFullYear() + "-" + (parseInt(dStart.getMonth())+1) + "-" + parseInt(dStart.getDate())-1,
                    'dEnd': lastDate.getFullYear() + "-" + (parseInt(lastDate.getMonth()) + 1) + "-" + lastDate.getDate(),
                    'days': days + 1,
                    'daysOfYear': daysOfYear,
                    'key': 3
            }
            con.push(row);
          }
        //   console.log(con)
        //   console.log("----------------------------------end days---------------------------------------------")
            // console.log(thisMonth," | ",i)
            if (thisMonth== i+1) {
                // console.log(con)
                callback(con)
            }
        }
    } catch (err) {
        console.error(err)
    }
}

const getReportTransaction = async (res, req, mConn = null) => {
    //  console.log("getReportTransaction")
    let conn = null;
    var params = req.query;
    var condition = "";
    var conByDate = "";
    var calInt = "";
    let reportDate = "";
    let orderBy = "";
    try {
        console.log(params);
       if (!params.hasOwnProperty("lob")) {
            return res.status(500).json({ 'msg': "ไม่พบข้อมูล LOB" }).end();
        }
        if (params.hasOwnProperty("date") && params.date != ""&& !params.hasOwnProperty("to_date")) {
            // let sDate = params.date.substring(0, 8)+"01";
            reportDate = params.date;
            conByDate += " and ((age_type = 'C' and ((status='0' and '" + params.date + "'>=start_date ) or (status = '2' and '" + params.date + "' between start_date and last_day(ex_date) )))";
            conByDate += " or (age_type <> 'C' and (status = '2' and(isnull(ex_date) = 0  and '" + params.date + "' between start_date and last_day(ex_date)) "
            conByDate += " or(status = '0' and '" + params.date + "'  >= start_date)) )) "
           
            let firstReportDate = getFirstDay(reportDate, 'DB','');

            // console.log(reportDate,"--",firstDate,"--",lastDayPrvMonth)
            calInt += ",ifnull((select round(sum(benefit_amt),2) from " + DB + ".interest where  bond_id = a.id and transaction_date between a.note_date and '" + reportDate + "' and is_delete=0 group by note_no),0) as benefit_amt "
            calInt += ",ifnull((select round(sum(benefit_amt),2) from " + DB + ".interest where  bond_id = a.id and transaction_date between '"+firstReportDate+"' and '" + reportDate + "' and is_delete=0 group by note_no),0) as m_benefit_amt "
            // calInt += ",ifnull((select round(sum(benefit_amt),2) from " + DB + ".interest where  bond_id = a.id and transaction_date between a.note_date and '" + lastDayPrvMonth + "' and is_delete=0 group by note_no),0) as prv_benefit_amt "
            calInt += ",ifnull((select round(sum(amount),2) from " + DB + ".adjust_int where  bond_id = a.id and transaction_date between a.note_date and '" + reportDate + "' and is_delete=0 group by note_no),0) as adjust_int "
            // calInt += ",ifnull((select round(sum(amount),2) from " + DB + ".adjust_int where  bond_id = a.id and transaction_date between a.note_date and '" + lastDayPrvMonth + "' and is_delete=0 group by note_no),0) as prv_adjust_int "
            calInt += ",ifnull((select round(sum(amount),2) from " + DB + ".adjust_int where  bond_id = a.id and transaction_date between '" + firstReportDate + "' and '" + reportDate + "' and is_delete=0 group by note_no),0) as m_adjust_int "
        } else if (params.hasOwnProperty("date") && params.date != ""&& params.hasOwnProperty("to_date")) {
            if (params.to_date != "") {
                conByDate += " and end_date between '" + params.date + "' and '" + params.to_date + "' ";
            } 
	        else {
              conByDate += " and end_date = '" + params.date + "' ";
            }
        }
        if(calInt==""){
            calInt += ",0 as benefit_amt";
            calInt += ",0 as m_benefit_amt "
            // calInt += ",0 as prv_benefit_amt "
            calInt += ",0 as adjust_int "
            // calInt += ",0 as prv_adjust_int "
            calInt += ",0 as m_adjust_int "
        }
        calInt += ",ifnull(round((a.note_amt*(a.int_rate/100)*if(isnull(exp_date)=0 && isnull(end_date) = 1,DATEDIFF(a.ex_date,a.start_date),DATEDIFF(a.end_date,a.start_date)))/365,2),0)as totalInt ";
        calInt += ",ifnull((SELECT round(SUM(amount),2) FROM corporate_finance_onee.adjust_int WHERE bond_id = a.id AND ((a.age_type = 'C' and transaction_date BETWEEN a.start_date AND a.ex_date)or (a.age_type <> 'C' and ((isnull(a.ex_date)=0 and transaction_date between a.start_date and a.ex_date)or (isnull(a.ex_date)=1 and a.start_date and a.end_date)) ) ) AND is_delete = 0 GROUP BY note_no),0) AS totalAdjInt ";
        // calInt += ",timestampdiff(MONTH,a.start_date,if(isnull(a.end_date)=1||a.end_date='0000-00-00'||a.end_date>'"+reportDate+"',if(isnull(a.ex_date)=1||a.ex_date>'"+reportDate+"','"+reportDate+"',a.ex_date),a.end_date)) as month "
         if (params.hasOwnProperty("instype")&&params.instype!="") {
            if (params.instype == '4') {
                condition += " and ins_type_id = 4";
            } else {
                condition += " and ins_type_id <> 4";
            }
        }
        // if (params.hasOwnProperty("type")&&params.type!="") {
        //     if (params.type == 1) {
        //         orderBy += "ins_name,status asc ";
        //         condition += " and com_code_old = '" + params.lob + "' and note_type_id = '1'";
        //     } else if (params.type == 3) {
        //         orderBy += "ins_name,status asc ";
        //         condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '4') or (com_code_old = '" + params.lob + "' and note_type_id = '3'))";
        //     } else if (params.type == 4) {
        //         orderBy += "company_name,status asc ";
        //         condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '3') or (com_code_old = '" + params.lob + "' and note_type_id = '4'))";
        //     } else if (params.type == 'all') {
        //         orderBy += "ins_name,status asc ";
        //         condition += " and (com_code_old = '" + params.lob + "' or ins_code = '" + params.lob + "' ) ";
        //     } else if (params.type == '13') {
        //         orderBy += "ins_name,status asc ";
        //         condition += " and com_code_old = '" + params.lob + "' and note_type_id in ('1','3')";
        //     }
            
        // }
        
        if (params.hasOwnProperty("type")&&params.type!="") {
            if (params.type == 1) {
                orderBy += "ins_name ";
                if (params.hasOwnProperty("ins") && params.ins != "") {
                    condition += " and com_code_old = '" + params.lob + "' and note_type_id = '1'  and ins_code= '"+params.ins+"'";
                } else {
                    condition += " and com_code_old = '" + params.lob + "' and note_type_id = '1'";
                }
                
            } else if (params.type == 3) {
                orderBy += "ins_name ";
                if (params.hasOwnProperty("ins")&& params.ins != "") {
                    condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '4' and com_code_old = '"+params.ins+"' ) or (com_code_old = '" + params.lob + "' and note_type_id = '3' and ins_code= '"+params.ins+"'))";
                }else{
                    condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '4'  ) or (com_code_old = '" + params.lob + "' and note_type_id = '3' ))";
                }
                
            } else if (params.type == 4) {
                orderBy += "company_name ";
                if (params.hasOwnProperty("ins")&& params.ins != "") {
                    condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '3' and com_code_old = '"+params.ins+"' ) or (com_code_old = '" + params.lob + "' and note_type_id = '4' and ins_code= '"+params.ins+"'))";
                }else{
                    condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '3') or (com_code_old = '" + params.lob + "' and note_type_id = '4' ))";
                }
            } else if (params.type == 'all') {
                orderBy += "ins_name ";
                condition += " and (com_code_old = '" + params.lob + "' or ins_code = '" + params.lob + "' ) ";
            } else if (params.type == '13') {
                orderBy += "ins_name ";
                condition += " and com_code_old = '" + params.lob + "' and note_type_id in ('1','3')";
            }
        }

        if (params.hasOwnProperty("ordertype") && params.ordertype != "") {
            if (params.ordertype == '1') {
                if(orderBy!=""){
                    orderBy += ','
                }
                orderBy += 'status,note_no asc'
            } else if (params.ordertype == '2') {
                if(orderBy!=""){
                    orderBy += ','
                }
                orderBy += 'status,start_date,note_no asc  '
            } else if (params.ordertype == '3') {
                if(orderBy!=""){
                    orderBy += ','
                }
                orderBy += 'status,end_date,note_no asc  '
            }
        } else {
            if(orderBy!=""){
                orderBy += ','
            }
            orderBy += 'status,start_date,note_no asc  '
        }
        

        if (params.hasOwnProperty("noteno")&& params.noteno != "") {
            condition += " and note_no = '" + params.noteno + "'";
        }
        if (params.hasOwnProperty("id")&& params.id != "") {
            condition += " and id = '"+params.id+"' "
        }
        if (params.hasOwnProperty("doc_type")&& params.doc_type != "") {
            condition += " and doc_type_code = '"+params.doc_type+"' "
        }
        // if (params.hasOwnProperty("ins")&& params.ins != "") {
        //     condition += " and ins_code = '"+params.ins+"' "
        // }
        // console.log("con ",condition)
        conn = mConn ? mConn : await getConnection();
        // var sql = `
        //     SELECT *${calInt},'C1' as row_type FROM ${DB}.report_transaction as a  where status in (0,2) ${condition} ${conByDate} GROUP BY id order by note_date,note_no  `;
        var sql = `SELECT * from (
                SELECT *${calInt},'C1' as row_type FROM ${DB}.report_transaction as a  where status in (0,2) ${condition} ${conByDate} 
            union all 
                SELECT *${calInt},'C2' as row_type FROM ${DB}.report_transaction as a  where status = 2 and '${params.date}' >= start_date ${condition} 
                HAVING ROUND((totalInt + adjust_int) - benefit_amt,2) > 0 or m_benefit_amt > 0 or m_adjust_int > 0
            ) a 
            GROUP BY id order by ${orderBy}`;
            // union all
            // SELECT *${calInt},'C3' as row_type FROM ${DB}.report_transaction as a  where status = 2 ${condition}  
        //  console.log("getReporttransaction : ",sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result)));
            if (reportDate == "") {
                let date = new Date();
                reportDate = date.getFullYear() + "-" + (parseInt(date.getMonth())+1) + "-" + date.getDate();
            }
            // console.log("reportDate : ",reportDate)
            if (rs.length > 0) {
                tranformAllData(rs, reportDate, function (result2) {
                    // console.log("inTranform")
                    // console.log(rs)
                    // const report_deposit = tranformReportTransaction(rs, reportDate);
                    // callback(report_deposit);
                    // console.log(report_deposit)
                    return res.status(200).json(result2).end();
                })
            } else {
                return res.status(200).json({msg:"ไม่พบข้อมูล"}).end();
            }
            
            
                
            
            // getDataForReport(){

            // }
            // const report_deposit = tranformReportTransaction(rs, reportDate);
            // callback(report_deposit);
            // console.log(report_deposit)
            // return res.status(200).json(report_deposit).end();
        })
        
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const getNote = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.query;
    var condition = "";
    // console.log("In function ",req.body)
    try {
         if (params.hasOwnProperty("type")) {
            if (params.type == 1) {
                 condition += " and com_code_old = '" + params.lob + "' and note_type_id = '1'";
            } else if (params.type == 3) {    
                condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '4') or (com_code_old = '" + params.lob + "' and note_type_id = '3'))";
            } else if (params.type == 4) {
                condition += " and ((ins_code = '" + params.lob + "' and note_type_id = '3') or (com_code_old = '" + params.lob + "' and note_type_id = '4'))";
             } else if (params.type == 'all') {
                 condition += " and (com_code_old = '" + params.lob + "' or ins_code = '" + params.lob + "' ) ";
            } else if (params.type == '13') {
                condition += " and com_code_old = '" + params.lob + "' and note_type_id in ('1','3')";
            }
        }

        ////////editDate
        if (params.hasOwnProperty('date')&&params.date!="") {
            condition += " and ((age_type = 'C' and ((status='0' and '" + params.date + "'>=start_date ) or (status = '2' and '" + params.date + "' between start_date and last_day(ex_date) )))";
            condition += " or (age_type <> 'C' and (status = '2' and(isnull(ex_date) = 0  and '" + params.date + "' between start_date and last_day(ex_date)) "
            condition += " or(status = '0' and '" + params.date + "'  >= start_date)) )) "
        }
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT note_no FROM ${DB}.report_transaction where status <> 1 ${condition} group by note_no order by note_no`;
        // var sql = `SELECT note_type_id,note_no,age_of_note,age_type,days_of_note,status FROM ${DB}.bond where status <> 1 ${condition} order by note_no `;
        // console.log("getNote sql>>",sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result))); 
            const note = tranformNote(rs);
            // console.log("getNote rs>>",note);
            return res.status(200).json(note).end();
        })
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const getBranch = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.query;
    var condition = "";
    // console.log("In function ",params)
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT ins_branch FROM ${DB}.interest ${condition} group by ins_branch order by ins_branch `;
        // console.log("getBranch sql>>",sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result))); 
            const branch = tranformBranch(rs);
            return res.status(200).json(branch).end();
        })
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const getCheque = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.query;
    var condition = "";
    // console.log("In function ",params)
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT cheque_no FROM ${DB}.interest ${condition} group by cheque_no order by cheque_no `;
        // console.log("getCheque sql>>",sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result))); 
            const cheque = tranformCheque(rs);
            return res.status(200).json(cheque).end();
        })
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const getExpReason = async (res, req, mConn = null) => {
    let conn = null;
    var params = req.query;
    var condition = "";
    // console.log("In function ",params)
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT exp_reason FROM ${DB}.bond ${condition} group by exp_reason order by exp_reason `;
        // console.log("get Expreason sql>>",sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result))); 
            const cheque = tranformExpReason(rs);
            return res.status(200).json(cheque).end();
        })
    } catch (error) {
        return res.status(500).end();
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

const getDateDiff = (end, start) => {
    let ds = start.split("-");
    let de = end.split("-");
    let sdate = new Date(ds[0],ds[1]-1,ds[2]);
    let edate = new Date(de[0],de[1]-1,de[2]);
    var t1 = sdate.getTime();
    var t2 = edate.getTime();
    // let diff = new Date(t2-t1)
    // var diff = Math.floor((t2-t1)/(24*3600*1000));
    var diff = (t2-t1)/(24*3600*1000);
    // console.log(" diff date === ", diff)
    return diff;
}

const getDateDiffSlash = (end, start) => {
    let ds = start.split("/");
    let de = end.split("/");
    let sdate = new Date(ds[2],ds[1]-1,ds[0]);
    let edate = new Date(de[2],de[1]-1,de[0]);
    var t1 = sdate.getTime();
    var t2 = edate.getTime();
    // let diff = new Date(t2-t1)
    // var diff = Math.floor((t2-t1)/(24*3600*1000));
    var diff = (t2-t1)/(24*3600*1000);
    // console.log(start,"::",end," >>  diff date === ", diff)
    return diff;
}

const formatDate = (input) => {
    if (input != "" && input != "0000-00-00" && input != null) {
        let date = input.split("-");
        return date[2]+"/"+date[1]+"/"+date[0]
    }
    return "";
}

const formatDateThai = (input) => {
    if (input != "" && input != "00/00/0000" && input != null) {
        let date = input.split("/");
        return date[0]+"/"+date[1]+"/"+(parseInt(date[2])+543)
    }
    return "";
}

const formatNumber = (num,decimal) => {
    if (num != "" && num!=null) {
        // console.log(num)
        num = parseFloat(num).toFixed(decimal);
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    return "";
}

const chkCurDate = (input,reportDate) => {
    // console.log(" chkCurDate>> ", input," -- reportDate>> ",reportDate)
    if (input != "" && input != "00/00/0000" && input != null) {
        let ds = input.split("/");
        let rp = reportDate.split("/");
        let rp_date = new Date(rp[2],rp[1]-1,rp[0]);
        let date = new Date(ds[2], ds[1]-1, ds[0]);
        // console.log("rpdate>> "+rp_date," date >> "+date)
        // console.log("Month >> ",rp_date.getMonth(),"-",date.getMonth()," || Year >> ",rp_date.getFullYear(),"-",date.getFullYear())
        if (rp_date.getMonth() == date.getMonth() && rp_date.getFullYear() == date.getFullYear()) {
            // console.log("chkCurDate is true")
            return true;
        }
        // console.log("chkCurDate is false >> input != null")
    }
    // console.log("chkCurDate is false >> input == null")
    return false;     
}

const getLastDay = (input) => {
    if (input != null) {
        let date = input.split("/");
        const day = new Date(date[2] , parseInt(date[1])+1,0).getDate();
        return day;
    }
}

const getFirstDay = (input,type,noteDate) => {
    if (input != null) {
       
        if (type == "DB") {
            let day = input.split("-");
            return day[0] + "-" + day[1]+"-01";
        } else {
            // console.log("getFirstDay::",input,"-",noteDate)
            let day = input.split("/");
            if (noteDate!="") {
                let nd = noteDate.split("/")
                let date1 = new Date(nd[2], nd[1]-1);
                // let date2 = new Date(day[2], day[1], '1');
                let lastDayPrvMonth = getLastDayPrvMonth(input,'');
                let lt = lastDayPrvMonth.split("/");
                let lastD = new Date(lt[2],lt[1])
                // console.log(date1,":",date1.getTime(), "<>",lastD,":", lastD.getTime())
                // console.log(date1.getTime()<date2.getTime())
                if (date1.getTime() != lastD.getTime()) {
                    // console.log("rpdatedate>>>>")
                    return "01/" + day[1] + "/" + day[2];
                } else {
                    // console.log("notedate>>>>")
                    return noteDate;
                }
            } else {
                
                return "01/" + day[1] + "/" + day[2];
            }
        }
    }
}

// const getDaysOfYear(reportDate){
//     var now = new Date(reportDate);
//     var start = new Date(now.getFullYear(), "1", "1");
//     var end = new Date(now.getFullYear(), "12", "31");
//     var diff = end - start;
//     var oneDay = 1000 * 60 * 60 * 24;
//     var day = Math.floor(diff / oneDay);
//     console.log('Day of year: ' + day);
// }

const getLastDayPrvMonth = (input,type) => {
    if (type == "DB") {
        let ds = input.split("-");
        let day = new Date(ds[0], ds[1] - 1, 0);
        return day.getFullYear() + "-" + (day.getMonth() + 1) +"-"+day.getDate();
    } else {
        let ds = input.split("/");
        let day = new Date(ds[2], ds[1] - 1, 0);
        return day.getDate() + "/" + (day.getMonth() + 1) + "/" + day.getFullYear();
    }
}

const getDaysForReport=(startDate, endDate,reportDate,expDate,startTime,endTime,exTime,rpTime,lastDayPrvMTime)=>{
    let chk_sdate = chkCurDate(startDate,reportDate);
    let chk_edate = false;
    let chk_expDate = false;
    let lastDayPrvMonth = getLastDayPrvMonth(reportDate, '');
    let firstDate = getFirstDay(reportDate, '', '');
    // console.log("isNaN == ",isNaN(endTime)," | ",isNaN(exTime))
    if(isNaN(endTime)){
        // console.log("endDate==NaN")
        chk_edate = false;
    }else{
        // console.log("endDate!=NaN")
        chk_edate = chkCurDate(endDate,reportDate);
    }

    if(isNaN(exTime)){
        // console.log("expDate==NaN")
        chk_expDate = false;
    }else{
        // console.log("expDate!=NaN")
        chk_expDate = chkCurDate(endDate,reportDate);
    }

    if (chk_sdate) {
        if (chk_edate) {
            // console.log("chk_edate")
            if (exTime > 0  && exTime < endTime) {
                // console.log("1 exTime < endTime")
                if (exTime < rpTime) {
                    // console.log("1-1")
                    return getDateDiffSlash(expDate, startDate);
                } else {
                    // console.log("1-2")
                    return getDateDiffSlash(reportDate, startDate);
                }
            // } else if (exTime > 0 && exTime > endTime) {
            //     if (endTime < rpTime) {
            //         return getDateDiffSlash(endTime, startDate);
            //     } else {
            //         return getDateDiffSlash(reportDate, startDate);
            //     }
            } else {
                // console.log("2 exTime > endTime")
                if (endTime <= rpTime) {
                    // console.log("2-1")
                    return getDateDiffSlash(endDate, startDate);
                } else {
                    // console.log("2-2" , expDate, " | ", firstDate, " | ", endDate)
                    return getDateDiffSlash(reportDate, startDate)+1;
                }  
            }
        } else if (chk_expDate) {
            // console.log("3chk_expDate")
            if (chk_edate) {
                //  console.log("3-1")
                if (exTime < endTime) {
                    //  console.log("3-1-1")
                    if (exTime < rpTime) {
                        // console.log("3-1-2")
                        return getDateDiffSlash(expDate, startDate);
                    } else {
                        // console.log("3-1-3")
                        return getDateDiffSlash(reportDate, startDate);
                    }
                } else {
                    // console.log("3-2-1")
                    if (endTime < rpTime) {
                        // console.log("3-2-2")
                        return getDateDiffSlash(endDate, startDate);
                    } else {
                        // console.log("3-2-3")
                        return getDateDiffSlash(reportDate, startDate);
                    }  
                }
            } else {
                // console.log("3-2")
                if (endTime < lastDayPrvMTime) {
                    // console.log("3-2-1")
                    return getDateDiffSlash(endDate, startDate);
                } else {
                    // console.log("3-2-2")
                    return getDateDiffSlash(reportDate, startDate);
                }
            }
        } else {
            // console.log("4!chk_edate && !chk_expDate")
            return getDateDiffSlash(reportDate, startDate)+1;
        }
    } else {
        // console.log("5!chk_sdate")
        if (chk_edate) { 
            // console.log("5 chk_edate", expDate, " | ", firstDate, " | ", endDate)
            if (endTime <= rpTime) {
                if (chk_expDate) {
                    if (exTime < endTime) {
                        return getDateDiffSlash(expDate, firstDate);
                    } else {
                        return getDateDiffSlash(endDate, firstDate);
                    }
                } else {
                    return getDateDiffSlash(endDate, firstDate);
                }
            } else {
                return getDateDiffSlash(reportDate, firstDate);
            }
            
        } else {
            // console.log("5 !chk_edate")
            if (endTime > 0 && endTime <= lastDayPrvMTime) {
                // console.log("endTime < lastDayPrvMTime")
                return 0;
            }else if (exTime>0 &&exTime <= lastDayPrvMTime) {
                // console.log("exTime < lastDayPrvMTime")
                return 0;
            } else {
                if (chk_expDate) {
                    // console.log("5-1 chk_expDATE ", expDate, " | ", firstDate, " | ", endDate," :  ",endTime)
                    if (exTime <= rpTime) {
                        // console.log("5-1-2")
                        if(endTime>0 && !isNaN(endTime)){
                            if (exTime < endTime) {
                                // console.log("5-1-3")
                                return getDateDiffSlash(expDate, firstDate);
                            } else {
                                // console.log("5-1-4")
                                return getDateDiffSlash(endDate, firstDate);
                            }
                        }else{
                            return getDateDiffSlash(expDate, firstDate);
                        }
                       
                    } else {
                        // console.log("5-1-1");
                        return getDateDiffSlash(reportDate, firstDate)+1;
                    }
                
                } else {
                    // console.log("5-2 chk_expDATE")
                    if (exTime > 0 && exTime < lastDayPrvMTime) {
                        // console.log(" exTime < lasttime ")
                        return 0;
                        // return getDateDiffSlash(endDate, firstDate)+1;
                    } else {
                        // console.log(" exTime > lasttime !! ",firstDate," | ",lastDayPrvMonth)
                        if(exTime > 0 && exTime < rpTime){
                            // console.log(" exTime < rpTime !!");
                            return getDateDiffSlash(expDate, firstDate);
                        }else{
                            // console.log(" exTime > rpTime !!");
                            return getDateDiffSlash(reportDate, firstDate)+1;
                        }
                    }
                   
                }
            
            }
            
        }
       
    }

}

const getDaysOfPrv = (noteDate, reportDate, endDate,expDate,startTime,endTime,exTime,rpTime,lastDayPrvMTime) => {
    // console.log("params>> nD:",noteDate ," rD:", reportDate," eD:", endDate,"("+endDate==""+")"," exD:", expDate,"("+expDate==null+")", " key:", key)
    let lastDayPrvMonth = getLastDayPrvMonth(reportDate, '');
    let chk_sdate = chkCurDate(noteDate, reportDate);
    let chk_edate = chkCurDate(endDate, reportDate);
    let chk_expDate = chkCurDate(expDate, reportDate);
    let startDate = getFirstDay(lastDayPrvMonth, '', noteDate);

    // console.log("rpDate: ",reportDate," | sDate: ",startDate," | lastDay: ",lastDayPrvMonth)
    // console.log(lastDayPrvMonth, "case s>>", chk_sdate, "|case e>>", chk_edate, "|case ex>>", chk_expDate)
    // console.log("case lastday: ",lastDayPrvMonth <= endDate|| lastDayPrvMonth<= expDate) 
    // console.log(lastDayPrvMonth, "--", startDate, "..", reportDate,">>>first >>",getFirstDay(lastDayPrvMonth),":::last:::",lastDayPrvMonth)
    
    if (startTime < lastDayPrvMTime) {
        // console.log("getDaysOfPrv:: 1sTime less then lastPrvTime")
        if (endTime > 0 && endTime <= lastDayPrvMTime) {
            // console.log("getDaysOfPrv:: 2endTime less then lastPrvTime")
            if (exTime > 0 && exTime <= lastDayPrvMTime) {
                if (exTime < endTime) {
                    // console.log("getDaysOfPrv:: 3exTime less then endTime")
                    return getDateDiffSlash(expDate, startDate);
                } else {
                    // console.log("getDaysOfPrv:: 4exTime more then endTime")
                    return getDateDiffSlash(endDate, startDate);
                }
            } else if (exTime > 0 && exTime > lastDayPrvMTime) {
                // console.log("getDaysOfPrv:: 5exTime more then lastDayPrvMTime")
                return getDateDiffSlash(lastDayPrvMonth, startDate);
            } else {
                // console.log("getDaysOfPrv:: 6exTime == 0 ", startDate, " | ", endDate)
                // if (endTime <= lastDayPrvMTime) {
                //     console.log("endTime < lasttime")
                //     return getDateDiffSlash(endDate, startDate)-1;
                // } else {
                //     console.log("endTime > lasttime")
                return getDateDiffSlash(endDate, startDate);
                // }
            }
        } else if (endTime > 0 && endTime > lastDayPrvMTime) {
            // console.log("getDaysOfPrv:: 7endTime more then lastPrvTime")
            if (exTime > 0 && exTime <= endTime) {
                // console.log("getDaysOfPrv:: 8exTime less then endTime")
                if (exTime < lastDayPrvMTime) { 
                    // console.log("getDaysOfPrv:: 9exTime less then lastDayPrvMTime")
                    return getDateDiffSlash(expDate, startDate);
                } else {
                    // console.log("getDaysOfPrv:: 10exTime more then lastDayPrvMTime ",startDate," | ",lastDayPrvMonth)
                    return getDateDiffSlash(lastDayPrvMonth, startDate)+1;
                }
            } else if (exTime > 0 && exTime > endTime) {
                // console.log("getDaysOfPrv:: 11endTime less then exTime")
                return getDateDiffSlash(endDate, startDate);
            } else {
                // console.log("getDaysOfPrv:: 12exTime == 0")
                if (noteDate < startDate) {
                    // console.log("12-1")
                    return getDateDiffSlash(lastDayPrvMonth, noteDate);
                } else {
                    // console.log("12-2")
                     return getDateDiffSlash(lastDayPrvMonth, startDate);
                }
                
            }
            
        } else {
            // console.log("getDaysOfPrv:: 13endTime == 0")
            if (exTime > 0 && exTime <= lastDayPrvMTime) {
                if(endTime > 0 && exTime < endTime){
                    // console.log("getDaysOfPrv:: 14exTime less then endTime")
                    return getDateDiffSlash(endDate, startDate);
                }else{
                    // console.log("getDaysOfPrv:: 15exTime more then endTime")
                    return getDateDiffSlash(expDate, startDate);
                }
                //if (exTime < endTime && endTime > 0 ) {
                 //   console.log("getDaysOfPrv:: 14exTime less then endTime")
                //    return getDateDiffSlash(expDate, startDate);
                //}else{
                //    if(endTime==0){
                //        return getDateDiffSlash(expDate, startDate);
                //    }
                //}
                //} else {
                //    console.log("getDaysOfPrv:: 15exTime more then endTime")
                //    return getDateDiffSlash(endDate, startDate);
                //}
            } else if (exTime > 0 && exTime > lastDayPrvMTime) {
                // console.log("getDaysOfPrv:: 16exTime more then lastDayPrvMTime")
                return getDateDiffSlash(lastDayPrvMonth, startDate)+1;
            } else {
                // console.log("getDaysOfPrv:: 17exTime == 0 || ",startDate," | ",lastDayPrvMonth)
                return getDateDiffSlash(lastDayPrvMonth, startDate)+1;
            }
        }
    } else {
        // console.log("getDaysOfPrv:: sTime more then lastPrvTime")
        return 0;
    }
}

const tranformBond = (input) => {
    let ret = [];
    let ageThai = "";
    input.forEach(resRow => {
        if (resRow['age_type'] == 'D') {
            ageThai = resRow['age_of_note'] + " วัน"
        } else if (resRow['age_type'] == 'M') {
            ageThai = resRow['age_of_note'] + " เดือน"
        } else if (resRow['age_type'] == 'Y') { 
            ageThai = resRow['age_of_note'] + " ปี"
        } else {
            ageThai = ""
        }
        const row = {
            'ID': resRow['id'],
            'Company': resRow['ledger_name'], 
            'CompanyOld': resRow['com_code_old'],
            'CompanyName': resRow['company_name'],
            'Institute': resRow['ins_code'], 
            'InstituteName': resRow['ins_name'], 
            'InsType':resRow['ins_type_id'],
            'InstituteType': resRow['ins_type_name'], 
            'InstituteBranch': resRow['ins_branch_name'], 
            'NoteTypeID' : resRow['note_type_id'],
            'NoteType': resRow['note_type_id'] + "-" + resRow['note_type_name'],
            'DocTypeCode':resRow['doc_type_code'],
            'DocType': resRow['doc_type_code']+"-"+resRow['doc_type_name'],
            'NoteNo': resRow['note_no'],
            'AgeOfNote': resRow['age_of_note'],
            'AgeType': resRow['age_type'],
            'AgeThai': ageThai,
            'PayDate': formatDateThai(resRow['pay_date']),
            'NoteDate': formatDateThai(resRow['note_date']),
            'EndingDate': formatDateThai(resRow['ending_date']),
            'InterestRate': resRow['int_rate'].toFixed(4),
            'InterestRateType': resRow['int_rate_type'],
            'NoteAmt': formatNumber(resRow['note_amt'],2),
            'NoteAmtPay' : formatNumber(resRow['note_amt_pay'],2),
            'Status': resRow['status'],
            'StatusDesc' : (resRow['status']=='0'?"PROCESS":(resRow['status']=='1'?"DELETE":"COMPLETE")),
            'Broker': resRow['broker'],
            'BrokerName': resRow['broker_name'],
            'Description': resRow['description'],
            'ExpDate': formatDateThai(resRow['exp_date']),
            'ExpReason': resRow['exp_reason'],
        }
        ret.push(row)
    });

    return ret;
}

const tranformReportTransaction = (input,date) => {
    let ret = [];
    let ageThai = "";
    let reportDate = formatDate(date);
    let noteAmt = 0;
    let days = 0;
    let daysOfPrvMonth = 0;
    let daysOfPrvNote = 0;
    let intPrv = 0;
    let intPrvMonth = 0;
    let intRate = 0;
    let intCur = 0;
    let noteDate = '';
    let endingDate = '';
    let expDate = '';
    let benefitAmt = 0;
    let benefitAmtPrv = 0;
    let benefitAmtThisMonth = 0;
    let adjInt = 0;
    let adjIntPrv = 0;
    let adjIntThisMonth = 0;
    let sumInt = 0;
    let sumAdjustInt=0;
    let row_type = '';
    let status = '';
    let ageType = '';
    input.forEach(resRow => {
        // console.log(resRow)
        // console.log("--------------row_type-:",resRow['row_type'],"------------",resRow['id'],"-----:--",resRow['note_no'],"---------------------")
        status = resRow['status'];
        ageType = resRow['age_type'];
        noteAmt = resRow['note_amt'];
        intRate = (resRow['int_rate']);
        adjInt = (resRow['adjust_int'] == null ? 0 : resRow['adjust_int']);
        adjIntPrv = (resRow['prv_adjust_int'] == null ? 0 : resRow['prv_adjust_int']);
        adjIntThisMonth = (resRow['m_adjust_int'] == null ? 0 : resRow['m_adjust_int']);
        noteDate = resRow['note_date'];
        endingDate = resRow['ending_date'];
        expDate = resRow['exp_date'];
        benefitAmt = (resRow['benefit_amt'] == null ? 0 : resRow['benefit_amt']);
        benefitAmtPrv = (reportDate < resRow['end_date'] || reportDate < resRow['ex_date'] || resRow['prv_benefit_amt'] == null ? 0 : (resRow['prv_benefit_amt']));
        row_type = resRow['row_type'];
        sumInt = resRow['totalInt'];
        sumAdjustInt = resRow['totalAdjInt'];
        benefitAmtThisMonth = parseFloat(resRow['m_benefit_amt'].toFixed(2));

        if (ageType == 'D') {
            ageThai = resRow['age_of_note'] + " วัน"
        } else if (ageType == 'M') {
            ageThai = resRow['age_of_note'] + " เดือน"
        } else if (ageType == 'Y') {
            ageThai = resRow['age_of_note'] + " ปี"
        } else {
            ageThai = "CALL"
        }
        let lastDayPrvMonth = getLastDayPrvMonth(date, 'DB');
        let lastDaysOfMonth = getLastDayPrvMonth(reportDate, '');
        let startTime = new Date(resRow['start_date']+" 00:00:00");
        let endTime = new Date(resRow['end_date']+" 00:00:00");
        let exTime = new Date(resRow['ex_date']+" 00:00:00");
        let rpTime = new Date(date+" 00:00:00");
        let lastDayPrvMTime = new Date(lastDayPrvMonth+" 00:00:00") 
        // console.log("rpTime : ", rpTime.getTime()," | sTime: ",startTime.getTime()," | ",resRow['end_date']," : endTime: ",endTime.getTime()," | exTime: ",exTime.getTime()," | lastTime: ",lastDayPrvMTime.getTime())
        if (startTime.getTime() <= lastDayPrvMTime.getTime()) {
            // console.log("1startDate ",resRow['start_date'], " less then ", lastDayPrvMonth)
            let lastDay = '';
            if (endTime.getTime() >0 && !isNaN(endTime.getTime()) && endTime.getTime() <= lastDayPrvMTime.getTime()) {
                // console.log("2endDate ",resRow['end_date'], " less then ", lastDayPrvMonth)
                if (exTime.getTime() > 0 && !isNaN(exTime.getTime()) && exTime.getTime() < lastDayPrvMTime.getTime()) {
                    if (exTime.getTime() < endTime.getTime()) {
                        // console.log("A1")
                        daysOfPrvNote = getDateDiffSlash(expDate, noteDate);
                    } else {
                        // console.log("A2")
                        daysOfPrvNote = getDateDiffSlash(endingDate, noteDate);
                    }
                } else {
                    // console.log("A3")
                    daysOfPrvNote = getDateDiffSlash(endingDate, noteDate);
                }

            }else if (endTime.getTime() >0 && !isNaN(endTime.getTime()) && endTime.getTime() > lastDayPrvMTime.getTime()) {
                if (endTime.getTime() >0 && !isNaN(endTime.getTime()) && endTime.getTime() <= lastDayPrvMTime.getTime()) {
                    // console.log("A4")
                    daysOfPrvNote = getDateDiffSlash(endingDate, noteDate);  
                }else{
                    // console.log("A5 : ",endTime.getTime() <= lastDayPrvMTime.getTime())
                    daysOfPrvNote = getDateDiffSlash(lastDaysOfMonth, noteDate)+1;  
                }
            } else {
                // console.log("-3endDate ", resRow['end_date'], " more then ", lastDayPrvMonth)
                
                if (exTime.getTime() > 0 && !isNaN(exTime.getTime()) && exTime.getTime() <= lastDayPrvMTime.getTime()) {
                    // console.log("prv1-1")
                    // console.log("-4exDate ",resRow['ex_date'], " less then ", lastDayPrvMonth)
                    // lastDay = expDate;
                    daysOfPrvNote = getDateDiffSlash(expDate, noteDate);
                } else {
                    // console.log("-5prv1-2 ",noteDate ," : ", lastDaysOfMonth)
                    daysOfPrvNote = getDateDiffSlash(lastDaysOfMonth, noteDate)+1;   
                    
                }
            }
                    
        } else {
            // console.log("start_date'>>",resRow['start_date'], " | reportDate ", reportDate)
            if(startTime.getTime() <= lastDayPrvMTime.getTime()){
                // console.log("1>>")
                // daysOfPrvNote = getDateDiffSlash(reportDate, noteDate);  
                daysOfPrvNote = 0;
            
            }else{
                // console.log("2>>")
                if (endTime.getTime() >0 && !isNaN(endTime.getTime()) && endTime.getTime() <= lastDayPrvMTime.getTime()) {
                    // console.log("2endDate ",resRow['end_date'], " less then ", lastDayPrvMonth)
                    if (exTime.getTime() > 0 && !isNaN(exTime.getTime()) && exTime.getTime() < lastDayPrvMTime.getTime()) {
                        if (exTime.getTime() < endTime.getTime()) {
                            daysOfPrvNote = getDateDiffSlash(expDate, noteDate);
                        } else {
                            daysOfPrvNote = getDateDiffSlash(endingDate, noteDate);
                        }
                    } else {
                        daysOfPrvNote = getDateDiffSlash(endingDate, noteDate);
                    }
                    
                } else {
                    // console.log("3endDate ", resRow['end_date'], " more then ", lastDayPrvMonth)
                    
                    if (exTime.getTime() > 0 && !isNaN(exTime.getTime()) && exTime.getTime() <= lastDayPrvMTime.getTime()) {
                        // console.log("prv1-1")
                        // console.log("4exDate ",resRow['ex_date'], " less then ", lastDayPrvMonth)
                        // lastDay = expDate;
                        daysOfPrvNote = getDateDiffSlash(expDate, noteDate);
                    } else {
                        // console.log("!5prv1-2 ",noteDate ," : ", lastDaysOfMonth)
                        daysOfPrvNote = 0;
                        // daysOfPrvNote = getDateDiffSlash(lastDaysOfMonth, noteDate)+1;   
                    }
                }
            }
            
        }

        daysOfPrvMonth = getDaysOfPrv(noteDate, reportDate, endingDate, expDate,startTime,endTime,exTime,rpTime,lastDayPrvMTime)
 
        days = getDaysForReport(noteDate, endingDate, reportDate, expDate, startTime, endTime, exTime, rpTime, lastDayPrvMTime);

        intPrv = ((noteAmt * (intRate / 100) * (daysOfPrvNote - daysOfPrvMonth)) / 365 );
        intPrvMonth =  ((noteAmt * (intRate / 100) * daysOfPrvMonth) / 365);
        intCur =  parseFloat(((noteAmt * (intRate / 100)) * days / 365)).toFixed(2);  //B
        //intPrv = (noteAmt * (intRate / 100) * (daysOfPrvNote - daysOfPrvMonth)) / 365 
        //intPrvMonth =  ((noteAmt * (intRate / 100) * daysOfPrvMonth) / 365);
        //intCur =  ((noteAmt * (intRate / 100) * days) / 365);
        
        let noteIntPrv = 0//A
        if(row_type=='C1'){
            noteIntPrv = ((intPrv+intPrvMonth+adjIntPrv)-(benefitAmt+adjIntPrv-benefitAmtThisMonth)).toFixed(2) //A
        }else{
            noteIntPrv = (sumInt-(benefitAmt-benefitAmtThisMonth)).toFixed(2);
        }
       
        // let noteIntPrv = ((intPrv+intPrvMonth+adjIntPrv)-(benefitAmt-benefitAmtThisMonth)).toFixed(2); //A

        //intCur //B
        //benefitAmtThisMonth //C   
        let noteIntAmt = parseFloat(noteIntPrv) + parseFloat(intCur) - parseFloat(benefitAmtThisMonth) + adjIntThisMonth;
        // console.log("A-noteIntPrv : ",parseFloat(noteIntPrv)," | B-intCur : ",parseFloat(intCur)," | C-benefitAmtThisMonth : ",benefitAmtThisMonth," | adjIntPrv: ",adjInt)
        // console.log("noteIntPrv:: ",noteIntPrv)
        // console.log("noteIntAmt :: "+noteIntAmt)
        const row = {
            'Key':"D", //detail
            'ID': resRow['id'],
            'CompanyCode': resRow['ledger_name'],
            'CompanyOld': resRow['com_code_old'],
            'CompanyName': resRow['company_name'], 
            'Institute': resRow['ins_code'], 
            'InstituteName': resRow['ins_name'],  
            'InstituteBranch': resRow['ins_branch_name'], 
            'InsType':resRow['ins_type_id'],
            'DocTypeCode':resRow['doc_type_code'],
            'DocTypeName': resRow['doc_type_name'],
            'NoteNo': resRow['note_no'],
            // 'NoteType': resRow['note_type_id'],
            'NoteTypeID' : resRow['note_type_id'],
            'NoteType': resRow['note_type_id'] + "-" + resRow['note_type_name'],
            'AgeOfNote': resRow['age_of_note'],
            'AgeType': ageType,
            'AgeThai': ageThai,
            'NoteDate': formatDateThai(noteDate),
            'PayDate': formatDateThai(resRow['pay_date']),
            'EndingDate': formatDateThai(endingDate),
            'startDate': resRow['start_date'],
            'endDate':resRow['end_date'],
            'InterestRate': intRate.toFixed(4),
            'NoteAmt': noteAmt,
            'NoteAmtPay' : resRow['note_amt_pay'].toFixed(2),
            'Days': (row_type=='C1'&& days>0?days:''),
            'NoteIntPvr':  (Math.abs((parseFloat(noteIntPrv)) == 0),0,(noteIntPrv).toFixed(2)), //(intPrvMonth+intPrv-benefitAmt), //A ยกมา
            'NoteIntCur': (row_type=='C1'?(Math.abs((parseFloat(intCur)) == 0),0,parseFloat(intCur)):0),    //Bปัจจุบัน
            'NoteIntAmt': (Math.abs((parseFloat(noteIntAmt)) == 0),0,(noteIntAmt).toFixed(2)),//ค่้างรับ/จ่าย
            'SumNoteInt': (intPrvMonth + intPrv + intCur+adjIntPrv),
            'AdjustInt': adjInt, //ปรับดอกเบี้ยรวม
            'AdjustIntPrv' : adjIntThisMonth, //ปรับดอกเบี้ยเดือนปัจจุบัน
            'Status': status,
            'StatusDesc' : resRow['status_name'],
            'Description': resRow['description'],
            'BenefitDate': formatDateThai(resRow['transaction_date']),
            'BenefitAmt':(benefitAmtThisMonth==null||benefitAmtThisMonth==''?0:benefitAmtThisMonth), //Cรับดอกเบี้ย
            'SumBenefitAmt': benefitAmt,
            'SumNoteInt': sumNoteAmt,
            'BenefitType': resRow['benefit_type'],
            'exDate':resRow['ex_date'],
            'ExpDate': formatDateThai(expDate),
            'ExpReason': resRow['exp_reason'],
            'FromExcRate': resRow['from_exc_rate'],
            'ToExcRate': resRow['to_exc_rate'],
            'ExcRate': (resRow['exc_rate']==0?'':resRow['exc_rate']),
        }
        //console.log(row)
        ret.push(row)
    });
    
    return ret;
}

const tranformNote = (input) => {
    let ret = [];
    input.forEach(resRow => {
        ret.push(resRow['note_no']);
    })
    return ret;
}

const tranformBranch = (input) => {
    let ret = [];
    input.forEach(resRow => {
        ret.push(resRow['ins_branch']);
    })
    return ret;
}

const tranformCheque = (input) => {
    let ret = [];
    input.forEach(resRow => {
        ret.push(resRow['cheque_no']);
    })
    return ret;
}

const tranformExpReason = (input) => {
    let ret = [];
    input.forEach(resRow => {
        ret.push(resRow['exp_reason']);
    })
    return ret;
}
const tranformChkBond = (input) => {
    let ret = [];
    input.forEach(resRow => {
        const row = {
            'note_no': resRow['note_no'],
            'doc_type': resRow['doc_type_code'],
            'doc_type_name':resRow['doc_type_name']
        }
        ret.push(row);
    })
    return ret;
}

const insertData = async(res,item,mConn = null)=>{
    let conn = null;
    //adjust_int    (company_code,doc_no,transaction_date,ins_code,note_type_id,doc_type_code,note_no,amount,user_id)
    //interest (company_code,rec_type,ins_code,ins_branch,cheque_no,run_no,cheque_date,transaction_date,inttitue,note_type,doc_type_code,note_no,benefit_type,benefit_amt,user_id)
    //bond (company_code,ins_code,ins_type_id,ins_branch,note_type_id,doc_type_code,note_no,days_of_note,age_type,age_of_note,pay_date,note_date,ending_date,int_rate,int_rate_type,note_amt,note_amt_pay,status,broker,description,exp_date,exp_reason,user_id)
    try{
      conn = mConn ? mConn : await getConnection();
      var sql = `INSERT INTO 
                  ${DB}.bond
                  (company_code,ins_code,ins_type_id,ins_branch,note_type_id,doc_type_code,note_no,days_of_note,age_type,age_of_note,pay_date,note_date,ending_date,int_rate,int_rate_type,note_amt,note_amt_pay,status,broker,description,exp_date,exp_reason,user_id)
                VALUES 
                  ${item};`;
    //   console.log("Insert data>>>>",sql)
  
      conn.query(sql,(err,result)=>{     
        // if(err) return res.status(500).end(); 
        if(err) console.error(err)
        return res.status(200).json({message:'บันทึกข้อมูลสำเร็จ'}).end();
      })
    }catch(err){
      console.error(err);
      return res.status(500).json({message:'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง'}).end(); 
    } finally {
      if (conn){
        await conn.end();
      } 
    }
  }
  
  const uploadData = async (res, req) => {
    // console.log("uploadData")
      try {
      excelData(req, function (result) {
        // console.log(result)
        insertData(res,result);
      });
    }catch(err){
      console.error(err);
    }
  }
  
  const excelData = async(req,callback)=> {
      readXlsxFile("./../public/bond-05012023.xlsx").then((rows) => {
        let item = "";
        let l = 0;
        rows.forEach(splitWords => {
          if (l > 1) {
               if (item != "") {
                  item += ",";
              }
              //   subject,announce_date,start_date,filename,file_type,file_group_id
              item += "('" + splitWords[0] + "','" + splitWords[1] + "','" +(splitWords[2]==null?'':splitWords[2])  + "','" + (splitWords[3]==null?'':splitWords[3]) + "','" +
               (splitWords[4]==null?'':splitWords[4]) + "','" + (splitWords[5]==null?'':splitWords[5]) + "','" + (splitWords[6]==null?'':splitWords[6])+ "','"+
               (splitWords[7]==null?'':splitWords[7]) + "','" + (splitWords[8]==null?'':splitWords[8]) + "','" +
                 (splitWords[9]==null?'':splitWords[9]) + "','" +(splitWords[10]==null?'':splitWords[10]) + "','" +(splitWords[10]==null?'':splitWords[10]) + "','" +
                 (splitWords[11]==null?'':splitWords[11])+"','" +(splitWords[12]==null?'':splitWords[12])  + "','" +
                 (splitWords[13]==null?'':splitWords[13])
                 + "','" + (splitWords[14]==null?'':splitWords[14]) +"','" + (splitWords[14]==null?'':splitWords[14]) + "','" +
                (splitWords[15]==null?'':splitWords[15])  + "','" + (splitWords[16]==null?'':splitWords[16]) + "','" + (splitWords[17]==null?'':splitWords[17]) + "','" +
                (splitWords[18]==null?'':splitWords[18])  + "','" + (splitWords[19]==null?'':splitWords[19]) + "',1)";
          }
          l++;
        });
        callback(item);
      });
  }

module.exports = {
    getBond,
    setBond,
    updateBond,
    updateExpBond,
    getReportTransaction,
    getNote,
    getBranch,
    getCheque,
    getExpReason,
    delBond,
    checkBond,
    uploadData
}