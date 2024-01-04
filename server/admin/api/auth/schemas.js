const ajvInstance = require('../../../utils/ajv') 
const auth = require('../../../validate-schemas/auth') 

const signUp = {
  type: 'object',
  required: ['userName', 'password', 'email'],
  properties: {
    userName: auth.userName,
    email: auth.email,
    password: auth.password,
    displayName: auth.displayName
  },
  errorMessage: {
    required: {
      userName: 'userName is required!',
      email: 'email is required!',
      password: 'password is required'
    }
  },
  additionalProperties: true
}

const signIn = {
  type: 'object',
  required: ['userName', 'password'],
  properties: {
    userName: auth.userName,
    password: auth.password,
    verifiedAt : auth.verifiedAt
  },
  errorMessage: {
    required: {
      email: 'email is required!',
      password: 'password is required',
      verifiedAt: 'verifiredAt is required'
    }
  },
  additionalProperties: false
}

const changePassword = {
  type: 'object',
  required: ['oldPassword', 'newPassword'],
  properties: {
    oldPassword: auth.password,
    newPassword: auth.password
  },
  errorMessage: {
    required: {
      oldPassword: 'oldPassword is required!',
      newPassword: 'newPassword is required'
    }
  },
  additionalProperties: false
}

const findId = {
  type: 'object',
  required: ['email'],
  properties: {
    email: auth.email,
  },
  errorMessage: {
    required: {
      email: 'email is required!',
    }
  },
  additionalProperties: false
}

const signUpSchema = ajvInstance.compile(signUp)
const signInSchema = ajvInstance.compile(signIn)
const changePasswordSchema = ajvInstance.compile(changePassword)
const findIdSchema = ajvInstance.compile(findId)

module.exports = {
  signUpSchema,
  signInSchema,
  changePasswordSchema,
  findIdSchema
}
