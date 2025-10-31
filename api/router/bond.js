const express = require('express');
const router = express.Router()
const {getBond,setBond,updateBond,updateExpBond,getReportTransaction,getNote,getBranch,getCheque,getExpReason,delBond,checkBond,uploadData} = require('../repository/bond-repo')

router.get('/', (req,res)=>{
    // console.log("get Bond!!");
    try {
        return getBond(res,req);
    } catch {
        res.sendStatus(500).end();
    }
})

router.post('/create', (req, res) => {
    // console.log("set Bond!!");
    try {
        return setBond(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.post('/update', (req, res) => {
    // console.log("update Bond!!");
    try {
        return updateBond(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.post('/del', (req, res) => {
    // console.log("del Bond!!");
    try {
        return delBond(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.post('/update/exp', (req, res) => {
    // console.log("update ExpBond!!");
    try {
        return updateExpBond(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})
router.get('/report_transection', (req, res) => {
    // console.log("report transection!!");
    try {
        return getReportTransaction(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.get('/getnote', (req, res) => {
    // console.log("get Note!!");
    try {
        return getNote(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.get('/getbranch', (req, res) => {
    // console.log("get Branch!!");
    try {
        return getBranch(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.get('/getcheque', (req, res) => {
    // console.log("get Cheque!!");
    try {
        return getCheque(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.get('/getexpreason', (req, res) => {
    // console.log("get Reason!!");
    try {
        return getExpReason(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.get('/chkbond', (req, res) => {
    console.log("chkBond")
    try {
        return checkBond(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.post('/upload', async (req, res) => {
    // console.log("upload")
    try {
        return await uploadData(res,req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

module.exports = router