const auctionSchema = {
    id: {
      type: 'integer',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field id'
      }
    },
    transactDate: {
      
      minLength: 1,
      type: 'string',
      errorMessage: {
        _: 'wrong data in field transactDate'
      }
    },
    company: {
      minLength: 1,
      type: 'string',
      errorMessage: {
        _: 'wrong data in field Company'
      }
    },
    auctionName: {
      minLength: 1,
      type: 'string',
      errorMessage: {
        _: 'wrong data in field auctionName'
      }
    },
    onOff: {
      minLength: 1,
      type: 'string',
      errorMessage: {
        _: 'wrong data in field onOff'
      }
    },
    location: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field location'
      }
    },
    artistId: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field artistId'
      }
    },
    artistKor: {

      type: 'string',
      errorMessage: {
        _: 'wrong data in field artistKor'
      }
    },
    artistEng: {
      type: 'string',
      errorMessage: {
        _: 'wrong data in field artistEng'
      }
    },
    artistBirth: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field artistBirth'
      }
    },
    artistDeath: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field artistDeath'
      }
    },
    lot: {
      type: 'string',
      errorMessage: {
        _: 'wrong data in field lot'
      }
    },
    img: {
      type: 'array',
      items: {type: "object"},
      maxItems: 5,
      errorMessage: {
        _: 'Wrong data type in field img!'
      }
    },
    titleKor: {
     
      type: 'string',
      errorMessage: {
        _: 'wrong data in field titleKor'
      }
    },
    titleEng: {
    
      type: 'string',
      errorMessage: {
        _: 'wrong data in field titleEng'
      }
    },
    mfgDate: {
     
      type: 'string',
      errorMessage: {
        _: 'wrong data in field mfgDate'
      }
    },
    height: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field height'
      }
    },
    width: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field width'
      }
    },
    depth: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field depth'
      }
    },
    materialKind: {
  
      type: 'string',
      errorMessage: {
        _: 'wrong data in field materialKind'
      }
    },
    materialKor: {
   
      type: 'string',
      errorMessage: {
        _: 'wrong data in field materialKor'
      }
    },
    materialEng: {
   
      type: 'string',
      errorMessage: {
        _: 'wrong data in field materialEng'
      }
    },
    sizeTable: {
      type: 'number',
      errorMessage: {
        _: 'wrong data in field sizeTable'
      }
    },
    signed: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field signed'
      }
    },    
    exhibited: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field exhibited'
      }
    },    
    provenance: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field provenance'
      }
    },    
    literature: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field literature'
      }
    },    
    catalogue: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field catalogue'
      }
    },    
    frame: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field frame'
      }
    },
    certification: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field certification'
      }
    },
    coditionReport: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field coditionReport'
      }
    },
    description: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field description'
      }
    },
    currency: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field currency'
      }
    },
    startPrice: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field startPrice'
      }
    },
    hammerPrice: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field hammerPrice'
      }
    },
    sellingPrice: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field sellingPrice'
      }
    },
    estimateMin: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field estimateMin'
      }
    },
    estimateMax: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field estimateMax'
      }
    },
    usdStartPrice: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field usdStartPrice'
      }
    },
    usdHammerPrice: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field usdHammerPrice'
      }
    },
    usdSellingPrice: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field usdSellingPrice'
      }
    },
    usdEstimateMin: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field usdEstimateMin'
      }
    },
    usdEstimateMax: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field usdEstimateMax'
      }
    },
    competiton: {
      type: 'number',
      minimum: 0,
      errorMessage: {
        _: 'wrong data in field competiton'
      }
    },
    bidClass: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field bidClass'
      }
    },
    method: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field method'
      }
    },
    series: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field series'
      }
    },
    mainColor: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field mainColor'
      }
    },
    preference: {
      
      type: 'string',
      errorMessage: {
        _: 'wrong data in field preference'
      }
    },
    identicalRecords: {
      type: 'array',
      items: {type: "number"},
      maxItems: 99,
      errorMessage: {
        _: 'Wrong data type in field identicalRecords!'
      }
    },
  }

module.exports =   auctionSchema
  