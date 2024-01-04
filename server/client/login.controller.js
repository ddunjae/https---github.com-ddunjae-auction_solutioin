const dotenv = require("dotenv");
dotenv.config("../.env");
const knex = require("../config/connectDB");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

async function login(req, res, next) {
  if (!knex.pool) {
   let  input_id = req.body.id;
   let  input_pw = req.body.pw;
   let  result
    if (input_id == undefined || input_pw == undefined) {
      res.send({
        result: false,
        err: 49999,
        err_desc: "Param required",
        errorCode : "auth001"
      });
    } else {
      result = await knex
        .select("*")
        .from("user")
        .where("user_name", "=", input_id);
      if (result.length < 1) {
        return res.send({
          result: false,
          err: 10011,
          err_desc: "ID does not exist",
          errorCode : "auth002"
        });
      } else {
        const isPasswordValid = bcrypt.compareSync(
          input_pw,
          result[0].password
        );
        if (!isPasswordValid) {
          return res.send(400,{
            result: false,
            err: 10010,
            err_desc: "Password error",
            errorCode : "auth003"
          });
        } else {
          const token = jwt.sign(
            { user_id: input_id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
          );
          res.cookie("Authorization", token);
          return res.send({
            result: true,
            msg: "로그인 성공",
            resp: { id: input_id, pw: input_pw, token: token },
          });
        }
      }
    }
  } else {
    return res.send({
      result: false,
      err: 10000,
      err_desc: "DB Error",
      errorCode : "auth004"
    });
  }
}

function logout(req, res, next) {
  res.clearCookie("Authorization");
  res.send({ result: true, msg: "로그아웃" });
}

module.exports = { login, logout };
