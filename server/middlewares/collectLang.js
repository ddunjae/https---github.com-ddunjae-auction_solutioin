const jwt = require('jsonwebtoken')
require('dotenv').config()
const { tokenCanUsing } = require('../utils/jwtHandle')

const acceptedLang = ["ko-KR","en-US"];
const defaultLang = "ko-KR";

//using for get user information if have in header
function collectLang(req, res, next) {
  try{
    const lang = acceptedLang.includes(req.headers['my-content-lang']) ? req.headers['my-content-lang'] : defaultLang;
    req.langCode = lang;
    
    return next();
  }catch(e){
    console.log("collector lang", e);
    return next();
  }
}

module.exports = collectLang
