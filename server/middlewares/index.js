const auth = require('./auth') 
const validator = require('./validator') 
const onlyAdmin = require('./onlyAdmin') 
const onlyUser = require('./onlyUser') 
const collectUser = require('./collectUser') 

module.exports =  {
  auth,
  validator,
  onlyAdmin,
  onlyUser,
  collectUser
}
