const ajvInstance = require("../../../utils/ajv") ;
const toUSDValidate = require("../../../validate-schemas/currency") ;

const createToUsd = {
  type: 'object',
  required: ['date'],
  properties: {
      date : toUSDValidate.date,
      krw : toUSDValidate.krw,
      gbp : toUSDValidate.gdp,
      eur : toUSDValidate.eur,
      cnh : toUSDValidate.cnh,
      hkd : toUSDValidate.hkd,
      sgd : toUSDValidate.sgd,
      chf : toUSDValidate.chf
  },
  errorMessage: {
    date : "Wrong field : date",
    krw : "Wrong field : krw",
    gbp : "Wrong field : gbp",
    eur : "Wrong field : eur",
    cnh : "Wrong field : cnh",
    hkd : "Wrong field : hkd",
    sgd : "Wrong field : sgd",
    chf : "Wrong field : chf",
  },
  additionalProperties: false
}
const createCurrencySchema = ajvInstance.compile(createToUsd)

module.exports =  {
  createCurrencySchema
}