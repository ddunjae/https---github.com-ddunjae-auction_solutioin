const auth = {
    id: {
      type: 'integer',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field id'
      }
    },
    userName: {
      type: 'string',
      minLength: 1,
      errorMessage: {
        _: 'wrong data in field userName'
      }
    },
    email: {
      type: 'string',
      errorMessage: {
        _: 'wrong data in field email'
      }
    },
    password: {
      type: 'string',
      errorMessage: {
        _: 'wrong data in field password'
      }
    },
    verifiedAt: {
      type: 'string',
      errorMessage: {
        _: 'wrong data in field verifiedAt'
      }
    },
    displayName: {
      type: 'string',
      errorMessage: {
        _: 'wrong data in field displayName'
      }
    },
    userName2: {
      type: 'string',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field userName2'
      }
    },
    password2: {
      type: 'string',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field password2'
      }
    }
  }
  
  module.exports =  auth
  