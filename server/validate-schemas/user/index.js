const user = {
  id: {
    type: 'integer',
    minimum: 0,
    errorMessage: {
      _: 'wrong data in field id'
    }
  },
  userId: {
    type: 'integer',
    minimum: 0,
    errorMessage: {
      _: 'wrong data in field userId'
    }
  },
  amount: {
    type: 'integer',
    errorMessage: {
      _: 'wrong data in field amount'
    }
  },
  note: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field note'
    }
  },
  adminNote: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field adminNote'
    }
  },
  active: {
    type: 'boolean',
    errorMessage: {
      _: 'wrong data in field active'
    }
  },
  emailReceive: {
    type: 'boolean',
    errorMessage: {
      _: 'wrong data in field emailReceive'
    }
  },
  smsReceive: {
    type: 'boolean',
    errorMessage: {
      _: 'wrong data in field smsReceive'
    }
  },
  email: {
    type: 'string',
    format: "email",
    errorMessage: {
      _: 'wrong data in field email'
    }
  },
  displayName: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field displayName'
    }
  },
  phoneNumber: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field phoneNumber'
    }
  },
  biZipCode: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field biZipCode'
    }
  },
  biAddress: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field biAddress'
    }
  },
  biAddress2: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field biAddress2'
    }
  },
  biBankName: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field biBankName'
    }
  },
  biBankAccount: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field biBankAccount'
    }
  },
  biBankHolderName: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field biBankHolderName'
    }
  },
  companyBc: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field companyBc'
    }
  },
  companyCEO: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field companyCEO'
    }
  },
  companyZipCode: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field companyZipCode'
    }
  },
  companyAddress: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field companyAddress'
    }
  },
  companyAddress2: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field companyAddress2'
    }
  },
  companyName: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field companyName'
    }
  },
  companyField: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field companyField'
    }
  },
  companyStatus: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field companyStatus'
    }
  },
  companyBlUrl: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field companyBlUrl'
    }
  },
  confirmLeave: {
    type: 'boolean',
    errorMessage: {
      _: 'wrong data in field confirmLeave'
    }
  },
  leaveSearch: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field leave'
    }
  },
  activeSearch: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field active'
    }
  },
  requestLeaveSearch: {
    type: 'string',
    errorMessage: {
      _: 'wrong data in field requestLeave'
    }
  },
  selectedTitles: {
    type: 'array',
    minItems: 1,
    items: {
      type: "string",
      minLength: 1,
    },
    errorMessage: {
      _: 'Wrong data in field selectedTitles!'
    }

  }

}

module.exports =  user
