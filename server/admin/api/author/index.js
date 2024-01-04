
const express = require('express') 
const { auth, validator } = require('../../../middlewares') 
const Author = require('./services')
const  {createAuthorSchema} = require('./schemas') 
const {editAuthorSchema} = require('./schemas')
const deleteFileUsingPath = require('../../../utils/fileUtils')

const createAuthorHandler = async (req, res) => {
  const data = req.body
  const response = await Author.createAuthor(data)
  return res.status(response.code).send(response.data)
}
const editAuthorHandler = async (req, res) => {
  const data = req.body
  const response = await Author.editAuthor(data)
  return res.status(response.code).send(response.data)
}
const getAllAuthorHandler = async (req, res) => {
  const data = req.body
  const response = await Author.getAllAuthor(data)
  return res.status(response.code).send(response.data)
}

const getAllAuthorHandler1 = async (req, res) => {
  const data = req.body
  const response = await Author.getAllUpdateAuthor(data)
  return res.status(response.code).send(response.data)
}

const getDetailAuthorHandler = async (req, res) => {
  const data = req.query
  const response = await Author.getDetailAuthor(data)
  return res.status(response.code).send(response.data)
}
const deleteAuthorHandler = async (req, res) => {
  const data = req.body
  const response = await Author.deleteAuthor(data)
  return res.status(response.code).send(response.data)
}
const exportExcelHandler = async (req, res) => {
  const data = req.body
  const response = await Author.exportExcelAuthor(data)
  return res.download(response.data.filePath, (err) => {
    if (err) {
        LOGGER.APP.error(err);
        return;
    }
    deleteFileUsingPath(response.data.filePath);
});
}
const getListAuthorHandler = async (req, res) => {
  const data = req.query
  const response = await Author.getListAuthor(data)
  return res.status(response.code).send(response.data)
}

const router = express.Router()
router.post('/create-author',auth,validator(createAuthorSchema),createAuthorHandler);
router.post('/edit-author',auth,validator(editAuthorSchema),editAuthorHandler);
router.post('/get-all-author',auth,getAllAuthorHandler);
router.get('/get-detail-author',auth,getDetailAuthorHandler);
router.post('/delete-author',auth,deleteAuthorHandler);
router.post('/export-excel',auth,exportExcelHandler);
router.get('/get-author',auth,getListAuthorHandler);
// router.post('/update-consonant',auth,getAllAuthorHandler1);

module.exports =  router
