
const express = require('express') 
const { auth, validator } = require('../../../middlewares') 
const AuctionCompany = require('./services') 
const { createCompanySchema } = require('./schemas') 

const createCompanyHandler = async (req, res) => {
  const data = req.body
  const response = await AuctionCompany.createAuctionCompany(data)
  return res.status(response.code).send(response.data)
}
const getAllCompanyHandler = async (req, res) => {
  const data = req.query
  const response = await AuctionCompany.getAllConpmany(data)
  return res.status(response.code).send(response.data)
}
const getDetailCompanyHandler = async (req, res) => {
  const data = req.query
  const response = await AuctionCompany.getDetailCompany(data)
  return res.status(response.code).send(response.data)
}

const router = express.Router()
router.post('/create-company',validator(createCompanySchema),auth,createCompanyHandler);
router.get('/get-all-company',auth,getAllCompanyHandler);
router.get('/get-detail-company',auth,getDetailCompanyHandler);
module.exports =  router
