const LOGGER = require("../utils/logger");
const Response = require("../utils/Response");
const knex = require("../config/connectDB");
const snakeToCamel = require("../utils/objStyleConverter");
const moment = require('moment');
const { SELL_OR_NOT } = require("../utils/strVar");
const exportSimpleExcel = require("../utils/excelUtils");
const deleteFileUsingPath = require("../utils/fileUtils");
// async function main(req, res, next) {
//   let db_res
//   console.log("datasearch :", req.query);
//   const currentDate = new Date();
//   const cur_y = currentDate.getFullYear().toString();
//   const cur_m = (currentDate.getMonth() + 1).toString();
//   const cur_d = currentDate.getDate().toString();
//   const cur_date = `${cur_y}${cur_m >= 10 ? cur_m : "0" + cur_m}${cur_d >= 10 ? cur_d : "0" + cur_d
//     }`;
//   const date_ =
//     req.query.date != undefined ? req.query.date.split("-") : ["", ""];
//   const to = date_[1];
//   const from = date_[0];
//   if (Object.keys(req.query).length == 0) {
//     let err_info = {
//       result: false,
//       err_desc: "Please enter the search contents",
//       err: 10051,
//     };

//     console.log("res : datasearch :", err_info);
//     res.send(err_info);
//     return;
//   }
//   // incorrect priod of time
//   if (
//     to != "" &&
//     from != "" &&
//     parseInt(to.replace(/-/gi, "")) < parseInt(from.replace(/-/gi, ""))
//   ) {
//     err_info = {
//       result: false,
//       err: 10050,
//       err_desc: "incorrect period of time",
//     };

//     console.log("res : datasearch :", err_info);
//     res.send(err_info);
//     return;
//   }
//   const success = req.query.success == "000" ? "111" : req.query.success;
//   const bid_class = req.query.bid_class == "000" ? "111" : req.query.bid_class;
//   const pricetp =
//     req.query.pricetp != undefined && req.query.pricetp == "winning_bid"
//       ? req.query.pricetp
//       : "hammer_price";
//   const price =
//     req.query.price != undefined ? req.query.price.split("-") : ["", ""];
//   const mfgDate =
//     req.query.mfgDate != undefined ? req.query.mfgDate.split("-") : ["", ""];
//   const height =
//     req.query.height != undefined ? req.query.height.split("-") : ["", ""];
//   const width =
//     req.query.width != undefined ? req.query.width.split("-") : ["", ""];
//   const onoff = +req.query.onoff;
//   const certification = +req.query.certi;
//   const auc =
//     typeof req.query.auc == "string" ? [req.query.auc] : req.query.auc;
//   const location =
//     typeof req.query.location == "string"
//       ? [req.query.location]
//       : req.query.location;
//   const material =
//     typeof req.query.material == "string"
//       ? [req.query.material]
//       : req.query.material;
//   const material_search = req.query.material_search;
//   const title_search =
//     req.query.title_search != undefined ? req.query.title_search : undefined;
//   const artist_search =
//     req.query.artist_search != undefined ? req.query.artist_search : undefined;
//   const orderby =
//     req.query.orderby != undefined
//       ? req.query.orderby.split("-")
//       : ["transact_date", "desc"];
//   const page = +req.query.page || 1;
//   let list = +req.query.size || 20;
//   var db_cnt = 0;

//   const from_query =
//     "(select * , case when artist_kor is null and artist_eng is null then null else concat_ws('-',artist_kor,artist_eng) end as artist,\
//                         case when title_kor is null and title_eng is null then null else concat_ws('-',title_kor, title_eng) end as title,\
//                         case when material_kor is null and material_eng is null then null else concat_ws('-',material_kor, material_eng) end as material,\
//                         concat_ws('×',height,width,depth) as size, (case when height is null then 1 else height end)*(case when width is null then 1 else width end)*(case when depth is null then 1 else depth end) as size_cm3\
//                         from crawling) as a";
//   let where_query = "";

//   if (date_[1] != "") {
//     where_query += "transact_date <= str_to_date('" + date_[1] + "','%Y%m%d')";
//   } else {
//     where_query += "transact_date <= str_to_date('" + cur_date + "','%Y%m%d')";
//   }
//   if (date_[0] != "") {
//     where_query +=
//       " and transact_date >= str_to_date('" + date_[0] + "','%Y%m%d')";
//   }
//   if (success != undefined) {
//     check = true;
//     for (var i = 0; i <= success.length; i++) {
//       if (success[i] == "1") {
//         if (check) {
//           where_query += " and (";
//           check = false;
//         } else {
//           where_query += " or";
//         }
//         if (i == 0) {
//           where_query += " (hammer_price is not null)";
//         } else if (i == 1) {
//           where_query += " (hammer_price is null and bid_class != 'w/d')";
//         } else if (i == 2) {
//           where_query += " (bid_class  = 'w/d')";
//         }
//       }
//     }
//     where_query += ")";
//   }
//   if (bid_class != undefined) {
//     check = true;
//     for (var i = 0; i <= bid_class.length; i++) {
//       if (bid_class[i] == "1") {
//         if (check) {
//           where_query += " and (";
//           check = false;
//         } else {
//           where_query += " or";
//         }
//         if (i == 0) {
//           where_query += " (estimate_max < hammer_price)";
//         } else if (i == 1) {
//           where_query +=
//             " (estimate_min <= hammer_price and estimate_max >= hammer_price)";
//         } else if (i == 2) {
//           where_query += " (estimate_min > hammer_price)";
//         }
//       }
//     }
//     where_query += ")";
//   }
//   if (onoff != undefined && onoff != 11) {
//     if (onoff == 1) {
//       where_query += " and on_off = 'online'";
//     } else if (onoff == 0) {
//       where_query += " and on_off = 'offline'";
//     }
//   }
//   if (certification != undefined && certification != 11) {
//     if (certification == 1) {
//       where_query += " and certification is not null";
//     } else if (certification == 0) {
//       where_query += " and certification is null";
//     }
//   }

//   if (price[0] != "") {
//     where_query += " and " + pricetp + " >=" + price[0];
//   }
//   if (price[1] != "") {
//     where_query += " and " + pricetp + " <=" + price[1];
//   }
//   // mfg_date 데이터 정리 필요....ㅜㅜ
//   if (mfgDate[0] != "") {
//     where_query += " and left(mfg_date, 4) >= " + mfgDate[0];
//   }
//   if (mfgDate[1] != "") {
//     where_query += " and left(mfg_date, 4) <= " + mfgDate[1];
//   }
//   if (height[0] != "") {
//     where_query += " and height >= " + height[0].replace("%2E", ".");
//   }
//   if (height[1] != "") {
//     where_query += " and height <= " + height[1].replace("%2E", ".");
//   }
//   if (width[0] != "") {
//     where_query += " and width >= " + width[0].replace("%2E", ".");
//   }
//   if (width[1] != "") {
//     where_query += " and width <= " + width[1].replace("%2E", ".");
//   }
//   if (artist_search != undefined) {
//     where_query +=
//       " and lower(concat_ws('-',artist_kor, artist_eng)) like '%" +
//       artist_search +
//       "%'";
//   }
//   if (title_search != undefined) {
//     where_query +=
//       " and lower(concat_ws('-',title_kor, title_eng)) like '%" +
//       title_search +
//       "%'";
//   }

//   let temp = await knex
//     .count("*", { as: "cnt" })
//     .count("hammer_price", { as: "winning_lot" })
//     .sum("hammer_price", { as: "total_bid" })
//     .fromRaw(from_query)
//     .whereRaw(where_query)
//     .where(function () {
//       if (material) {
//         this.where(function () {
//           if (material_search) {
//             this.whereIn("material_kind", material).orWhere(
//               knex.raw(
//                 `lower(concat_ws('-',material_kor, material_eng)) like '%${material_search.toLowerCase()}%'`
//               )
//             );
//           } else {
//             this.whereIn("material_kind", material);
//           }
//         });
//       } else if (material_search) {
//         this.where(
//           knex.raw(
//             `lower(concat_ws('-',material_kor, material_eng)) like '%${material_search.toLowerCase()}%'`
//           )
//         );
//       }
//       if (auc != undefined) {
//         this.whereIn("source", auc);
//       }
//       if (location != undefined) {
//         this.whereIn("location", location);
//       }
//     });

//   db_cnt = temp[0].cnt;
//   if (db_cnt == 0) {
//     err_info = {
//       result: false,
//       err: 10053,
//       err_desc: "No search results",
//     };

//     console.log("res : datasearch :", err_info);
//     res.send(err_info);
//   } else {
//     let summary = {
//       total_bid: temp[0].total_bid,
//       total_lot: temp[0].cnt,
//       hammer_rate: temp[0].cnt / temp[0].winning_lot,
//     };

//     if (list == 1000) {
//       db_res = await knex
//         .select("*")
//         .fromRaw(from_query)
//         .whereRaw(where_query)
//         .where(function () {
//           if (material) {
//             this.where(function () {
//               if (material_search) {
//                 this.whereIn("material_kind", material).orWhere(
//                   knex.raw(
//                     `lower(concat_ws('-',material_kor, material_eng)) like '%${material_search.toLowerCase()}%'`
//                   )
//                 );
//               } else {
//                 this.whereIn("material_kind", material);
//               }
//             });
//           } else if (material_search) {
//             this.where(
//               knex.raw(
//                 `lower(concat_ws('-',material_kor, material_eng)) like '%${material_search.toLowerCase()}%'`
//               )
//             );
//           }
//           if (auc != undefined) {
//             this.whereIn("source", auc);
//           }
//           if (location != undefined) {
//             this.whereIn("location", location);
//           }
//         })
//         .orderBy(
//           `${orderby[0] == "size" ? "size_cm3" : orderby[0]}`,
//           "asc",
//           "last"
//         )
//         .orderBy(
//           `${orderby[0] == "size" ? "size_cm3" : orderby[0]}`,
//           orderby[1]
//         )
//         .orderBy("transact_date", "desc")
//         .orderBy("transact_date", "desc");
//     } else {
//       db_res = await knex
//         .select(
//           "*",
//           knex.raw(
//             "(case when bid_class = 'w/d' then 1 else null end) as cancel"
//           )
//         )
//         .fromRaw(from_query)
//         .whereRaw(where_query)
//         .where(function () {
//           if (material) {
//             this.where(function () {
//               if (material_search) {
//                 this.whereIn("material_kind", material).orWhere(
//                   knex.raw(
//                     `lower(concat_ws('-',material_kor, material_eng)) like '%${material_search.toLowerCase()}%'`
//                   )
//                 );
//               } else {
//                 this.whereIn("material_kind", material);
//               }
//             });
//           } else if (material_search) {
//             this.where(
//               knex.raw(
//                 `lower(concat_ws('-',material_kor, material_eng)) like '%${material_search.toLowerCase()}%'`
//               )
//             );
//           }
//           if (auc != undefined) {
//             this.whereIn("source", auc);
//           }
//           if (location != undefined) {
//             this.whereIn("location", location);
//           }
//         })
//         .orderBy(
//           `${orderby[0] == "size" ? "size_cm3" : orderby[0]}`,
//           "asc",
//           "last"
//         )
//         .orderBy(
//           `${orderby[0] == "size" ? "size_cm3" : orderby[0]}`,
//           orderby[1]
//         )
//         .orderBy("transact_date", "desc")
//         .limit(list)
//         .offset((page - 1) * list);
//     }

//     let resp = [];
//     for (var i = 0; i < db_res.length; i++) {
//       temp = db_res[i];
//       resp.push({
//         no: list * (page - 1) + i + 1,
//         img_url: temp.img,
//         artist: (
//           `${temp.artist_kor == null ? "" : " - " + temp.artist_kor}` +
//           `${temp.artist_eng == null || temp.artist_eng == temp.artist_kor
//             ? ""
//             : " - " + temp.artist_eng
//           }`
//         ).substr(3),
//         title: (
//           `${temp.title_kor == null ? "" : " - " + temp.title_kor}` +
//           `${temp.title_eng == null || temp.title_eng == temp.title_kor
//             ? ""
//             : " - " + temp.title_eng
//           }`
//         ).substr(3),
//         mfg_date: temp.mfg_date,
//         certification: temp.certification,
//         size: temp.size,
//         material_kind: temp.material_kind,
//         material: (
//           `${temp.material_kor == null ? "" : " - " + temp.material_kor}` +
//           `${temp.material_eng == null || temp.material_eng == temp.material_kor
//             ? ""
//             : " - " + temp.material_eng
//           }`
//         ).substr(3),
//         signed: temp.signed,
//         source: temp.source,
//         auction_name: temp.auction_name,
//         on_off: temp.on_off,
//         transact_y: temp.transact_date.getFullYear(),
//         transact_m: temp.transact_date.getMonth(),
//         transact_d: temp.transact_date.getDate(),
//         winning_bid: temp.hammer_price,
//         selling_price: temp.selling_price,
//         start_bid: temp.start_price,
//         estimate_min: temp.estimate_min,
//         estimate_max: temp.estimate_max,
//         competition: temp.competition,
//         cancel: temp.cancel,
//       });
//     }

//     res.send({
//       result: true,
//       msg: "데이터 검색",
//       summary: summary,
//       resp: resp,
//       page: {
//         totalPage: Math.ceil(db_cnt / list),
//         totalElement: db_cnt,
//         hasNext: Math.ceil(db_cnt / list) > page,
//         hasPrev: page != 1,
//         currentPage: page,
//         size: db_res.length,
//       },
//     });
//   }
// }

async function dataSearch(req, res, next) {
  try {
    let {
      page,
      size,
      auctionName,
      sizeTable = [],
      sellOrNot = [],
      price = [],
      pricetp,
      material = [],
      materialSearch,
      transactDate = [],
      mfgDate = [],
      title,
      height = [],
      width = [],
      company = [],
      bidClass = [],
      onOff,
      certification,
      location = [],
      mainColor = [],
      locationSearch,
      mainColorSearch,
      querySearch,
      method = [],
      series = [],
      preference = [],
      order,
      field,
      auc
    } = req.body;
    page = page || 1;
    size = size || 20;
    order = order || "desc"
    const connection = knex('crawling');
    let queryDb = connection.where({ is_deleted: false })
    if (locationSearch) {
      location = [...location, locationSearch]
    }
    if (mainColorSearch) {
      mainColor.push(...mainColorSearch.split(","))
    }

    const where_fn = function () {
      //Source
      if (auc != undefined) {
        this.whereIn("source", auc);
      }
      // Auction Name
      if (auctionName) {
        this.where(build =>
          build.whereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `)
            .orWhereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `))
      }
      // size Table
      if (sizeTable.length !== 0) {
        this.where(build =>
          build.whereBetween(`crawling.size_table`, [sizeTable[0] === 0 ? 0 : sizeTable[0], sizeTable[1] === 0 ? 9999 : sizeTable[1]]))
      }
      //Sell or not
      if (sellOrNot.length !== 0) {
        if (sellOrNot.length === 1) {
          if (sellOrNot.includes(SELL_OR_NOT.SOLD)) {
            this.where(build =>
              build.whereRaw(`crawling.hammer_price != 0`).andWhereRaw(`crawling.bid_class != 'w/d'`))
          }
          if (sellOrNot.includes(SELL_OR_NOT.NOTSOLD)) {
            this.where(build =>
              build.whereRaw(`crawling.hammer_price = 0`).andWhereRaw(`crawling.bid_class != 'w/d'`))
          }
          if (sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            this.where(build =>
              build.whereRaw(`crawling.bid_class = 'w/d'`))
          }
        } else if (sellOrNot.length === 2) {
          if (sellOrNot.includes(SELL_OR_NOT.SOLD) && sellOrNot.includes(SELL_OR_NOT.NOTSOLD)) {
            this.where(build =>
              build.whereRaw(`crawling.bid_class != 'w/d'`)
            )
          } else if (sellOrNot.includes(SELL_OR_NOT.SOLD) && sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            this.where(build =>
              build.whereRaw(`crawling.hammer_price != 0`).orWhereRaw(`crawling.bid_class  =  'w/d'`)
            )
          } else if (sellOrNot.includes(SELL_OR_NOT.NOTSOLD) && sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            this.where(build =>
              build.whereRaw(`crawling.hammer_price = 0`).orWhereRaw(`crawling.bid_class  =  'w/d'`)
            )
          }
        }

      }
      //Price
      if (pricetp) {
        if (price.length !== 0) {
          this.where(build =>
            build.whereNotNull(`crawling.${pricetp}`)
              .andWhereBetween(`crawling.${pricetp}`, [price[0] === 0 ? 0 : price[0], price[1] === 0 ? 99999999999999 : price[1]]))
        }
      }
      //Author
      if (querySearch) {
        this.where(build =>
          build.whereRaw(`crawling.artist_kor like '${querySearch.trim().toLowerCase()}'`)
            .orWhereRaw(`crawling.artist_eng like '${querySearch.trim().toLowerCase()}'`)
            .orWhereRaw(`crawling.identical_records = '${Number(querySearch)}'`)
          // .orWhereRaw(`LOWER(crawling.title_kor) like '%${querySearch.trim().toLowerCase()}%'`)
          // .orWhereRaw(`LOWER(crawling.title_eng) like '%${querySearch.trim().toLowerCase()}%'`)
        )
      };
      // material Kind
      if (material.length !== 0) {
        this.where(build =>
          build.whereIn('crawling.material_kind', material))
      }
      if (materialSearch) {
        this.where(build =>
          build.whereRaw(`LOWER(crawling.material_kor) like '%${materialSearch.trim().toLowerCase()}%'`)
            .orWhereRaw(`LOWER(crawling.material_eng)  like '%${materialSearch.trim().toLowerCase()}%'`))
      };
      // /transactDate
      if (transactDate.length !== 0) {
        this.where(build =>
          build.whereBetween(`crawling.transact_date`, [transactDate[0] === "" ? moment(new Date('0000-01-01')).format('YYYY-MM-DD[T]HH:mm:ss[Z]') : moment(transactDate[0]).format('YYYY-MM-DD[T]HH:mm:ss[Z]'), transactDate[1] == "" ? moment(new Date('9999-01-01')).format('YYYY-MM-DD[T]HH:mm:ss[Z]') : moment(transactDate[1]).format('YYYY-MM-DD[T]HH:mm:ss[Z]')]))
      }
      // mfgDate
      if (mfgDate.length !== 0) {
        this.where(build =>
          build.whereBetween('crawling.mfg_date', [mfgDate[0] === "" ? "0000" : mfgDate[0], mfgDate[1] === "" ? "9999" : mfgDate[1]]))
      }
      // Title
      if (title) {
        this.where(build =>
          build.whereRaw(`LOWER(crawling.title_kor) like '%${title.trim().toLowerCase()}%' `)
            .orWhereRaw(`LOWER(crawling.title_eng) like '%${title.trim().toLowerCase()}%' `))
      }
      // Heght
      if (height.length !== 0) {
        this.where(build =>
          build.whereBetween('crawling.height', [height[0] == 0 ? 0 : height[0], height[1] == 0 ? 99999999 : height[1]]))
      }
      // Width
      if (width.length !== 0) {
        this.where(build =>
          build.whereBetween('crawling.width', [width[0] == 0 ? 0 : width[0], width[1] == 0 ? 99999999 : width[1]]))
      }
      // Company
      if (company.length !== 0) {
        this.where(build =>
          build.whereIn('crawling.company', company))
      }
      // location
      if (location.length !== 0) {
        this.where(build =>
          build.whereIn('crawling.location', location))
      }
      // bid Class
      if (bidClass.length !== 0) {
        this.whereIn('crawling.bid_class', bidClass)
      }
      // on Off
      if (onOff) {
        this.where(build =>
          build.whereRaw(`LOWER(crawling.on_off) = '${onOff.trim().toLowerCase()}'`))
      }

      // certification
      if (certification == "0") {
        this.where(build =>
          build.where(`crawling.certification`, '=', ''))
      } else if (certification == "1") {
        this.where(build =>
          build.where(`crawling.certification`, '!=', ''))
      }
      //Main color
      if (mainColor.length !== 0) {
        this.where(build =>
          build.whereIn('crawling.main_color', mainColor))
      }
      //Method
      if (method.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.method', method))
      }
      //Series
      if (series.length !== 0) {
        this.where(build =>
          build.whereIn('crawling.series', series))
      }
      //preference
    
      if (preference.length !== 0) {
        this.where(build =>
          build.whereIn('crawling.preference', preference))
      }
    }
  
    const totalElement = await (queryDb.clone().count('crawling.id as count').where(where_fn).first());
    if (Math.ceil(totalElement / size) < page) {
      return Response.SUCCESS("ok", []);
    }
    // console.log(bidClass,'bidClass');
    let results
    // console.log(field);
    if (field == 'material_kind' ||
      field == 'transact_date' ||
      field == 'lot' ||
      field == 'mfg_date' ||
      field == 'height' ||
      field == 'width' ||
      field == 'depth' ||
      field == 'size_table' ||
      field == 'hammer_price' ||
      field == 'estimate_min' ||
      field == 'estimate_max'
    ) {
      results = await queryDb.select().where(where_fn).orderBy(`${field}`, `${order}`).limit(size).offset((page - 1) * size);
    } else if (field == 'artist_kor') {
      results = await queryDb.select()
        .orderBy(knex.raw("(case when artist_kor is null or artist_kor = '' then artist_eng\
        when artist_eng is null or artist_eng = '' then artist_kor\
        else concat_ws('-', artist_kor, artist_eng) end )\
        COLLATE utf8mb4_unicode_520_ci"), `${order}`).where(where_fn).limit(size).offset((page - 1) * size);
    } else if (field == 'title_kor') {

      results = await queryDb.select()
        .orderBy(knex.raw("(case when title_kor is null or title_kor = '' then title_eng\
        when title_eng is null or title_eng = '' then title_kor\
        else concat_ws('-', title_kor, title_eng) end )\
        COLLATE utf8mb4_unicode_520_ci"), `${order}`).where(where_fn).limit(size).offset((page - 1) * size);
    } else if (field == 'material_kor') {

      results = await queryDb.select()
        .orderBy(knex.raw("(case when material_kor is null or material_kor = '' then material_eng\
        when material_eng is null or material_eng = '' then material_kor\
        else concat_ws('-', material_kor, material_eng) end )\
        COLLATE utf8mb4_unicode_520_ci"), `${order}`).where(where_fn).limit(size).offset((page - 1) * size);
    } else if (field == 'company') {
      results = await queryDb.select().orderBy(knex.raw("" +
        field +
        " COLLATE utf8mb4_unicode_520_ci"), `${order}`).where(where_fn).limit(size).offset((page - 1) * size);
    } else {
      results = await queryDb.select().where(where_fn).orderBy('id', 'desc').limit(size).offset((page - 1) * size);
    }


    let temp = await knex
      .select(knex.raw("count(*) as cnt, count(hammer_price) as winning_lot, count(lot) as total_lot, sum(hammer_price) as total_bid, Sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw"))
      .from("crawling")
      .where(where_fn)
      console.log(knex
        .select(knex.raw("count(*) as cnt, count(hammer_price) as winning_lot, count(lot) as total_lot, sum(hammer_price) as total_bid, Sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw"))
        .from("crawling")
        .where(where_fn).toQuery());
    let usd = await knex.select("to_usd.krw").from('to_usd').orderBy("date", "desc")
    const resultsCamel = results.map(item => snakeToCamel(item));
    let summary = {
      usd: +temp[0].total_bid * usd[0].krw,
      total_bid: +temp[0].total_bid,
      total_lot: +temp[0].total_lot - Number(temp[0].with_draw),
      wining_lot: +temp[0].winning_lot,
      hammer_rate: +temp[0].cnt / +temp[0].winning_lot,
    };
    return res.send({
      result: true,
      msg: "ok",
      summary: summary,
      page: { totalElement: totalElement.count, page: page, size: size, totalPage: Math.ceil(totalElement.count / size), },
      resp: resultsCamel
    });
  } catch (error) {
    LOGGER.APP.error(error.stack)
    return Response.ERROR(500, error.message, "Sv_500")
  }
}

async function exportExcel(req, res) {
  const connection = knex('crawling')
  try {
    let { records = [],
      auctionName,
      sizeTable = [],
      price = [],
      pricetp,
      material = [],
      materialSearch,
      transactDate = [],
      mfgDate = [],
      title,
      height = [],
      width = [],
      company = [],
      bidClass = [],
      onOff,
      certification,
      location = [],
      locationSearch,
      mainColor = [],
      mainColorSearch,
      querySearch,
      order,
      field,
      auc } = req.body;

    // if (locationSearch) {
    //   location = location.push(locationSearch)
    // }
    // if (mainColorSearch) {
    //   mainColor.push(...mainColorSearch.split(","))
    // }
    if (records.length < 1) {
      return Response.WARN(404, 'No record selected', 'auc_004')
    }

    // let dataCurrency = await connection2.select('*').clone().where({ is_deleted: false }).orderBy('to_usd.date', 'desc').first();
    // if (!dataCurrency) {
    //   return Response.WARN(404, 'CurendataCurrency not found', 'auc_005')
    // }
    let count = 1
    const results = await connection
      .select('*')
      .clone()
      .where({ is_deleted: false })
      .whereIn('crawling.id', records)
      .orderBy('crawling.created_at', 'desc')
    if (!results) {
      return Response.WARN(404, 'Data Auction not found', 'auc_006')
    }
    let usd = await knex.select("to_usd.krw").from('to_usd').orderBy("date", "desc")
    const titlesEng = [
      '#',
      'ID',
      'Company',
      'Auction Name',
      'onOff',
      'Location',
      'Transact Date',
      'Lot.No',
      'Image',
      'Artist Id',
      'Artist Kor',
      'Artist Eng',
      'Artist Birth',
      'Artist Death',
      'Title Kor',
      'Title Eng',
      'MfgDate',
      'Height',
      'Width',
      'Depth',
      'Size Table',
      'Material Kind',
      'MaterialKor',
      'MaterialEng',
      'Signed',
      'Exhibited',
      'Provenance',
      'Literature',
      'Catalogue',
      'Frame',
      'Certification',
      'Codition Report',
      'Description',
      'Currency',
      'Start Price',
      'Hammer Price',
      'Selling Price',
      'Estimate Min',
      'Estimate Max',
      'UsdStart Price',
      'UsdHammer Price',
      'UsdSelling Price',
      'UsdEstimate Min',
      'UsdEstimate Max',
      'Competiton',
      'Bid Class',
      'Method',
      'Series',
      'Main Color',
      'Preference',
      'Historical Category',
      'Identical Records',
      'Is Deleted',
      'Updated At',
      'Created At',
      'Source'
    ]
    // const titlesKor = [
    //   '#',
    //   'ID',
    //   '거래일',
    //   '출품처',
    //   '작가명',
    //   'onOff',
    //   'Location',
    //   '작가생 Id',
    //   '작가생 Kor',
    //   '작가생 Eng',
    //   '작가생 Birth',
    //   '작가생 Death',
    //   'Lot.No',
    //   '이미지',
    //   '작품명 Kor',
    //   '작품명 Eng',
    //   '제작년도',
    //   '세로',
    //   '가로',
    //   '깊이',
    //   '재료별',
    //   '재료명 Kor',
    //   '재료명 Eng',
    //   '호수',
    //   'Signed',
    //   'Exhibited',
    //   'Provenance',
    //   'Literature',
    //   'Catalogue',
    //   'Frame',
    //   'Certification',
    //   'Codition Report',
    //   'Description',
    //   'Currency',
    //   'Start Price',
    //   '낙찰가',
    //   'Selling Price',
    //   '낮은추정가',
    //   '높은추정가',
    //   'Exchange Rate',
    //   'UsdStart Price',
    //   'Usd낙찰가',
    //   'UsdSelling Price',
    //   'Usd낮은추정가',
    //   'Usd높은추정가',
    //   'Bid Class',
    //   'Competiton',
    //   'Method',
    //   'Series',
    //   'Main Color',
    //   'Preference',
    //   'Identical Records'
    // ]
    // console.log(typeof auctionName == 'undefined');
    // let sortFilter = [
    //   "Auction Name: " + `${typeof auctionName == 'undefined' ? '' : auctionName }` ,
    //   "Size Table: " +  `${typeof sizeTable[1] == 'undefined' ? '' : sizeTable[1] }`+ '-' + `${typeof sizeTable[2] == 'undefined' ? '' : sizeTable[2] }` ,
    //   "Currency: " + "PriceTp: " +  `${typeof pricetp == 'undefined' ? '' : pricetp }` +  "Price: " +  `${typeof price[0] == 'undefined' ? '' : price[0] }` + '-' +  `${typeof price[1] == 'undefined' ? '' : price[1] }`,
    //   "Material: " +  `${typeof material == 'undefined' ? '' : material }` ,
    //   "Material Search: " +  `${typeof materialSearch == 'undefined' ? '' : materialSearch }`,
    //   "Transact Date: " +   `${typeof transactDate[0] == 'undefined' ? '' : transactDate[0] }` + '-->' +  `${typeof transactDate[1] == 'undefined' ? '' : transactDate[1] }`,
    //   "mfgDate: " +  `${typeof mfgDate[0] == 'undefined' ? '' : mfgDate[0] }`+ '-->' + `${typeof mfgDate[1]  == 'undefined' ? '' : mfgDate[1]  }`,
    //   "Title_Kor_Eng: " +  `${typeof title == 'undefined' ? '' : title }`,
    //   "Height: " +  `${typeof height[0]  == 'undefined' ? '' : height[0]  }`+ '-->' +  `${typeof height[1] == 'undefined' ? '' : height[1] }`,
    //   "Width: " +  `${typeof width[0] == 'undefined' ? '' : width[0] }` + '-->' +  `${typeof width[1] == 'undefined' ? '' : width[1] }`,
    //   "Company: " +  `${typeof company == 'undefined' ? '' : company }`,
    //   "BidClass: " +  `${typeof bidClass == 'undefined' ? '' : bidClass }`,
    //   "On-Off: " +  `${typeof onOff == 'undefined' ? '' : onOff }`,
    //   "Certification" +  `${typeof certification == 'undefined' ? '' : certification }`,
    //   "Location : " +  `${typeof location == 'undefined' ? '' : location }`,
    //   "QuerySearch: " +  `${typeof querySearch == 'undefined' ? '' : querySearch }`,
    //   "Sort: " + "Field: " +  `${typeof field == 'undefined' ? '' : field }` +  " Order: " +  `${typeof order == 'undefined' ? '' : order }`
    // ]
    const dataExport = results.map((e) => [
      count++,
      e.id,
      e.company,
      e.auction_name,
      e.on_off,
      e.location,
      e.transact_date,
      e.lot,
      e.img,
      e.artist_id,
      e.artist_kor,
      e.artist_eng,
      e.artist_birth,
      e.artist_death,
      e.title_kor,
      e.title_eng,
      e.mfg_date,
      e.height,
      e.width,
      e.depth,
      e.size_table,
      e.material_kind,
      e.material_kor,
      e.material_eng,
      e.signed,
      e.exhibited,
      e.provenance,
      e.literature,
      e.catalogue,
      e.frame,
      e.certification,
      e.codition_report,
      e.description,
      e.currency,
      Number(e.start_price).toLocaleString("en-US"),
      Number(e.hammer_price).toLocaleString("en-US"),
      Number(e.selling_price).toLocaleString("en-US"),
      Number(e.estimate_min).toLocaleString("en-US"),
      Number(e.estimate_max).toLocaleString("en-US"),
      e.usd_start_price = (e.start_price * usd[0].krw).toLocaleString("en-US"),
      e.usd_hammer_price = (e.hammer_price * usd[0].krw).toLocaleString("en-US"),
      e.usd_selling_price = (e.selling_price * usd[0].krw).toLocaleString("en-US"),
      e.usd_estimate_min = (e.estimate_min * usd[0].krw).toLocaleString("en-US"),
      e.usd_estimate_max = (e.estimate_max * usd[0].krw).toLocaleString("en-US"),
      e.competition,
      e.bid_class,
      e.method,
      e.series,
      e.main_color,
      e.preference,
      e.historical_category,
      e.identical_records,
      e.is_deleted,
      e.updated_at,
      e.created_at,
      e.source
    ])
    const dataSave = {
      fileName: 'List_of_Auction',
      data: dataExport,
      // fillterSort : sortFilter,
      colsTitle: titlesEng,
      // colsTitle2 : titlesKor
    }
    let download = exportSimpleExcel(dataSave);
    return res.download(download.data.filePath, (err) => {
      if (err) {
        LOGGER.APP.error(err);
        return;
      }
      deleteFileUsingPath(download.data.filePath);
    });

  } catch (error) {
    LOGGER.APP.error(error.stack)
    return res.send(error.message, 500)
  }
}

module.exports = { dataSearch, exportExcel };
