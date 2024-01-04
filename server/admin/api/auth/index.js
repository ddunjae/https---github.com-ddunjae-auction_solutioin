const AuthServices = require('./services');
const express = require('express') 
const { auth, validator } = require('../../../middlewares') 
const {
  signUpSchema,
  signInSchema,
  changePasswordSchema,
  findIdSchema,
  recoveryPwSchema,
  checkExistAccountSchema,
  signInSnsSchema
} = require('./schemas') 
const { removeJwt } = require('../../../utils/jwtHandle')

const signUpHandler = async (req, res) => {
  const data = req.body
  const response = await AuthServices.signUp(data)
  return res.status(response.code).send(response.data)
}

const signInHandler = async (req, res) => {
  const data = req.body;
  const ipIdentify = req.ipIdentify;
  const response = await AuthServices.signIn(data, ipIdentify);

  return res.status(response.code).send(response.data)
}

const signInSnsHandler = async (req, res) => {
  const data = req.body;
  const ipIdentify = req.ipIdentify;
  const response = await AuthServices.signInSns(data, ipIdentify);

  return res.status(response.code).send(response.data)
}

const changePasswordHandler = async (req, res) => {
  const data = req.body
  const { user } = req
  const response = await AuthServices.changePassword(user, data)

  return res.status(response.code).send(response.data)
}

const findIdHandler = async (req, res) => {
  const data = req.body
  const response = await AuthServices.findIdByEmail(data)
  return res.status(response.code).send(response.data)
}

const recoveryPasswordHandler = async (req, res) => {
  const data = req.body
  const response = await AuthServices.recoveryPassword(data)
  return res.status(response.code).send(response.data)
}

const checkExistAccountHandler = async (req, res) => {
  const data = req.body
  const response = await AuthServices.checkExist(data)
  return res.status(response.code).send(response.data)
}

const logoutHandler = async (req, res) => {
  removeJwt(req.jwtToken);
  return res.status(200).send({ result: true, message: "Logout success", data: null })
}

const getIdDevice = async (req, res) => {
  const data = req.query
  const response = await AuthServices.getIdDevice(data)
  return res.status(response.code).send(response.data)
}

const router = express.Router()

router.post('/sign-up', validator(signUpSchema), signUpHandler)
router.post('/sign-in', validator(signInSchema), signInHandler)
router.post('/sign-in-sns', validator(signInSnsSchema), signInSnsHandler)
router.post('/change-password', auth, validator(changePasswordSchema), changePasswordHandler)
router.post('/find-id', validator(findIdSchema), findIdHandler)
router.post('/recovery-pw', validator(recoveryPwSchema), recoveryPasswordHandler)
router.post('/check-exists', validator(checkExistAccountSchema), checkExistAccountHandler)
router.post('/logout', auth, logoutHandler)
router.get('/', getIdDevice)



module.exports =  router
