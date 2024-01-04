
function ipIdentify(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  req.ipIdentify = {ip};
  next();
}

module.exports =  ipIdentify
