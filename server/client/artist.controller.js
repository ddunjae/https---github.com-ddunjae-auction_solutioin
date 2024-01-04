const { BOX_WHISPER_PLOT_TIME, SELL_OR_NOT } = require("../utils/strVar");
const knex = require("../config/connectDB");
const moment = require('moment')
  let err_info;
async function main(req, res, next) {
  let artist = req.query.artist_search;
  let db_res
  let success
  let bid_class
  if(artist == undefined){
    artist = "";
  }
  if (artist == undefined) {
    // err_info = {
    //   result: false,
    //   err: 10051,
    //   err_desc: "Please enter the search contents",
    // };

    // res.send(err_info);
  } else {
     db_res = [];
    const currentDate = new Date();
    const cur_date =
      currentDate.getFullYear().toString() +
      "-" +
      (currentDate.getMonth() + 1).toString() +
      "-" +
      currentDate.getDate().toString();
    const req_date =
      req.query.date != undefined ? req.query.date.split("-") : ["", ""];
     success = req.query.success;
     bid_class = req.query.bid_class;
    const auc =
      typeof req.query.auc == "string" ? [req.query.auc] : req.query.auc;
    const location =
      typeof req.query.location == "string"
        ? [req.query.location]
        : req.query.location;
    const material =
      typeof req.query.material == "string"
        ? [req.query.material]
        : req.query.material;
    const material_search = req.query.material_search;
    const onoff = undefined ? +req.query.onoff : undefined;
    const certi = +req.query.certification;
    const title = req.query.title;
    const height =
      req.query.height != undefined ? req.query.height.split("-") : ["", ""];
    const width =
      req.query.width != undefined ? req.query.width.split("-") : ["", ""];
    const pricetp =
      req.query.pricetp != undefined && req.query.pricetp == "winning_bid"
        ? req.query.pricetp
        : "hammer_price";
    const price =
      req.query.price != undefined ? req.query.price.split("-") : ["", ""];
    const mfgDate =
      req.query.mfgDate != undefined ? req.query.mfgDate.split("-") : ["", ""];
      if(mainColorSearch){
        mainColor.push(mainColorSearch)
      };
    const where_fn = function () {
      if (artist) {
        this.where(
          knex.raw(
            `(case 
              when artist_kor is null or artist_kor = '' then artist_eng 
              when artist_eng is null or artist_eng = '' then artist_kor
              else concat_ws('-', artist_kor, artist_eng)
              end
              ) = '${artist.toLowerCase()}'`
          )
        );
      }
      if (title) {
        this.where(
          knex.raw(
            `lower(concat_ws('-',title_kor, title_eng)) like '%${title.toLowerCase()}%'`
          )
        );
      }
      if (material) {
        this.where(function () {
          if (material_search) {
            this.whereIn("material_kind", material).orWhere(
              knex.raw(
                `lower(concat_ws('-',material_kor, material_eng)) like '%${material_search.toLowerCase()}%'`
              )
            );
          } else {
            this.whereIn("material_kind", material);
          }
        });
      } else if (material_search) {
        this.where(
          knex.raw(
            `lower(concat_ws('-',material_kor, material_eng)) like '%${material_search.toLowerCase()}%'`
          )
        );
      }
      if (req_date[0]) {
        this.where(
          knex.raw(`transact_date >= str_to_date('${req_date[0]}','%Y%m%d')`)
        );
      }
      if (req_date[1]) {
        this.where(
          knex.raw(`transact_date <= str_to_date('${req_date[1]}','%Y%m%d')`)
        );
      } else {
        this.where(
          knex.raw(`transact_date >= date_sub(now(), interval 3 year)`)
        );
      }
      if (height[0]) {
        this.where("height", ">=", height[0].replace("%2E", "."));
      }
      if (height[1]) {
        this.where("height", "<=", height[1].replace("%2E", "."));
      }
      if (width[0]) {
        this.where("width", ">=", width[0].replace("%2E", "."));
      }
      if (width[1]) {
        this.where("width", "<=", width[1].replace("%2E", "."));
      }
      if (price[0]) {
        this.where(pricetp, ">=", price[0].replace("%2E", "."));
      }
      if (price[1]) {
        this.where(pricetp, "<=", price[1].replace("%2E", "."));
      }
      if (mfgDate[0]) {
        this.where(knex.raw("left(mfg_date,4)"), ">=", mfgDate[0]);
      }
      if (mfgDate[1]) {
        this.where(knex.raw("left(mfg_date,4)"), "<=", mfgDate[1]);
      }
      if (auc) {
        this.whereIn("company", auc);
      }
      if (location) {
        this.whereIn("location", location);
      }
      if (onoff != undefined) {
        if (onoff) {
          this.where("on_off", "=", "online");
        } else {
          this.where("on_off", "=", "offline");
        }
      }
      if (certi != undefined) {
        if (onoff) {
          this.whereNotNull("certification");
        } else {
          this.where("certification", null); // đang sửa
        }
      }
    };
    // result check
    db_res = await knex.select(knex.raw(`SUM(if(lot = 0 or lot is null, 0 ,1)) as totalLot, 
    SUM(if (hammer_price is null or hammer_price = 0, 0, 1)) / SUM(if (lot is null or lot = 0, 0, 1)) as bidRate, 
    SUM(hammer_price) / SUM(if(hammer_price is null or hammer_price = 0, 0, 1)) as avgHammerPrice, 
    MIN(NULLIF(hammer_price, 0)) as minHammerPrice,
    max(hammer_price) as maxHammerPrice,
    SUM(if(bid_class = 'ABOVE', 1, 0))/ SUM(if (lot is null or lot = 0, 0, 1)) as hammerRange,
    SUM(hammer_price)/SUM(size_table) as avgHammerPricePerSizeTable,
    artist_birth as artistBirth,
    artist.nationality1 as nationality`))
    .from(function () {
      this.from("crawling").where(where_fn).andWhere(knex.raw(`material_kind = 'Painting'`)).as("a");
    }).innerJoin('artist', 'artist.id', '=', 'a.artist_id');

    // console.log("dbres", knex
    // .max("hammer_price", { as: "max" })
    // .min("hammer_price", { as: "min" })
    // .avg("hammer_price", { as: "avg" })
    // .count("*", { as: "total_lot" })
    // .sum("hammer_price", { as: "total_bid" })
    // .count("hammer_price", { as: "winning_lot" })
    // .from(function () {
    //   this.from("crawling").where(where_fn).as("a");
    // }).toQuery())
    if (db_res[0].total_lot == 0) {
      err_info = {
        result: false,
        err: 10053,
        err_desc: "No search results",
      };

      res.send(err_info);
    } else {
      const result_info = {
        max: db_res[0].maxHammerPrice ?? 0,
        min: db_res[0].minHammerPrice ?? 0,
        avg: db_res[0].avgHammerPrice ?? 0,
      };

      const summary = {
        range_max: db_res[0].maxHammerPrice ?? 0,
        range_min: db_res[0].minHammerPrice ?? 0,
        recommended_price: db_res[0].avg ?? 0,
        hammer_range: db_res[0].hammerRange ?? 0,
        avg_hammer_price: db_res[0].avgHammerPrice ?? 0,
        bid_rate: db_res[0].bidRate ?? 0,
        total_bid: db_res[0].total_bid ?? 0,
        total_lot: db_res[0].totalLot ?? 0,
        avg_per_size_table: db_res[0].avgHammerPricePerSizeTable ?? 0,
        artist_birth: db_res[0].artistBirth,
        nationality: db_res[0].nationality
      };

      // bidByMaterial, total_bid
      db_res = await knex
        .select(
          "material_kind",
          knex.raw(
            "sum(case when hammer_price < estimate_min then 1 else 0 end) as below"
          ),
          knex.raw(
            "sum(case when hammer_price > estimate_max then 1 else 0 end) as above"
          )
        )
        .count("*", { as: "total_cnt" })
        .count("hammer_price", { as: "winbid_cnt" })
        .from(function () {
          this.from("crawling").where(where_fn).as("a");
        })
        .groupBy("material_kind")
        .orderBy("total_cnt", "desc");

      let _below = 0;
      let _above = 0;
      let _total_cnt = 0;
      let _winbid_cnt = 0;
      let bidByMaterial = [];
      for (var i = 0; i < db_res.length; i++) {
        let temp = db_res[i];
        _below += Number(temp.below);
        _above += Number(temp.above);
        _total_cnt += temp.total_cnt;
        _winbid_cnt += temp.winbid_cnt;
        bidByMaterial.push({
          material: temp.material_kind,
          below: (temp.below / temp.total_cnt) * 100,
          within:
            ((temp.winbid_cnt - temp.below - temp.above) / temp.total_cnt) *
            100,
          above: (temp.above / temp.total_cnt) * 100,
          not_sold: ((temp.total_cnt - temp.winbid_cnt) / temp.total_cnt) * 100,
          win_rate: (temp.winbid_cnt / temp.total_cnt) * 100,
        });
      }

      let totalBid = {
        below: (_below / _total_cnt) * 100,
        within: ((_winbid_cnt - _below - _above) / _total_cnt) * 100,
        above: (_above / _total_cnt) * 100,
        not_sold: ((_total_cnt - _winbid_cnt) / _total_cnt) * 100,
        win_rate: (_winbid_cnt / _total_cnt) * 100,
      };
      // top 10
      db_res = await knex
        .select(
          knex.raw(
            "*, concat_ws('-',title_kor, title_eng) as title, img,size_table, concat_ws('-',artist_kor, artist_eng) as artist, concat_ws('x', cast(height as decimal(10,2)), cast(width as decimal(10,2)), cast(depth as decimal(10,2))) as size"
          )
        )
        .from(function () {
          this.from("crawling").where(where_fn).as("a");
        })
        .orderBy("hammer_price", "desc")
        .limit(10);
     
      let top10 = [];
      for (var i = 0; i < db_res.length; i++) {
        let temp = db_res[i];
        top10.push({
          no: i + 1,
          title: temp.title,
          material: temp.material_kind,
          mfg_date: temp.mfg_date,
          size: temp.size,
          transact_date: temp.transact_date,
          source: temp.company,
          winning_bid: temp.hammer_price,
          img: temp.img,
          size_table : temp.size_table
        });
      }

      // priceByWinbid
      let price_list = [50000, 30000, 10000, 5000, 1000, 100, 0];
      let sub_query = "";
      for (var j = price_list.length - 1; j >= 0; j--) {
        let price_from = price_list[j];
        sub_query += `sum(case when (hammer_price >= ${price_from * 10000}`;
        if (j != 0) {
          let price_to = price_list[j - 1];
          sub_query += ` and hammer_price < ${price_to * 10000}`;
        }
        sub_query += `) then hammer_price else 0 end) as from${price_from},`;
      }

      console.log(sub_query)

      db_res = await knex
        .select(
          knex.raw(
            "concat(year(transact_date),'.',month(transact_date)) as date"
          ),
          knex.raw(sub_query.substr(0, sub_query.length - 1))
        )
        .count("hammer_price", { as: "total_cnt" })
        .from(function () {
          this.from("crawling").where(where_fn).as("a");
        })
        .groupBy("date");

      let priceByWinbid = {};
      for (var j = price_list.length - 1; j >= 0; j--) {
        let price_from = price_list[j];
        priceByWinbid[`from${price_from}`] = db_res.length != 0 ? parseInt(db_res[0][`from${price_from}`]) : 0;
      }

      // lotByWinbid
      sub_query = "";
      for (var j = price_list.length - 1; j >= 0; j--) {
        let price_from = price_list[j];
        sub_query += `sum(case when (hammer_price >= ${price_from * 10000}`;
        if (j != 0) {
          let price_to = price_list[j - 1];
          sub_query += ` and hammer_price < ${price_to * 10000}`;
        }
        sub_query += `) then 1 else 0 end) as from${price_from},`;
      }
      db_res = await knex
        .select(
          knex.raw(
            "concat(year(transact_date),'.',month(transact_date)) as date"
          ),
          knex.raw(sub_query.substr(0, sub_query.length - 1))
        )
        .count("hammer_price", { as: "total_cnt" })
        .from(function () {
          this.from("crawling").where(where_fn).as("a");
        })
        .groupBy("date");
      let lotByWinbid = {};
      for (var j = price_list.length - 1; j >= 0; j--) {
        let price_from = price_list[j];
        lotByWinbid[`from${price_from}`] = db_res.length != 0 ? parseInt(db_res[0][`from${price_from}`]) : 0;
      }

      // lotByMaterial
      let lotByMaterial = [];
      db_res = await knex
        .select(knex.raw("ifnull(material_kind,'total') as material"))
        .count("*", { as: "total_cnt" })
        .count("hammer_price", { as: "win_cnt" })
        .from(function () {
          this.from("crawling").where(where_fn).as("a");
        })
        .groupBy(knex.raw("material_kind with rollup"));
      for (var i = 0; i < db_res.length; i++) {
        let temp = db_res[i];
        lotByMaterial.push({
          material: temp.material,
          total_cnt: temp.total_cnt,
          win_cnt: temp.win_cnt,
        });
      }

      // resultByPeriod, lotByPeriod, bidByPeriod, medianByPeriod
      const period = ["yearly", "half", "quarter", "monthly"];
      const period_ = [12, 6, 3, 1];
      let resultByPeriod = {};
      let lotByPeriod = {};
      let bidByPeriod = {};
      let medianByPeriod = {};
      let distributionByPeriod = {};
      let avgByPeriod = {};
     
      for (var j = 0; j < 4; j++) {
        let periodRaw
        if (j == 0) {
          periodRaw = "year(transact_date)";
        } else {
          periodRaw = `concat(month(transact_date), '.', ${
            j == 3
              ? `month(transact_date)`
              : `(case ${
                  j == 2 ? ` when month(transact_date) <= 3 then 3` : ""
                } when month(transact_date) <= 6 then 6 ${
                  j == 2 ? `when month(transact_date) <= 9 then 9` : ""
                } else 12 end)`
          })`;
        }
         periodRaw;
        db_res = await knex
          .select(
            knex.raw(
              "min(transact_date) as min_period, max(transact_date) as max_period"
            )
          )
          .from(function () {
            this.select("*", knex.raw(periodRaw))
              .from("crawling")
              .where(where_fn)
              .as("a");
          });
        
        let year; 
        let month;
        let max_period; 
        let month_max_period;
        if(db_res[0].min_period && db_res[0].max_period){
          year = parseInt(db_res[0].min_period.getFullYear());
          month = parseInt(db_res[0].min_period.getMonth());
          max_period = db_res[0].max_period.getFullYear();
          month_max_period = db_res[0].max_period.getMonth();
        }
        resultByPeriod[period[j]] = [];
        lotByPeriod[period[j]] = [];
        bidByPeriod[period[j]] = [];
        medianByPeriod[period[j]] = [];
        distributionByPeriod[period[j]] = [];
        avgByPeriod[period[j]] = [];
        // console.log('avgByPeriod',avgByPeriod);
        // console.log('year', year);
        // console.log('max_period', max_period);
        
        while (year <= parseInt(max_period)) { // đang sửa
          while (true) {
            let value = { date: `${year}${j == 0 ? "" : "." + month}` };
            resultByPeriod[period[j]].push(value);
            lotByPeriod[period[j]].push(value);
            bidByPeriod[period[j]].push(value);
            medianByPeriod[period[j]].push(value);
            distributionByPeriod[period[j]].push(value);
            avgByPeriod[period[j]].push(value);
            
            if (j == 0) {
              break;
            }
            month += period_[j];
            if (month > 12) {
              month = month % 12;
              break;
            }
            if (
              year == parseInt(max_period) &&
              month > parseInt(month_max_period)
            ) {
              break;
            }
          }
          year += 1;
        }

        db_res = await knex
          .select(
            knex.raw(`${periodRaw} as period`),
            knex.raw(
              "sum(case when hammer_price is null then 1 else 0 end) as notsold"
            ),
            knex.raw(
              "sum(case when hammer_price < estimate_min then 1 else 0 end) as below"
            ),
            knex.raw(
              "sum(case when hammer_price > estimate_max then 1 else 0 end) as above"
            ),
            knex.raw(
              "sum(case when hammer_price <= estimate_max and hammer_price >= estimate_min then 1 else 0 end) as within"
            )
          )
          .count("hammer_price", { as: "sold" })
          .count("estimate_max", { as: "es_cnt" })
          .sum("hammer_price", { as: "total_bid" })
          .avg("hammer_price", { as: "winbid_avg" })
          .avg("estimate_min", { as: "esMin_avg" })
          .avg("estimate_max", { as: "esMax_avg" })
          .from(function () {
            this.select("*", knex.raw(periodRaw))
              .from("crawling")
              .where(where_fn)
              .as("a");
          })
          .groupBy(knex.raw(`${periodRaw}`))
          .orderBy(knex.raw("transact_date"));

        let resp3 = [];
        let es_median = [];
        let period_rank = [];

        let index = 0;
        for (var k = 0; k < resultByPeriod[period[j]].length; k++) {
          let temp = db_res[index];
          let notsold = 0;
          let below = 0;
          let above = 0;
          let within = 0;
          let sold = 0;
          let total_bid = 0;
          let winbid_avg = 0;
          let esMin_avg = 0;
          let esMax_avg = 0;
          if (resultByPeriod[period[j]][k].date == temp.period.toString()) {
            notsold = temp.notsold == null ? 0 : temp.notsold;
            below = temp.below == null ? 0 : temp.below;
            above = temp.above == null ? 0 : temp.above;
            within = temp.within == null ? 0 : temp.within;
            sold = temp.sold == null ? 0 : temp.sold;
            total_bid = temp.total_bid == null ? 0 : temp.total_bid;
            winbid_avg = temp.winbid_avg == null ? 0 : temp.winbid_avg;
            esMin_avg = temp.esMin_avg == null ? 0 : temp.esMin_avg;
            esMax_avg = temp.esMax_avg == null ? 0 : temp.esMax_avg;

            period_rank.push(
              `${temp.period}` + "-" + `${Math.ceil(temp.sold / 2)}`
            );
            if (!(temp.sold % 2)) {
              period_rank.push(`${temp.period}` + "-" + `${sold / 2 + 1}`);
            }
            resp3.push({
              date: temp.period.toString(),
              avg: winbid_avg,
            });
            es_median.push(
              `${temp.period}` + "-" + `${Math.ceil(temp.es_cnt / 2)}`
            );
            if (!(temp.es_cnt % 2)) {
              es_median.push(`${temp.period}` + "-" + `${temp.es_cnt / 2 + 1}`);
            }

            index += 1;
          }
          resultByPeriod[period[j]][k].notsold = notsold;
          resultByPeriod[period[j]][k].below = below;
          resultByPeriod[period[j]][k].above = above;
          resultByPeriod[period[j]][k].within = within;
          lotByPeriod[period[j]][k].sold = sold;
          lotByPeriod[period[j]][k].notsold =
            parseInt(notsold) + parseInt(sold);
          lotByPeriod[period[j]][k].total_lot =
            parseInt(notsold) + parseInt(sold);
          lotByPeriod[period[j]][k].total_bid = total_bid;
          avgByPeriod[period[j]][k].esMin = esMin_avg;
          avgByPeriod[period[j]][k].esMax = esMax_avg;
          avgByPeriod[period[j]][k].winbid = winbid_avg;
          bidByPeriod[period[j]][k].avg = winbid_avg;
        }
        db_res = await knex
          .select("period", "ranking", "hammer_price")
          .from(function () {
            this.select(
              "*",
              knex.raw(`${periodRaw} as period`),
              knex.raw(
                `row_number() over(partition by ${periodRaw} order BY hammer_price is null, hammer_price ) as 'ranking'`
              )
            )
              .from("crawling")
              .where(where_fn)
              .as("a");
          })
          .whereIn(knex.raw(`concat(${periodRaw},'-',ranking)`), period_rank)
          .orderBy(knex.raw("transact_date"));
          // console.log(db_res)
          // console.log( knex
          // .select(`${periodRaw} as period`, "ranking", "hammer_price")
          // .from(function () {
          //   this.select(
          //     "*",
          //     knex.raw(`${periodRaw} as period`),
          //     knex.raw(
          //       `row_number() over(partition by ${periodRaw} order BY hammer_price is null, hammer_price ) as 'ranking'`
          //     )
          //   )
          //     .from("crawling")
          //     .where(where_fn)
          //     .as("a");
          // })
          // .whereIn(knex.raw(`concat(${periodRaw},'-',ranking)`), period_rank)
          // .orderBy(knex.raw("transact_date")).toQuery())
        index = 0;
        for (var i = 0; i < db_res.length; i++) {
          let temp = db_res[i];
          if (resp3[index].date != temp.period.toString()) {
            index += 1;
          }
          if (resp3[index].median != undefined) {
            resp3[index].median = (resp3[index].median + temp.hammer_price) / 2;
          } else {
            resp3[index].median =
              temp.hammer_price == null ? 0 : temp.hammer_price;
          }
        }
        index = 0;
        for (var i = 0; i < medianByPeriod[period[j]].length; i++) {
          if (index == resp3.length) {
            medianByPeriod[period[j]][i] = {
              date: medianByPeriod[period[j]][i].date,
              winbid: 0,
            };
            continue;
          }
          if (medianByPeriod[period[j]][i].date == resp3[index].date) {
            medianByPeriod[period[j]][i] = {
              date: medianByPeriod[period[j]][i].date,
              winbid: resp3[index].median,
            };
            bidByPeriod[period[j]][i].median = resp3[index].median;
            index += 1;
          } else {
            medianByPeriod[period[j]][i] = {
              date: medianByPeriod[period[j]][i].date,
              winbid: 0,
            };
            bidByPeriod[period[j]][i].median = 0;
          }
        }
        let db_res1 = await knex
          .select(knex.raw(`${periodRaw} as period, ranking, estimate_min`))
          .from(function () {
            this.select(
              "*",
              knex.raw(`${periodRaw} as period`),
              knex.raw(
                `row_number() over(partition by ${periodRaw} order BY estimate_min is null, estimate_min ) as 'ranking'`
              )
            )
              .from("crawling")
              .where(where_fn)
              .as("a");
          })
          .whereIn(knex.raw(`concat(${periodRaw},'-',ranking)`), es_median)
          .orderBy(knex.raw("transact_date"));

        let db_res2 = await knex
          .select(knex.raw(`${periodRaw} as period, ranking, estimate_max`))
          .from(function () {
            this.select(
              "*",
              knex.raw(`${periodRaw} as period`),
              knex.raw(
                `row_number() over(partition by ${periodRaw} order BY estimate_max is null, estimate_max ) as 'ranking'`
              )
            )
              .from("crawling")
              .where(where_fn)
              .as("a");
          })
          .whereIn(knex.raw(`concat(${periodRaw},'-',ranking)`), es_median)
          .orderBy(knex.raw("transact_date"));

        index = 0;
        for (var i = 0; i < medianByPeriod[period[j]].length; i++) {
          if (index == db_res1.length) {
            medianByPeriod[period[j]][i].esMin = 0;
            medianByPeriod[period[j]][i].esMax = 0;
            continue;
          }
          let temp1 = db_res1[index];
          let temp2 = db_res2[index];

          if (medianByPeriod[period[j]][i].date == temp1.period) {
            if (Object.keys(medianByPeriod[period[j]][i]).includes("esMin")) {
              medianByPeriod[period[j]][i].esMin =
                (medianByPeriod[period[j]][i].esMin + temp1.estimate_min) / 2;
              medianByPeriod[period[j]][i].esMax =
                (medianByPeriod[period[j]][i].esMax + temp2.estimate_max) / 2;
              index += 1;
            } else {
              medianByPeriod[period[j]][i].esMin = temp1.estimate_min;
              medianByPeriod[period[j]][i].esMax = temp2.estimate_max;
            }
          }
          if (
            medianByPeriod[period[j]][i].date.split(".")[0] <
              temp1.period.toString().split(".")[0] ||
            (medianByPeriod[period[j]][i].date.split(".")[0] ==
              temp1.period.toString().split(".")[0] &&
              parseInt(medianByPeriod[period[j]][i].date.split(".")[1]) <
                parseInt(temp1.period.toString().split(".")[1]))
          ) {
            medianByPeriod[period[j]][i].esMin = 0;
            medianByPeriod[period[j]][i].esMax = 0;
          }
          if (
            medianByPeriod[period[j]][i].date.split(".")[0] >
              temp1.period.toString().split(".")[0] ||
            (medianByPeriod[period[j]][i].date.split(".")[0] ==
              temp1.period.toString().split(".")[0] &&
              parseInt(medianByPeriod[period[j]][i].date.split(".")[1]) >
                parseInt(temp1.period.toString().split(".")[1]))
          ) {
            i -= 2;
          }
        }
        // distributionByPeriod
        db_res = await knex
          .select(
            knex.raw(`${periodRaw} as period, group_concat(hammer_price separator ',') as winbid_list`),
          )
          .from(function () {
            this.select("*", knex.raw(periodRaw))
              .from("crawling")
              .where(where_fn)
              .as("a");
          })
          .whereNotNull("hammer_price")
          .groupBy(knex.raw(`${periodRaw}`))
          .orderBy(knex.raw("transact_date"));
        distributionByPeriod[period[j]] = [];
        for (var i = 0; i < db_res.length; i++) {
          let temp = db_res[i];
          distributionByPeriod[period[j]].push({
            date: temp.period,
            bid: temp.winbid_list.split(",").map(function (e) {
              return parseInt(e);
            }),
          });
        }
      }

      const geographicDistribution = await knex.select(knex.raw(`location, SUM(hammer_price) totalBid, COUNT(lot) - SUM(if(bid_class = 'w/d', 1, 0)) as totalLot`)).from("crawling").where(knex.raw(`lower(concat_ws("-",artist_kor, artist_eng)) like '%${artist.toLowerCase()}%'`)).groupBy("location");
      res.send({
        result: true,
        msg: "데이터 로드 성공",
        summary: summary,
        resp: {
          result_info: result_info,
          totalBid: totalBid, //
          // bidByMaterial: bidByMaterial,
          priceByWinbid: priceByWinbid, //
          lotByWinbid: lotByWinbid, //
          top10: top10,//
          lotByMaterial: lotByMaterial, //
          resultByPeriod: resultByPeriod, //
          lotByPeriod: lotByPeriod, //
          bidByPeriod: bidByPeriod, //
          // avgByPeriod: avgByPeriod,
          medianByPeriod: medianByPeriod, //
          distributionByPeriod: distributionByPeriod, //
          geographicDistribution: {
            korea: geographicDistribution.filter((element)=> element.location == "Korea")[0] ?? {
              location: "Korea",
              totalBid: "0",
              totalLot: 0,
            },
            hongKong: geographicDistribution.filter((element)=> element.location == "Hong Kong")[0] ?? {
              location: "Hong Kong",
              totalBid: "0",
              totalLot: 0,
            },
            tokyo: geographicDistribution.filter((element)=> element.location == "Tokyo")[0] ?? {
              location: "Tokyo",
              totalBid: "0",
              totalLot: 0,
            },
            newYork: geographicDistribution.filter((element)=> element.location == "New York")[0] ?? {
              location: "New York",
              totalBid: "0",
              totalLot: 0,
            },
            london: geographicDistribution.filter((element)=> element.location == "London")[0] ?? {
              location: "London",
              totalBid: "0",
              totalLot: 0,
            },
            paris: geographicDistribution.filter((element)=> element.location == "Paris")[0] ?? {
              location: "Paris",
              totalBid: "0",
              totalLot: 0,
            },
            shangHai: geographicDistribution.filter((element)=> element.location == "Shang Hai")[0] ?? {
              location: "Shang Hai",
              totalBid: "0",
              totalLot: 0,
            },
            others: {
              totalBid: geographicDistribution.reduce((preVal, currentVal) => {
                if(!["Korea", "Hong Kong", "Tokyo", "New York", "London", "Paris", "Shang Hai"].includes(currentVal.location)){
                  return preVal + Number(currentVal.totalBid);
                }else{
                  return preVal + 0
                }
              }, 0),
              totalLot: geographicDistribution.reduce((preVal, currentVal) => {
                if(!["Korea", "Hong Kong", "Tokyo", "New York", "London", "Paris", "Shang Hai"].includes(currentVal.location)){
                  return preVal + Number(currentVal.totalLot);
                }else{
                  return preVal + 0
                }
              }, 0)
            }
          }
        },
      });
    }
  }
}

async function getWinningRateAndWinningBid(req, res, next){
  let {
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
    querySearch = '',
    timeFilter,
    mainColor = [],
    mainColorSearch
  } = req.body;
  let db_res
  let success
  let bid_class
     db_res = [];
     const where_fn = function () {
      //Source
      // if (source != undefined) {
      //   this.whereIn("source", auctionName);
      // }
      if(mainColorSearch){
        mainColor.push(...mainColorSearch.split(","));
      };
      // Auction Name
      if (auctionName) {
        this.where(build =>
          build.whereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `)
            .orWhereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `))
      }
      // size Table
      if (sizeTable.length !== 0) {
        this.where(build =>
          build.whereBetween(`crawling.size_table`, [sizeTable[0] === "" ? 0 : sizeTable[0], sizeTable[1] === "" ? 9999 : sizeTable[1]]))
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
              .andWhereBetween(`crawling.${pricetp}`, [price[0] === "" ? 0 : price[0], price[1] === "" ? 99999999999999 : price[1]]))
        }
      }
      //Author
      if (querySearch) {
        this.where(build =>
          build.where(knex.raw(
            `(case 
              when artist_kor is null or artist_kor = '' then artist_eng 
              when artist_eng is null or artist_eng = '' then artist_kor
              else concat_ws('-', artist_kor, artist_eng)
              end
              ) = '${querySearch.toLowerCase()}'`
          ))
        )
      };
      // material Kind
      if (material.length !== 0) {
        this.where(build =>
          build.whereIn('material_kind', material))
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
          build.whereBetween('crawling.height', [height[0] == "" ? 0 : height[0], height[1] == "" ? 99999999 : height[1]]))
      }
      // Width
      if (width.length !== 0) {
        this.where(build =>
          build.whereBetween('crawling.width', [width[0] == "" ? 0 : width[0], width[1] == "" ? 99999999 : width[1]]))
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
        this.where(build =>
          build.whereIn('crawling.bid_class', bidClass))
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
    }
  
  const usd_rate = await knex.select("*").from("to_usd").orderBy('to_usd.date', 'desc');

  const currentMonth = new Date().toLocaleString("us-US", {month: "numeric"});
  const currentYear = new Date().toLocaleString("us-US", {year: "numeric"});
  let timeFilterVar;
  let winningRateAndWinningBid;
  let groupBy;
  let whereClause;
  let orderBy;
  if(timeFilter == BOX_WHISPER_PLOT_TIME.YEARLY){
    timeFilterVar = 'YEAR(transact_date) as timeFilter';
    groupBy = 'YEAR(transact_date)';
    orderBy = 'year(transact_date)'
  }else if(timeFilter == BOX_WHISPER_PLOT_TIME.HALF){
    timeFilterVar = 'concat_ws("-", CEILING(QUARTER(transact_date)/2), year(transact_date)) as timeFilter'
    groupBy = 'year(transact_date), CEILING(QUARTER(transact_date)/2)'
    orderBy = "STR_TO_DATE(concat(year(transact_date), '-0' ,CEILING(QUARTER(transact_date)/2) , '-01'),'%Y-%m-%d')"
    if(currentMonth-6>=0 && currentMonth-6<6){
      whereClause = `transact_date <= '${currentYear}-06-30'`;  
    }else if(currentMonth-6<0){
      whereClause = `transact_date < '${currentYear}-01-01'`;
    }
  }else if(timeFilter == BOX_WHISPER_PLOT_TIME.QUARTER){
    timeFilterVar = 'concat_ws("-", Quarter(transact_date), Year(transact_date)) as timeFilter'
    groupBy = 'concat_ws("-", Quarter(transact_date), Year(transact_date))';
    orderBy = `STR_TO_DATE(concat(year(transact_date), '-0' ,Quarter(transact_date) , '-01'),'%Y-%m-%d')`
  }else{
    timeFilterVar = 'concat_ws("-",  Month(transact_date), Year(transact_date)) as timeFilter'
    groupBy = 'concat_ws("-",  Month(transact_date), Year(transact_date))';
    orderBy = `STR_TO_DATE(concat(year(transact_date),
    case 
      when month(transact_date) >= 10 then concat('-', month(transact_date))
      else concat('-0', month(transact_date))
    end , '-01'), '%Y-%m-%d')`
  }

  if(timeFilter == BOX_WHISPER_PLOT_TIME.HALF){
    if(currentMonth-6==6){
      winningRateAndWinningBid = await knex.select(
        knex.raw(
          `SUM(if(lot = 0 or lot is null, 0, 1)) - SUM(if(bid_class = 'w/d', 1, 0)) as totalLot, 
          SUM(if(hammer_price = 0 or hammer_price is null, 0, 1)) as totalBid, 
          SUM(hammer_price) totalWinningMoney, 
          SUM(hammer_price) * ${usd_rate[0].krw} as totalWinningUsd,
          SUM(if(hammer_price = 0 or hammer_price is null, 0, 1))/(SUM(if(lot = 0 or lot is null, 0, 1)) - SUM(if(bid_class = 'w/d', 1, 0))) as winningRate,${timeFilterVar}`
          ))
        .from("crawling")
        .where(where_fn)
        .groupBy(knex.raw(`${groupBy}`))
        .orderBy(knex.raw(`${orderBy}`), 'desc');
    }else{
      winningRateAndWinningBid = await knex.select(
        knex.raw(
          `SUM(if(lot = 0 or lot is null, 0, 1)) - SUM(if(bid_class = 'w/d', 1, 0)) as totalLot, 
          SUM(if(hammer_price = 0 or hammer_price is null, 0, 1)) as totalBid, 
          SUM(hammer_price) totalWinningMoney, 
          SUM(hammer_price) * ${usd_rate[0].krw} as totalWinningUsd,
          SUM(if(hammer_price = 0 or hammer_price is null, 0, 1))/(SUM(if(lot = 0 or lot is null, 0, 1)) - SUM(if(bid_class = 'w/d', 1, 0))) as winningRate,${timeFilterVar}`
          ))
        .from("crawling")
        .where(knex.raw(whereClause))
        .andWhere(where_fn)
        .groupBy(knex.raw(`${groupBy}`))
        .orderBy(knex.raw(`${orderBy}`), 'desc')
    }
  }else{
    winningRateAndWinningBid = await knex.select(
      knex.raw(
        `SUM(if(lot = 0 or lot is null, 0, 1)) - SUM(if(bid_class = 'w/d', 1, 0)) as totalLot, 
        SUM(if(hammer_price = 0 or hammer_price is null, 0, 1)) as totalBid, 
        SUM(if(hammer_price is null, 0, hammer_price )) as totalWinningMoney, 
        SUM(if(hammer_price is null, 0, hammer_price )) * ${usd_rate[0].krw} as totalWinningUsd,
        SUM(if(hammer_price = 0 or hammer_price is null, 0, 1))/(SUM(if(lot = 0 or lot is null, 0, 1)) - SUM(if(bid_class = 'w/d', 1, 0))) as winningRate,${timeFilterVar}`
        ))
      .from("crawling")
      .where(where_fn)
      .groupBy(knex.raw(`${groupBy}`))
      .orderBy(knex.raw(`${orderBy}`), 'desc');
    }

  res.send({
    result:true,
    message: "successfully!",
    winningRateAndWinningBid: winningRateAndWinningBid
  });
}

async function autoCompleteArtistSearch(req, res){
  const artistName = req.query.artistName;

  const result = await knex.select(knex.raw(`distinct case 
    when artist_kor is null or artist_kor = '' then artist_eng 
    when artist_eng is null or artist_eng = '' then artist_kor
    else concat_ws('-', artist_kor, artist_eng) 
  end as artistName`))
  .from('crawling')
  .where(knex.raw(`artist_kor like '%${artistName}%' or artist_eng like '%${artistName}%' or (case 
    when artist_kor is null or artist_kor = '' then artist_eng 
    when artist_eng is null or artist_eng = '' then artist_kor
    else concat_ws('-', artist_kor, artist_eng)
    end
    ) = '${artistName.toLowerCase()}'`))
  ;

  res.send({
    result:true,
    message: "successfully!",
    result: result
  });
}

async function newMain(req, res){
  let {
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
    locationSearch,
    querySearch = '',
    mainColor = [],
    mainColorSearch,
    method = [],
    seriesSearch,
    preference = []
  } = req.body;
  const where_fn = function () {
    //Source
    // if (source != undefined) {
    //   this.whereIn("source", auctionName);
    // }
    // Auction Name
    if(locationSearch){
      location.push(locationSearch)
    }

    if(mainColorSearch){
      mainColor.push(...mainColorSearch.split(","));
    };

    if (auctionName) {
      this.where(build =>
        build.whereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `)
          .orWhereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `))
    }
    // size Table
    if (sizeTable.length !== 0) {
      this.where(build =>
        build.whereBetween(`crawling.size_table`, [sizeTable[0] === "" ? 0 : sizeTable[0], sizeTable[1] === "" ? 9999 : sizeTable[1]]))
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
            .andWhereBetween(`crawling.${pricetp}`, [price[0] === "" ? 0 : price[0], price[1] === "" ? 99999999999999 : price[1]]))
      }
    }
    //Author
    if (querySearch) {
      this.where(build =>
        build.where(knex.raw(
          `(case 
            when artist_kor is null or artist_kor = '' then artist_eng 
            when artist_eng is null or artist_eng = '' then artist_kor
            else concat_ws('-', artist_kor, artist_eng)
            end
            ) = '${querySearch.toLowerCase()}'`
        ))
      )
    };
    // material Kind
    if (material.length !== 0) {
      this.where(build =>
        build.whereIn('material_kind', material))
    }
    if (materialSearch) {
      this.where(build =>
        build.whereRaw(`LOWER(crawling.material_kor) like '%${materialSearch.trim().toLowerCase()}%'`)
          .orWhereRaw(`LOWER(crawling.material_eng)  like '%${materialSearch.trim().toLowerCase()}%'`))
    };
    // /transactDate
    if (transactDate.length !== 0) {
      this.where(build =>
        build.whereBetween(`crawling.transact_date`, [transactDate[0] === "" ? moment(new Date('0000-01-01')).format('YYYY-MM-DD') : moment(transactDate[0]).format('YYYY-MM-DD'), transactDate[1] == "" ? moment(new Date('9999-01-01')).format('YYYY-MM-DD') : moment(transactDate[1]).format('YYYY-MM-DD')]))
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
        build.whereBetween('crawling.height', [height[0] == "" ? 0 : height[0], height[1] == "" ? 99999999 : height[1]]))
    }
    // Width
    if (width.length !== 0) {
      this.where(build =>
        build.whereBetween('crawling.width', [width[0] == "" ? 0 : width[0], width[1] == "" ? 99999999 : width[1]]))
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
      this.where(build =>
        build.whereIn('crawling.bid_class', bidClass))
    }
    // on Off
    if (onOff) {
      this.where(build =>
        build.whereRaw(`crawling.on_off = '${onOff}'`))
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

    if (method.length !== 0) {
      this.where(build =>
        build.whereIn('crawling.method', method))
    }
    //Series
    if (seriesSearch) { 
      this.where(build =>
          build.whereRaw(`LOWER(crawling.series) like '%${seriesSearch.trim().toLowerCase()}%'`))
    }
    //preference
    if (preference.length !== 0) {
      this.where(build =>
        build.whereIn('crawling.preference', preference))
    }
  }

  // let lotfrom0 = 0;
  // let lotfrom100 = 0;
  // let lotfrom1000 = 0;
  // let lotfrom5000 = 0;
  // let lotfrom10000 = 0;
  // let lotfrom30000 = 0;
  // let lotfrom50000 = 0;
  let query;
  let summary;
  let winBidYearArray = [];
  let winBidHalfArray = [];
  let winBidQuarterArray = [];
  let winBidMonthArray = [];
  let winBidMonthArraySecond = [];
  let lotByPeriod = {};
  let estimateMaxMedian = {};
  let estimateMinMedian = {};
  let hammerPriceMedian = {};
  let hammerPricePerSizeTableMedian = {};
  let totalTransactYear = 0;
  let top10;
  let yearCondition = 'year(transact_date)';
  let halfCondition = 'concat_ws("-", CEILING(QUARTER(transact_date)/2), year(transact_date))';
  let quarterCondition = 'concat_ws("-", Quarter(transact_date), Year(transact_date))';
  let monthCondition = 'concat_ws("-",  Month(transact_date), Year(transact_date))';
  // let bidSum = `sum(if(hammer_price is null and (bid_class != 'w/d' or bid_class is null), 1, 0)) as notSold,
  // sum(case when estimate_min is not null and estimate_max is not null and hammer_price < estimate_min and (bid_class != 'w/d' or bid_class is null) then 1 else 0 end) as below,
	// sum(case when hammer_price > estimate_max and estimate_max is not null and estimate_min is not null and (bid_class != 'w/d' or bid_class is null) then 1 else 0 end)  as above,
	// sum(case when ((hammer_price <= estimate_max and estimate_max is not null) and (hammer_price >= estimate_min and estimate_min is not null) or (estimate_min is null ) or (estimate_max is null )) and (bid_class != 'w/d' or bid_class is null) and hammer_price is not null then 1 else 0 end) as within,
  // SUM(if(hammer_price is not null and (bid_class != 'w/d' or bid_class is null), 1 , 0)) as sold,
  // SUM(if(bid_class = 'w/d', 1, 0)) as totalWd`;
  let bidSum = `sum(CASE WHEN hammer_price < estimate_min and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 THEN 1 ELSE 0 END) AS below,
  SUM(CASE WHEN hammer_price > estimate_max and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 THEN 1 ELSE 0 END) AS above,
  SUM(CASE WHEN ((hammer_price <= estimate_max AND estimate_max IS NOT NULL) AND (hammer_price >= estimate_min AND estimate_min IS NOT NULL) OR (estimate_min IS NULL) OR (estimate_max IS NULL)) AND (bid_class != 'w/d' OR bid_class IS NULL) AND hammer_price IS NOT NULL THEN 1 ELSE 0 END) AS within,
  sum(if(hammer_price is null and (bid_class != 'w/d' or bid_class is null), 1, 0)) as notSold,
  SUM(CASE WHEN hammer_price IS NULL OR hammer_price = 0 THEN 0 ELSE 1 END) AS sold,
  SUM(CASE WHEN bid_class = 'w/d' THEN 1 ELSE 0 END) AS totalWd`
  let distributionByPeriod = {};    
  let materialArray = [];
  let lotByYear = [];
  let lotByHalf = [];
  let lotByQuarter = [];
  let lotByMonth = [];
  let lotByYearMap = {};
  let lotByHalfMap = {};
  let lotByQuarterMap = {};
  let lotByMonthMap = {};

  //sumary

  //=========================================update performance===============================================

  // const testQuery = await knex.select("*").from("crawling").leftJoin('artist', 'artist.id', '=', 'crawling.artist_id').where(where_fn);
 

  summary = await knex.select(knex.raw(`
  SUM(hammer_price/if(size_table = 0, 0.7, size_table)) / SUM(IF(hammer_price is not null, 1, 0)) as avgHammerPricePerSizeTable,
  SUM(if(hammer_price is not null and (bid_class != 'w/d' or bid_class is null), 1 , 0)) as totalSold,
  SUM(if(bid_class = 'w/d', 1, 0)) as totalWd,
  SUM(if(hammer_price is not null and (bid_class != 'w/d' or bid_class is null), hammer_price, 0)) as totalHammerPrice,
  SUM(if(lot is null, 0, 1)) - SUM(if(bid_class = 'w/d', 1, 0)) as totalLot,
  SUM(if(material_kind = 'Painting' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalPainting,
  SUM(if(material_kind = 'Painting' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByPainting,
  SUM(if(material_kind = 'Decorative Art' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalDecorativeArt,
  SUM(if(material_kind = 'Decorative Art' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByDecorativeArt,
  SUM(if(material_kind = 'Others' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalOthers,
  SUM(if(material_kind = 'Others' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByOthers,
  SUM(if(material_kind = 'Edition' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalEdition,
  SUM(if(material_kind = 'Edition' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByEdition,
  SUM(if(material_kind = 'Works on Paper' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalWorksOnPaper,
  SUM(if(material_kind = 'Works on Paper' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByWorksOnPaper,
  SUM(if(material_kind = 'Sculpture' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalSculpture,
  SUM(if(material_kind = 'Sculpture' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceBySculpture,
  SUM(if(material_kind = 'Photo' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalPhoto,
  SUM(if(material_kind = 'Photo' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByPhoto,
  SUM(if(material_kind = 'Multi-media' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalMultiMedia,
  SUM(if(material_kind = 'Multi-media' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByMultiMedia,
  SUM(if(material_kind = 'Books&Manuscripts' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalBooksAndManuscripts,
  SUM(if(material_kind = 'Books&Manuscripts' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByBooksAndManuscripts,
  SUM(if(material_kind = 'Furniture&Design' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalFurnitureAndDesign,
  SUM(if(material_kind = 'Furniture&Design' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByFurnitureAndDesign,
  SUM(if(material_kind = 'Watch&Jewelry&Handbags' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalWatchAndJewelryAndHandbags,
  SUM(if(material_kind = 'Watch&Jewelry&Handbags' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByWatchAndJewelryAndHandbags,
  SUM(if(material_kind = 'Wine&Whisky&Sprits' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalWineAndWhiskyAndSprits,
  SUM(if(material_kind = 'Wine&Whisky&Sprits' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByWineAndWhiskyAndSprits,
  SUM(if(material_kind = '판화' and hammer_price != 0 and hammer_price is not null, 1, 0)) as total판화,
  SUM(if(material_kind = '판화' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceBy판화,
  min(hammer_price) as range_min,
  max(hammer_price) as range_max,
  SUM(if(hammer_price is not null && hammer_price > 0 && hammer_price < 1000000, hammer_price, 0)) as hammerPricefrom0,
  SUM(if(hammer_price is not null && hammer_price >= 1000000 && hammer_price < 10000000, hammer_price, 0)) as hammerPricefrom100,
  SUM(if(hammer_price is not null && hammer_price >= 10000000 && hammer_price < 50000000, hammer_price, 0)) as hammerPricefrom1000,
  SUM(if(hammer_price is not null && hammer_price >= 50000000 && hammer_price < 100000000, hammer_price, 0)) as hammerPricefrom5000,
  SUM(if(hammer_price is not null && hammer_price >= 100000000 && hammer_price < 300000000, hammer_price, 0)) as hammerPricefrom10000,
  SUM(if(hammer_price is not null && hammer_price >= 300000000 && hammer_price < 500000000, hammer_price, 0)) as hammerPricefrom30000,
  SUM(if(hammer_price is not null && hammer_price >= 500000000, hammer_price, 0)) as hammerPricefrom50000,
  SUM(if(hammer_price is not null && hammer_price > 0 && hammer_price < 1000000, 1, 0)) as lotfrom0,
  SUM(if(hammer_price is not null && hammer_price >= 1000000 && hammer_price < 10000000, 1, 0)) as lotfrom100,
  SUM(if(hammer_price is not null && hammer_price >= 10000000 && hammer_price < 50000000, 1, 0)) as lotfrom1000,
  SUM(if(hammer_price is not null && hammer_price >= 50000000 && hammer_price < 100000000, 1, 0)) as lotfrom5000,
  SUM(if(hammer_price is not null && hammer_price >= 100000000 && hammer_price < 300000000, 1, 0)) as lotfrom10000,
  SUM(if(hammer_price is not null && hammer_price >= 300000000 && hammer_price < 500000000, 1, 0)) as lotfrom30000,
  SUM(if(hammer_price is not null && hammer_price >= 500000000, 1, 0)) as lotfrom50000,
  SUM(CASE WHEN hammer_price IS NULL OR hammer_price = 0 THEN 1 ELSE 0 END) AS notSold,
  DATEDIFF(max(transact_date), min(transact_date)) / 365 as totalTransactYear,
  (select max(transact_date) from crawling) as maxTransactDate,
  (select min(transact_date) from crawling) as minTransactDate,
  ${bidSum},
  artist_birth,
  artist.nationality1 `))
  .from("crawling")
  .leftJoin('artist', 'artist.id', '=', 'crawling.artist_id')
  .where(where_fn);

  console.log(knex.select(knex.raw(`
  SUM(hammer_price/if(size_table = 0, 0.7, size_table)) / SUM(IF(hammer_price is not null, 1, 0)) as avgHammerPricePerSizeTable,
  SUM(if(hammer_price is not null and (bid_class != 'w/d' or bid_class is null), 1 , 0)) as totalSold,
  SUM(if(bid_class = 'w/d', 1, 0)) as totalWd,
  SUM(if(hammer_price is not null and (bid_class != 'w/d' or bid_class is null), hammer_price, 0)) as totalHammerPrice,
  SUM(if(lot is null, 0, 1)) - SUM(if(bid_class = 'w/d', 1, 0)) as totalLot,
  SUM(if(material_kind = 'Painting' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalPainting,
  SUM(if(material_kind = 'Painting' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByPainting,
  SUM(if(material_kind = 'Decorative Art' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalDecorativeArt,
  SUM(if(material_kind = 'Decorative Art' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByDecorativeArt,
  SUM(if(material_kind = 'Others' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalOthers,
  SUM(if(material_kind = 'Others' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByOthers,
  SUM(if(material_kind = 'Edition' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalEdition,
  SUM(if(material_kind = 'Edition' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByEdition,
  SUM(if(material_kind = 'Works on Paper' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalWorksOnPaper,
  SUM(if(material_kind = 'Works on Paper' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByWorksOnPaper,
  SUM(if(material_kind = 'Sculpture' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalSculpture,
  SUM(if(material_kind = 'Sculpture' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceBySculpture,
  SUM(if(material_kind = 'Photo' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalPhoto,
  SUM(if(material_kind = 'Photo' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByPhoto,
  SUM(if(material_kind = 'Multi-media' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalMultiMedia,
  SUM(if(material_kind = 'Multi-media' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByMultiMedia,
  SUM(if(material_kind = 'Books&Manuscripts' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalBooksAndManuscripts,
  SUM(if(material_kind = 'Books&Manuscripts' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByBooksAndManuscripts,
  SUM(if(material_kind = 'Furniture&Design' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalFurnitureAndDesign,
  SUM(if(material_kind = 'Furniture&Design' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByFurnitureAndDesign,
  SUM(if(material_kind = 'Watch&Jewelry&Handbags' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalWatchAndJewelryAndHandbags,
  SUM(if(material_kind = 'Watch&Jewelry&Handbags' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByWatchAndJewelryAndHandbags,
  SUM(if(material_kind = 'Wine&Whisky&Sprits' and hammer_price != 0 and hammer_price is not null, 1, 0)) as totalWineAndWhiskyAndSprits,
  SUM(if(material_kind = 'Wine&Whisky&Sprits' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceByWineAndWhiskyAndSprits,
  SUM(if(material_kind = '판화' and hammer_price != 0 and hammer_price is not null, 1, 0)) as total판화,
  SUM(if(material_kind = '판화' and hammer_price != 0 and hammer_price is not null, hammer_price, 0)) as totalHammerPriceBy판화,
  min(hammer_price) as range_min,
  max(hammer_price) as range_max,
  SUM(if(hammer_price is not null && hammer_price > 0 && hammer_price < 1000000, hammer_price, 0)) as hammerPricefrom0,
  SUM(if(hammer_price is not null && hammer_price >= 1000000 && hammer_price < 10000000, hammer_price, 0)) as hammerPricefrom100,
  SUM(if(hammer_price is not null && hammer_price >= 10000000 && hammer_price < 50000000, hammer_price, 0)) as hammerPricefrom1000,
  SUM(if(hammer_price is not null && hammer_price >= 50000000 && hammer_price < 100000000, hammer_price, 0)) as hammerPricefrom5000,
  SUM(if(hammer_price is not null && hammer_price >= 100000000 && hammer_price < 300000000, hammer_price, 0)) as hammerPricefrom10000,
  SUM(if(hammer_price is not null && hammer_price >= 300000000 && hammer_price < 500000000, hammer_price, 0)) as hammerPricefrom30000,
  SUM(if(hammer_price is not null && hammer_price >= 500000000, hammer_price, 0)) as hammerPricefrom50000,
  SUM(if(hammer_price is not null && hammer_price > 0 && hammer_price < 1000000, 1, 0)) as lotfrom0,
  SUM(if(hammer_price is not null && hammer_price >= 1000000 && hammer_price < 10000000, 1, 0)) as lotfrom100,
  SUM(if(hammer_price is not null && hammer_price >= 10000000 && hammer_price < 50000000, 1, 0)) as lotfrom1000,
  SUM(if(hammer_price is not null && hammer_price >= 50000000 && hammer_price < 100000000, 1, 0)) as lotfrom5000,
  SUM(if(hammer_price is not null && hammer_price >= 100000000 && hammer_price < 300000000, 1, 0)) as lotfrom10000,
  SUM(if(hammer_price is not null && hammer_price >= 300000000 && hammer_price < 500000000, 1, 0)) as lotfrom30000,
  SUM(if(hammer_price is not null && hammer_price >= 500000000, 1, 0)) as lotfrom50000,
  SUM(CASE WHEN hammer_price IS NULL OR hammer_price = 0 THEN 1 ELSE 0 END) AS notSold,
  DATEDIFF(max(transact_date), min(transact_date)) / 365 as totalTransactYear,
  (select max(transact_date) from crawling) as maxTransactDate,
  (select min(transact_date) from crawling) as minTransactDate,
  ${bidSum},
  artist_birth,
  artist.nationality1 `))
  .from("crawling")
  .leftJoin('artist', 'artist.id', '=', 'crawling.artist_id')
  .where(where_fn).toQuery())

  query = `SUM(if(hammer_price is not null and (bid_class != 'w/d' or bid_class is null), 1 , 0)) as totalSold,
          SUM(if(hammer_price is null, 0 , hammer_price)) as totalHammerPrice,
          AVG(hammer_price) as avgHammerPrice,`
          
  if(transactDate.length > 0){
    // totalTransactYear = Math.abs(new Date(new Date(transactDate[0]) - new Date(transactDate[1])).getUTCFullYear()- 1970);
    if(transactDate[0] == transactDate[1]){
      totalTransactYear = 1;
    }else{
      totalTransactYear = dayDiff(new Date(transactDate[0]), new Date(transactDate[1])) + 1;
    }
  }else{
    totalTransactYear = dayDiff(new Date(summary[0].minTransactDate), new Date(summary[0].maxTransactDate));
  }  



  lotByYear = await knex.select(knex.raw(`SUM(if(lot is null, 0 , 1)) - sum(if(bid_class = 'w/d', 1, 0)) as totalLot, sum(if(hammer_price is null and (bid_class != 'w/d' or bid_class is null) and estimate_min is not null and estimate_max is not null, 1, 0)) as notSold, ${yearCondition} as 'timeFilter',
  SUM(hammer_price/if(size_table = 0, 0.7, size_table)) / SUM(IF(size_table is not null and hammer_price is not null, 1, 0)) as avgHammerPriceBySizeTable`))
  .from('crawling')
  .where(where_fn)
  .groupBy(knex.raw('year(transact_date)')).orderBy('timeFilter')

  lotByYear.forEach((element)=>{
    lotByYearMap[element.timeFilter] = {
      totalLot: element.totalLot,
      notSold: element.notSold,
      avgHammerPriceBySizeTable: element.avgHammerPriceBySizeTable
    }
  })

  lotByPeriod.yearly = await knex.select(knex.raw(query + `${yearCondition} as 'timeFilter', 
  ${bidSum}`))
  .from('crawling')
  .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0`))
  .groupBy(knex.raw('year(transact_date)')).orderBy('timeFilter')

  for(let i = 0; i< lotByPeriod.yearly.length; i++){
    if(lotByYearMap[lotByPeriod.yearly[i].timeFilter]){
      lotByPeriod.yearly[i].totalLot = lotByYearMap[lotByPeriod.yearly[i].timeFilter].totalLot
      lotByPeriod.yearly[i].notSold = lotByYearMap[lotByPeriod.yearly[i].timeFilter].notSold,
      lotByPeriod.yearly[i].avgHammerPriceBySizeTable = lotByYearMap[lotByPeriod.yearly[i].timeFilter].avgHammerPriceBySizeTable
    }
  }
  
  lotByHalf = await knex.select(knex.raw(`SUM(if(lot is null, 0 , 1)) - sum(if(bid_class = 'w/d', 1, 0)) as totalLot, sum(if(hammer_price is null and (bid_class != 'w/d' or bid_class is null) and estimate_min is not null and estimate_max is not null, 1, 0)) as notSold, ${halfCondition} as 'timeFilter',
  SUM(hammer_price/if(size_table = 0, 0.7, size_table)) / SUM(IF(size_table is not null and hammer_price is not null, 1, 0)) as avgHammerPriceBySizeTable`))
  .from('crawling')
  .where(where_fn)
  .groupBy(knex.raw(`${halfCondition}`))
  .orderBy(knex.raw(`STR_TO_DATE(concat(year(transact_date), '-0' ,CEILING(QUARTER(transact_date)/2) , '-01'),'%Y-%m-%d')`))

  lotByHalf.forEach((element)=>{
    lotByHalfMap[element.timeFilter] = {
      totalLot: element.totalLot,
      notSold: element.notSold,
      avgHammerPriceBySizeTable: element.avgHammerPriceBySizeTable

    }
  })

  lotByPeriod.half = await knex.select(knex.raw(query + `${halfCondition} as 'timeFilter',
  ${bidSum}`))
  .from('crawling')
  .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0`))
  .groupBy(knex.raw(`${halfCondition}`))
  .orderBy(knex.raw(`STR_TO_DATE(concat(year(transact_date), '-0' ,CEILING(QUARTER(transact_date)/2) , '-01'),'%Y-%m-%d')`))

  for(let i = 0; i< lotByPeriod.half.length; i++){
    if(lotByHalfMap[lotByPeriod.half[i].timeFilter]){
      lotByPeriod.half[i].totalLot = lotByHalfMap[lotByPeriod.half[i].timeFilter].totalLot
      lotByPeriod.half[i].notSold = lotByHalfMap[lotByPeriod.half[i].timeFilter].notSold,
      lotByPeriod.half[i].avgHammerPriceBySizeTable = lotByHalfMap[lotByPeriod.half[i].timeFilter].avgHammerPriceBySizeTable
    }
  }

  lotByQuarter = await knex.select(knex.raw(`SUM(if(lot is null, 0 , 1)) - sum(if(bid_class = 'w/d', 1, 0)) as totalLot, sum(if(hammer_price is null and (bid_class != 'w/d' or bid_class is null) and estimate_min is not null and estimate_max is not null, 1, 0)) as notSold, ${quarterCondition} as 'timeFilter',
  SUM(hammer_price/if(size_table = 0, 0.7, size_table)) / SUM(IF(size_table is not null and hammer_price is not null, 1, 0)) as avgHammerPriceBySizeTable`))
  .from('crawling')
  .where(where_fn)
  .groupBy(knex.raw(`${quarterCondition}`))
  .orderBy(knex.raw(`STR_TO_DATE(concat(year(transact_date), '-0' ,Quarter(transact_date) , '-01'),'%Y-%m-%d')`))

  lotByPeriod.quarter = await knex.select(knex.raw(query + `${quarterCondition} as 'timeFilter',
  ${bidSum}`))
  .from('crawling')
  .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0`))
  .groupBy(knex.raw(`${quarterCondition}`))
  .orderBy(knex.raw(`STR_TO_DATE(concat(year(transact_date), '-0' ,Quarter(transact_date) , '-01'),'%Y-%m-%d')`))

  lotByQuarter.forEach((element)=>{
    lotByQuarterMap[element.timeFilter] = {
      totalLot: element.totalLot,
      notSold: element.notSold,
      avgHammerPriceBySizeTable: element.avgHammerPriceBySizeTable
    }
  })

  lotByMonth = await knex.select(knex.raw(`SUM(if(lot is null, 0 , 1)) - sum(if(bid_class = 'w/d', 1, 0)) as totalLot, 
  sum(if(hammer_price is null and (bid_class != 'w/d' or bid_class is null), 1, 0)) as notSold, 
  ${monthCondition} as 'timeFilter',
  SUM(hammer_price/if(size_table = 0, 0.7, size_table)) / SUM(IF(size_table is not null and hammer_price is not null, 1, 0)) as avgHammerPriceBySizeTable`))
  .from('crawling')
  .where(where_fn)
  .groupBy(knex.raw(`${monthCondition}`))
  .orderBy(knex.raw(`STR_TO_DATE(concat(year(transact_date),
  case 
    when month(transact_date) >= 10 then concat('-', month(transact_date))
    else concat('-0', month(transact_date))
  end , '-01'), '%Y-%m-%d')`))

  lotByMonth.forEach((element)=>{
    lotByMonthMap[element.timeFilter] = {
      totalLot: element.totalLot,
      notSold: element.notSold,
      avgHammerPriceBySizeTable: element.avgHammerPriceBySizeTable
    }
  })

  // console.log( knex.select(knex.raw(`SUM(if(lot is null, 0 , 1)) - sum(if(bid_class = 'w/d', 1, 0)) as totalLot, 
  // sum(if(hammer_price is null and (bid_class != 'w/d' or bid_class is null), 1, 0)) as notSold, 
  // ${monthCondition} as 'timeFilter',
  // SUM(hammer_price/if(size_table = 0, 0.7, size_table)) / SUM(IF(hammer_price != 0 and size_table is not null, 1, 0)) as avgHammerPriceBySizeTable`))
  // .from('crawling')
  // .where(where_fn)
  // .groupBy(knex.raw(`${monthCondition}`))
  // .orderBy(knex.raw(`STR_TO_DATE(concat(year(transact_date),
  // case 
  //   when month(transact_date) >= 10 then concat('-', month(transact_date))
  //   else concat('-0', month(transact_date))
  // end , '-01'), '%Y-%m-%d')`)).toQuery())

  lotByPeriod.monthly = await knex.select(knex.raw(query + `${monthCondition} as 'timeFilter',
  ${bidSum}`))
  .from('crawling')
  .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0`))
  .groupBy(knex.raw(`${monthCondition}`))
  .orderBy(knex.raw(`STR_TO_DATE(concat(year(transact_date),
  case 
    when month(transact_date) >= 10 then concat('-', month(transact_date))
    else concat('-0', month(transact_date))
  end , '-01'), '%Y-%m-%d')`))

  lotByMonth.forEach((element)=>{
    if(lotByPeriod.monthly.filter((e)=>e.timeFilter==element.timeFilter).length>0){
    }else{
      lotByPeriod.monthly.push({
        timeFilter: element.timeFilter,
        within: 0,
        above: 0,
        below: 0,
        sold: 0,
        totalHammerPrice: 0,
        avgHammerPrice: 0
      });
    }
  })

  lotByPeriod.monthly.sort(function(a,b) {
    a = a.timeFilter.split("-");
    b = b.timeFilter.split("-");
    return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
  });

  for(let i = 0; i< lotByPeriod.monthly.length; i++){
    if(lotByMonthMap[lotByPeriod.monthly[i].timeFilter]){
      lotByPeriod.monthly[i].totalLot = lotByMonthMap[lotByPeriod.monthly[i].timeFilter].totalLot
      lotByPeriod.monthly[i].notSold = lotByMonthMap[lotByPeriod.monthly[i].timeFilter].notSold
      lotByPeriod.monthly[i].avgHammerPriceBySizeTable = lotByMonthMap[lotByPeriod.monthly[i].timeFilter].avgHammerPriceBySizeTable
    }
  }

  //aa1
  summary[0].bid_rate = parseFloat(summary[0].totalSold) / parseFloat(summary[0].totalLot)
  summary[0].belowPercent = parseFloat(summary[0].below) / parseFloat(summary[0].totalLot)
  summary[0].abovePercent = parseFloat(summary[0].above) / parseFloat(summary[0].totalLot)
  summary[0].within = summary[0].totalSold - summary[0].below - summary[0].above
  summary[0].withinPercent = parseFloat(summary[0].within) / parseFloat(summary[0].totalLot)
  summary[0].notsoldPercent =  parseFloat(summary[0].notSold) / parseFloat(summary[0].totalLot)
  summary[0].soldPercent = summary[0].bid_rate
  summary[0].avg_hammer_price = parseFloat(summary[0].totalHammerPrice) / parseFloat(summary[0].totalSold)
  summary[0].avgLot = parseFloat(summary[0].totalLot) / totalTransactYear
  summary[0].avgWinBid = (parseFloat(summary[0].totalSold) / totalTransactYear) * 365
  summary[0].hammer_range = summary[0].above / summary[0].totalLot;
  //aa3
  summary[0].painting = summary[0].totalPainting / summary[0].totalLot
  summary[0].decorativeArt = summary[0].totalDecorativeArt / summary[0].totalLot
  summary[0].etc = ( parseFloat(summary[0].totalOthers) +  parseFloat(summary[0].totalPhoto) +  parseFloat(summary[0].totalMultiMedia) +  parseFloat(summary[0].totalBooksAndManuscripts) +  parseFloat(summary[0].totalFurnitureAndDesign) + parseFloat(summary[0].totalWatchAndJewelryAndHandbags) + parseFloat(summary[0].totalWineAndWhiskyAndSprits)) / parseFloat(summary[0].totalLot)
  summary[0].edition = summary[0].totalEdition / summary[0].totalLot
  summary[0].worksOnPaper = summary[0].totalWorksOnPaper / summary[0].totalLot
  summary[0].sculpture = summary[0].totalSculpture / summary[0].totalLot
  // summary[0].photo = summary[0].totalPhoto / summary[0].totalLot
  // summary[0].multiMedia = summary[0].totalMultiMedia / summary[0].totalLot
  // summary[0].booksAndManuscripts = summary[0].totalBooksAndManuscripts / summary[0].totalLot
  // summary[0].furnitureAndDesign = summary[0].totalFurnitureAndDesign / summary[0].totalLot
  // summary[0].watchAndJewelryAndHandbags = summary[0].totalWatchAndJewelryAndHandbags / summary[0].totalLot
  // summary[0].wineAndWhiskyAndSprits = summary[0].totalWineAndWhiskyAndSprits / summary[0].totalLot
  materialArray.push({
    materialName: "Painting",
    volume: summary[0].totalPainting / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceByPainting / summary[0].totalHammerPrice)
  })
  materialArray.push({
    materialName: "DecorativeArt",
    volume: summary[0].totalDecorativeArt / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceByDecorativeArt / summary[0].totalHammerPrice)
  })
  materialArray.push({
    materialName: "Edition",
    volume: summary[0].totalEdition / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceByEdition / summary[0].totalHammerPrice)
  })
  materialArray.push({
    materialName: "WorksOnPaper",
    volume: summary[0].totalWorksOnPaper / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceByWorksOnPaper / summary[0].totalHammerPrice)
  })
  materialArray.push({
    materialName: "Sculpture",
    volume: summary[0].totalSculpture / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceBySculpture / summary[0].totalHammerPrice)
  })
  materialArray.push({
    materialName: "Others",
    volume: summary[0].totalOthers / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceByOthers / summary[0].totalHammerPrice)
  })
  materialArray.push({
    materialName: "Photo",
    volume: summary[0].totalPhoto / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceByPhoto / summary[0].totalHammerPrice)
  })
  materialArray.push({
    materialName: "MultiMedia",
    volume: summary[0].totalMultiMedia / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceByMultiMedia / summary[0].totalHammerPrice)
  })

  materialArray.push({
    materialName: "BooksAndManuscripts",
    volume: summary[0].totalBooksAndManuscripts / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceByBooksAndManuscripts / summary[0].totalHammerPrice)
  })
  materialArray.push({
    materialName: "FurnitureAndDesign",
    volume: summary[0].totalFurnitureAndDesign / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceByFurnitureAndDesign / summary[0].totalHammerPrice)
  })
  materialArray.push({
    materialName: "WatchAndJewelryAndHandbags",
    volume: summary[0].totalWatchAndJewelryAndHandbags / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceByWatchAndJewelryAndHandbags / summary[0].totalHammerPrice)
  })
  materialArray.push({
    materialName: "WineAndWhiskyAndSprits",
    volume: summary[0].totalWineAndWhiskyAndSprits / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceByWineAndWhiskyAndSprits / summary[0].totalHammerPrice)
  })

  materialArray.push({
    materialName: "판화",
    volume: summary[0].total판화 / summary[0].totalSold,
    value: parseFloat(summary[0].totalHammerPriceBy판화 / summary[0].totalHammerPrice)
  })

  const materialSorting = materialArray.sort((a,b)=>{
    return b.value - a.value
  })

  const top5Material = materialSorting.slice(0,5) ?? []

  top5Material.push({
    materialName: "etc",
    volume: materialSorting.slice(5, materialSorting.length).reduce((preVal, currentVal)=>{
      if(currentVal.volume){
        return preVal + parseFloat(currentVal.volume)
      }else{
        return preVal + 0
      }
    }, 0),
    value: materialSorting.slice(5, materialSorting.length).reduce((preVal, currentVal)=>{
      if(currentVal.value){
        return preVal + parseFloat(currentVal.value)
      }else{
        return preVal + 0
      }
    }, 0),
  })

  summary[0].top5Material = top5Material;
  summary[0].painting = summary[0].totalPainting / summary[0].totalSold
  summary[0].decorativeArt = summary[0].totalDecorativeArt / summary[0].totalSold
  summary[0].edition = summary[0].totalEdition / summary[0].totalSold
  summary[0].worksOnPaper = summary[0].totalWorksOnPaper / summary[0].totalSold
  summary[0].sculpture = summary[0].totalSculpture / summary[0].totalSold
  summary[0].others = summary[0].totalOthers / summary[0].totalSold
  summary[0].photo = summary[0].totalPhoto / summary[0].totalSold
  summary[0].multiMedia = summary[0].totalMultiMedia / summary[0].totalSold
  summary[0].booksAndManuscripts = summary[0].totalBooksAndManuscripts / summary[0].totalSold
  summary[0].furnitureAndDesign = summary[0].totalFurnitureAndDesign / summary[0].totalSold
  summary[0].watchAndJewelryAndHandbags = summary[0].totalWatchAndJewelryAndHandbags / summary[0].totalSold
  summary[0].wineAndWhiskyAndSprits = summary[0].totalWineAndWhiskyAndSprits / summary[0].totalSold

  // summary[0].photo = summary[0].totalPhoto / summary[0].totalLot
  // summary[0].multiMedia = summary[0].totalMultiMedia / summary[0].totalLot
  // summary[0].booksAndManuscripts = summary[0].totalBooksAndManuscripts / summary[0].totalLot
  // summary[0].furnitureAndDesign = summary[0].totalFurnitureAndDesign / summary[0].totalLot
  // summary[0].watchAndJewelryAndHandbags = summary[0].totalWatchAndJewelryAndHandbags / summary[0].totalLot
  // summary[0].wineAndWhiskyAndSprits = summary[0].totalWineAndWhiskyAndSprits / summary[0].totalLot



  //yearly
  distributionByPeriod.yearly = await knex.select(knex.raw(`hammer_price, ${yearCondition} as timeFilter`)).from('crawling').where(where_fn).where(knex.raw(`hammer_price is not null`)).orderBy('timeFilter')
  const winBidYearMap = {};
  distributionByPeriod.yearly.forEach((element)=>{
    winBidYearMap[element.timeFilter] = [...(winBidYearMap[element.timeFilter] || []), parseFloat(element.hammer_price)]
  })

  const yearArr = distributionByPeriod.yearly.map(item => item.timeFilter)
  .filter((value, index, self) => self.indexOf(value) === index);
  yearArr.forEach((element)=>{
    winBidYearArray.push({
      date: element,
      bid: winBidYearMap[element.toString()].sort((a,b)=> a-b)
    })
  })

  //half
  distributionByPeriod.half = await knex.select(knex.raw(`hammer_price, ${halfCondition} as timeFilter`)).from('crawling').where(where_fn).where(knex.raw(`hammer_price is not null`)).orderBy(knex.raw(`STR_TO_DATE(concat(year(transact_date), '-0' ,CEILING(QUARTER(transact_date)/2) , '-01'),'%Y-%m-%d')`))
  const winBidHalfMap = {};
  distributionByPeriod.half.forEach((element)=>{
    winBidHalfMap[element.timeFilter] = [...(winBidHalfMap[element.timeFilter] || []), parseFloat(element.hammer_price)]
  })
  const halfArr = distributionByPeriod.half.map(item => item.timeFilter)
  .filter((value, index, self) => self.indexOf(value) === index);
  halfArr.forEach((element)=>{
    winBidHalfArray.push({
      date: element,
      bid: winBidHalfMap[element].sort((a,b)=> a-b)
    })
  })

  //quarter
  distributionByPeriod.quarter = await knex.select(knex.raw(`hammer_price, ${quarterCondition} as timeFilter`)).from('crawling').where(where_fn).where(knex.raw(`hammer_price is not null`)).orderBy(knex.raw(`STR_TO_DATE(concat(year(transact_date), '-0' ,Quarter(transact_date) , '-01'),'%Y-%m-%d')`))
  const winBidQuarterMap = {};
  distributionByPeriod.quarter.forEach((element)=>{
    winBidQuarterMap[element.timeFilter] = [...(winBidQuarterMap[element.timeFilter] || []), parseFloat(element.hammer_price)]
  })
  const quarterArr = distributionByPeriod.quarter.map(item => item.timeFilter)
  .filter((value, index, self) => self.indexOf(value) === index);
  quarterArr.forEach((element)=>{
    winBidQuarterArray.push({
      date: element,
      bid: winBidQuarterMap[element].sort((a,b)=> a-b)
    })
  })
  //month
  distributionByPeriod.monthly = await knex.select(knex.raw(`hammer_price, ${monthCondition} as timeFilter, concat_ws("-", day(transact_date), month(transact_date), year(transact_date)) as dayFilter`)).from('crawling').where(where_fn).where(knex.raw(`hammer_price is not null`)).orderBy(knex.raw(`STR_TO_DATE(concat(year(transact_date),
  case 
    when month(transact_date) >= 10 then concat('-', month(transact_date))
    else concat('-0', month(transact_date))
  end , '-01'), '%Y-%m-%d')`))


  const winBidMonthMap = {};
  distributionByPeriod.monthly.forEach((element)=>{
    winBidMonthMap[element.dayFilter] = [...(winBidMonthMap[element.dayFilter] || []), parseFloat(element.hammer_price)]
  })
  const monthArr = distributionByPeriod.monthly.map(item => item.dayFilter)
  .filter((value, index, self) => self.indexOf(value) === index);
  monthArr.forEach((element)=>{
    winBidMonthArray.push({
      date: element,
      bid: winBidMonthMap[element]
    })
  })

  winBidMonthArray.sort(function(a,b) {
    a = a.date.split("-");
    b = b.date.split("-");
    return new Date(parseInt(a[2]), parseInt(a[1]), parseInt(a[0])) - new Date(parseInt(a[2]), parseInt(a[1]), parseInt(a[0]))
  })

  const winBidMonthSecondMap = {};
  distributionByPeriod.monthly.forEach((element)=>{
    winBidMonthSecondMap[element.timeFilter] = [...(winBidMonthSecondMap[element.timeFilter] || []), parseFloat(element.hammer_price)]
  })
  const monthArrSecond = distributionByPeriod.monthly.map(item => item.timeFilter)
  .filter((value, index, self) => self.indexOf(value) === index);
  monthArrSecond.forEach((element)=>{
    winBidMonthArraySecond.push({
      date: element,
      bid: winBidMonthSecondMap[element]
    })
  })

  

  // estimateMaxMedian.yearly = await knex.select(knex.raw(`avg(estimate_max),
	// transactDate`)).from(knex.raw(`(
  //   select
  //       year(transact_date) as transactDate,
  //       estimate_max as ,
  //       row_number() over(partition by year(transact_date)
  //   order by
  //       estimate_max) rowNumber,
  //       count(*) over(partition by year(transact_date)) cnt
  //   from
  //       crawling
  //   where
  //     (((case
  //       when artist_kor is null
  //         or artist_kor = '' then artist_eng
  //         when artist_eng is null
  //         or artist_eng = '' then artist_kor
  //         else concat_ws('-', artist_kor, artist_eng)
  //       end
  //             ) = '강익중-kang ikjoong')
  //       and (material_kind in ('Painting'))
  //         and (year(transact_date) > year(date_sub((select max(transact_date) from crawling ), interval 3 year))))
  // ) as subTable`)).where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`)).groupBy(`transactDate`)

                                //=========================>median<=========================
  //yearly
  
  estimateMaxMedian.yearly = await knex.select(knex.raw(`avg(estimate_max) as estimateMaxMedian,
	timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`if(estimate_max, estimate_max, 0) as estimate_max,
      ${yearCondition} as timeFilter,
      row_number() over(partition by year(transact_date) order by estimate_max) rowNumber,
      count(*) over(partition by year(transact_date)) cnt`))
      .from('crawling')
      .where(where_fn)
      .where(knex.raw(`estimate_max is not null and estimate_max != 0`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy('timeFilter')

  estimateMinMedian.yearly = await knex.select(knex.raw(`avg(estimate_min) as estimateMinMedian,
  timeFilter`))
.from(knex.raw(`(${knex.select(
    knex.raw(`if(estimate_min, estimate_min, 0) as estimate_min,
    ${yearCondition} as timeFilter,
    row_number() over(partition by year(transact_date) order by estimate_min) rowNumber,
    count(*) over(partition by year(transact_date)) cnt`))
    .from('crawling')
    .where(where_fn).where(knex.raw(`estimate_min is not null and estimate_min != 0`))}) as subTable`))
  .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
  .groupBy(knex.raw(`timeFilter`))
  .orderBy('timeFilter')

  hammerPriceMedian.yearly = await knex.select(knex.raw(`avg(hammer_price) as hammerPriceMedian,
	timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`if(hammer_price, hammer_price, 0) as hammer_price,
      ${yearCondition} as timeFilter,
      row_number() over(partition by year(transact_date) order by hammer_price) rowNumber,
      count(*) over(partition by year(transact_date)) cnt`))
      .from('crawling')
      .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy('timeFilter')

  hammerPricePerSizeTableMedian.yearly = await knex.select(knex.raw(`avg(hammerPricePerSizeTable) as hammerPricePerSizeTableMedian,
	timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`hammer_price / if(size_table = 0, 0.7, size_table)
      as hammerPricePerSizeTable,
      ${yearCondition} as timeFilter,
      row_number() over(partition by year(transact_date) order by hammer_price / if(size_table = 0, 0.7, size_table)) rowNumber,
      count(*) over(partition by year(transact_date)) cnt`))
      .from('crawling')
      .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0 and size_table is not null`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy('timeFilter')

  //half

  estimateMaxMedian.half = await knex.select(knex.raw(`avg(estimate_max) as estimateMaxMedian,
	timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`if(estimate_max, estimate_max, 0) as estimate_max,
      ${halfCondition} as timeFilter,
      row_number() over(partition by ${halfCondition} order by estimate_max) rowNumber,
      count(*) over(partition by ${halfCondition}) cnt`))
      .from('crawling')
      .where(where_fn).where(knex.raw(`estimate_max is not null and estimate_max != 0`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', concat('0', timeFilter)) , '%d-%m-%Y')`))

    
  estimateMinMedian.half = await knex.select(knex.raw(`avg(estimate_min) as estimateMinMedian,
  timeFilter`))
.from(knex.raw(`(${knex.select(
    knex.raw(`if(estimate_min, estimate_min, 0) as estimate_min,
    ${halfCondition} as timeFilter,
    row_number() over(partition by ${halfCondition} order by estimate_min) rowNumber,
    count(*) over(partition by ${halfCondition}) cnt`))
    .from('crawling')
    .where(where_fn).where(knex.raw(`estimate_min is not null and estimate_min != 0`))}) as subTable`))
  .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
  .groupBy(knex.raw(`timeFilter`))
  .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', concat('0', timeFilter)) , '%d-%m-%Y')`))


  hammerPriceMedian.half = await knex.select(knex.raw(`avg(hammer_price) as hammerPriceMedian,
	timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`if(hammer_price, hammer_price, 0) as hammer_price,
      ${halfCondition} as timeFilter,
      row_number() over(partition by ${halfCondition} order by hammer_price) rowNumber,
      count(*) over(partition by ${halfCondition}) cnt`))
      .from('crawling')
      .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', concat('0', timeFilter)) , '%d-%m-%Y')`))

  hammerPricePerSizeTableMedian.half = await knex.select(knex.raw(`avg(hammerPricePerSizeTable) as hammerPricePerSizeTableMedian,
  timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`hammer_price / if(size_table = 0, 0.7, size_table)
      as hammerPricePerSizeTable,
      ${halfCondition} as timeFilter,
      row_number() over(partition by ${halfCondition} order by hammer_price / if(size_table = 0, 0.7, size_table)) rowNumber,
      count(*) over(partition by ${halfCondition}) cnt`))
      .from('crawling')
      .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0 and size_table is not null`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', concat('0', timeFilter)) , '%d-%m-%Y')`))
  //quarter

  estimateMaxMedian.quarter = await knex.select(knex.raw(`avg(estimate_max) as estimateMaxMedian,
	timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`if(estimate_max, estimate_max, 0) as estimate_max,
      ${quarterCondition} as timeFilter,
      row_number() over(partition by ${quarterCondition} order by estimate_max) rowNumber,
      count(*) over(partition by ${quarterCondition}) cnt`))
      .from('crawling')
      .where(where_fn).where(knex.raw(`estimate_max is not null and estimate_max != 0`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', concat('0', timeFilter)) , '%d-%m-%Y')`))
  
  estimateMinMedian.quarter = await knex.select(knex.raw(`avg(estimate_min) as estimateMinMedian,
  timeFilter`))
.from(knex.raw(`(${knex.select(
    knex.raw(`if(estimate_min, estimate_min, 0) as estimate_min,
    ${quarterCondition} as timeFilter,
    row_number() over(partition by ${quarterCondition} order by estimate_min) rowNumber,
    count(*) over(partition by ${quarterCondition}) cnt`))
    .from('crawling')
    .where(where_fn).where(knex.raw(`estimate_min is not null and estimate_min != 0`))}) as subTable`))
  .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
  .groupBy(knex.raw(`timeFilter`))
  .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', concat('0', timeFilter)) , '%d-%m-%Y')`))


  hammerPriceMedian.quarter = await knex.select(knex.raw(`avg(hammer_price) as hammerPriceMedian,
	timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`if(hammer_price, hammer_price, 0) as hammer_price,
      ${quarterCondition} as timeFilter,
      row_number() over(partition by ${quarterCondition} order by hammer_price) rowNumber,
      count(*) over(partition by ${quarterCondition}) cnt`))
      .from('crawling')
      .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', concat('0', timeFilter)) , '%d-%m-%Y')`))
  
  hammerPricePerSizeTableMedian.quarter = await knex.select(knex.raw(`avg(hammerPricePerSizeTable) as hammerPricePerSizeTableMedian,
	timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`hammer_price / if(size_table = 0, 0.7, size_table)
      as hammerPricePerSizeTable,
      ${quarterCondition} as timeFilter,
      row_number() over(partition by ${quarterCondition} order by hammer_price / if(size_table = 0, 0.7, size_table)) rowNumber,
      count(*) over(partition by ${quarterCondition}) cnt`))
      .from('crawling')
      .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0 and size_table is not null`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', concat('0', timeFilter)) , '%d-%m-%Y')`))
  //monthly

  estimateMaxMedian.monthly = await knex.select(knex.raw(`avg(estimate_max) as estimateMaxMedian,
  monthTransact,
	timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`if(estimate_max, estimate_max, 0) as estimate_max,
      ${monthCondition} as timeFilter,
      month(transact_date) as monthTransact,
      row_number() over(partition by ${monthCondition} order by estimate_max) rowNumber,
      count(*) over(partition by ${monthCondition}) cnt`))
      .from('crawling')
      .where(where_fn).where(knex.raw(`estimate_max is not null and estimate_max != 0`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', case when monthTransact >=10 then timeFilter else concat('0', timeFilter) end) ,
    '%d-%m-%Y')`))


  estimateMinMedian.monthly = await knex.select(knex.raw(`avg(estimate_min) as estimateMinMedian,
  monthTransact,
  timeFilter`))
  .from(knex.raw(`(${knex.select(
    knex.raw(`if(estimate_min, estimate_min, 0) as estimate_min,
    ${monthCondition} as timeFilter,
    month(transact_date) as monthTransact,
    row_number() over(partition by ${monthCondition} order by estimate_min) rowNumber,
    count(*) over(partition by ${monthCondition}) cnt`))
    .from('crawling')
    .where(where_fn).where(knex.raw(`estimate_min is not null and estimate_min != 0`))}) as subTable`))
  .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
  .groupBy(knex.raw(`timeFilter`))
  .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', case when monthTransact >=10 then timeFilter else concat('0', timeFilter) end),
	'%d-%m-%Y')`))


  hammerPriceMedian.monthly = await knex.select(knex.raw(`avg(hammer_price) as hammerPriceMedian,
  monthTransact,
	timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`if(hammer_price, hammer_price, 0) as hammer_price,
      ${monthCondition} as timeFilter,
      month(transact_date) as monthTransact,
      row_number() over(partition by ${monthCondition} order by hammer_price) rowNumber,
      count(*) over(partition by ${monthCondition}) cnt`))
      .from('crawling')
      .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', case when monthTransact >=10 then timeFilter else concat('0', timeFilter) end) ,
    '%d-%m-%Y')`))

  hammerPricePerSizeTableMedian.monthly = await knex.select(knex.raw(`avg(hammerPricePerSizeTable) as hammerPricePerSizeTableMedian,
  monthTransact,
	timeFilter`))
  .from(knex.raw(`(${knex.select(
      knex.raw(`hammer_price / if(size_table = 0, 0.7, size_table)
      as hammerPricePerSizeTable,
      ${monthCondition} as timeFilter,
      month(transact_date) as monthTransact,
      row_number() over(partition by ${monthCondition} order by hammer_price / if(size_table = 0, 0.7, size_table)) rowNumber,
      count(*) over(partition by ${monthCondition}) cnt`))
      .from('crawling')
      .where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price != 0 and size_table is not null`))}) as subTable`))
    .where(knex.raw(`rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )`))
    .groupBy(knex.raw(`timeFilter`))
    .orderBy(knex.raw(`STR_TO_DATE(concat_ws("-", '01', case when monthTransact >=10 then timeFilter else concat('0', timeFilter) end) ,
    '%d-%m-%Y')`))

    lotByMonth.forEach((element)=>{
      if(hammerPricePerSizeTableMedian.monthly.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        hammerPricePerSizeTableMedian.monthly.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0
        });
      }

      if(hammerPriceMedian.monthly.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        hammerPriceMedian.monthly.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0
        });
      }

      if(estimateMaxMedian.monthly.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        estimateMaxMedian.monthly.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0,
          estimateMinMedian: 0,
        });
      }

      if(estimateMinMedian.monthly.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        estimateMinMedian.monthly.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0,
          estimateMinMedian: 0
        });
      }
    })

  
    hammerPricePerSizeTableMedian.monthly.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    hammerPriceMedian.monthly.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    estimateMaxMedian.monthly.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    estimateMinMedian.monthly.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    lotByYear.forEach((element)=>{
      if(hammerPricePerSizeTableMedian.yearly.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        hammerPricePerSizeTableMedian.yearly.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0
        });
      }

      if(hammerPriceMedian.yearly.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        hammerPriceMedian.yearly.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0
        });
      }

      if(estimateMaxMedian.yearly.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        estimateMaxMedian.yearly.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0,
          estimateMinMedian: 0,
        });
      }

      if(estimateMinMedian.yearly.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        estimateMinMedian.yearly.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0,
          estimateMinMedian: 0
        });
      }
    })

    hammerPricePerSizeTableMedian.yearly.sort(function(a,b) {
      return parseInt(a.timeFilter) - parseInt(b.timeFilter)
    });

    hammerPriceMedian.yearly.sort(function(a,b) {
      return parseInt(a.timeFilter) - parseInt(b.timeFilter)
    });

    estimateMaxMedian.yearly.sort(function(a,b) {
      return parseInt(a.timeFilter) - parseInt(b.timeFilter)

    });

    estimateMinMedian.yearly.sort(function(a,b) {
      return parseInt(a.timeFilter) - parseInt(b.timeFilter)
    });

    lotByQuarter.forEach((element)=>{
      if(hammerPricePerSizeTableMedian.quarter.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        hammerPricePerSizeTableMedian.quarter.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0
        });
      }

      if(hammerPriceMedian.quarter.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        hammerPriceMedian.quarter.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0
        });
      }

      if(estimateMaxMedian.quarter.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        estimateMaxMedian.quarter.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0,
          estimateMinMedian: 0,
        });
      }

      if(estimateMinMedian.quarter.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        estimateMinMedian.quarter.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0,
          estimateMinMedian: 0
        });
      }
    })

    hammerPricePerSizeTableMedian.quarter.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    hammerPriceMedian.quarter.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    estimateMaxMedian.quarter.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    estimateMinMedian.quarter.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    lotByHalf.forEach((element)=>{
      if(hammerPricePerSizeTableMedian.half.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        hammerPricePerSizeTableMedian.half.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0
        });
      }

      if(hammerPriceMedian.half.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        hammerPriceMedian.half.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0
        });
      }

      if(estimateMaxMedian.half.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        estimateMaxMedian.half.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0,
          estimateMinMedian: 0,
        });
      }

      if(estimateMinMedian.half.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        estimateMinMedian.half.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0,
          hammerPricePerSizeTableMedian: 0,
          hammerPriceMedian: 0,
          estimateMinMedian: 0
        });
      }
    })

    hammerPricePerSizeTableMedian.half.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    hammerPriceMedian.half.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    estimateMaxMedian.half.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    estimateMinMedian.half.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    // for(let i = 0; i< lotByPeriod.monthly.length; i++){
    //   if(lotByMonthMap[lotByPeriod.monthly[i].timeFilter]){
    //     lotByPeriod.monthly[i].totalLot = lotByMonthMap[lotByPeriod.monthly[i].timeFilter].totalLot
    //     lotByPeriod.monthly[i].notSold = lotByMonthMap[lotByPeriod.monthly[i].timeFilter].notSold
    //     lotByPeriod.monthly[i].avgHammerPriceBySizeTable = lotByMonthMap[lotByPeriod.monthly[i].timeFilter].avgHammerPriceBySizeTable
    //   }
    // }

    hammerPriceMedian.quarter.forEach((element)=>{
      if(lotByPeriod.quarter.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        lotByPeriod.quarter.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0
        });
      }
    })
  
    lotByPeriod.quarter.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    hammerPriceMedian.half.forEach((element)=>{
      if(lotByPeriod.half.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        lotByPeriod.half.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0
        });
      }
    })
  
    lotByPeriod.half.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    hammerPriceMedian.half.forEach((element)=>{
      if(lotByPeriod.half.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        lotByPeriod.half.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0
        });
      }
    })
  
    lotByPeriod.half.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });

    hammerPriceMedian.yearly.forEach((element)=>{
      if(lotByPeriod.yearly.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        lotByPeriod.yearly.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0
        });
      }
    })
  
    lotByPeriod.yearly.sort(function(a,b) {
      return parseInt(a.timeFilter) - parseInt(b.timeFilter)
    });

    hammerPriceMedian.monthly.forEach((element)=>{
      if(lotByPeriod.monthly.filter((e)=>e.timeFilter==element.timeFilter).length>0){
      }else{
        lotByPeriod.monthly.push({
          timeFilter: element.timeFilter,
          within: 0,
          above: 0,
          below: 0,
          sold: 0,
          totalHammerPrice: 0,
          avgHammerPrice: 0
        });
      }
    })
  
    lotByPeriod.monthly.sort(function(a,b) {
      a = a.timeFilter.split("-");
      b = b.timeFilter.split("-");
      return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });
  
    for(let i = 0; i< lotByPeriod.quarter.length; i++){
      if(lotByQuarterMap[lotByPeriod.quarter[i].timeFilter]){
        lotByPeriod.quarter[i].totalLot = lotByQuarterMap[lotByPeriod.quarter[i].timeFilter].totalLot
        lotByPeriod.quarter[i].notSold = lotByQuarterMap[lotByPeriod.quarter[i].timeFilter].notSold,
        lotByPeriod.quarter[i].avgHammerPriceBySizeTable = lotByQuarterMap[lotByPeriod.quarter[i].timeFilter].avgHammerPriceBySizeTable
      }
    }

  top10 = await knex.select([knex.raw(`case
  when title_kor is null
  or title_kor = '' then title_eng
  when title_eng is null
  or title_eng = '' then title_kor
  else concat_ws('-', title_kor, title_eng)
  end as title`),
  'material_kind',
  'size_table',
  'img',
  'height',
  'width',
  'depth',
  'mfg_date',
  'location',
  'company',
  'transact_date',
  'hammer_price'])
  .from('crawling').where(where_fn).where(knex.raw(`hammer_price is not null and hammer_price !=0`)).orderBy('hammer_price', 'desc').limit(10)

   const geographicDistribution = await knex.select(knex.raw(`location, SUM(hammer_price) totalBid, COUNT(lot) - SUM(if(bid_class = 'w/d', 1, 0)) as totalLot`)).from("crawling").where(where_fn).where(knex.raw(`lower(concat_ws("-",artist_kor, artist_eng)) like '%${querySearch.toLowerCase()}%'`)).where(knex.raw(`hammer_price is not null and hammer_price != 0`)).groupBy("location");

  //=========================================update performance===============================================

  //  let rangeMax = 0;
  //  testQuery.forEach((element)=>{
  //   if(element.hammer_price>rangeMax){
  //     rangeMax = element.hammer_price
  //   }
  // })
  // let range_max = Math.max(...testQuery.map(element=>{
  //   return element.hammer_price
  // })).toString()
  // //range min
  // let range_min = testQuery.sort((a,b)=>{
  //   if(a.hammer_price && b.hammer_price){
  //     return a.hammer_price - b.hammer_price
  //   }
  // })[0].hammer_price ?? 0
  // let avgLot = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.lot != null && currentVal.lot != undefined){
  //     return preVal + 1
  //   }
  // }, 0) / totalTransactYear).toString()
  // let totalSold = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.hammer_price != null && currentVal.hammer_price != undefined && currentVal.hammer_price != 0){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()
  // let totalHammerPrice = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.hammer_price != null && currentVal.hammer_price != undefined){
  //     return preVal + parseFloat(currentVal.hammer_price)
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()
  // let totalLot =  (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.lot != null && currentVal.lot != undefined){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()
  
  // let totalAbove = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.bid_class == 'ABOVE'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let hammerPricePerSizeTable = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.hammer_price != null && currentVal.hammer_price != undefined && currentVal.size_table != 0){
  //     return preVal + currentVal.hammer_price / currentVal.size_table
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let avg_hammer_price = totalHammerPrice / totalTransactYear

  // let hammer_range = totalAbove / totalLot

  // let totalPainting = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'Painting'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let totalDecorativeArt = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'DecorativeArt'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let totalOthers = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'Others'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let totalEdition = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'Edition'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let totalWorksOnPaper = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'WorksOnPaper'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let totalSculpture = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'Sculpture'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let totalPhoto = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'Photo'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let totalMultiMedia = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'MultiMedia'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let totalBooksAndManuscripts = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'BooksAndManuscripts'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let totalFurnitureAndDesign = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'FurnitureAndDesign'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let totalWatchAndJewelryAndHandbags = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'WatchAndJewelryAndHandbags'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let totalWineAndWhiskyAndSprits = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.material_kind == 'WineAndWhiskyAndSprits'){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let hammerPricefrom0 = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.hammer_price > 0 && currentVal.hammer_price < 1000000){
  //     lotfrom0 += 1;
  //     return preVal + parseFloat(currentVal.hammer_price)
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let hammerPricefrom100 = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.hammer_price >= 1000000 && currentVal.hammer_price < 10000000){
  //     lotfrom100 += 1;
  //     return preVal + parseFloat(currentVal.hammer_price)
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let hammerPricefrom1000 = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.hammer_price >= 10000000 && currentVal.hammer_price < 50000000){
  //     lotfrom1000 += 1;
  //     return preVal + parseFloat(currentVal.hammer_price)
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let hammerPricefrom5000 = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.hammer_price >= 50000000 && currentVal.hammer_price < 100000000){
  //     lotfrom5000 += 1;
  //     return preVal + parseFloat(currentVal.hammer_price)
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let hammerPricefrom10000 = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.hammer_price >= 100000000 && currentVal.hammer_price < 300000000){
  //     lotfrom10000 += 1;
  //     return preVal + parseFloat(currentVal.hammer_price)
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let hammerPricefrom30000 = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.hammer_price >= 300000000 && currentVal.hammer_price < 500000000){
  //     lotfrom30000 += 1;
  //     return preVal + parseFloat(currentVal.hammer_price)
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let hammerPricefrom50000 = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.hammer_price >= 500000000 && currentVal.hammer_price < 500000000){
  //     lotfrom50000 += 1;
  //     return preVal + parseFloat(currentVal.hammer_price)
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let notSold = (testQuery.reduce((preVal, currentVal)=>{
  //   if(currentVal.hammer_price == null || currentVal.hammer_price == 0){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let below = (testQuery.reduce((preVal, currentVal)=>{
  //   if(parseFloat(currentVal.hammer_price) < parseFloat(currentVal.estimate_min ?? 0)){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let above = (testQuery.reduce((preVal, currentVal)=>{
  //   if(parseFloat(currentVal.hammer_price) > parseFloat(currentVal.estimate_max ?? 0)){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let within = (testQuery.reduce((preVal, currentVal)=>{
  //   if(parseFloat(currentVal.hammer_price) <= parseFloat(currentVal.estimate_max) && parseFloat(currentVal.hammer_price) >= parseFloat(currentVal.estimate_min)){
  //     return preVal + 1
  //   }else{
  //     return preVal + 0
  //   }
  // }, 0)).toString()

  // let artist_birth = testQuery[0].artist_birth
  // let nationality1 = testQuery[0].nationality1
  // let bid_rate = totalSold / totalLot;
  // let belowPercent = below / totalLot;
  // let abovePercent = above / totalLot;
  // let withinPercent = within / totalLot;
  // let notsoldPercent = notSold / totalLot;
  // let soldPercent = totalSold / totalLot;

  // let painting = totalPainting / totalLot
  // let decorativeArt = totalDecorativeArt / totalLot
  // let etc = ( totalOthers +  totalPhoto +  totalMultiMedia +  totalBooksAndManuscripts +  totalFurnitureAndDesign + totalWatchAndJewelryAndHandbags + totalWineAndWhiskyAndSprits) / totalLot
  // let edition = totalEdition / totalLot
  // let worksOnPaper = totalWorksOnPaper / totalLot
  // let sculpture = totalSculpture / totalLot

    res.send({
      result: true,
      msg: "데이터 로드 성공",
      summary: summary[0],
      // summary2: {
      //   avgLot: avgLot,
      //   avgHammerPricePerSizeTable: (hammerPricePerSizeTable / totalSold).toString(),
      //   totalSold: totalSold,
      //   totalHammerPrice: totalHammerPrice,
      //   avg_hammer_price: avg_hammer_price.toString(),
      //   hammer_range: hammer_range.toString(),
      //   totalLot: totalLot,
      //   totalPainting: totalPainting,
      //   totalDecorativeArt: totalDecorativeArt,
      //   totalOthers: totalOthers,
      //   totalEdition: totalEdition,
      //   totalWorksOnPaper: totalWorksOnPaper,
      //   totalSculpture: totalSculpture,
      //   totalPhoto: totalPhoto,
      //   totalMultiMedia: totalMultiMedia,
      //   totalBooksAndManuscripts: totalBooksAndManuscripts,
      //   totalFurnitureAndDesign: totalFurnitureAndDesign,
      //   totalWatchAndJewelryAndHandbags: totalWatchAndJewelryAndHandbags,
      //   totalWineAndWhiskyAndSprits: totalWineAndWhiskyAndSprits,
      //   range_min: range_min,
      //   range_max: range_max,
      //   hammerPricefrom0: hammerPricefrom0,
      //   hammerPricefrom100: hammerPricefrom100,
      //   hammerPricefrom1000: hammerPricefrom1000,
      //   hammerPricefrom5000: hammerPricefrom5000,
      //   hammerPricefrom10000: hammerPricefrom10000,
      //   hammerPricefrom30000: hammerPricefrom30000,
      //   hammerPricefrom50000: hammerPricefrom50000,
      //   lotfrom0: lotfrom0,
      //   lotfrom100: lotfrom100,
      //   lotfrom1000: lotfrom1000,
      //   lotfrom5000: lotfrom5000,
      //   lotfrom10000: lotfrom10000,
      //   lotfrom30000: lotfrom30000,
      //   lotfrom50000: lotfrom50000,
      //   notSold: notSold,
      //   below: below,
      //   above: above,
      //   within: within,
      //   sold: totalSold,
      //   artist_birth: artist_birth,
      //   nationality1: nationality1,
      //   bid_rate: bid_rate,
      //   belowPercent: belowPercent,
      //   abovePercent: abovePercent,
      //   withinPercent: withinPercent,
      //   notsoldPercent: notsoldPercent,
      //   soldPercent: soldPercent,
      //   painting: painting,
      //   decorativeArt: decorativeArt,
      //   etc: etc,
      //   edition: edition,
      //   worksOnPaper: worksOnPaper,
      //   sculpture: sculpture
      // },
      resp: {
        result_info: "result_info",
        // totalBid: totalBid, //
        // bidByMaterial: bidByMaterial,
        priceByWinbid: {
          from0: parseFloat(summary[0].hammerPricefrom0),
          from100: parseFloat(summary[0].hammerPricefrom100),
          from1000: parseFloat(summary[0].hammerPricefrom1000),
          from5000: parseFloat(summary[0].hammerPricefrom5000),
          from10000: parseFloat(summary[0].hammerPricefrom10000),
          from30000: parseFloat(summary[0].hammerPricefrom30000),
          from50000: parseFloat(summary[0].hammerPricefrom50000)
        }, //
        lotByWinbid: {
          from0: parseFloat(summary[0].lotfrom0),
          from100: parseFloat(summary[0].lotfrom100),
          from1000: parseFloat(summary[0].lotfrom1000),
          from5000: parseFloat(summary[0].lotfrom5000),
          from10000: parseFloat(summary[0].lotfrom10000),
          from30000: parseFloat(summary[0].lotfrom30000),
          from50000: parseFloat(summary[0].lotfrom50000)
        }, //
        distributionByPeriod: {
          yearly: winBidYearArray,
          half: winBidHalfArray,
          quarter: winBidQuarterArray,
          monthly: winBidMonthArray
        },
        distributionByPeriodSecond: {
          yearly: winBidYearArray,
          half: winBidHalfArray,
          quarter: winBidQuarterArray,
          monthly: winBidMonthArraySecond
        },
        lotByPeriod: lotByPeriod,
        top10: top10,
        medianByPeriod: {
          estimateMaxMedian: estimateMaxMedian,
          estimateMinMedian: estimateMinMedian,
          hammerPriceMedian: hammerPriceMedian,
          hammerPricePerSizeTableMedian: hammerPricePerSizeTableMedian
        },
        // lotByMaterial: lotByMaterial, //
        // resultByPeriod: resultByPeriod, //
        // lotByPeriod: lotByPeriod, //
        // bidByPeriod: bidByPeriod, //
        // // avgByPeriod: avgByPeriod,
        // medianByPeriod: medianByPeriod, //
        // distributionByPeriod: distributionByPeriod, //

        geographicDistribution: {
          korea: geographicDistribution.filter((element)=> element.location == "Korea")[0] ?? {
            location: "Korea",
            totalBid: "0",
            totalLot: 0,
          },
          hongKong: geographicDistribution.filter((element)=> element.location == "Hong Kong")[0] ?? {
            location: "Hong Kong",
            totalBid: "0",
            totalLot: 0,
          },
          tokyo: geographicDistribution.filter((element)=> element.location == "Tokyo")[0] ?? {
            location: "Tokyo",
            totalBid: "0",
            totalLot: 0,
          },
          newYork: geographicDistribution.filter((element)=> element.location == "New York")[0] ?? {
            location: "New York",
            totalBid: "0",
            totalLot: 0,
          },
          london: geographicDistribution.filter((element)=> element.location == "London")[0] ?? {
            location: "London",
            totalBid: "0",
            totalLot: 0,
          },
          paris: geographicDistribution.filter((element)=> element.location == "Paris")[0] ?? {
            location: "Paris",
            totalBid: "0",
            totalLot: 0,
          },
          shangHai: geographicDistribution.filter((element)=> element.location == "Shang Hai")[0] ?? {
            location: "Shang Hai",
            totalBid: "0",
            totalLot: 0,
          },
          others: {
            totalBid: geographicDistribution.reduce((preVal, currentVal) => {
              if(!["Korea", "Hong Kong", "Tokyo", "New York", "London", "Paris", "Shang Hai"].includes(currentVal.location)){
                return preVal + Number(currentVal.totalBid);
              }else{
                return preVal + 0
              }
            }, 0),
            totalLot: geographicDistribution.reduce((preVal, currentVal) => {
              if(!["Korea", "Hong Kong", "Tokyo", "New York", "London", "Paris", "Shang Hai"].includes(currentVal.location)){
                return preVal + Number(currentVal.totalLot);
              }else{
                return preVal + 0
              }
            }, 0)
          }
        }
      },
    });
}

function monthDiff(d1, d2) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

async function getLevel2Filters(req, res){
  const artistName = req.query.artistName;

  const result = await knex.select(knex.raw(`DISTINCT main_color as mainColor, preference, series`))
  .from('crawling')
  .where(knex.raw(`artist_kor like '%${artistName}%' or artist_eng like '%${artistName}%' or (case 
    when artist_kor is null or artist_kor = '' then artist_eng 
    when artist_eng is null or artist_eng = '' then artist_kor
    else concat_ws('-', artist_kor, artist_eng)
    end
    ) = '${artistName.toLowerCase()}'`));

    const mainColorMap = {};
    const preferenceMap = {};
    const seriesMap = {};
    let mainColorResult = [];
    let preferenceResult = [];
    let seriesResult = [];

    result.forEach((e)=>{
      if(!mainColorMap[e.mainColor] && e.mainColor != null && e.mainColor != ''){
        mainColorMap[e.mainColor] = e.mainColor;
        mainColorResult.push(e.mainColor)
      }
      if(!preferenceMap[e.preference] && e.preference != null && e.preference != ''){
        preferenceMap[e.preference] = e.preference;
        preferenceResult.push(e.preference)
      }
      if(!seriesMap[e.series] && e.series != null && e.series != ''){
        seriesMap[e.series] = e.series;
        seriesResult.push(e.series)
      }
    })

  res.send({
    result:true,
    message: "successfully!",
    resp: {
      mainColorList: mainColorResult,
      preferenceList: preferenceResult,
      seriesList: seriesResult
    }
  });
}

function dayDiff(d1, d2){
  return Math.ceil((Math.abs(d2 - d1)) / (1000 * 60 * 60 * 24)); 
}

function calculateMedian(fieldName, timeFilter){
  return `select
  avg(${fieldName})
from
  (
  select
    ${timeFilter} as transactDate,
   CAST(${fieldName} as DECIMAL(16,2)),
    row_number() over(partition by  ${timeFilter}
  order by
  ${fieldName}) rowNumber,
    count(*) over(partition by ${timeFilter}) cnt
  from
    crawling
  where
    ${timeFilter} = 'timeFilter'
) as subTable
where
  rowNumber in ( FLOOR((cnt + 1) / 2), FLOOR( (cnt + 2) / 2) )
group by
  transactDate`
}
module.exports = { main, getWinningRateAndWinningBid, autoCompleteArtistSearch, newMain, getLevel2Filters };

