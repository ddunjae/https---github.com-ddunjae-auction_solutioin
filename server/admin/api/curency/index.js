
const express = require('express') 
const Currency = require('./services') 
const { auth , validator} = require('../../../middlewares') 
const { createCurrencySchema } = require('./schemas') 


const createCurrencyHandler = async (req, res) => {
  const data = req.body
  const response = await Currency.createCurrency(data)
  return res.status(response.code).send(response.data)
}
const getAllCurrencyHandler = async (req, res) => {
  const data = req.query
  const response = await Currency.getAllCurrency(data)
  return res.status(response.code).send(response.data)
}
const getDetailCurrencyHandler = async (req, res) => {
  const data = req.query
  const response = await Currency.getDetailCurrency(data)
  return res.status(response.code).send(response.data)
}

const router = express.Router()
router.post('/create-currency',auth,validator(createCurrencySchema),createCurrencyHandler);
router.get('/get-all-currency',auth,getAllCurrencyHandler);
router.get('/get-detail-currency',auth,getDetailCurrencyHandler);
module.exports =  router
