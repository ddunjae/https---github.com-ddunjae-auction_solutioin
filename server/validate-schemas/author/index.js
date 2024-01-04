const authorValidate = {
    id: {
        type: 'integer',
        minimum: 1,
        errorMessage: {
            _: 'Wrong data type in field borrowerId!'
        }
    },
    nameKr: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field nameKr!'
        }
    },
    nameEn: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field nameEn!'
        }
    },
    nameCn: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field nameCn!'
        }
    },
    yearBirth: {
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field yearBirth!'
        }
    },
    yearDeath: {
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field yearBirth!'
        }
    },
    aliasKr: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field aliasKr!'
        }
    },
    aliasEn: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field aliasEn!'
        }
    },
    externalLink: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field externalLink!'
        }
    },
    reference: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field reference!'
        }
    },
    exhibition: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field exhibition!'
        }
    },
    education: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field education!'
        }
    },
    description: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field description!'
        }
    },
    memo: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field memo!'
        }
    },
    generation: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field generation!'
        }
    },
    artMovmnt: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field artMovmnt!'
        }
    },
    consonant: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field consonant!'
        }
    },
    nationality1: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field nationality1!'
        }
    },
    nationality2: {
        
        type: 'string',
        errorMessage: {
            _: 'Wrong data type in field nationality2!'
        }
    },
}

module.exports = authorValidate