const toUSDValidate = {
    id: {
        type: 'integer',
        minimum: 1,
        errorMessage: {
            _: 'Wrong data type in field borrowerId!'
        }
    },
    date: {
        minLength: 1,
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field date!'
        }
    },
    krw: {
        type: 'number',
        errorMessage: {
            _: 'Wrong data type in field krw!'
        }
    },
    gdp: {
        type: 'number',
        errorMessage: {
            _: 'Wrong data type in field gdp!'
        }
    },
    eur: {
        type: 'number',
        errorMessage: {
            _: 'Wrong data type in field eur!'
        }
    },
    cnh: {
        type: 'number',
        errorMessage: {
            _: 'Wrong data type in field cnh!'
        }
    },
    hkd: {
        type: 'number',
        errorMessage: {
            _: 'Wrong data type in field hkd!'
        }
    },
    sgd: {
        type: 'number',
        errorMessage: {
            _: 'Wrong data type in field sgd!'
        }
    },
    chf: {
        type: 'number',
        errorMessage: {
            _: 'Wrong data type in field chf!'
        }
    }


}

module.exports =  toUSDValidate