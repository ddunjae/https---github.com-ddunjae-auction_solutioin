const LOGGER = require("../utils/logger") ;
const response = require("../utils/Response") ;
require("dotenv").config();

function ipAuth(req, res, next) {
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const whiteList = process.env.IP_WHITE_LIST;
  if (whiteList.indexOf(clientIp) === -1) {
    LOGGER.APP.error(`not allowed access : ${clientIp}`);
    const resp = response.ERROR(
      403,
      `not allowed access : ${clientIp}`,
      "ip_403"
    );
    res.status(resp.code).send(resp.data);
  } else {
    next();
  }
}

module.exports = ipAuth;
