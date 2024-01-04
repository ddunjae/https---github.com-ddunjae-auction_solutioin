const filter = {
  date_from: {
    type: "string",
    pattern: "^\\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$",
    minLength: 10,
    errorMessage: {
      _: "Wrong data in field date_from!",
    },
  },
  date_to: {
    type: "string",
    pattern: "^\\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$",
    minLength: 10,
    errorMessage: {
      _: "Wrong data in field date_to!",
    },
  },
  success: {
    type: "boolean",
    errorMessage: {
      _: "Wrong data in field success!",
    },
  },
  bid_class: {
    type: "array",
    minItems: 1,
    items: {
      type: "string",
      minLength: 1,
    },
    errorMessage: {
      _: "Wrong data in field bid_class!",
    },
  },
  withdraw: {
    type: "boolean",
    errorMessage: {
      _: "Wrong data in field withdraw!",
    },
  },
  company: {
    type: "array",
    minItems: 1,
    items: {
      type: "string",
      minLength: 1,
    },
    errorMessage: {
      _: "Wrong data in field company!",
    },
  },
  company_string: {
    type: "string",
    enum: [
      "케이옥션",
      "서울옥션",
      "라이즈아트옥션",
      "마이아트옥션",
      "아이옥션",
      "아트데이옥션",
      "에이옥션",
      "토탈아트옥션",
    ],
    minLength: 1,
    errorMessage: {
      _: "Wrong data in field 'company'!",
    },
  },
  location: {
    type: "array",
    minItems: 1,
    items: {
      type: "string",
      minLength: 1,
    },
    errorMessage: {
      _: "Wrong data in field company!",
    },
  },
  material_kind: {
    type: "array",
    minItems: 1,
    items: {
      type: "string",
      minLength: 1,
    },
    errorMessage: {
      _: "Wrong data in field company!",
    },
  },
  material_query: {
    type: "string",
    errorMessage: {
      _: "wrong data in field material_query",
    },
  },
  on_off: {
    type: "boolean",
    errorMessage: {
      _: "Wrong data in field on_off!",
    },
  },
  title_query: {
    type: "string",
    errorMessage: {
      _: "wrong data in field title_query",
    },
  },
  artist_query: {
    type: "string",
    errorMessage: {
      _: "wrong data in field artist_query",
    },
  },
  height_min: {
    type: "number",
    errorMessage: {
      _: "wrong data in field height_min",
    },
  },
  height_max: {
    type: "number",
    errorMessage: {
      _: "wrong data in field height_max",
    },
  },
  width_min: {
    type: "number",
    errorMessage: {
      _: "wrong data in field width_min",
    },
  },
  width_max: {
    type: "number",
    errorMessage: {
      _: "wrong data in field width_max",
    },
  },
  price_type: {
    type: "string",
    enum: ["hammer_price", "selling_price", "estimate_min", "estimate_max"],
    errorMessage: {
      _: "wrong data in field price_type",
    },
  },
  price_min: {
    type: "number",
    errorMessage: {
      _: "wrong data in field price_min",
    },
  },
  price_max: {
    type: "number",
    errorMessage: {
      _: "wrong data in field price_max",
    },
  },
  mfg_date_min: {
    type: "number",
    errorMessage: {
      _: "wrong data in field mfg_date_min",
    },
  },
  mfg_date_max: {
    type: "number",
    errorMessage: {
      _: "wrong data in field mfg_date_max",
    },
  },
  certi: {
    type: "boolean",
    errorMessage: {
      _: "Wrong data in field certi!",
    },
  },
  list: {
    type: "number",
    errorMessage: {
      _: "wrong data in field height_min",
    },
  },
  page: {
    type: "number",
    errorMessage: {
      _: "wrong data in field height_min",
    },
  },
  kind_rank: {
    type: "string",
    enum: ["hammer_price", "hammer_rate", "entries"],
    minLength: 1,
    errorMessage: {
      _: "Wrong data in field 'kind'!",
    },
  },
  kind_section: {
    type: "string",
    enum: ["hammer_price", "winning_bid"],
    minLength: 1,
    errorMessage: {
      _: "Wrong data in field 'kind'!",
    },
  },
};
module.exports =  filter;
