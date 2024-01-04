const knex = require("../config/connectDB");
const moment = require('moment')
class Main {
  static async main(req, res, next) {
    let now = new Date();
    let lastDay = moment(new Date(now.getFullYear(), now.getMonth(), 0)).format();
    let firstDay = moment(new Date(now.getFullYear() - 5, now.getMonth(), 1)).format();
    // query lấy năm 
    let db_res = await knex
      .select(knex.raw("MAX(`transact_date`) AS max_transact_date,\
                  YEAR(transact_date) as period,\
                  SUM(CASE  WHEN on_off = 'online' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS online1,\
                  SUM(CASE  WHEN on_off = 'offline' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS offline1,\
                  SUM(CASE WHEN hammer_price < estimate_min and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS below,\
                                  SUM(CASE WHEN hammer_price > estimate_max and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS above,\
                                  SUM(CASE WHEN ((hammer_price <= estimate_max AND estimate_max IS NOT NULL) AND (hammer_price >= estimate_min AND estimate_min IS NOT NULL) OR (estimate_min IS NULL) OR (estimate_max IS NULL)) AND (bid_class != 'w/d' OR bid_class IS NULL) AND hammer_price IS NOT NULL and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS within,\
                                  SUM(CASE WHEN (hammer_price IS NULL OR hammer_price = 0) and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS notsold,\
                                  SUM(CASE WHEN hammer_price IS NULL OR hammer_price = 0 THEN 0 ELSE 1 END) AS sold,\
                                  SUM(CASE WHEN bid_class = 'w/d' THEN 1 ELSE 0 END) AS with_draw,\
                  COUNT(`estimate_max`) AS `es_cnt`,\
                  SUM(`hammer_price`) AS `total_bid`,\
                  AVG(`hammer_price`) AS `winbid_avg`"))
      .from("crawling")
      .where(knex.raw(`transact_date <= STR_TO_DATE('${moment(lastDay).format('YYYYMMDD')}','%Y%m%d') and transact_date >= '${moment(firstDay).format('YYYYMMDD')}' `))
      .groupBy("period")
      .orderBy("max_transact_date");
    let lotByPeriod = {};
    let onOff = {};
    let resultByPeriod = {};
    let totalOnOffYear = [];
    let totalResultByPeriodYear = [];
    let dataLotByPeriodYear = [];
    for (let i = 0; i < db_res.length; i++) {
      let lotByPeriod = {
        date: db_res[i].period.toString(),
        sold: Number(db_res[i].sold),
        notsold: Number(db_res[i].notsold),
        total_bid: Number(db_res[i].total_bid)
      };
      dataLotByPeriodYear.push(lotByPeriod)
      let dataResultByPeriod = {
        date: db_res[i].period.toString(),
        notsold: db_res[i].notsold / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        above: db_res[i].above / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        below: db_res[i].below / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        within: db_res[i].within / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      };
      totalResultByPeriodYear.push(dataResultByPeriod);
      let dataOnoff = {
        date: db_res[i].period.toString(),
        online: db_res[i].online1,
        offline: db_res[i].offline1
      };
      totalOnOffYear.push(dataOnoff);
    };
    // query nửa năm
    db_res = await knex
      .select(knex.raw("MAX(`transact_date`) AS max_transact_date,\
              CONCAT(YEAR(transact_date),'.', CASE WHEN MONTH(transact_date) <= 6 THEN 6 ELSE 12 END) AS period,\
              SUM(CASE  WHEN on_off = 'online' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS online1,\
              SUM(CASE  WHEN on_off = 'offline' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS offline1,\
              SUM(CASE WHEN hammer_price < estimate_min and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS below,\
                              SUM(CASE WHEN hammer_price > estimate_max and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS above,\
                              SUM(CASE WHEN ((hammer_price <= estimate_max AND estimate_max IS NOT NULL) AND (hammer_price >= estimate_min AND estimate_min IS NOT NULL) OR (estimate_min IS NULL) OR (estimate_max IS NULL)) AND (bid_class != 'w/d' OR bid_class IS NULL) AND hammer_price IS NOT NULL and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS within,\
                              SUM(CASE WHEN (hammer_price IS NULL OR hammer_price = 0) and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS notsold,\
                              SUM(CASE WHEN hammer_price IS NULL OR hammer_price = 0 THEN 0 ELSE 1 END) AS sold,\
                              SUM(CASE WHEN bid_class = 'w/d' THEN 1 ELSE 0 END) AS with_draw,\
              COUNT(`estimate_max`) AS `es_cnt`,\
              SUM(`hammer_price`) AS `total_bid`,\
              AVG(`hammer_price`) AS `winbid_avg`"))
      .from("crawling")
      .where(knex.raw(`transact_date <= STR_TO_DATE('${moment(lastDay).format('YYYYMMDD')}','%Y%m%d') and transact_date >= '${moment(firstDay).format('YYYYMMDD')}' `))
      .groupBy("period")
      .orderBy("max_transact_date");
    let totalOnOffHalf = [];
    let totalResultByPeriodHalf = [];
    let dataLotByPeriodHalf = [];
    for (let i = 0; i < db_res.length; i++) {
      let lotByPeriod = {
        date: db_res[i].period.toString(),
        sold: Number(db_res[i].sold),
        notsold: Number(db_res[i].notsold),
        total_bid: Number(db_res[i].total_bid)
      };
      dataLotByPeriodHalf.push(lotByPeriod)
      let dataResultByPeriod = {
        date: db_res[i].period.toString(),
        notsold: db_res[i].notsold / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        above: db_res[i].above / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        below: db_res[i].below / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        within: db_res[i].within / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      };
      totalResultByPeriodHalf.push(dataResultByPeriod);
      let dataOnoff = {
        date: db_res[i].period.toString(),
        online: db_res[i].online1,
        offline: db_res[i].offline1
      };
      totalOnOffHalf.push(dataOnoff);
    };
    // query quý
    db_res = await knex
      .select(knex.raw("MAX(`transact_date`) AS max_transact_date,\
                CONCAT(YEAR(transact_date), '.', CASE WHEN MONTH(transact_date) <= 3 THEN 3 WHEN MONTH(transact_date) <= 6 THEN 6 WHEN MONTH(transact_date) <= 9 THEN 9 ELSE 12 END) AS period,\
                SUM(CASE  WHEN on_off = 'online' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS online1,\
                SUM(CASE  WHEN on_off = 'offline' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS offline1,\
                SUM(CASE WHEN hammer_price < estimate_min and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS below,\
                                SUM(CASE WHEN hammer_price > estimate_max and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS above,\
                                SUM(CASE WHEN ((hammer_price <= estimate_max AND estimate_max IS NOT NULL) AND (hammer_price >= estimate_min AND estimate_min IS NOT NULL) OR (estimate_min IS NULL) OR (estimate_max IS NULL)) AND (bid_class != 'w/d' OR bid_class IS NULL) AND hammer_price IS NOT NULL and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS within,\
                                SUM(CASE WHEN (hammer_price IS NULL OR hammer_price = 0) and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS notsold,\
                                SUM(CASE WHEN hammer_price IS NULL OR hammer_price = 0 THEN 0 ELSE 1 END) AS sold,\
                                SUM(CASE WHEN bid_class = 'w/d' THEN 1 ELSE 0 END) AS with_draw,\
                COUNT(`estimate_max`) AS `es_cnt`,\
                SUM(`hammer_price`) AS `total_bid`,\
                AVG(`hammer_price`) AS `winbid_avg`"))
      .from("crawling")
      .where(knex.raw(`transact_date <= STR_TO_DATE('${moment(lastDay).format('YYYYMMDD')}','%Y%m%d') and transact_date >= '${moment(firstDay).format('YYYYMMDD')}' `))
      .groupBy("period")
      .orderBy("max_transact_date");
    let totalOnOffQuater = [];
    let totalResultByPeriodQuater = [];
    let dataLotByPeriodQuater = [];
    for (let i = 0; i < db_res.length; i++) {
      let lotByPeriod = {
        date: db_res[i].period.toString(),
        sold: Number(db_res[i].sold),
        notsold: Number(db_res[i].notsold),
        total_bid: Number(db_res[i].total_bid)
      };
      dataLotByPeriodQuater.push(lotByPeriod)
      let dataResultByPeriod = {
        date: db_res[i].period.toString(),
        notsold: db_res[i].notsold / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        above: db_res[i].above / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        below: db_res[i].below / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        within: db_res[i].within / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      };
      totalResultByPeriodQuater.push(dataResultByPeriod);
      let dataOnoff = {
        date: db_res[i].period.toString(),
        online: db_res[i].online1,
        offline: db_res[i].offline1
      };
      totalOnOffQuater.push(dataOnoff);
    };
    // query tháng
    db_res = await knex
      .select(knex.raw("MAX(`transact_date`) AS max_transact_date,\
              CONCAT(YEAR(transact_date), '.', MONTH(transact_date)) AS period,\
              SUM(CASE  WHEN on_off = 'online' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS online1,\
              SUM(CASE  WHEN on_off = 'offline' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS offline1,\
              SUM(CASE WHEN hammer_price < estimate_min and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS below,\
                              SUM(CASE WHEN hammer_price > estimate_max and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS above,\
                              SUM(CASE WHEN ((hammer_price <= estimate_max AND estimate_max IS NOT NULL) AND (hammer_price >= estimate_min AND estimate_min IS NOT NULL) OR (estimate_min IS NULL) OR (estimate_max IS NULL)) AND (bid_class != 'w/d' OR bid_class IS NULL) AND hammer_price IS NOT NULL and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS within,\
                              SUM(CASE WHEN (hammer_price IS NULL OR hammer_price = 0) and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS notsold,\
                              SUM(CASE WHEN hammer_price IS NULL OR hammer_price = 0 THEN 0 ELSE 1 END) AS sold,\
                              SUM(CASE WHEN bid_class = 'w/d' THEN 1 ELSE 0 END) AS with_draw,\
              COUNT(`estimate_max`) AS `es_cnt`,\
              SUM(`hammer_price`) AS `total_bid`,\
              AVG(`hammer_price`) AS `winbid_avg`"))
      .from("crawling")
      .where(knex.raw(`transact_date <= STR_TO_DATE('${moment(lastDay).format('YYYYMMDD')}','%Y%m%d') and transact_date >= '${moment(firstDay).format('YYYYMMDD')}' `))
      .groupBy("period")
      .orderBy("max_transact_date");
    let totalOnOffMonthly = [];
    let totalResultByPeriodMonthly = [];
    let dataLotByPeriodMonthly = [];
    for (let i = 0; i < db_res.length; i++) {
      let lotByPeriod = {
        date: db_res[i].period.toString(),
        sold: Number(db_res[i].sold),
        notsold: Number(db_res[i].notsold),
        total_bid: Number(db_res[i].total_bid)
      };
      dataLotByPeriodMonthly.push(lotByPeriod)
      let dataResultByPeriod = {
        date: db_res[i].period.toString(),
        notsold: db_res[i].notsold / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        above: db_res[i].above / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        below: db_res[i].below / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
        within: db_res[i].within / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      };
      totalResultByPeriodMonthly.push(dataResultByPeriod);
      let dataOnoff = {
        date: db_res[i].period.toString(),
        online: db_res[i].online1,
        offline: db_res[i].offline1
      };
      totalOnOffMonthly.push(dataOnoff);
    };

    //  OccupyByPeriod
    db_res = await knex
      .select(knex.raw(`max(transact_date) as max_transact_date,\
                    company as auction,\
                    sum(hammer_price) as bid,\
                    year(transact_date) as period`))
      .from("crawling")
      .where("location", "=", "Korea")
      .where(knex.raw(`transact_date <= STR_TO_DATE('${moment(lastDay).format('YYYYMMDD')}','%Y%m%d') and transact_date >= '${moment(firstDay).format('YYYYMMDD')}' `))
      .groupBy(knex.raw("period, company"))
      .orderBy("max_transact_date");


    let obj = []
    for (let item of db_res) {
      item.bid = Number(item.bid)
      if (obj[Number(item.period)]) {
        obj[Number(item.period)].push(item)
      } else {
        obj[Number(item.period)] = [item]
      }
    }

    let a = db_res.map(e => Number(e.max_transact_date.getFullYear()))
    let myArrayWithNoDuplicates = a.reduce(function (accumulator, element) {
      if (accumulator.indexOf(element) === -1) {
        accumulator.push(element)
      }
      return accumulator
    }, [])

    let occupyByPeriod = {};
    occupyByPeriod.yearly = [];
    occupyByPeriod.half = [];
    occupyByPeriod.quarter = [];
    occupyByPeriod.monthly = [];
    for (let i = 0; i < myArrayWithNoDuplicates.length; i++) {
      if (obj[myArrayWithNoDuplicates[i]].length > 0) {
        let temp = { date: myArrayWithNoDuplicates[i], occupy: obj[myArrayWithNoDuplicates[i]] }
        occupyByPeriod.yearly.push(temp)
      }
    }
    // Lấy nửa năm
    db_res = await knex
      .select(knex.raw(`max(transact_date) as max_transact_date,
                      company as auction ,
                      sum(hammer_price) as bid,
                      CONCAT(YEAR(transact_date), '.', CASE WHEN MONTH(transact_date) <= 6 THEN 6 ELSE 12 END) AS period,
                      CONCAT(YEAR(transact_date), '', CASE WHEN MONTH(transact_date) <= 6 THEN 6 ELSE 12 END) AS period1`))
      .from("crawling")
      .where("location", "=", "Korea")
      .where(knex.raw(`transact_date <= STR_TO_DATE('${moment(lastDay).format('YYYYMMDD')}','%Y%m%d') and transact_date >= '${moment(firstDay).format('YYYYMMDD')}' `))
      .groupBy(knex.raw("period, company"))
      .orderBy("max_transact_date");
    let obj1 = []
    for (let item of db_res) {
      item.bid = Number(item.bid)
      if (obj1[Number(item.period1)]) {
        obj1[Number(item.period1)].push(item)
      } else {
        obj1[Number(item.period1)] = [item]
      }
    }
    let half = db_res.map(e => e.period1)
    let myArrayWithNoDuplicatesHalf = half.reduce(function (accumulator, element) {
      if (accumulator.indexOf(element) === -1) {
        accumulator.push(element)
      }
      return accumulator
    }, [])
    for (let i = 0; i < myArrayWithNoDuplicatesHalf.length; i++) {
      let dateSlice = myArrayWithNoDuplicatesHalf[i].toString()
      if (obj1[myArrayWithNoDuplicatesHalf[i]].length > 0) {
        let temp = { date: dateSlice.slice(0, 4) + '.' + dateSlice.slice(4), occupy: obj1[myArrayWithNoDuplicatesHalf[i]] }
        occupyByPeriod.half.push(temp)
      }
    }
    // Lấy quy
    db_res = await knex
      .select(knex.raw(`max(transact_date) as max_transact_date,
                        company as auction,
                        sum(hammer_price) as bid,
                        concat(year(transact_date),'.', case when month(transact_date) <= 3 then 3 when month(transact_date) <= 6 then 6 when month(transact_date) <= 9 then 9 else 12 end) as period,
                        concat(year(transact_date),'', case when month(transact_date) <= 3 then 3 when month(transact_date) <= 6 then 6 when month(transact_date) <= 9 then 9 else 12 end) as period1`))
      .from("crawling")
      .where("location", "=", "Korea")
      .where(knex.raw(`transact_date <= STR_TO_DATE('${moment(lastDay).format('YYYYMMDD')}','%Y%m%d') and transact_date >= '${moment(firstDay).format('YYYYMMDD')}' `))
      .groupBy(knex.raw("period, company"))
      .orderBy("max_transact_date");
    let obj2 = []
    for (let item of db_res) {
      item.bid = Number(item.bid)
      if (obj2[Number(item.period1)]) {
        obj2[Number(item.period1)].push(item)
      } else {
        obj2[Number(item.period1)] = [item]
      }
    }
    let quater = db_res.map(e => Number(e.period1))
    let myArrayWithNoDuplicatesQuater = quater.reduce(function (accumulator, element) {
      if (accumulator.indexOf(element) === -1) {
        accumulator.push(element)
      }
      return accumulator
    }, [])

    for (let i = 0; i < myArrayWithNoDuplicatesQuater.length; i++) {
      let dateSlice = myArrayWithNoDuplicatesQuater[i].toString()
      if (obj2[myArrayWithNoDuplicatesQuater[i]].length > 0) {
        let temp = { date: dateSlice.slice(0, 4) + '.' + dateSlice.slice(4), occupy: obj2[myArrayWithNoDuplicatesQuater[i]] }
        occupyByPeriod.quarter.push(temp)
      }
    }
    // Lấy tháng 
    db_res = await knex
      .select(knex.raw(`max(transact_date) as max_transact_date,
                          company as auction,
                          sum(hammer_price) as bid,
                          concat(year(transact_date),'.', month(transact_date)) as period,
                          concat(year(transact_date),'', month(transact_date)) as period1`))
      .from("crawling")
      .where("location", "=", "Korea")
      .where(knex.raw(`transact_date <= STR_TO_DATE('${moment(lastDay).format('YYYYMMDD')}','%Y%m%d') and transact_date >= '${moment(firstDay).format('YYYYMMDD')}' `))
      .groupBy(knex.raw("period, company"))
      .orderBy("max_transact_date");
    let obj3 = []
    for (let item of db_res) {
      item.bid = Number(item.bid)
      if (obj3[Number(item.period1)]) {
        obj3[Number(item.period1)].push(item)
      } else {
        obj3[Number(item.period1)] = [item]
      }
    }
    let monthly = db_res.map(e => Number(e.period1))
    let myArrayWithNoDuplicatesMonthly = monthly.reduce(function (accumulator, element) {
      if (accumulator.indexOf(element) === -1) {
        accumulator.push(element)
      }
      return accumulator
    }, [])
    for (let i = 0; i < myArrayWithNoDuplicatesMonthly.length; i++) {
      let dateSlice = myArrayWithNoDuplicatesMonthly[i].toString()
      if (obj3[myArrayWithNoDuplicatesMonthly[i]].length > 0) {
        let temp = { date: dateSlice.slice(0, 4) + '.' + dateSlice.slice(4), occupy: obj3[myArrayWithNoDuplicatesMonthly[i]] }
        occupyByPeriod.monthly.push(temp)
      }
    }

    lotByPeriod = {
      yearly: dataLotByPeriodYear.sort((a, b) => a.date - b.date),
      half: dataLotByPeriodHalf,
      quarter: dataLotByPeriodQuater,
      monthly: dataLotByPeriodMonthly
    }
    resultByPeriod = {
      yearly: totalResultByPeriodYear.sort((a, b) => a.date - b.date),
      half: totalResultByPeriodHalf,
      quarter: totalResultByPeriodQuater,
      monthly: totalResultByPeriodMonthly
    }
    onOff = {
      yearly: totalOnOffYear.sort((a, b) => a.date - b.date),
      half: totalOnOffHalf,
      quarter: totalOnOffQuater,
      monthly: totalOnOffMonthly
    }
    res.send({
      result: true,
      msg: "데이터 로드 성공",
      resp: {
        firstDay: firstDay,
        lastDay: lastDay,
        lotByPeriod: lotByPeriod,
        resultByPeriod: resultByPeriod,
        occupyByPeriod: occupyByPeriod,
        onoffByPeriod: onOff
      },
    });
  }
  static async mainTop(req, res, next) {
    let currentDate = new Date();
    let cur_y = currentDate.getFullYear().toString();
    let pre_y = (currentDate.getFullYear() - 1).toString();
    let pre_winbid;
    let cur_winbid;
    let yoy;
    let biddroping;
    let price_list;
    let price_distribution;
    let price;
    let cnt_price;
    let top_lot;
    let artist_ko;
    let artist_en;
    let artist_pre;
    let artist_competition;
    let artist_work;
    let top_artist;
    let top_competition;
    let top_outperfomer;
    let rising_artist;
    let now = new Date();
    let lastDayOfYear = moment(new Date(now.getFullYear(), now.getMonth(), 0)).format();// Lấy ngày cuối tháng trước năm nay
    let firstDayOfYear = moment(new Date(now.getFullYear(), 0, 1)).format() // Lấy ngày đầu năm nay
    let preFirstMonthOfYear = moment(new Date(now.getFullYear(), now.getMonth() - 1, 1)).format() // Lấy ngày đầu tháng trước năm nay
    let pre_first_date = moment(new Date(now.getFullYear() - 1, 0, 1)).format() // Lấy ngày đầu tháng trước so với tháng hiện tại của năm ngoái
    let pre_first_month = moment(new Date(now.getFullYear() - 1, now.getMonth() - 1, 1)).format()
    let pre_last_date = moment(new Date(now.getFullYear() - 1, now.getMonth(), 0)).format() //  Lấy ngày cuối tháng trước so với tháng hiện tại của năm ngoái
    // let otherFistDate = moment(new Date(now.getFullYear() - 2, now.getMonth() - 1, 1)).format(); // Lấy ngày đầu tháng trước so với tháng hiện tại của 2 năm trước
    // let otherLastDate = moment(new Date(now.getFullYear() - 2, now.getMonth(), 0)).format();//  Lấy ngày cuối tháng trước so với tháng hiện tại của 2 năm trước
    let otherYear = (currentDate.getFullYear() - 2).toString();

    cur_winbid = await knex
      .select(knex.raw("Sum(hammer_price) as winbid,\
        Sum(case when hammer_price is null or hammer_price = 0 then 0 else 1 end) as cnt_winbid,\
        Count(lot) as cnt_total,\
        Sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw"))
      .from("crawling")
      .whereRaw(
        "(transact_date <= STR_TO_DATE('" +
        lastDayOfYear +
        "','%Y-%m-%d')) " +
        "and (transact_date >= STR_TO_DATE('" +
        firstDayOfYear +
        "','%Y-%m-%d'))"
      )
      .andWhere(knex.raw(`(bid_class <> 'w/d' or bid_class is null)`))
      .andWhere(knex.raw("year(transact_date)"), "=", cur_y);
    if (cur_winbid.length < 1) {
      pre_winbid = await knex
        .select(knex.raw("Sum(hammer_price) as winbid,\
            Sum(case when hammer_price is null or hammer_price = 0 then 0 else 1 end) as cnt_winbid,\
            Count(lot) as cnt_total,\
            Sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw"))
        .from("crawling")
        .whereRaw(
          "(transact_date <= STR_TO_DATE('" +
          pre_first_date +
          "','%Y-%m-%d')) "
        )
        .andWhereRaw("(transact_date >= STR_TO_DATE('" +
          pre_last_date +
          "','%Y-%m-%d'))")
        .andWhere(knex.raw("year(transact_date)"), "=", otherYear);

      cur_winbid = await knex
        .sum("hammer_price", { as: "winbid" })
        .count("hammer_price", { as: "cnt_winbid" })
        .count("lot", { as: "cnt_total" })
        .from("crawling")
        .whereRaw(
          "(transact_date <= STR_TO_DATE('" +
          pre_last_date +
          "','%Y-%m-%d')) " +
          "and (transact_date >= STR_TO_DATE('" +
          pre_first_date +
          "','%Y-%m-%d'))"
        )
        .andWhere(knex.raw("year(transact_date)"), "=", cur_y)
        .andWhere(knex.raw("(bid_class <> 'w/d' or bid_class is null"));

    } else {
      pre_winbid = await knex
        .select(knex.raw("Sum(hammer_price) as winbid,\
        Sum(case when hammer_price is null or hammer_price = 0 then 0 else 1 end) as cnt_winbid,\
        Count(lot) as cnt_total,\
        Sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw"))
        .from("crawling")
        .whereRaw(
          "(transact_date <= STR_TO_DATE('" +
          pre_last_date +
          "','%Y-%m-%d')) "
        )
        .andWhereRaw("(transact_date >= STR_TO_DATE('" +
          pre_first_date +
          "','%Y-%m-%d'))")
        .andWhere(knex.raw("year(transact_date)"), "=", pre_y);
    }
           
    yoy = {
      yoy:
        ((Number(cur_winbid[0].winbid) - Number(pre_winbid[0].winbid)) / Number(pre_winbid[0].winbid)) *
        100,
      yoysum: (Number(cur_winbid[0].winbid) - Number(pre_winbid[0].winbid)),
      total_winbid: Number(cur_winbid[0].winbid),
    };

    biddroping = {
      bid_rate_change:
        (cur_winbid[0].cnt_winbid / (cur_winbid[0].cnt_total - cur_winbid[0].with_draw) == 0 ? 1 :
          cur_winbid[0].cnt_winbid / (cur_winbid[0].cnt_total - cur_winbid[0].with_draw)) * 100
        - (pre_winbid[0].cnt_winbid / (pre_winbid[0].cnt_total - pre_winbid[0].with_draw) == 0 ? 1 :
          pre_winbid[0].cnt_winbid / (pre_winbid[0].cnt_total - pre_winbid[0].with_draw)) * 100,
      winbid_rate: (cur_winbid[0].cnt_winbid / (cur_winbid[0].cnt_total - cur_winbid[0].with_draw)) * 100,
      total_lot: cur_winbid[0].cnt_total,
      win_lot: cur_winbid[0].cnt_winbid,
    };
    // Last Month
    let query
    query = await knex
      .select(knex.raw(
        "total.count_lot,\
      total.countlothm,\
      total.sumhm,\
      (total.countlothm/total.count_lot) * 100 as bidrate ,\
      (total.above/total.count_lot) * 100 as above, \
      (total.below/total.count_lot) * 100 as below, \
      (total.within/total.count_lot) * 100 as within, \
      (total.notsold /total.count_lot) * 100 as notsold"))
      .fromRaw("(select \
                          SUM(CASE WHEN hammer_price < estimate_min and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS below,\
                          SUM(CASE WHEN hammer_price > estimate_max and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS above,\
                          SUM(CASE WHEN ((hammer_price <= estimate_max AND estimate_max IS NOT NULL) AND (hammer_price >= estimate_min AND estimate_min IS NOT NULL) OR (estimate_min IS NULL) OR (estimate_max IS NULL)) AND (bid_class != 'w/d' OR bid_class IS NULL) AND hammer_price IS NOT NULL and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS within,\
                          SUM(CASE WHEN (hammer_price IS NULL OR hammer_price = 0) and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS notsold,\
                          SUM(CASE WHEN hammer_price IS NULL OR hammer_price = 0 THEN 0 ELSE 1 END) AS sold,\
                          SUM(CASE WHEN bid_class = 'w/d' THEN 1 ELSE 0 END) AS with_draw,\
                          Sum(case when lot is null  and (bid_class <> 'w/d' or bid_class is null) then 0 else 1 end) as count_lot,\
                          Sum(case when lot is not null and hammer_price is not null or hammer_price != 0 then 1 else 0 end) as countlothm,\
                          Sum(hammer_price) as sumhm\
                from crawling\
                 where (transact_date <= STR_TO_DATE('" + moment(lastDayOfYear).format('YY-MM-DD') + "', '%Y-%m-%d'))\
                 AND (transact_date >= STR_TO_DATE('" + moment(preFirstMonthOfYear).format('YY-MM-DD') + "', '%Y-%m-%d'))\
                 AND (bid_class <> 'w/d' or bid_class is null)) as total")

    let last_month_yoy = {
      preFirstDate: preFirstMonthOfYear,
      preLastDate: lastDayOfYear,
      worksOnDisplay: query[0].count_lot, // số tác phẩm trưng bày
      tenderWorks: query[0].countlothm, //tổng số tác phẩm trưng bày
      tenderMoney: query[0].sumhm,// Tổng số tiền đấu thầu
      biddingRate: query[0].bidrate, // Tỉ lệ đấu thầu
      below: query[0].below,
      above: query[0].above,
      within: query[0].within,
      notsold: query[0].notsold
    }

    //Top_lot
    // price_list = [50000, 10000, 1000, 100, 0];
    // price_distribution = {};
    // while (price_list.length > 0) {
    //   price = price_list.pop();
    //   cnt_price = await knex
    //     .count("hammer_price", { as: "winbid" })
    //     .from("crawling")
    //     .where(function () {
    //       if (price_list.length == 0) {
    //         this.where("hammer_price", ">=", price * 10000);
    //       } else {
    //         this.where("hammer_price", ">=", price * 10000).andWhere(
    //           "hammer_price",
    //           "<",
    //           price_list[price_list.length - 1] * 10000
    //         );
    //       }
    //     })
    //     .whereRaw(
    //       "(transact_date <= STR_TO_DATE('" +
    //       lastDayOfYear +
    //       "','%Y-%m-%d')) " +
    //       "and (transact_date >= STR_TO_DATE('" +
    //       firstDayOfYear +
    //       "','%Y-%m-%d'))"
    //     )
    //     .andWhere(knex.raw("year(transact_date)"), "=", cur_y);
    //   price_distribution["from" + price.toString()] =
    //     (cnt_price[0].winbid / cur_winbid[0].cnt_winbid) * 100;
    // }
    // if (cnt_price.length == 0) {
    //   while (price_list.length > 0) {
    //     price = price_list.pop();
    //     cnt_price = await knex
    //       .count("hammer_price", { as: "winbid" })
    //       .from("crawling")
    //       .where(function () {
    //         if (price_list.length == 0) {
    //           this.where("hammer_price", ">=", price * 10000);
    //         } else {
    //           this.where("hammer_price", ">=", price * 10000).andWhere(
    //             "hammer_price",
    //             "<",
    //             price_list[price_list.length - 1] * 10000
    //           );
    //         }
    //       })
    //       .whereRaw(
    //         "(transact_date <= STR_TO_DATE('" +
    //         pre_last_date +
    //         "','%Y-%m-%d')) " +
    //         "and (transact_date >= STR_TO_DATE('" +
    //         pre_first_date +
    //         "','%Y-%m-%d'))"
    //       )
    //       .andWhere(knex.raw("year(transact_date)"), "=", cur_y);
    //     price_distribution["from" + price.toString()] =
    //       (cnt_price[0].winbid / cur_winbid[0].cnt_winbid) * 100;
    //   }
    // }
    query = await knex
      .select(
        "*",
        knex.raw("CONCAT_WS('-', artist_kor, artist_eng) AS artist,\
        CONCAT_WS('-', artist_birth, artist_death) AS artist_date"))
      .from("crawling")
      .where(knex.raw("year(transact_date)"), "=", cur_y)
      .andWhere(knex.raw(`(bid_class <> 'w/d' or bid_class is null)`))
      .orderBy("hammer_price", "desc")
      .limit(1);

    if (query.length == 0) {
      query = await knex
        .select("*")
        .from("crawling")
        .where(knex.raw("year(transact_date)"), "=", pre_y)
        .orderBy("hammer_price", "desc")
        .limit(1);
    }

    top_lot = {
      artist_date: query[0].artist_date,
      company: query[0].company,
      artist: query[0].artist
      ,
      title:
        `${query[0].title_kor == null ? "" : query[0].title_kor}` +
        `${query[0].title_eng == query[0].title_kor || query[0].title_eng == null
          ? ""
          : " (" + query[0].title_eng + ")"
        }`,
      mfg_date: query[0].mfg_date,
      material_eng: `${query[0].material_kor == null ? "" : query[0].material_kor}` + `${query[0].material_eng == null ? "" : query[0].material_eng}`,
      img_url: query[0].img,
      winning_bid: query[0].hammer_price,
      auc_com: query[0].source,
      transact_date: query[0].transact_date,
      size: `${query[0].height == null ? 0 : Number(query[0].height).toFixed(2)}` + '-' + `${query[0].width == null ? 0 : Number(query[0].width).toFixed(2)}` + '-' + `${query[0].depth == null ? 0 : Number(query[0].depth).toFixed(2)}`
    };

    //Top artist
    artist_ko = await knex
      .select(knex.raw("artist_kor, sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw"))
      .sum("hammer_price", { as: "winbid" })
      .count("lot", { as: "total_lot" })
      .count("hammer_price", { as: "win_lot" })
      .from("crawling")
      .whereRaw(
        "(transact_date <= str_to_date('" +
        lastDayOfYear +
        "','%Y-%m-%d'))" +
        "and (transact_date >= str_to_date('" +
        firstDayOfYear +
        "','%Y-%m-%d'))"
      )
      .andWhereRaw(`artist_kor is not null`)
      .andWhere(knex.raw(`(bid_class <> 'w/d' or bid_class is null)`))
      .groupBy("artist_kor")
      .orderBy("winbid", "desc")
      .limit(1);

    if (artist_ko.length == 0) {
      artist_ko = await knex
        .select(knex.raw("artist_kor, sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw"))
        .sum("hammer_price", { as: "winbid" })
        .count("lot", { as: "total_lot" })
        .count("hammer_price", { as: "win_lot" })
        .from("crawling")
        .whereRaw(
          "(transact_date <= str_to_date('" +
          pre_last_date +
          "','%Y-%m-%d'))" +
          "and (transact_date >= str_to_date('" +
          pre_first_date +
          "','%Y-%m-%d'))"
        )
        .andWhereRaw(`artist_kor is not null`)
        .andWhere(knex.raw(`(bid_class <> 'w/d' or bid_class is null)`))
        .groupBy("artist_kor")
        .orderBy("winbid", "desc")
        .limit(1);
    }
    artist_en = await knex
      .select(
        "artist_eng",
        knex.raw("concat_ws('-',case when artist_birth is null then '' else  artist_birth end, case when artist_death is null then '' else  artist_death end ) as aritst_date")
      )
      .from("crawling")
      .where("artist_kor", "=", artist_ko[0].artist_kor)
      .orderBy("artist_eng", "desc", "artist_date", "desc");
    artist_pre = await knex
      .sum("hammer_price", { as: "winbid" })
      .from("crawling")
      .whereRaw(
        "(transact_date <= str_to_date('" +
        pre_last_date +
        "','%Y-%m-%d'))" +
        "and (transact_date >= str_to_date('" +
        pre_first_date +
        "','%Y-%m-%d'))"
      )
      .groupBy("artist_kor")
      .having("artist_kor", "=", artist_ko[0].artist_kor);

    artist_competition = await knex
      .avg("competition", { as: "avg_competition" })
      .from("crawling")
      .where("artist_kor", "=", artist_ko[0].artist_kor)
      .andWhere(knex.raw("year(transact_date)"), "=", cur_y)
      .orderBy("competition", "desc");
    if (artist_competition.length == 0) {
      artist_competition = await knex
        .avg("competition", { as: "avg_competition" })
        .from("crawling")
        .where("artist_kor", "=", artist_ko[0].artist_kor)
        .andWhere(knex.raw("year(transact_date)"), "=", pre_y)
        .orderBy("competition", "desc");
    }
    artist_work = await knex
      .select("*", "img")
      .from("crawling")
      .where("artist_kor", "=", artist_ko[0].artist_kor)
      .orderBy("transact_date", "desc");
    top_artist = {
      artist: (
        `${artist_ko[0].artist_kor == null ? "" : " - " + artist_ko[0].artist_kor
        }` +
        `${artist_en[0].artist_eng == artist_ko[0].artist_kor ||
          artist_en[0].artist_eng == null
          ? ""
          : " - " + artist_en[0].artist_eng
        }`
      ).substr(3),
      artist_date: artist_en[0].aritst_date,
      img_url: artist_work[0].img,
      total_price: artist_ko[0].winbid,
      all_lot: Number(artist_ko[0].total_lot) - artist_ko[0].with_draw == null ? 0 : Number(artist_ko[0].total_lot) - artist_ko[0].with_draw,
      succes_rate: (Number(artist_ko[0].win_lot) / (Number(artist_ko[0].total_lot) - (artist_ko[0].with_draw == null ? 0 : Number(artist_ko[0].with_draw)))) * 100,
      avg_competition: artist_competition[0].avg_competition * 100,
      artist_yoy:
        ((Number(artist_ko[0].winbid) - Number(artist_pre[0].winbid)) / Number(artist_pre[0].winbid)) *
        100,
    };

    //new top 0803
    query = await knex
    .select(knex.raw("artist_date,\
        a.artist as artist,\
        a.win as total_winbid_cur,\
        a.img as img,\
        b.win as total_winbid_pre,\
        ((a.avg_ /b.avg_)-1)*100 as winbid_change,\
        a.total_lot - a.with_draw as total_lot,\
        a.totalBidRate as currentBidRate,\
        b.totalBidRate as preBidRate,\
        (a.totalBidRate/a.total_lot - a.with_draw) * 100 as bid_rate"))
    .fromRaw(" (select \
                    CONCAT_WS('-', artist_kor, artist_eng) AS artist,\
                    MAX(artist_eng) AS artist_eng,\
                    CONCAT_WS('-', artist_birth, artist_death) AS artist_date,\
                    MAX(img) AS img,\
                    SUM(hammer_price) AS win,\
                    avg(hammer_price / if(size_table = 0, 0.7,size_table)) AS avg_,\
                    SUM(IF(lot = 0 or lot is null, 0 ,1 )) as total_lot,\
                    SUM(IF(hammer_price IS NULL OR hammer_price = 0, 0, 1)) AS  totalBidRate,\
                    SUM(case when hammer_price is null or hammer_price = 0 then 0 else 1 end ) / COUNT(lot) * 100 as bid_rate,\
                    sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw\
                FROM crawling\
                WHERE\
                  artist_kor is not null\
                  and year(transact_date) = " + cur_y + " \
                  and (transact_date <= STR_TO_DATE('" + lastDayOfYear + "','%Y-%m-%d'))\
                  and (transact_date >= STR_TO_DATE('" + firstDayOfYear + "','%Y-%m-%d'))\
                  and (material_kind = 'Painting' or material_kind = 'Works on Paper')\
                  and size_table is not null\
                GROUP BY artist\
                HAVING win > 50000000\
                AND total_lot > 2\
                AND bid_rate > 65\
                  ORDER BY avg_ DESC) as a\
      inner join \
      (select \
              CONCAT_WS('-', artist_kor, artist_eng) AS artist,\
              sum(hammer_price) as win,\
              SUM(IF(lot = 0 or lot is null, 0 ,1 )) as total_lot,\
              avg(hammer_price / if(size_table = 0, 0.7,size_table)) AS avg_,\
              sum(IF(hammer_price is null or hammer_price = 0, 0, 1)) as totalBidRate\
      from crawling\
          where artist_kor is not null and year(transact_date) = " + pre_y + "\
          and (transact_date <= STR_TO_DATE('" + pre_last_date + "','%Y-%m-%d'))\
          and (transact_date >= STR_TO_DATE('" + pre_first_date + "','%Y-%m-%d'))\
          and (material_kind = 'Painting' or material_kind = 'Works on Paper')\
          and size_table is not null\
          group by artist\
          HAVING total_lot > 2\
          order by avg_ desc) as b\
              ON a.artist = b.artist")
    .orderBy("winbid_change", "desc")
       
    let above_query = await knex
      .select(knex.raw("hammer_price,COUNT(*) as COUNT,estimate_max"))
      .from("crawling")
      .where(knex.raw("(transact_date <= STR_TO_DATE('" +
        lastDayOfYear +
        "','%Y-%m-%d')) and (transact_date >= STR_TO_DATE('" +
        firstDayOfYear +
        "','%Y-%m-%d')) \
        and concat_ws('-',artist_kor, artist_eng) = '"+
        query[0].artist +
        "'\
        and hammer_price IS NOT NULL\
        and hammer_price > estimate_max\
        AND lot IS NOT NULL"))
    if (above_query.length < 1) {
      above_query[0] = {
        COUNT: 0
      }
    }
    top_outperfomer = {
      artist: query[0].artist,
      artist_date: query[0].artist_date,
      img_url: query[0].img,
      total_winbid_pre: query[0].total_winbid_pre,
      total_winbid_cur: query[0].total_winbid_cur,
      winbid_change: query[0].winbid_change ,
      above_rate: ((above_query[0].COUNT == 0 ? 0 : above_query[0].COUNT)) / (query[0].countbid == 0 ? 1 : query[0].countbid) * 100 > 100 ? 100 : (above_query[0].COUNT) / (query[0].countbid == 0 ? 1 : query[0].countbid) * 100,
      total_lot: query[0].total_lot,//
      bidRate: query[0].bid_rate
    };
    // Rising artist

    query = await knex
      .select(
        knex.raw(
          "a.artist_kor,\
          a.img,\
          a.artist_birth,\
          a.artist_death,\
          a.artist_date,\
          a.artist,\
          a.win as total_winbid_cur,\
          b.win as total_winbid_pre,\
          ((a.win/b.win)-1)*100 as estimate_change,\
          a.count_hm/(a.count_lot - a.with_draw) * 100 as bid_rate"
        )
      )
      .fromRaw(
        "((select artist_kor,\
                  max(artist_eng) as artist_eng,\
                  artist_birth,\
                  artist_death,\
                  concat_ws('-',artist_birth,artist_death) as artist_date,\
                  max(img) as img, sum(hammer_price) as win,\
                  CONCAT_WS('-', artist_kor, artist_eng) AS artist,\
                  Count(case when hammer_price is null or hammer_price = 0 then 0 else 1 end) as count_hm,\
                  Count(lot) as count_lot ,\
                  sum(case when bid_class = 'w/d' then 1 else 0 end) as with_draw\
        from crawling\
        where artist_kor is not null\
        and (transact_date <= STR_TO_DATE('" +
        lastDayOfYear +
        "','%Y-%m-%d'))\
        and (transact_date >= STR_TO_DATE('" +
        firstDayOfYear +
        "','%Y-%m-%d'))\
        and (material_kind = 'Painting' or material_kind = 'Works on Paper')\
                group by artist) as a\
                  left join \
          (select artist_kor,\
                  sum(hammer_price) as win,\
                  CONCAT_WS('-', artist_kor, artist_eng) AS artist\
                  from crawling\
                  where artist_kor is not null\
                  and (transact_date <= STR_TO_DATE('" +
        pre_last_date +
        "','%Y-%m-%d'))\
              and (transact_date >= STR_TO_DATE('" +
        pre_first_date +
        "','%Y-%m-%d'))\
        and (material_kind = 'Painting' or material_kind = 'Works on Paper')\
          group by artist) as b on a.artist = b.artist)\
          where (a.win is not null) and (b.win is not null)")
      .orderBy("estimate_change", "desc");

           
    rising_artist = {
      artist: query[0].artist,
      artist_date: query[0].artist_date,
      img_url: query[0].img,
      total_winbid_pre: query[0].total_winbid_pre,
      total_winbid_cur: query[0].total_winbid_cur,
      estimate_change: query[0].estimate_change ,
      bid_rate: query[0].bid_rate
    };
    res.send({
      result: true,
      msg: "데이터 로드 성공",
      resp: {
        firstDayOfYear: firstDayOfYear,
        lastDayOfYear: lastDayOfYear,
        yoy: yoy,
        biddroping: biddroping,
        yoyLastMonth: last_month_yoy,
        price_distribution: price_distribution,
        top_lot: top_lot,
        top_artist: top_artist,
        top_competition: top_competition,
        top_outperfomer: top_outperfomer,
        rising_artist: rising_artist
      },
    });
  }

}

module.exports = Main;