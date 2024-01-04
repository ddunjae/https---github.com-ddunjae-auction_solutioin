const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config("../.env");
const {tokenCanUsing} = require('../utils/jwtHandle')
const auth = (req, res, next) => {
  // 인증 완료
  try {
    // 요청 헤더에 저장된 토큰과 비밀키를 사용하여 토큰을 req.decoded에 반환
    // token = req.headers["authorization"].split(" ")[1];
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
      const userInfo = user
      req.user = userInfo
      req.jwtToken = token;
      next()
    });
  } catch (error) {
    console.log(error);
    // 인증 실패ss
    // 유효시간이 초과된 경우
    if (error.name === "TokenExpiredError") {
      res.status(419).json({
        result: false,
        err: 419,
        err_desc: "token expire",
      });
    }
    // 토큰의 비밀키가 일치하지 않는 경우
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        result: false,
        err: 401,
        err_desc: "invalid token",
      });
    }
  }
};

module.exports =  {auth} ;
