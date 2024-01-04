const jwt = require('jsonwebtoken')
require('dotenv').config()
const {tokenCanUsing} = require('../utils/jwtHandle')

function auth (req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]
  if (!token) {
    return res.sendStatus(401)
  }
  if (!tokenCanUsing(token)) return res.sendStatus(403);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403)
    }
    // console.log("data:",user);
    const userInfo = user
    req.user = userInfo
    req.jwtToken = token;
    // console.log("done auth",req.user);
    next()
  })
}

module.exports =  auth
