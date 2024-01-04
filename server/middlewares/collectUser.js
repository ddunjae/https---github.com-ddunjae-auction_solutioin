const jwt = require('jsonwebtoken')
require('dotenv').config()
const { tokenCanUsing } = require('../utils/jwtHandle')

//using for get user information if have in header
function collectUser(req, res, next) {
  try{
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]
    if (!token) {
      return next();
    }
    if (!tokenCanUsing(token)) return next();
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      const userInfo = user
      req.user = userInfo
      return next();
    })
  }catch(e){
    console.log("collector user error", e);
    return next();
  }
}

module.exports = collectUser
