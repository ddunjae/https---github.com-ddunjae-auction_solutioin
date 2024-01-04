const ajvInstance = require("../../../utils/ajv") ;
const companyValidate = require("../../../validate-schemas/auction_company") ;


const createAuthor = {
  type: 'object',
  required: ['company'],
  properties: {
          company : companyValidate.company,
          onlineFeerate : companyValidate.onlineFeerate,
          offlineFeerate : companyValidate.offlineFeerate,
          overseas : companyValidate.overseas,
  },
  errorMessage: {
    company: "Wrong field : company",
    onlineFeerate: "Wrong field : onlineFeerate",
    offlineFeerate: "Wrong field : offlineFeerate",
    overseas: "Wrong field : overseas"
  },
  additionalProperties: false
}
const createCompanySchema = ajvInstance.compile(createAuthor)

module.exports =  {
  createCompanySchema
}