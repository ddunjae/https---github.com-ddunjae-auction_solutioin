//need using combine with auth
const { USER_ROLE } = require('../utils/strVar');
function onlyWrite(req, res, next) {
  // console.log("auth",req.user);
  if (!req.user || req.user.userRole != USER_ROLE.WRITE) {
    return res.status(403).send('Only for admin write');
  }
  next();
}

module.exports =  onlyWrite