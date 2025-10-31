var mysql = require('mysql');

var config = mysql.createConnection({
  host: "localhost",
  user: "iconvert",
  password: "Onee@convert2022",
  database: "corporate_finance_onee"
});
const getConnection = async () => {
    var con = null
    try {      
        con= mysql.createConnection({config});
        con.connect((err)=>{
            if(err){
                throw err;
            }
            console.log("MySql Connected..");
        })
    } catch (error) {
      console.error(error)
      process.exit(1)
    }
    return con;
  }
module.exports = {
    getConnection
};