const { getConnection } = require("../config");
const DB = 'corporate_finance_onee'

const getCompany = async (res,req,type, mConn = null) => { 
    let conn = null
    var params = req.query;
    // var condition = "";
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT * FROM ${DB}.company where is_delete='0'order by company_name `;
        // console.log("sql>>",sql)
        conn.query(sql, (err, result) => {
            // if(err) return res.status(500).end(); 
            if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result)));
            return res.status(200).json(tranformCompany(rs,type)).end();
        })
    } catch (error) {
        console.error(error)
    } finally {
        if (conn){
            await conn.end();
        } 
    }
}

const getDocType = async (res,req, mConn = null) => { 
    let conn = null
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT * FROM ${DB}.doc_type where is_delete='0' order by doc_type_code `;
        // console.log("sql>>",sql)
        conn.query(sql, (err, result) => {
            if(err) return res.status(500).end(); 
            // if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result)));
            return res.status(200).json(tranformDocType(rs)).end();
        })
    } catch (error) {
        console.error(error)
    } finally {
        if (conn){
            await conn.end();
        } 
    }
}

const getBank = async (res,req, mConn = null) => { 
    let conn = null
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT * FROM ${DB}.bank where is_delete='0' order by bank_code `;
        // console.log("sql>>",sql)
        conn.query(sql, (err, result) => {
            if(err) return res.status(500).end(); 
            // if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result)));
            return res.status(200).json(tranformBank(rs)).end();
        })
    } catch (error) {
        console.error(error)
    } finally {
        if (conn){
            await conn.end();
        } 
    }
}

const getInstitute = async (res,req, mConn = null) => { 
    let conn = null
    var params = req.query;
    var condition = "";
    // console.log(params)
    if (params.hasOwnProperty("type")) {
        if (params.type == 1) {
            condition = "and ins_type = 1 "
        } else if (params.type == 4) {
            condition = "and ins_type = 4 "
        } else {
             condition = "and ins_type <> 4 "
        }
    }
    if (params.hasOwnProperty("id")) {
        condition += "and ins_code = '"+params.id+"' "
    }
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT * FROM ${DB}.institute where is_delete='0' ${condition} order by ins_name `;
        // console.log("sql>>",sql)
        conn.query(sql, (err, result) => {
            if(err) return res.status(500).end(); 
            // if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result)));
            return res.status(200).json(tranformInstitute(rs)).end();
        })
    } catch (error) {
        console.error(error)
    } finally {
        if (conn){
            await conn.end();
        } 
    }
}

const getInstituteBranch = async (res,req, mConn = null) => { 
    let conn = null
    var params = req.query;
    var condition = "";
    // console.log(params)
    if (params.hasOwnProperty("bank")) {
        condition = "ins_code = '"+params.bank+"'"
    }
    if (params.hasOwnProperty("id")) {
        if (condition != "") {
            condition += " and ";
        }
        condition += "ins_branch_code = '"+params.id+"' "
    }
    if (condition != "") {
        condition += " and ";
    }
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT * FROM ${DB}.institute_branch where ${condition} is_delete='0' order by ins_code,ins_branch_name `;
        // console.log("sql>>",sql)
        conn.query(sql, (err, result) => {
            if(err) return res.status(500).end(); 
            // if(err) console.error(err)
            const rs = Object.values(JSON.parse(JSON.stringify(result)));
            return res.status(200).json(tranformInstituteBranch(rs)).end();
        })
    } catch (error) {
        console.error(error)
    } finally {
        if (conn){
            await conn.end();
        } 
    }
}

const tranformCompany = (input,type) => {
    let ret = []; 
    if (type == 'C') {
        input.forEach((resRow) => {
            const row = {
                id: resRow['ledger_name'],
                name: resRow['company_name'],
                short_name: resRow['company_short_name'],
                old_code: resRow['company_code_old']
            };
            ret.push(row);
        }); 
    } else if (type == 'L') {
         input.forEach((resRow) => {
            const row = {
                id: resRow['company_code_old'],
                name: resRow['company_name'],
                short_name: resRow['company_short_name'],
                old_code: resRow['ledger_name']
            };
            ret.push(row);
        }); 
    }
  return ret;
};

const tranformDocType = (input) => {
  let ret = []; 
  input.forEach((resRow) => {
    const row = {
      id: resRow['doc_type_code'],
      name: resRow['doc_type_code']+" : "+resRow['doc_type_name'],
      type_name: resRow['doc_type_name'],
    };
    ret.push(row);
  });  
  return ret;
};

const tranformBank = (input) => {
  let ret = []; 
  input.forEach((resRow) => {
    const row = {
      id: resRow['bank_code'],
      name: resRow['bank_name'],
    };
    ret.push(row);
  });  
  return ret;
};

const tranformInstitute = (input) => {
  let ret = []; 
  input.forEach((resRow) => {
    const row = {
      id: resRow['ins_code'],
      name: resRow['ins_name'],
      ins_name : resRow['ins_name']
    };
    ret.push(row);
  });  
  return ret;
};

const tranformInstituteBranch = (input) => {
  let ret = []; 
  input.forEach((resRow) => {
    const row = {
      id: resRow['ins_branch_code'],
      name: resRow['ins_branch_name'],
    };
    ret.push(row);
  });  
  return ret;
};

module.exports = {
    getCompany,
    getDocType,
    getInstitute,
    getInstituteBranch,
    getBank
}