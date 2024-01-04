const filter_v1 = {
  from: {
    type: "string",
    pattern: "^\\d{4}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$",
    errorMessage: {
      _: "Wrong data in field 'from'!",
    },
  },
  to: {
    type: "string",
    pattern: "^\\d{4}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$",
    errorMessage: {
      _: "Wrong data in field 'to'!",
    },
  },
  date: {
    type: "string",
    pattern:
      "^(\\d{4}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01]))?-(\\d{4}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01]))?$",
    minLength: 10,
    errorMessage: {
      _: "Wrong data in field date!",
    },
  },
  success: {
    type: "string",
    pattern: "^(0|1)(0|1)(0|1)$",
    errorMessage: {
      _: "Wrong data in field success!",
    },
  },
  bid_class: {
    type: "string",
    pattern: "^(0|1)(0|1)(0|1)$",
    errorMessage: {
      _: "Wrong data in field bid_class!",
    },
  },
  pricetp: {
    type: "string",
    enum: ["winning_bid", "selling_price", "estimate_min", "estimate_max"],
    errorMessage: {
      _: "wrong data in field pricetp",
    },
  },
  price: {
    type: "string",
    pattern: "^(\\d+(.\\d+)?)?-(\\d+(.\\d+)?)?$",
    errorMessage: {
      _: "wrong data in field price",
    },
  },
  title_search: {
    type: "string",
    minLength: 1,
    errorMessage: {
      _: "wrong data in field title_search",
    },
  },
  material_search: {
    type: "string",
    minLength: 1,
    errorMessage: {
      _: "wrong data in field material_search",
    },
  },
  artist_search: {
    type: "string",
    minLength: 1,
    errorMessage: {
      _: "wrong data in field artist_search",
    },
  },
  height: {
    type: "string",
    pattern: "^(\\d+(%2E\\d+)?)?-(\\d+(%2E\\d+)?)?$",
    errorMessage: {
      _: "wrong data in field height",
    },
  },
  width: {
    type: "string",
    pattern: "^(\\d+(%2E\\d+)?)?-(\\d+(%2E\\d+)?)?$",
    errorMessage: {
      _: "wrong data in field width",
    },
  },
  mfgDate: {
    type: "string",
    pattern: "^(\\d+(%2E\\d+)?)?-(\\d+(%2E\\d+)?)?$",
    errorMessage: {
      _: "wrong data in field mfgDate",
    },
  },
  onoff: {
    type: "boolean",
    errorMessage: {
      _: "Wrong data in field onoff!",
    },
  },
  certification: {
    type: "boolean",
    errorMessage: {
      _: "Wrong data in field certification!",
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
module.exports =  filter_v1;
