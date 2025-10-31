const express = require('express');
const router = express.Router()
const {getInterest,setInterest,updateInterest,delInterest} = require('../repository/interest-repo')

router.get('/', (req,res)=>{
    // console.log("get interest!!");
    try {
        return getInterest(res,req);
    } catch {
        res.sendStatus(500).end();
    }
})

router.post('/create', (req, res) => {
    // console.log("set Interest!!");
    try {
        return setInterest(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.post('/update', (req, res) => {
    // console.log("update Interest!!");
    try {
        return updateInterest(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.post('/del', (req, res) => {
    // console.log("del Interest!!");
    try {
        return delInterest(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

module.exports = router