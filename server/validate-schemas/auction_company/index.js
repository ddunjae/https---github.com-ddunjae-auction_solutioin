const companyValidate = {
    id: {
        type: 'integer',
        minimum: 1,
        errorMessage: {
            _: 'Wrong data type in field borrowerId!'
        }
    },
    company: {
        minLength: 1,
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field company!'
        }
    },
    onlineFeerate: {
        type: 'number',
        minimum: 1,
        errorMessage: {
            _: 'Wrong data type in field onlineFeerate!'
        }
    },
    offlineFeerate: {
        type: 'number',
        minimum: 1,
        errorMessage: {
            _: 'Wrong data type in field offlineFeerate!'
        }
    },
    overseas: {
        type: 'boolean',
        errorMessage: {
            _: 'Wrong data type in field overseas!'
        }
    },
}

module.exports =  companyValidate