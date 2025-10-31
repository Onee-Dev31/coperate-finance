const express = require('express');
const router = express.Router()
const {deleteAdjustInt,getAdjustInt,setAdjustInt,updateAdjustInt} = require('../repository/adjust-int-repo')

router.get('/', (req,res)=>{
    // console.log("get interest!!");
    try {
        return getAdjustInt(res,req);
    } catch {
        res.sendStatus(500).end();
    }
})

router.put('/del', (req, res) => {
    try {
        return deleteAdjustInt(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.post('/create', (req, res) => {
    // console.log("set AdjustInt!!");
    // console.log(req.body);
    try {
        return setAdjustInt(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

router.post('/update', (req, res) => {
    // console.log("update Interest!!");
    try {
        return updateAdjustInt(res, req);
    } catch (error) {
        res.sendStatus(500).end();
    }
})

module.exports = router