const express = require('express') 
const { auth, validator } = require('../../../middlewares') 
const onlyWrite = require('../../../middlewares/onlyWrite') ;
const LOGGER = require("../../../utils/logger") ;
const ExportExcel = require('./services') ;


const getAllExcelLog = async (req, res) => {
    const data = req.query;
    const response = await ExportExcel.getAllLogExcel(data)
    LOGGER.APP.info('get all FAQ --> data' + JSON.stringify(data))
    return res.status(response.code).send(response.data)
}
const getExcelLogDetail = async (req, res) => {
    const param = req.query;
    const response = await ExportExcel.getLogExcel(param)
    return res.status(response.code).send(response.data)
}
const deleteLogExcel = async (req, res) => {
    const data = req.body;
    const response = await ExportExcel.deleteLogExcel(data)
    return res.status(response.code).send(response.data)
}
const importEx = async (req, res) => {
    const data = req.body;
    const response = await ExportExcel.importExcelByThriftApi(data)
    return res.status(response.code).send(response.data)
}
const router = express.Router()
router.get('/get-all-log', auth, onlyWrite,getAllExcelLog);
router.get('/detail-log', auth, onlyWrite, getExcelLogDetail);
router.post('/del-log', auth, onlyWrite,deleteLogExcel);
router.post('/import',importEx);

  

module.exports = router