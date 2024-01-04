const CONFIG = require('./config') 
const LOGGER = require('../utils/logger') 

require('dotenv').config()

const { DB_CONFIG } = CONFIG
const knex = require('knex')(DB_CONFIG)

knex.on('query', LOGGER.DB.query)
knex.on('query-error', LOGGER.DB.error.bind(LOGGER.DB))
// knex.on('query-response', LOGGER.DB.queryResponse) //nang vl

function initialize () {
  // user
  require('../admin/db-schemas/user').userModel(knex)
  require('../../server/admin/db-schemas/author').authorModel(knex)
  require('../admin/db-schemas/aution_solution').autionSolutionModel(knex)
  require('../admin/db-schemas/currency').currencyModel(knex)
  require('../admin/db-schemas/auction_company').auctionCompanyrModel(knex)
}
initialize()
module.exports = knex
