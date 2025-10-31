require("dotenv").config();
const express = require('express');
const cors = require("cors");
const app = express()
app.use(cors());
app.use(express.json());
const{
  bond,
  master,
  interest,
  adjustInt,
  user
  // source
} = require('../api/router')


const port = process.env.PORT || 3002

// Begin Allow origin policy
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods','POST, GET, PUT, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers','Content-Type, Json, Option, Authorization')
  res.header('Access-Control-Allow-Credentials',true)
  return next()
});
// End Allow origin policy

app
  .use(express.json())
  .use('/api/bond',bond)
  .use('/api/master',master)
  .use('/api/interest', interest)
  .use('/api/adjust', adjustInt)
  .use('/api/user',user)
  .listen(port, () => console.info(`Listening on port ${port}`));