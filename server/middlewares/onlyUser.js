//need using combine with auth
const {USER_ROLE} = require('../utils/strVar');
function onlyUser (req, res, next) {
  if(!req.user || !(req.user.userRole == USER_ROLE.USER || req.user.userRole == USER_ROLE.COMPANY)){
    return res.status(403).send('Only for user');
  }
  next();
}

module.exports =  onlyUser