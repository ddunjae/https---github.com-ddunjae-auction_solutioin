const ajvInstance = require("../../../utils/ajv") ;
const filter = require("../../../validate-schemas/filter/filter") ;

const option_rank = {
  type: "object",
  required: ["kind"],
  properties: {
    kind: filter.kind_rank,
    company: filter.company_string,
  },
  errorMessage: {
    required: {
      kind: "kind is required'",
    },
  },
  additionalProperties: true,
};
const option_section = {
  type: "object",
  required: ["kind"],
  properties: {
    kind: filter.kind_section,
  },
  errorMessage: {
    required: {
      kind: "kind is required",
    },
  },
  additionalProperties: true,
};

const optionRankSchema = ajvInstance.compile(option_rank);
const optionSectionSchema = ajvInstance.compile(option_section);
module.exports =  { optionRankSchema, optionSectionSchema };
