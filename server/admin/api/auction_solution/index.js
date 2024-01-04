
const express = require('express') 
const { auth, validator } = require('../../../middlewares') 
const { updateAuctionSchema } = require('./schemas') 
const AuctionSolution = require('./services') 
const  deleteFileUsingPath  = require('../../../utils/fileUtils') 

const createAuctionHandler = async (req, res) => {
  const data = req.body
  const response = await AuctionSolution.createAution(data)
  return res.status(response.code).send(response.data)
}
const getAllAuctionHandler = async (req, res) => {
  const data = req.body
  const response = await AuctionSolution.getAllAuction(data)
  return res.status(response.code).send(response.data)
}
const postEditAuctionHandler = async (req, res) => {
  const data = req.body
  const response = await AuctionSolution.updateAuction(data)
  return res.status(response.code).send(response.data)
}
const postEditAuctionMultirowHandler = async (req, res) => {
  const data = req.body
  const response = await AuctionSolution.updateMultiRow(data)
  return res.status(response.code).send(response.data)
}
const postEditAuctionMainPageHandler = async (req,res) => {
  const data = req.body
  const response = await AuctionSolution.updateDataMainPage(data)
  return res.status(response.code).send(response.data)
}
const postdeleteAuctionHandler = async (req, res) => {
  const data = req.body
  const response = await AuctionSolution.deleteAuction(data)
  return res.status(response.code).send(response.data)
}
const getDetailAuctionHandler = async (req, res) => {
  const data = req.query
  const response = await AuctionSolution.getDetailAuction(data)
  return res.status(response.code).send(response.data)
}
const getCaculateAuctionHandler = async (req, res) => {
  const data = req.body
  const response = await AuctionSolution.caculateBeforeCreateAndUpdate(data)
  return res.status(response.code).send(response.data)
}
const exportExcel = async (req, res) => {
  const data = req.body
  const response = await AuctionSolution.exportExcel(data)
  return res.download(response.data.filePath, (err) => {
    if (err) {
        LOGGER.APP.error(err);
        return;
    }
    deleteFileUsingPath(response.data.filePath);
});
}
const exportExcelAfterSearchHandler = async (req, res) => {
  const data = req.body
  const response = await AuctionSolution.exportExcelAfterSearch(data)
  return res.download(response.data.filePath, (err) => {
    if (err) {
      LOGGER.APP.error(err);
      return;
    }
    deleteFileUsingPath(response.data.filePath);
    res.status(response.code)
  });
}

const getDataAfterFilter = async (req, res) => {
  const data = req.body
  const response = await AuctionSolution.getDataAfterFilter(data)
  return res.status(response.code).send(response.data)
}

const router = express.Router()
router.post('/create-auction',auth,createAuctionHandler);
router.post('/edit-auction',auth,postEditAuctionHandler);
router.post('/edit-multi',auth,postEditAuctionMultirowHandler);
router.post('/edit-data-mainpage',auth,postEditAuctionMainPageHandler);
router.post('/get-all-auction',auth,getAllAuctionHandler);
router.post('/delete-auction',auth,postdeleteAuctionHandler);
router.get('/detail-auction',auth,getDetailAuctionHandler);
router.post('/data-after-filter',auth,getDataAfterFilter);
router.post('/caculate',auth,getCaculateAuctionHandler);
router.post('/export-excel',auth,exportExcel);
router.post('/export-excel-after-search',auth,exportExcelAfterSearchHandler);

module.exports =  router
