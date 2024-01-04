const exportSimpleExcel = require("../utils/excelUtils");
const deleteFileUsingPath = require("../utils/fileUtils");
const LOGGER = require("../utils/logger");
const snakeToCamel = require("../utils/objStyleConverter");
const Response = require("../utils/Response");
const knex = require("../config/connectDB");
const currentDate = new Date();
const moment = require('moment')


async function topRanker(req, res) {
  try {
    let cur_m = (currentDate.getMonth() + 1).toString();
    let cur_d = currentDate.getDate().toString();
    let {
      company,
      location = [],
      locationSearch,
      materialKind = [],
      artistBirth = [],
      transactDate = [],
      nationality = [],
      nationalitySearch,
      querySearch, // artistKor
      materialSearch,
      mainColor = [],
      mainColorSearch,
      method = [],
      seriesSearch,
      preference = [],
      from,
      to,
      page,
      size,
      order,
      field
    } = req.body;
    page = page || 1;
    size = size || 20;
    if (mainColorSearch) {
      mainColor.push(...mainColorSearch.split(","))
    }
    if (locationSearch) {
      location.push(...locationSearch.split(","))
    }

    if (nationalitySearch) {
      nationality.push(...nationalitySearch.split(","))
    }
    const where_fn = function () {
      // material Kind
      if (materialKind.length !== 0) {
        // materialKind = JSON.parse(materialKind)
        this.where(build => build.whereIn('crawling.material_kind', materialKind))

      }
      //Location
      if (location.length !== 0) {
        // location1 = JSON.parse(location1)
        this.where(build => build.whereIn('crawling.location', location))
      }

      // Birth  
      if (artistBirth.length !== 0) {
        // artistBirth = JSON.parse(artistBirth)

        // console.log(JSON.parse(artistBirth));
        this.where(build => build.whereBetween(`crawling.artist_birth`, [artistBirth[0] === '' ? 0 : artistBirth[0], artistBirth[1] === '' ? 9999 : artistBirth[1]]))
      }

      // Company
      if (company !== undefined) {
        this.where(build => build.whereIn('crawling.company', company))

      }
      // nationality
      if (nationality.length !== 0) {
        this.where(build => build.whereIn('crawling.nationality1', nationality)
          .orWhereIn('crawling.nationality2', nationality))
      }

      //Author
      if (querySearch) {
        this.where(build => build.whereRaw(`LOWER(crawling.artist_eng) like '%${querySearch.trim().toLowerCase()}%'`)
          .orWhereRaw(`LOWER(crawling.artist_kor) like '%${querySearch.trim().toLowerCase()}%'`))
      };
      //materialSearch
      if (materialSearch) {
        this.where(build => build.whereRaw(`LOWER(crawling.material_kor) like '%${materialSearch.trim().toLowerCase()}%'`)
          .orWhereRaw(`LOWER(crawling.material_eng) like '%${materialSearch.trim().toLowerCase()}%'`))
      };
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
      if (seriesSearch) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.series) like '%${seriesSearch.trim().toLowerCase()}%'`))
      }
      //preference
      if (preference.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.preference', preference))
      }
    };

    let results
    if (to < from) {
      results = false;
      err = 10050;
      err_desc = "incorrect period of time";
    } else {

      let cur_y = currentDate.getFullYear().toString();
      let cur_date = `${cur_y}-${cur_m >= 10 ? cur_m : "0" + cur_m}-${cur_d >= 10 ? cur_d : "0" + cur_d
        }`;
      from = transactDate[0] ? transactDate[0].split('-').join('') : '1000' + "0101";
      // from = from || cur_y + "0101";
      to = transactDate[1] ? transactDate[1].split('-').join('') : cur_date.replace(/-/gi, "")

      // to = to || cur_date.replace(/-/gi, "")
      let time = moment(to, "YYYYMMDD").diff(moment(from, "YYYYMMDD"), "years") == 0 ? 1 : moment(to, "YYYYMMDD").diff(moment(from, "YYYYMMDD"), "years")
      let to1 = `${new Date(moment(to).format("YYYY-MM-DD")).getFullYear() - time}${new Date(moment(to).format("YYYY-MM-DD")).getMonth() + 1 >= 10 ? new Date(moment(to).format("YYYY-MM-DD")).getMonth() + 1 : "0" + (new Date(moment(to).format("YYYY-MM-DD")).getMonth() + 1)}${new Date(moment(to).format("YYYY-MM-DD")).getDate() >= 10 ? new Date(moment(to).format("YYYY-MM-DD")).getDate() : "0" + (new Date(moment(to).format("YYYY-MM-DD")).getDate())}`;
      let from1 = `${new Date(moment(from).format("YYYY-MM-DD")).getFullYear() - time}${new Date(moment(from).format("YYYY-MM-DD")).getMonth() + 1 >= 10 ? new Date(moment(from).format("YYYY-MM-DD")).getMonth() + 1 : "0" + (new Date(moment(from).format("YYYY-MM-DD")).getMonth() + 1)}${new Date(moment(from).format("YYYY-MM-DD")).getDate() >= 10 ? new Date(moment(from).format("YYYY-MM-DD")).getDate() : "0" + (new Date(moment(from).format("YYYY-MM-DD")).getDate())}`;
      let usd = await knex.select("to_usd.krw").from('to_usd').orderBy("date", "desc")
      results = await knex
        .select(
          knex.raw(`COUNT(lot) as lot,
        artist.*,
        case when main_color is not null then main_color else null end as main_color,
        artist_kor,artist_eng,artist_birth,artist_death,
        artist_id,
        material_kind,material_kor,material_eng,company,transact_date,location,
        concat_ws('-',artist_kor, artist_eng) as artist,
        SUM(hammer_price) as total_bid,
        COUNT('lot') AS 'total_lot',
        Sum (case when hammer_price is null or hammer_price = 0 then 0 else 1 end) AS 'win_lot',
        Sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw`)
        )
        .leftJoin('artist', 'crawling.artist_id', '=', 'artist.id')
        .from("crawling")
        .where(knex.raw(`(artist_kor is not null or artist_eng is not null)\
        and transact_date <= str_to_date(${to},'%Y%m%d')\
        and transact_date >= str_to_date(${from},'%Y%m%d')`))
        .where(where_fn)
        .groupBy('artist')
        .orderBy('total_bid', 'desc')

      // .fromRaw("(Select artist.nationality1 as nationality1,\
      //           COUNT(lot) as lot,\
      //           main_color,\
      //           artist.nationality2 as nationality2,\
      //           artist_kor,artist_eng,artist_birth,artist_death,artist_id,\
      //           material_kind,material_kor,material_eng,company,transact_date,location,\
      //           concat_ws('-',artist_kor, artist_eng) as artist,\
      //           SUM(hammer_price) as total_bid,\
      //           COUNT(`lot`) AS `total_lot`,\
      //           Sum (case when hammer_price is null or hammer_price = 0 then 0 else 1 end) AS `win_lot`,\
      //           Sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw\
      // from crawling\
      // left join  artist on artist_id = artist.id\
      // where (artist_kor is not null or artist_eng is not null)\
      // and transact_date <= str_to_date('" +
      //   to +
      //   "','%Y%m%d')\
      // and transact_date >= str_to_date('" +
      //   from +
      //   "','%Y%m%d') GROUP BY artist ORDER BY total_bid DESC\
      // ) as a")
      // .where(where_fn)
      // .orderBy('a.total_bid', 'desc')

      let preYoy = await knex.raw("SELECT CONCAT_WS('-', artist_kor, artist_eng) AS artist,\
                  SUM(hammer_price) AS total_bid,\
                  COUNT(`lot`) AS `total_lot`,\
                  Sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw\
                  from crawling\
                  where transact_date <= str_to_date('" +
        to1 +
        "','%Y%m%d')\
                  and transact_date >= str_to_date('" +
        from1 +
        "','%Y%m%d') GROUP BY artist ORDER BY total_bid DESC ");
      let dataNull = [];
      let dataNotNull = [];
      // yoyFilter
      for (let i = 0; i < results.length; i++) {
        results[i].total_lot = +results[i].lot - +results[i].with_draw;
        results[i].bid_rate = +results[i].win_lot / (Number(results[i].lot) - Number(results[i].with_draw)) * 100;
        results[i].usd = +results[i].total_bid * usd[0].krw;
        results[i].total_bid = +results[i].total_bid;
        results[i].bid_rate = +results[i].bid_rate;
        for (let j = 0; j < preYoy[0].length; j++) {
          preYoy[0][j].total_bid = +preYoy[0][j].total_bid
          if (results[i].artist === preYoy[0][j].artist) {
            results[i].yoy =
              isNaN((parseFloat(results[i].total_bid) - parseFloat(preYoy[0][j].total_bid)) / parseFloat(preYoy[0][j].total_bid) * 100)
                ? 0 :
                (parseFloat(results[i].total_bid) - parseFloat(preYoy[0][j].total_bid)) / (parseFloat(preYoy[0][j].total_bid) === 0 ? results[i].total_bid : parseFloat(preYoy[0][j].total_bid)) * 100
          }
        }
        if (results[i][`${field}`] === null) {
          dataNull.push(results[i])
        } else {
          dataNotNull.push(results[i])
        }
      }

      if (order == 'asc') {
        if (field == 'total_bid' || field == 'bid_rate' || field == 'yoy') {
          dataNotNull.sort((a, b) => a[field] - b[field]);
          results = [...dataNotNull, ...dataNull]
        } else {
          dataNotNull.sort(function (a, b) {
            let fa = a[`${field}`];
            let fb = b[`${field}`];
            if (fa < fb) { return -1; }
            if (fa > fb) { return 1; }
            return 0;
          })
          results = [...dataNotNull, ...dataNull]
        }
      } else if (order == 'desc') {
        if (field == 'total_bid' || field == 'bid_rate' || field == 'yoy') {
          dataNotNull.sort((a, b) => b[field] - a[field]);
          results = [...dataNotNull, ...dataNull]
        } else {
          dataNotNull.sort(function (a, b) {
            let fa = a[`${field}`];
            let fb = b[`${field}`];
            if (fa < fb) { return 1; }
            if (fa > fb) { return -1; }
            return 0;
          })
          results = [...dataNotNull, ...dataNull]
        }
      }
    }


    if (!results) {
      return res.send({ result: false, message: 'No result!', resp: [] })
    }

    let totalElement = results.length;
    let [limitStart, limitEnd] = [(page - 1) * size, page * size];
    limitStart = limitStart > 0 ? (limitStart < results.length ? limitStart : results.length) : 0;
    limitEnd = limitEnd > 0 ? (limitEnd < results.length ? limitEnd : results.length) : 0;
    results = results.slice(limitStart, limitEnd);
    const resultsCamel = results.map(item => snakeToCamel(item));
    return res.send({ result: true, message: 'ok', resp: resultsCamel, totalElement: totalElement, page: page, size: size, totalPage: Math.ceil(totalElement / size) })
  } catch (error) {
    LOGGER.APP.error(error.stack)
    return Response.ERROR(500, error.message, "Sv_500")
  }
}

async function exportExcelTotalBid(req, res, next) {
  try {
    let cur_m = (currentDate.getMonth() + 1).toString();
    let cur_d = currentDate.getDate().toString();
    let {
      company,
      location = [],
      locationSearch,
      materialKind = [],
      artistBirth = [],
      transactDate = [],
      nationality = [],
      nationalitySearch,
      querySearch, // artistKor
      materialSearch,
      mainColor = [],
      mainColorSearch,
      // method = [],
      // seriesSearch,
      // preference = [],
      from,
      to,
      order,
      field
    } = req.body;


    if (mainColorSearch) {
      mainColor.push(...mainColorSearch.split(","))
    }
    if (locationSearch) {
      location.push(...locationSearch.split(","))
    }

    if (nationalitySearch) {
      nationality.push(...nationalitySearch.split(","))
    }
    const where_fn = function () {
      // material Kind
      if (materialKind.length !== 0) {
        // materialKind = JSON.parse(materialKind)
        this.where(build => build.whereIn('crawling.material_kind', materialKind))

      }
      //Location
      if (location.length !== 0) {
        // location1 = JSON.parse(location1)
        this.where(build => build.whereIn('crawling.location', location))
      }

      // Birth  
      if (artistBirth.length !== 0) {
        // artistBirth = JSON.parse(artistBirth)

        // console.log(JSON.parse(artistBirth));
        this.where(build => build.whereBetween(`crawling.artist_birth`, [artistBirth[0] === '' ? 0 : artistBirth[0], artistBirth[1] === '' ? 9999 : artistBirth[1]]))
      }

      // Company
      if (company !== undefined) {
        this.where(build => build.whereIn('crawling.company', company))

      }
      // nationality
      if (nationality.length !== 0) {
        this.where(build => build.whereIn('crawling.nationality1', nationality)
          .orWhereIn('crawling.nationality2', nationality))
      }

      //Author
      if (querySearch) {
        this.where(build => build.whereRaw(`LOWER(crawling.artist_eng) like '%${querySearch.trim().toLowerCase()}%'`)
          .orWhereRaw(`LOWER(crawling.artist_kor) like '%${querySearch.trim().toLowerCase()}%'`))
      };
      //materialSearch
      if (materialSearch) {
        this.where(build => build.whereRaw(`LOWER(crawling.material_kor) like '%${materialSearch.trim().toLowerCase()}%'`)
          .orWhereRaw(`LOWER(crawling.material_eng) like '%${materialSearch.trim().toLowerCase()}%'`))
      };
      // //Method
      // if (method.length !== 0) {
      //   queryDb.where(build =>
      //     build.whereIn('crawling.method', method))
      // }
      // //Series
      // if (seriesSearch) {
      //   queryDb.where(build =>
      //     build.whereRaw(`LOWER(crawling.series) like '%${seriesSearch.trim().toLowerCase()}%'`))
      // }
      // //preference
      // if (preference.length !== 0) {
      //   queryDb.where(build =>
      //     build.whereIn('crawling.preference', preference))
      // }
    };

    let results
    if (to < from) {
      results = false;
      err = 10050;
      err_desc = "incorrect period of time";
    } else {

      let cur_y = currentDate.getFullYear().toString();
      let cur_date = `${cur_y}-${cur_m >= 10 ? cur_m : "0" + cur_m}-${cur_d >= 10 ? cur_d : "0" + cur_d
        }`;
      from = transactDate[0] ? transactDate[0].split('-').join('') : '1000' + "0101";
      // from = from || cur_y + "0101";
      to = transactDate[1] ? transactDate[1].split('-').join('') : cur_date.replace(/-/gi, "")

      // to = to || cur_date.replace(/-/gi, "")
      let time = moment(to, "YYYYMMDD").diff(moment(from, "YYYYMMDD"), "years") == 0 ? 1 : moment(to, "YYYYMMDD").diff(moment(from, "YYYYMMDD"), "years")
      let to1 = `${new Date(moment(to).format("YYYY-MM-DD")).getFullYear() - time}${new Date(moment(to).format("YYYY-MM-DD")).getMonth() + 1 >= 10 ? new Date(moment(to).format("YYYY-MM-DD")).getMonth() + 1 : "0" + (new Date(moment(to).format("YYYY-MM-DD")).getMonth() + 1)}${new Date(moment(to).format("YYYY-MM-DD")).getDate() >= 10 ? new Date(moment(to).format("YYYY-MM-DD")).getDate() : "0" + (new Date(moment(to).format("YYYY-MM-DD")).getDate())}`;
      let from1 = `${new Date(moment(from).format("YYYY-MM-DD")).getFullYear() - time}${new Date(moment(from).format("YYYY-MM-DD")).getMonth() + 1 >= 10 ? new Date(moment(from).format("YYYY-MM-DD")).getMonth() + 1 : "0" + (new Date(moment(from).format("YYYY-MM-DD")).getMonth() + 1)}${new Date(moment(from).format("YYYY-MM-DD")).getDate() >= 10 ? new Date(moment(from).format("YYYY-MM-DD")).getDate() : "0" + (new Date(moment(from).format("YYYY-MM-DD")).getDate())}`;
      let usd = await knex.select("to_usd.krw").from('to_usd').orderBy("date", "desc")

      results = await knex
        .select(
          knex.raw(`COUNT(lot) as lot,
        artist.*,
        case when main_color is not null then main_color else null end as main_color,
        artist.nationality2 as nationality2,
        artist_kor,artist_eng,artist_birth,artist_death,
        artist_id,
        material_kind,material_kor,material_eng,company,transact_date,location,
        concat_ws('-',artist_kor, artist_eng) as artist,
        SUM(hammer_price) as total_bid,
        COUNT('lot') AS 'total_lot',
        Sum (case when hammer_price is null or hammer_price = 0 then 0 else 1 end) AS 'win_lot',
        Sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw`)
        )
        .leftJoin('artist', 'crawling.artist_id', '=', 'artist.id')
        .from("crawling")
        .where(knex.raw(`(artist_kor is not null or artist_eng is not null)\
        and transact_date <= str_to_date(${to},'%Y%m%d')\
        and transact_date >= str_to_date(${from},'%Y%m%d')`))
        .where(where_fn)
        .groupBy('artist')
        .orderBy('total_bid', 'desc')

      let preYoy = await knex.raw("SELECT CONCAT_WS('-', artist_kor, artist_eng) AS artist,\
                  SUM(hammer_price) AS total_bid,\
                  COUNT(`lot`) AS `total_lot`,\
                  Sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw\
                  from crawling\
                  where transact_date <= str_to_date('" +
        to1 +
        "','%Y%m%d')\
                  and transact_date >= str_to_date('" +
        from1 +
        "','%Y%m%d') GROUP BY artist ORDER BY total_bid DESC ");

      let dataNull = [];
      let dataNotNull = [];
      // yoyFilter
      for (let i = 0; i < results.length; i++) {
        results[i].total_lot = +results[i].lot - +results[i].with_draw;
        results[i].bid_rate = +results[i].win_lot / (Number(results[i].lot) - Number(results[i].with_draw)) * 100;
        results[i].usd = +results[i].total_bid * usd[0].krw;
        results[i].total_bid = +results[i].total_bid;
        results[i].bid_rate = +results[i].bid_rate;
        for (let j = 0; j < preYoy[0].length; j++) {
          preYoy[0][j].total_bid = +preYoy[0][j].total_bid
          if (results[i].artist === preYoy[0][j].artist) {
            results[i].yoy =
              isNaN((parseFloat(results[i].total_bid) - parseFloat(preYoy[0][j].total_bid)) / parseFloat(preYoy[0][j].total_bid) * 100)
                ? 0 :
                (parseFloat(results[i].total_bid) - parseFloat(preYoy[0][j].total_bid)) / (parseFloat(preYoy[0][j].total_bid) === 0 ? results[i].total_bid : parseFloat(preYoy[0][j].total_bid)) * 100
          }
        }
        if (results[i][`${field}`] === null) {
          dataNull.push(results[i])
        } else {
          dataNotNull.push(results[i])
        }
      }

      if (order == 'asc') {
        if (field == 'total_bid' || field == 'bid_rate' || field == 'yoy') {
          dataNotNull.sort((a, b) => a[field] - b[field]);
          results = [...dataNotNull, ...dataNull]
        } else {
          dataNotNull.sort(function (a, b) {
            let fa = a[`${field}`];
            let fb = b[`${field}`];
            if (fa < fb) { return -1; }
            if (fa > fb) { return 1; }
            return 0;
          })
          results = [...dataNotNull, ...dataNull]
        }
      } else if (order == 'desc') {
        if (field == 'total_bid' || field == 'bid_rate' || field == 'yoy') {
          dataNotNull.sort((a, b) => b[field] - a[field]);
          results = [...dataNotNull, ...dataNull]
        } else {
          dataNotNull.sort(function (a, b) {
            let fa = a[`${field}`];
            let fb = b[`${field}`];
            if (fa < fb) { return 1; }
            if (fa > fb) { return -1; }
            return 0;
          })
          results = [...dataNotNull, ...dataNull]
        }
      }
    }


    if (!results) {
      return res.send({ result: false, message: 'No result!', resp: [] })
    }

    let count = 1
    const titlesEng = [
      '# ',
      'Author Name',
      'Author Birth',
      'Author Death',
      'Nationality1',
      'Total Lot',
      'Successful Bid',
      'Bid Rate',
      'Total Winning Bid(KRW)',
      'Total Winning Bid(USD)',
      'YOY (Total Winning Bid)',
    ]
    // const titlesKor = [
    //   '순번 ',
    //   '작가명',
    //   '생년',
    //   '몰년',
    //   '국적',
    //   '출품수',
    //   '낙찰수',
    //   '낙찰율',
    //   '낙찰총액(KRW)',
    //   '낙찰총액(USD)',
    //   'YOY (낙찰총액)',
    // ]

    const dataExport = results.map((e) => [
      count++,
      e.artist,
      e.artist_birth,
      e.artist_death,
      e.nationality1,
      e.total_lot.toLocaleString("en-US"),
      e.win_lot.toLocaleString("en-US"),
      e.bid_rate == null ? 0 + '%' : (parseFloat(e.bid_rate).toFixed(2)).toLocaleString("en-US") + '%',
      e.total_bid === null ? 0 : Number(parseFloat(e.total_bid).toFixed(3)).toLocaleString("en-US"),
      Number(parseFloat(e.usd).toFixed(6)).toLocaleString("en-US"),
      e.yoy == null ? 0 + '%' : e.yoy.toFixed(3) + '%'
    ])

    // let keyFilter = [
    //   "company: " + `${typeof company == 'undefined' ? '' : company}`,
    //   "Location: " + `${typeof location == 'undefined' ? '' : location}`,
    //   "materialKind: " + `${typeof materialKind == 'undefined' ? '' : materialKind}`,
    //   "artistBirth:  " + `${typeof artistBirth[0] == 'undefined' ? '' : artistBirth[0]}` + '-->' + `${typeof artistBirth[1] == 'undefined' ? '' : artistBirth[1]}`,
    //   "Transact Date: " + `${typeof transactDate[0] == 'undefined' ? '' : transactDate[0]}` + '-->' + `${typeof transactDate[1] == 'undefined' ? '' : transactDate[1]}`,
    //   "querySearch: " + `${typeof querySearch == 'undefined' ? '' : querySearch}`,
    //   "nationality: " + `${typeof nationality == 'undefined' ? '' : nationality}`,
    //   "nationalitySearch: " + `${typeof nationalitySearch == 'undefined' ? '' : nationalitySearch}`,
    //   "materialSearch: " + `${typeof materialSearch == 'undefined' ? '' : materialSearch}`,
    //   "Sort: " + "Field: " + `${typeof field == 'undefined' ? '' : field}` + " Order: " + `${typeof order == 'undefined' ? '' : order}`,
    // ]


    const dataSave = {
      fileName: 'Top_Ranker',
      data: dataExport,
      // fillterSort: keyFilter,
      colsTitle: titlesEng,
      // colsTitle2: titlesKor
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
    return Response.ERROR(500, error.message, "Sv_500")
  }
}
module.exports = { exportExcelTotalBid, topRanker };
