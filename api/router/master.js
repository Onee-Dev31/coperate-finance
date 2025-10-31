const express = require('express');
const router = express.Router()
const {getCompany,getDocType,getInstitute,getInstituteBranch,getBank} = require('../repository/master-repo')

router.get('/company', async (req,res)=>{
    try {
        return await getCompany(res,req,"C");
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.get('/lob', async (req,res)=>{
    try {
        return await getCompany(res,req,"L");
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.get('/doctype', async (req, res) => {
    // console.log("docType")
    try {
        return await getDocType(res,req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.get('/institute', async (req, res) => {
    try {
        return await getInstitute(res,req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.get('/institute/branch/', async (req, res) => {
    // console.log(req.query)
    try {
        return await getInstituteBranch(res,req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.get('/bank', async (req, res) => {
    try {
        return await getBank(res,req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

module.exports = router