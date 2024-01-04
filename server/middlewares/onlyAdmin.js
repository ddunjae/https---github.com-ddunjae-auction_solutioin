
//need using combine with auth
const { USER_ROLE } = require('../utils/strVar');
function onlyAdmin(req, res, next) {
  // console.log("auth",req.user);
  if (!req.user || req.user.userRole != USER_ROLE.ADMIN) {
    return res.status(403).send('Only for admin');
  }
  next();
}

module.exports =  onlyAdmin
