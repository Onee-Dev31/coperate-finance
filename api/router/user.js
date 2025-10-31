const express = require('express');
const router = express.Router()
const {login,authenticatedUser,refresh,logout,changePassForUser} = require('../repository/user-repo')

router.post('/login', async(req,res)=>{
    try {
        // console.log("login")
        return await login(res,req);
    } catch (error) {
        res.status(500).end();
    }
})

router.post('/changepass', async (req, res) => {
    try {
        return await changePassForUser(res, req);
    } catch (error) {
        res.status(500).end();
    }
})

router.get('/auth', async (req, res) => {
    try {
        return await authenticatedUser(res,req)
    } catch (error) {
        res.status(500).end();
    }
})

router.post('/refresh', async (req, res) => {
    try {
        return await refresh(res,req)
    } catch (error) {
        res.status(500).end();
    }
})
  
router.post('/logout', async (req, res) => {
    // console.log("logout")
    try {
        return await logout(res,req);
    } catch (error) {
        res.status(500).end();
    }
})


module.exports = router