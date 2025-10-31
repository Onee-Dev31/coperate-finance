const { getConnection } = require("../config");
const jwt = require("jsonwebtoken");
const sessions = require('express-session');
// const cookieParser = require("cookie-parser");
const express = require('express');
const app = express()
const bcrypt = require('bcrypt');
const rounds = 6;
const DB = 'corporate_finance_onee'
let session = "";
const login = async (res,req, mConn = null) => { 
    let conn = null
    
    try {
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT a.user_id,b.company_code as lob,b.name,b.lastname,a.password FROM ${DB}.login as a left join ${DB}.user as b on a.user_id = b.user_id  where a.user_name='${req.body.user}'`;
        // console.log("login sql>>",sql)
        conn.query(sql, (err, result) => {
            if(err) return res.status(401).json({message:"Login ไม่สำเร็จ"}).end(); 
            // if(err) console.error(err)
            if (result.length > 0) {
                const rs = Object.values(JSON.parse(JSON.stringify(result)));
                // console.log(rs)
                // const user = {
                //             id: rs[0]['user_id'],
                //             user_id: rs[0]['name'],
                //             username: req.body.user,
                // };
                const matched = bcrypt.compareSync(req.body.pass, rs[0]['password']);
                if (matched) {
                    // console.log("matched")
                    const accessToken = jwt.sign({
                        id: rs[0]['user_id']
                    }, "access_secret", { expiresIn: '3h' });

                    // const refreshToken = jwt.sign({
                    //     id: rs[0]['user_id']
                    // }, "refresh_secret", { expiresIn: '1w' });

                    res.cookie('accessToken', accessToken,  {
                        httpOnly: true,
                        maxAge: 3*60*60*1000 // 2h
                    })
                    // console.log(res.cookie)
                    // app.use(sessions({
                    //     secret: "theoneesecretkeyeenoeht",
                    //     saveUninitialized: true,
                    //     cookie: { name:'accessToken',value:accessToken,expiresIn:'3h',maxAge: 3*60*60*1000 }, //3h
                    //     resave: false
                    // }));
                    // res.cookie('refreshToken', refreshToken, {
                    //     httpOnly: true,
                    //     maxAge: 7*24*60*60*1000 // 7 days
                    // })
                    // return res.status(200).json({data:rs[0], message:"Login สำเร็จ"}).end();
                    return res.status(200).json(tranformUser(rs)).end();
                } else {
                // console.log("not matched")
                   return res.status(401).json({message:"ไม่พบข้อมูล Username หรือ Password"}).end();
                }
                
            } else {
                return res.status(401).json({message:"ไม่พบข้อมูล Username หรือ Password"}).end();
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).end(); 
    } finally {
        if (conn){
            await conn.end();
        } 
    }
}

const authenticatedUser = async (res,req,mConn=null) => {
    // console.log("Auth ")
    let conn =""
    // console.log("auth>>",req.cookies.accessToken)
    try {
        const accessToken = req.cookies.accessToken;

        const payload = jwt.verify(accessToken, "access_secret");

        if (!payload) {
            return res.status(401).Json({ message: 'Unauthenticated' }).end();
        }

        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT a.user_id,b.company_code as lob,b.name,b.lastname FROM ${DB}.login as a left join ${DB}.user as b on a.user_id = b.user_id  where a.user_id='${payload.id}' `;
        // console.log("auth sql>>",sql)
        conn.query(sql, (err, result) => {
            if (err) return res.status(401).Json({ message: 'Unauthenticated' }).end();
            if (result.length > 0) {
                const rs = Object.values(JSON.parse(JSON.stringify(result)));
                return res.status(200).json(tranformUser(rs)).end();
            }
        })
    } catch (error) {
        return res.status(401).Json({ message: 'Unauthenticated' }).end();
    }
}

const refresh = async (res, req, mConn = null) => {
    // console.log("Refresh ")
    let conn =""
    // console.log("refresh>>",req.cookies.refreshToken)
    try {
        const refreshToken = req.cookies.refreshToken;

        const payload = jwt.verify(refreshToken, "refresh_secret");

        if (!payload) {
            return res.status(401).Json({ message: 'Unauthenticated' }).end();
        }
        // console.log(refreshToken)
        const accessToken = jwt.sign({
            id: payload.id
        }, "access_secret", { expiresIn: '3h' });

        res.cookie('accessToken', accessToken,  {
            httpOnly: true,
            maxAge: 3*60*60*1000 // 2hours
        })
        return res.status(200).json({message: "Refresh Token Success" }).end();
    } catch (error) {
        return res.status(401).Json({ message: 'Unauthenticated' }).end();
    }
}

const changePassForUser = async (res, req) => {
    
    let params = req.body.params;
    // console.log(req)
    try {
        // console.log("params>>",params)
        checkUser(params.user, params.c_pass ,function(result) {
            // console.log(result)
            if (result) {
                updatePassword(res, params);
            } else {
                return res.status(401).Json({ message: 'Unauthenticated' }).end();
            }
        });
        
    } catch (error) {
        console.error(error)
        return res.status(401).Json({ message: 'Unauthenticated' }).end();
    }
}

const updatePassword = async (res, params, mConn = null) => {
    let conn = "";
    try {
        let phash = bcrypt.hashSync(params.n_pass, rounds);

        // console.log("hash >> ", phash);
        conn = mConn ? mConn : await getConnection();
        var sql = `UPDATE ${DB}.login set password = '${phash}' where user_id='${params.user}' `;
        // console.log("login sql>>",sql)
        conn.query(sql, (err, result) => {
            if (err) console.error(err);
            return res.status(200).json({message: "Changed Password Success" }).end();
        });
    } catch (error) {
        console.error(error)
        return res.status(401).Json({ message: 'Unauthenticated' }).end();
    }
}

const checkUser = async (user, pass, callback, mConn = null) =>{
    let conn = "";
    // let chk = false;
    try {
        
        conn = mConn ? mConn : await getConnection();
        var sql = `SELECT a.user_id,a.password FROM ${DB}.login as a left join ${DB}.user as b on a.user_id = b.user_id and b.is_active = '0' where a.user_id='${user}' `;
        // console.log("login sql>>",sql)
        conn.query(sql, (err, result) => {
            if (err) callback(false);
            if (result.length > 0) {
                const rs = Object.values(JSON.parse(JSON.stringify(result)));
                // console.log(rs)
                const matched = bcrypt.compareSync(pass, rs[0]['password']);
                if (matched) {
                    // console.log("matched")
                    callback(true);
                } else {
                    // console.log("not matched")
                   callback(false);
                }              
            } else {
                callback(false);
            }
        });
        // callback(chk);
    } catch (error) {
        console.error(error)
    }
} 

const logout = async (res, req) => {
    // console.log("logOut:",req.session)
    // req.session.destroy();
    res.cookie('accessToken', { maxAge: 0})
    // res.cookie('refreshToken', { maxAge: 0 })
    return res.status(200).end();
}

const tranformUser = (input) => {
    let ret = [];
    input.forEach((resRow) => {
        const row = {
            user_id: resRow['user_id'],
            lob: resRow['lob'],
            name: resRow['name'],
            lastname: resRow['lastname'],
            // accessToken: accessToken,
            // refreshToken : refreshToken
        }
        ret.push(row)
    })
    return ret;
}

module.exports = {
    login,
    logout,
    authenticatedUser,
    refresh,
    changePassForUser
}