const ajvInstance = require("../../../utils/ajv")
const authorValidate = require("../../../validate-schemas/author");

const createAuthor = {
  type: 'object',
  required: [],
  properties: {
    nameKr: authorValidate.nameKr,
    nameEn: authorValidate.nameEn,
    nameCn: authorValidate.nameCn,
    born: authorValidate.yearBirth,
    dead: authorValidate.yearDeath,
    aliasKr: authorValidate.aliasKr,
    aliasEn: authorValidate.aliasEn,
    externalLink: authorValidate.externalLink,
    reference: authorValidate.reference,
    exhibition: authorValidate.exhibition,
    education: authorValidate.education,
    description: authorValidate.description,
    memo: authorValidate.memo,
    generation: authorValidate.generation,
    artMovmnt: authorValidate.artMovmnt,
    consonant : authorValidate.artMovmnt,
    nationality1 : authorValidate.nationality1,
    nationality2 : authorValidate.nationality2
  },
  errorMessage: {
    nameKr: "Wrong field : Name kor",
    nameCn: "Wrong field : nameCn",
    born: "Wrong field : born",
    dead: "Wrong field : dead",
    aliasKr: "Wrong field : aliasKr",
    aliasEn: "Wrong field : aliasEn",
    externalLink: "Wrong field : externalLink",
    reference: "Wrong field : reference",
    exhibition: "Wrong field : exhibition",
    education: "Wrong field : education",
    description: "Wrong field : description",
    memo: "Wrong field : memo",
    nationality1: "Wrong field : nationality1",
    nationality2: "Wrong field : nationality2"
  },
  additionalProperties: false
}
const createAuthorSchema = ajvInstance.compile(createAuthor)

const editAuthor = {
  type: 'object',
  required: ['id'],
  properties: {
    id: authorValidate.id,
    nameKr: authorValidate.nameKr,
    nameEn: authorValidate.nameEn,
    nameCn: authorValidate.nameCn,
    born: authorValidate.yearBirth,
    dead: authorValidate.yearDeath,
    aliasKr: authorValidate.aliasKr,
    aliasEn: authorValidate.aliasEn,
    externalLink: authorValidate.externalLink,
    reference: authorValidate.reference,
    exhibition: authorValidate.exhibition,
    education: authorValidate.education,
    description: authorValidate.description,
    memo: authorValidate.memo,
    generation: authorValidate.generation,
    artMovmnt: authorValidate.artMovmnt,
    nationality1 : authorValidate.nationality1,
    nationality2 : authorValidate.nationality2
  },
  errorMessage: {
    id: "Wrong field : id",
    nameKr: "Wrong field : Name kor",
    nameCn: "Wrong field : nameCn",
    born: "Wrong field : born",
    dead: "Wrong field : dead",
    aliasKr: "Wrong field : aliasKr",
    aliasEn: "Wrong field : aliasEn",
    externalLink: "Wrong field : externalLink",
    reference: "Wrong field : reference",
    exhibition: "Wrong field : exhibition",
    education: "Wrong field : education",
    description: "Wrong field : description",
    memo: "Wrong field : memo",
    nationality1: "Wrong field : nationality1",
    nationality2: "Wrong field : nationality2"
  },
  additionalProperties: false
}
const editAuthorSchema = ajvInstance.compile(editAuthor)

module.exports = {
  editAuthorSchema,
  createAuthorSchema
}