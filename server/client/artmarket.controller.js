
const { NORTH_AMERICA, SOUTHEAST_ASIA, NORTHEAST_ASIA, SOUTH_AMERICA, EUROPE, AFRICA, CENTRAL_WESTERN_ASIA, OCEANIA } = require("../utils/countriesOfContinents");
const knex = require("../config/connectDB");
function Subquery(
  req_date,
  req_pricetp,
  req_price,
  req_mfgDate,
  req_height,
  req_width,
  req_title,
  req_onoff,
  req_certi,
  req_sizeTable
) {
  const date_ = req_date != undefined ? req_date.split("-") : ["", ""];
  const pricetp =
    req_pricetp != undefined && req_pricetp == "winning_bid"
      ? req_pricetp
      : "hammer_price";
  const price = req_price != undefined ? req_price.split("-") : ["", ""];
  const mfgDate = req_mfgDate != undefined ? req_mfgDate.split("-") : ["", ""];
  const height = req_height != undefined ? req_height.split("-") : ["", ""];
  const width = req_width != undefined ? req_width.split("-") : ["", ""];
  const title_search = req_title != undefined ? req_title : undefined;
  const onOff = req_onoff;
  const certification = +req_certi;
  const sizeTable = req_sizeTable != undefined ? req_sizeTable.split("-") : ["", ""]
  // period
  let period_select = [];
  temp = [
    "when month(transact_date) <= 3 then 3 ",
    "when month(transact_date) <= 6 then 6 ",
    "when month(transact_date) <= 9 then 9 ",
  ];
  for (var kind = 0; kind < 4; kind++) {
    if (kind == 0) {
      // 연도별
      periodRaw = "year(transact_date) as period";
    } else {
      periodRaw = "concat(year(transact_date),'.', ";
      if (kind == 3) {
        // 월별
        periodRaw += "month(transact_date)) as period";
      } else {
        periodRaw += "case ";
        if (kind == 1) {
          // 반기별
          periodRaw += temp[1];
        } else {
          // 분기별
          periodRaw += temp[0] + temp[1] + temp[2];
        }
        periodRaw += "else 12 end) as period";
      }
    }
    period_select.push(periodRaw);
  }

  let where_query = "";

  // transact date
  if (date_[0] != "") {
    where_query +=
      " and transact_date >= str_to_date('" + date_[0] + "','%Y%m%d')";
  }
  if (date_[1] != "") {
    where_query +=
      " and transact_date <= str_to_date('" + date_[1] + "','%Y%m%d')";
  }
  // pirce
  if (price[0] != "") {
    where_query += " and " + pricetp + " >=" + price[0];
  }
  if (price[1] != "") {
    where_query += " and " + pricetp + " <=" + price[1];
  }

  // Size table
  if (sizeTable[0] != '') {
    where_query += " and size_table " + " >=" + Number(sizeTable[0])
  }
  if (sizeTable[1] != '') {
    where_query += " and size_table " + " <=" + Number(sizeTable[1])
  }
  // onoff_select
  if (onOff != undefined && onOff != 11) {
    if (onOff === 'online') {
      where_query += " and on_off = 'online'";
    } else if (onOff === 'offline') {
      where_query += " and on_off = 'offline'";
    }
  }
  // certification_select
  if (certification != undefined && certification != 11) {
    if (certification == 1) {
      where_query += " and certification is not null";
    } else if (certification == 0) {
      where_query += " and certification is null";
    }
  }
  // mfg_date 데이터 정리 필요....
  if (mfgDate[0] != "") {
    where_query += " and left(mfg_date, 4) >= " + mfgDate[0];
  }
  if (mfgDate[1] != "") {
    where_query += " and left(mfg_date, 4) <= " + mfgDate[1];
  }
  if (height[0] != "") {
    where_query += " and height >= " + height[0].replace("%2E", ".");
  }
  if (height[1] != "") {
    where_query += " and height <= " + height[1].replace("%2E", ".");
  }
  if (width[0] != "") {
    where_query += " and width >= " + width[0].replace("%2E", ".");
  }
  if (width[1] != "") {
    where_query += " and width <= " + width[1].replace("%2E", ".");
  }
  if (where_query.length > 0) {
    where_query = where_query.substr(4);
  }
  if (title_search != undefined) {
    where_query +=
      " and lower(concat_ws('-',title_kor, title_eng)) like '%" +
      title_search +
      "%'";
  }
  // let where_query;
  if (where_query.substr(0, 4).includes("and")) {
    where_query = where_query.substr(4);
  }
  return_value = {
    where: where_query,
    period: period_select,
    // auc_com: auc_com,
    // material: mate,
  };
  return return_value;
}
let temp;
let periodRaw;
let return_value;
let price_from;
let priceByWinbid;
let lotByWinbid;
let db_res2;
let northAmerica = [];
let southAmerica = [];
let europe = [];
let africa = [];
let northeastAsia = [];
let southeastAsia = [];
let centralWesternAsia = [];
let oceania = [];
let topNationality = ['American', 'British', 'French', 'German', 'Spanish', 'Italian', 'Chinese', 'Japanese', 'Korean']


async function newMain(req, res, next) {
  const query = Subquery(
    req.query.transactDate,
    req.query.pricetp,
    req.query.price,
    req.query.mfgDate,
    req.query.height,
    req.query.width,
    req.query.title,
    req.query.onOff,
    req.query.certi,
    req.query.sizeTable
  );
  const auc =
    typeof req.query.company == "string" ? req.query.company.split("-") : undefined;
  const location =
    typeof req.query.location == "string"
      ? req.query.location.split("-") : undefined;
  if (req.query.locationSearch) {
    if (location !== 'undefined')
      location = location.push(req.query.locationSearch)
  }
  const material =
    typeof req.query.material == "string"
      ? req.query.material.split("-") : undefined;
  const material_search = req.query.material_search;

  const where_fn = function () {
    if (material != undefined) {
      this.where(function () {
        if (material_search != undefined) {
          this.whereIn("material_kind", material).orWhere(
            knex.raw(
              `lower(concat_ws('-',material_kor, material_eng)) like '%${material_search.toLowerCase()}%'`
            )
          );
        } else {
          this.whereIn("material_kind", material);
        }
      });
    } else if (material_search != undefined) {
      this.where(
        knex.raw(
          `lower(concat_ws('-',material_kor, material_eng)) like '%${material_search.toLowerCase()}%'`
        )
      );
    }
    if (auc != undefined) {
      this.whereIn("company", auc);
    }
    if (location != undefined) {
      this.whereIn("location", location);
    }
  };

  let db_res = await knex
    .select(knex.raw("SUM(CASE WHEN (hammer_price IS NULL OR hammer_price = 0) and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS notsold,\
    SUM(CASE WHEN hammer_price IS NULL OR hammer_price = 0 THEN 0 ELSE 1 END) AS sold,\
    SUM(CASE WHEN bid_class = 'w/d' THEN 1 ELSE 0 END) AS with_draw"),
      knex.raw("COUNT(`lot`) - COUNT(case when bid_class = 'w/d' then lot else null end) AS `cnt`"))
    .sum("hammer_price", { as: "total_bid" })
    .from("crawling")
    .where(where_fn)
    .whereRaw(query.where)
    .where(knex.raw("lot is not null and lot <> 0"));

  let summary = {
    total_bid: db_res[0].total_bid,
    total_lot: Number(db_res[0].sold) + Number(db_res[0].notsold),
    hammer_rate: (Number(db_res[0].sold) / (Number(db_res[0].sold) + Number(db_res[0].notsold))) * 100,
    number_of_winbid: Number(db_res[0].sold)
  }

  // query lấy năm 
  db_res = await knex
    .select(knex.raw("MAX(`transact_date`) AS max_transact_date,\
            YEAR(transact_date) as period,\
            sum(case when artist_kor in ('김창열', '이우환', '박서보', '정상화', '하종현', '윤형근', '정창섭', '김기린', '권영우', '서세옥', '곽인식' ) and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupa,\
            sum(case when artist_kor in ('이강소', '이건용', '김구림', '김태호', '이배', '남춘모', '전광영', '이승조', '서승원', '윤명 로', '안영일', '최명영', '오수환', '심문섭', '이동엽') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupb,\
            sum(case when artist_kor in ('김환기', '유영국', '이성자', '이중섭', '박수근', '천경자', '이대원', '도상봉', '오지호', '권옥연', '박고석', '장욱진', '남관', '이응노', '백남준', '황염수', '김종학', '임직순', '김형근', '류경채', '김흥수', '최영림', '권진규', '이인성', '윤중식', '전혁림', '변종하', '이만익', '변시지', '문신', '황용엽') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupc,\
            sum(case when artist_kor in ('오치균', '이왈종', '최영욱', '윤병락', '김강용', '고영훈', '최울가', '황재형', '강요배', '강익중', '권순철', '이숙자', '오윤', '손상기', '최욱경', '황영성', '임옥상', '배병우', '노은님', '오세열', '김홍주', '김병종', '안창홍', '신학철', '강형구', '이동기', '김동유', '이정웅', '사석원') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupd,\
            sum(case when artist_kor in ('우국원', '문형태', '김선우','하태임', '정영주', '도성욱', '장마리아', '콰야', '진영', '청신', '콰야', '정해윤', '권기수', '최소영', '마리킴', '안성하') and (bid_class <> 'w/d' or bid_class is null)then hammer_price  else 0 end)/sum(hammer_price)*100 as groupe,\
            COUNT(CASE WHEN (estimate_min >= 0 AND estimate_min < 1000000) THEN hammer_price ELSE NULL END) AS from0_esm_by_period_hammer_price,\
            COUNT(CASE WHEN (estimate_min >= 0 AND estimate_min < 1000000) THEN lot ELSE NULL  END) AS from0_esm_by_period_lot,\
            COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 0 AND estimate_min < 1000000 THEN lot ELSE NULL END) AS from0_esm_by_period_wd,\
            COUNT(CASE WHEN (estimate_min >= 1000000 AND estimate_min < 10000000) THEN hammer_price ELSE NULL END) AS from100_esm_by_period_hammer_price,\
            COUNT(CASE WHEN (estimate_min >= 1000000 AND estimate_min < 10000000) THEN lot ELSE NULL END) AS from100_esm_by_period_lot,\
            COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D')  AND estimate_min >= 1000000 AND estimate_min < 10000000 THEN lot ELSE NULL END) AS from100_esm_by_period_wd,\
            COUNT(CASE WHEN (estimate_min >= 10000000  AND estimate_min < 50000000) THEN hammer_price  ELSE NULL END) AS from1000_esm_by_period_hammer_price,\
            COUNT(CASE WHEN (estimate_min >= 10000000  AND estimate_min < 50000000) THEN lot ELSE NULL END) AS from1000_esm_by_period_lot,\
            COUNT(CASE WHEN  (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 10000000 AND estimate_min < 50000000  THEN lot ELSE NULL END) AS from1000_esm_by_period_wd,\
            COUNT(CASE WHEN (estimate_min >= 50000000 AND estimate_min < 100000000) THEN hammer_price ELSE NULL END) AS from5000_esm_by_period_hammer_price,\
            COUNT(CASE  WHEN (estimate_min >= 50000000 AND estimate_min < 100000000) THEN lot ELSE NULL END) AS from5000_esm_by_period_lot,\
            COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D')  AND estimate_min >= 50000000 AND estimate_min < 100000000 THEN lot ELSE NULL END) AS from5000_esm_by_period_wd,\
            COUNT(CASE  WHEN (estimate_min >= 100000000 AND estimate_min < 300000000) THEN hammer_price  ELSE NULL END) AS from10000_esm_by_period_hammer_price,\
            COUNT(CASE WHEN  (estimate_min >= 100000000 AND estimate_min < 300000000) THEN  lot ELSE NULL END) AS from10000_esm_by_period_lot,\
            COUNT(CASE  WHEN  (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 100000000 AND estimate_min < 300000000 THEN  lot ELSE NULL END) AS from10000_esm_by_period_wd,\
            COUNT(CASE WHEN (estimate_min >= 300000000  AND estimate_min < 500000000) THEN hammer_price ELSE NULL END) AS from30000_esm_by_period_hammer_price,\
            COUNT(CASE WHEN (estimate_min >= 300000000 AND estimate_min < 500000000) THEN lot  ELSE NULL END) AS from30000_esm_by_period_lot,\
            COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 300000000 AND estimate_min < 500000000 THEN lot  ELSE NULL END) AS from30000_esm_by_period_wd,\
            COUNT(CASE WHEN (estimate_min >= 500000000) THEN hammer_price ELSE NULL END) AS from50000_esm_by_period_hammer_price,\
            COUNT(CASE WHEN (estimate_min >= 500000000) THEN lot   ELSE NULL END) AS from50000_esm_by_period_lot,\
            COUNT(CASE  WHEN  (bid_class = 'w/d' OR bid_class = 'W/D')   AND estimate_min >= 500000000 THEN lot ELSE NULL END) AS from50000_esm_by_period_wd,\
            SUM(CASE  WHEN on_off = 'online' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS online1,\
            SUM(CASE  WHEN on_off = 'offline' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS offline1,\
            SUM(CASE WHEN (hammer_price >= 0 AND hammer_price < 1000000) THEN  hammer_price  ELSE 0 END) AS from0_bid_by_period,\
            SUM(CASE  WHEN (hammer_price >= 1000000 AND hammer_price < 10000000) THEN hammer_price ELSE 0 END) AS from100_bid_by_period,\
            SUM(CASE  WHEN (hammer_price >= 10000000 AND hammer_price < 50000000) THEN hammer_price  ELSE 0 END) AS from1000_bid_by_period,\
            SUM(CASE  WHEN (hammer_price >= 50000000 AND hammer_price < 100000000) THEN hammer_price ELSE 0 END) AS from5000_bid_by_period,\
            SUM(CASE WHEN (hammer_price >= 100000000  AND hammer_price < 300000000) THEN  hammer_price ELSE 0  END) AS from10000_bid_by_period,\
            SUM(CASE  WHEN  (hammer_price >= 300000000  AND hammer_price < 500000000)  THEN  hammer_price ELSE 0 END) AS from30000_bid_by_period,\
            SUM(CASE WHEN (hammer_price >= 500000000) THEN hammer_price ELSE 0 END) AS from50000_bid_by_period,\
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
    .where(where_fn)
    .whereRaw(query.where)
    .groupBy("period")
    .orderBy("max_transact_date");
    
  let yearSortEsm = db_res.sort((a, b) => Number(b.max_transact_date.getFullYear()) - Number(a.max_transact_date.getFullYear())).slice(0, 4)
  let lotByPeriod = {};
  let esmByPeriod = {};
  let onOff = {};
  let bidByPeriod = {};
  let resultByPeriod = {};
  let groupByPeriod = {};
  let totalgroupByPeriodYear = [];
  let totalBidByPeriodYear = [];
  let totalOnOffYear = [];
  let totalResultByPeriodYear = [];
  let dataLotByPeriodYear = [];
  let price_list = [50000, 30000, 10000, 5000, 1000, 100, 0];
  let dataEsmByPeriodYear = []
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
    let dataBidByPeriod = {
      date: db_res[i].period.toString(),
      from0: db_res[i].from0_bid_by_period,
      from100: db_res[i].from100_bid_by_period,
      from1000: db_res[i].from1000_bid_by_period,
      from5000: db_res[i].from5000_bid_by_period,
      from10000: db_res[i].from10000_bid_by_period,
      from30000: db_res[i].from30000_bid_by_period,
      from50000: db_res[i].from50000_bid_by_period,
    }
    totalBidByPeriodYear.push(dataBidByPeriod);
    let dataOnoff = {
      date: db_res[i].period.toString(),
      online: db_res[i].online1,
      offline: db_res[i].offline1
    };
    totalOnOffYear.push(dataOnoff);

    let dataGroupByPeriod = {
      date: db_res[i].period.toString(),
      a: Number(db_res[i].groupa),
      b: Number(db_res[i].groupb),
      c: Number(db_res[i].groupc),
      d: Number(db_res[i].groupd),
      e: Number(db_res[i].groupe),
    }
    totalgroupByPeriodYear.push(dataGroupByPeriod);
    for (let j = 0; j < yearSortEsm.length; j++) {
      if (yearSortEsm[j].period == db_res[i].period) {
        let dataEsmByPeriodMonthly = {
          date: db_res[i].period.toString(),
          from0: Number(db_res[i].from0_esm_by_period_hammer_price) / (Number(db_res[i].from0_esm_by_period_lot) - Number(db_res[i].from0_esm_by_period_wd)),
          from100: Number(db_res[i].from100_esm_by_period_hammer_price) / (Number(db_res[i].from100_esm_by_period_lot) - Number(db_res[i].from100_esm_by_period_wd)),
          from1000: Number(db_res[i].from1000_esm_by_period_hammer_price) / (Number(db_res[i].from1000_esm_by_period_lot) - Number(db_res[i].from1000_esm_by_period_wd)),
          from5000: Number(db_res[i].from5000_esm_by_period_hammer_price) / (Number(db_res[i].from5000_esm_by_period_lot) - Number(db_res[i].from5000_esm_by_period_wd)),
          from10000: Number(db_res[i].from10000_esm_by_period_hammer_price) / (Number(db_res[i].from10000_esm_by_period_lot) - Number(db_res[i].from10000_esm_by_period_wd)),
          from30000: Number(db_res[i].from30000_esm_by_period_hammer_price) / (Number(db_res[i].from30000_esm_by_period_lot) - Number(db_res[i].from30000_esm_by_period_wd)),
          from50000: Number(db_res[i].from50000_esm_by_period_hammer_price) / (Number(db_res[i].from50000_esm_by_period_lot) - Number(db_res[i].from50000_esm_by_period_wd)),
        };
        dataEsmByPeriodYear.push(dataEsmByPeriodMonthly)
      }
    }
  };

  // nửa năm
  db_res = await knex
    .select(knex.raw("MAX(`transact_date`) AS max_transact_date,\
                      CONCAT(YEAR(transact_date),'.', CASE WHEN MONTH(transact_date) <= 6 THEN 6 ELSE 12 END) AS period,\
                      sum(case when artist_kor in ('김창열', '이우환', '박서보', '정상화', '하종현', '윤형근', '정창섭', '김기린', '권영우', '서세옥', '곽인식' ) and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupa,\
                      sum(case when artist_kor in ('이강소', '이건용', '김구림', '김태호', '이배', '남춘모', '전광영', '이승조', '서승원', '윤명 로', '안영일', '최명영', '오수환', '심문섭', '이동엽') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupb,\
                      sum(case when artist_kor in ('김환기', '유영국', '이성자', '이중섭', '박수근', '천경자', '이대원', '도상봉', '오지호', '권옥연', '박고석', '장욱진', '남관', '이응노', '백남준', '황염수', '김종학', '임직순', '김형근', '류경채', '김흥수', '최영림', '권진규', '이인성', '윤중식', '전혁림', '변종하', '이만익', '변시지', '문신', '황용엽') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupc,\
                      sum(case when artist_kor in ('오치균', '이왈종', '최영욱', '윤병락', '김강용', '고영훈', '최울가', '황재형', '강요배', '강익중', '권순철', '이숙자', '오윤', '손상기', '최욱경', '황영성', '임옥상', '배병우', '노은님', '오세열', '김홍주', '김병종', '안창홍', '신학철', '강형구', '이동기', '김동유', '이정웅', '사석원') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupd,\
                      sum(case when artist_kor in ('우국원', '문형태', '김선우','하태임', '정영주', '도성욱', '장마리아', '콰야', '진영', '청신', '콰야', '정해윤', '권기수', '최소영', '마리킴', '안성하') and (bid_class <> 'w/d' or bid_class is null)then hammer_price  else 0 end)/sum(hammer_price)*100 as groupe,\
                      COUNT(CASE WHEN (estimate_min >= 0 AND estimate_min < 1000000) THEN hammer_price ELSE NULL END) AS from0_esm_by_period_hammer_price,\
                      COUNT(CASE WHEN (estimate_min >= 0 AND estimate_min < 1000000) THEN lot ELSE NULL  END) AS from0_esm_by_period_lot,\
                      COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 0 AND estimate_min < 1000000 THEN lot ELSE NULL END) AS from0_esm_by_period_wd,\
                      COUNT(CASE WHEN (estimate_min >= 1000000 AND estimate_min < 10000000) THEN hammer_price ELSE NULL END) AS from100_esm_by_period_hammer_price,\
                      COUNT(CASE WHEN (estimate_min >= 1000000 AND estimate_min < 10000000) THEN lot ELSE NULL END) AS from100_esm_by_period_lot,\
                      COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D')  AND estimate_min >= 1000000 AND estimate_min < 10000000 THEN lot ELSE NULL END) AS from100_esm_by_period_wd,\
                      COUNT(CASE WHEN (estimate_min >= 10000000  AND estimate_min < 50000000) THEN hammer_price  ELSE NULL END) AS from1000_esm_by_period_hammer_price,\
                      COUNT(CASE WHEN (estimate_min >= 10000000  AND estimate_min < 50000000) THEN lot ELSE NULL END) AS from1000_esm_by_period_lot,\
                      COUNT(CASE WHEN  (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 10000000 AND estimate_min < 50000000  THEN lot ELSE NULL END) AS from1000_esm_by_period_wd,\
                      COUNT(CASE WHEN (estimate_min >= 50000000 AND estimate_min < 100000000) THEN hammer_price ELSE NULL END) AS from5000_esm_by_period_hammer_price,\
                      COUNT(CASE  WHEN (estimate_min >= 50000000 AND estimate_min < 100000000) THEN lot ELSE NULL END) AS from5000_esm_by_period_lot,\
                      COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D')  AND estimate_min >= 50000000 AND estimate_min < 100000000 THEN lot ELSE NULL END) AS from5000_esm_by_period_wd,\
                      COUNT(CASE  WHEN (estimate_min >= 100000000 AND estimate_min < 300000000) THEN hammer_price  ELSE NULL END) AS from10000_esm_by_period_hammer_price,\
                      COUNT(CASE WHEN  (estimate_min >= 100000000 AND estimate_min < 300000000) THEN  lot ELSE NULL END) AS from10000_esm_by_period_lot,\
                      COUNT(CASE  WHEN  (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 100000000 AND estimate_min < 300000000 THEN  lot ELSE NULL END) AS from10000_esm_by_period_wd,\
                      COUNT(CASE WHEN (estimate_min >= 300000000  AND estimate_min < 500000000) THEN hammer_price ELSE NULL END) AS from30000_esm_by_period_hammer_price,\
                      COUNT(CASE WHEN (estimate_min >= 300000000 AND estimate_min < 500000000) THEN lot  ELSE NULL END) AS from30000_esm_by_period_lot,\
                      COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 300000000 AND estimate_min < 500000000 THEN lot  ELSE NULL END) AS from30000_esm_by_period_wd,\
                      COUNT(CASE WHEN (estimate_min >= 500000000) THEN hammer_price ELSE NULL END) AS from50000_esm_by_period_hammer_price,\
                      COUNT(CASE WHEN (estimate_min >= 500000000) THEN lot   ELSE NULL END) AS from50000_esm_by_period_lot,\
                      COUNT(CASE  WHEN  (bid_class = 'w/d' OR bid_class = 'W/D')   AND estimate_min >= 500000000 THEN lot ELSE NULL END) AS from50000_esm_by_period_wd,\
                      SUM(CASE  WHEN on_off = 'online' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS online1,\
                      SUM(CASE  WHEN on_off = 'offline' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS offline1,\
                      SUM(CASE WHEN (hammer_price >= 0 AND hammer_price < 1000000) THEN  hammer_price  ELSE 0 END) AS from0_bid_by_period,\
                      SUM(CASE  WHEN (hammer_price >= 1000000 AND hammer_price < 10000000) THEN hammer_price ELSE 0 END) AS from100_bid_by_period,\
                      SUM(CASE  WHEN (hammer_price >= 10000000 AND hammer_price < 50000000) THEN hammer_price  ELSE 0 END) AS from1000_bid_by_period,\
                      SUM(CASE  WHEN (hammer_price >= 50000000 AND hammer_price < 100000000) THEN hammer_price ELSE 0 END) AS from5000_bid_by_period,\
                      SUM(CASE WHEN (hammer_price >= 100000000  AND hammer_price < 300000000) THEN  hammer_price ELSE 0  END) AS from10000_bid_by_period,\
                      SUM(CASE  WHEN  (hammer_price >= 300000000  AND hammer_price < 500000000)  THEN  hammer_price ELSE 0 END) AS from30000_bid_by_period,\
                      SUM(CASE WHEN (hammer_price >= 500000000) THEN hammer_price ELSE 0 END) AS from50000_bid_by_period,\
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
    .where(where_fn)
    .whereRaw(query.where)
    .groupBy("period")
    .orderBy("max_transact_date");
  let dataEsmByPeriodHalf = [];
  let totalOnOffHalf = [];
  let totalBidByPeriodHalf = [];
  let totalResultByPeriodHalf = [];
  let totalgroupByPeriodHalf = [];
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
      date: db_res[i].period,
      notsold: db_res[i].notsold / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      above: db_res[i].above / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      below: db_res[i].below / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      within: db_res[i].within / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
    };
    totalResultByPeriodHalf.push(dataResultByPeriod);
    let dataBidByPeriod = {
      date: db_res[i].period,
      from0: db_res[i].from0_bid_by_period,
      from100: db_res[i].from100_bid_by_period,
      from1000: db_res[i].from1000_bid_by_period,
      from5000: db_res[i].from5000_bid_by_period,
      from10000: db_res[i].from10000_bid_by_period,
      from30000: db_res[i].from30000_bid_by_period,
      from50000: db_res[i].from50000_bid_by_period,
    };
    totalBidByPeriodHalf.push(dataBidByPeriod);
    let dataOnoff = {
      date: db_res[i].period,
      online: db_res[i].online1,
      offline: db_res[i].offline1
    };
    totalOnOffHalf.push(dataOnoff);

    let dataGroupByPeriod = {
      date: db_res[i].period,
      a: Number(db_res[i].groupa),
      b: Number(db_res[i].groupb),
      c: Number(db_res[i].groupc),
      d: Number(db_res[i].groupd),
      e: Number(db_res[i].groupe),
    }
    totalgroupByPeriodHalf.push(dataGroupByPeriod);
    for (let j = 0; j < yearSortEsm.length; j++) {
      let datePeriod = db_res[i].max_transact_date;
      if (yearSortEsm[j].period == datePeriod.getFullYear()) {
        let dataEsmByPeriodMonthly = {
          date: db_res[i].period,
          from0: Number(db_res[i].from0_esm_by_period_hammer_price) / (Number(db_res[i].from0_esm_by_period_lot) - Number(db_res[i].from0_esm_by_period_wd)),
          from100: Number(db_res[i].from100_esm_by_period_hammer_price) / (Number(db_res[i].from100_esm_by_period_lot) - Number(db_res[i].from100_esm_by_period_wd)),
          from1000: Number(db_res[i].from1000_esm_by_period_hammer_price) / (Number(db_res[i].from1000_esm_by_period_lot) - Number(db_res[i].from1000_esm_by_period_wd)),
          from5000: Number(db_res[i].from5000_esm_by_period_hammer_price) / (Number(db_res[i].from5000_esm_by_period_lot) - Number(db_res[i].from5000_esm_by_period_wd)),
          from10000: Number(db_res[i].from10000_esm_by_period_hammer_price) / (Number(db_res[i].from10000_esm_by_period_lot) - Number(db_res[i].from10000_esm_by_period_wd)),
          from30000: Number(db_res[i].from30000_esm_by_period_hammer_price) / (Number(db_res[i].from30000_esm_by_period_lot) - Number(db_res[i].from30000_esm_by_period_wd)),
          from50000: Number(db_res[i].from50000_esm_by_period_hammer_price) / (Number(db_res[i].from50000_esm_by_period_lot) - Number(db_res[i].from50000_esm_by_period_wd)),
        };
        dataEsmByPeriodHalf.push(dataEsmByPeriodMonthly)
      }
    }
  }




  // theo qúy
  db_res = await knex
    .select(knex.raw("MAX(`transact_date`) AS max_transact_date,\
                          CONCAT(YEAR(transact_date), '.', CASE WHEN MONTH(transact_date) <= 3 THEN 3 WHEN MONTH(transact_date) <= 6 THEN 6 WHEN MONTH(transact_date) <= 9 THEN 9 ELSE 12 END) AS period,\
                          sum(case when artist_kor in ('김창열', '이우환', '박서보', '정상화', '하종현', '윤형근', '정창섭', '김기린', '권영우', '서세옥', '곽인식' ) and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupa,\
                          sum(case when artist_kor in ('이강소', '이건용', '김구림', '김태호', '이배', '남춘모', '전광영', '이승조', '서승원', '윤명 로', '안영일', '최명영', '오수환', '심문섭', '이동엽') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupb,\
                          sum(case when artist_kor in ('김환기', '유영국', '이성자', '이중섭', '박수근', '천경자', '이대원', '도상봉', '오지호', '권옥연', '박고석', '장욱진', '남관', '이응노', '백남준', '황염수', '김종학', '임직순', '김형근', '류경채', '김흥수', '최영림', '권진규', '이인성', '윤중식', '전혁림', '변종하', '이만익', '변시지', '문신', '황용엽') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupc,\
                          sum(case when artist_kor in ('오치균', '이왈종', '최영욱', '윤병락', '김강용', '고영훈', '최울가', '황재형', '강요배', '강익중', '권순철', '이숙자', '오윤', '손상기', '최욱경', '황영성', '임옥상', '배병우', '노은님', '오세열', '김홍주', '김병종', '안창홍', '신학철', '강형구', '이동기', '김동유', '이정웅', '사석원') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupd,\
                          sum(case when artist_kor in ('우국원', '문형태', '김선우','하태임', '정영주', '도성욱', '장마리아', '콰야', '진영', '청신', '콰야', '정해윤', '권기수', '최소영', '마리킴', '안성하') and (bid_class <> 'w/d' or bid_class is null)then hammer_price  else 0 end)/sum(hammer_price)*100 as groupe,\
                          COUNT(CASE WHEN (estimate_min >= 0 AND estimate_min < 1000000) THEN hammer_price ELSE NULL END) AS from0_esm_by_period_hammer_price,\
                          COUNT(CASE WHEN (estimate_min >= 0 AND estimate_min < 1000000) THEN lot ELSE NULL  END) AS from0_esm_by_period_lot,\
                          COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 0 AND estimate_min < 1000000 THEN lot ELSE NULL END) AS from0_esm_by_period_wd,\
                          COUNT(CASE WHEN (estimate_min >= 1000000 AND estimate_min < 10000000) THEN hammer_price ELSE NULL END) AS from100_esm_by_period_hammer_price,\
                          COUNT(CASE WHEN (estimate_min >= 1000000 AND estimate_min < 10000000) THEN lot ELSE NULL END) AS from100_esm_by_period_lot,\
                          COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D')  AND estimate_min >= 1000000 AND estimate_min < 10000000 THEN lot ELSE NULL END) AS from100_esm_by_period_wd,\
                          COUNT(CASE WHEN (estimate_min >= 10000000  AND estimate_min < 50000000) THEN hammer_price  ELSE NULL END) AS from1000_esm_by_period_hammer_price,\
                          COUNT(CASE WHEN (estimate_min >= 10000000  AND estimate_min < 50000000) THEN lot ELSE NULL END) AS from1000_esm_by_period_lot,\
                          COUNT(CASE WHEN  (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 10000000 AND estimate_min < 50000000  THEN lot ELSE NULL END) AS from1000_esm_by_period_wd,\
                          COUNT(CASE WHEN (estimate_min >= 50000000 AND estimate_min < 100000000) THEN hammer_price ELSE NULL END) AS from5000_esm_by_period_hammer_price,\
                          COUNT(CASE  WHEN (estimate_min >= 50000000 AND estimate_min < 100000000) THEN lot ELSE NULL END) AS from5000_esm_by_period_lot,\
                          COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D')  AND estimate_min >= 50000000 AND estimate_min < 100000000 THEN lot ELSE NULL END) AS from5000_esm_by_period_wd,\
                          COUNT(CASE  WHEN (estimate_min >= 100000000 AND estimate_min < 300000000) THEN hammer_price  ELSE NULL END) AS from10000_esm_by_period_hammer_price,\
                          COUNT(CASE WHEN  (estimate_min >= 100000000 AND estimate_min < 300000000) THEN  lot ELSE NULL END) AS from10000_esm_by_period_lot,\
                          COUNT(CASE  WHEN  (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 100000000 AND estimate_min < 300000000 THEN  lot ELSE NULL END) AS from10000_esm_by_period_wd,\
                          COUNT(CASE WHEN (estimate_min >= 300000000  AND estimate_min < 500000000) THEN hammer_price ELSE NULL END) AS from30000_esm_by_period_hammer_price,\
                          COUNT(CASE WHEN (estimate_min >= 300000000 AND estimate_min < 500000000) THEN lot  ELSE NULL END) AS from30000_esm_by_period_lot,\
                          COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 300000000 AND estimate_min < 500000000 THEN lot  ELSE NULL END) AS from30000_esm_by_period_wd,\
                          COUNT(CASE WHEN (estimate_min >= 500000000) THEN hammer_price ELSE NULL END) AS from50000_esm_by_period_hammer_price,\
                          COUNT(CASE WHEN (estimate_min >= 500000000) THEN lot   ELSE NULL END) AS from50000_esm_by_period_lot,\
                          COUNT(CASE  WHEN  (bid_class = 'w/d' OR bid_class = 'W/D')   AND estimate_min >= 500000000 THEN lot ELSE NULL END) AS from50000_esm_by_period_wd,\
                          SUM(CASE  WHEN on_off = 'online' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS online1,\
                          SUM(CASE  WHEN on_off = 'offline' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS offline1,\
                          SUM(CASE WHEN (hammer_price >= 0 AND hammer_price < 1000000) THEN  hammer_price  ELSE 0 END) AS from0_bid_by_period,\
                          SUM(CASE  WHEN (hammer_price >= 1000000 AND hammer_price < 10000000) THEN hammer_price ELSE 0 END) AS from100_bid_by_period,\
                          SUM(CASE  WHEN (hammer_price >= 10000000 AND hammer_price < 50000000) THEN hammer_price  ELSE 0 END) AS from1000_bid_by_period,\
                          SUM(CASE  WHEN (hammer_price >= 50000000 AND hammer_price < 100000000) THEN hammer_price ELSE 0 END) AS from5000_bid_by_period,\
                          SUM(CASE WHEN (hammer_price >= 100000000  AND hammer_price < 300000000) THEN  hammer_price ELSE 0  END) AS from10000_bid_by_period,\
                          SUM(CASE  WHEN  (hammer_price >= 300000000  AND hammer_price < 500000000)  THEN  hammer_price ELSE 0 END) AS from30000_bid_by_period,\
                          SUM(CASE WHEN (hammer_price >= 500000000) THEN hammer_price ELSE 0 END) AS from50000_bid_by_period,\
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
    .where(where_fn)
    .whereRaw(query.where)
    .groupBy("period")
    .orderBy("max_transact_date");
  let dataEsmByPeriodQuater = [];
  let totalOnOffQuater = [];
  let totalBidByPeriodQuater = [];
  let totalResultByPeriodQuater = [];
  let totalgroupByPeriodQuater = [];
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
      date: db_res[i].period,
      notsold: db_res[i].notsold / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      above: db_res[i].above / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      below: db_res[i].below / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      within: db_res[i].within / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
    };
    totalResultByPeriodQuater.push(dataResultByPeriod);
    let dataBidByPeriod = {
      date: db_res[i].period,
      from0: db_res[i].from0_bid_by_period,
      from100: db_res[i].from100_bid_by_period,
      from1000: db_res[i].from1000_bid_by_period,
      from5000: db_res[i].from5000_bid_by_period,
      from10000: db_res[i].from10000_bid_by_period,
      from30000: db_res[i].from30000_bid_by_period,
      from50000: db_res[i].from50000_bid_by_period,
    };
    totalBidByPeriodQuater.push(dataBidByPeriod);
    let dataOnoff = {
      date: db_res[i].period,
      online: db_res[i].online1,
      offline: db_res[i].offline1
    };
    totalOnOffQuater.push(dataOnoff);

    let dataGroupByPeriod = {
      date: db_res[i].period,
      a: Number(db_res[i].groupa),
      b: Number(db_res[i].groupb),
      c: Number(db_res[i].groupc),
      d: Number(db_res[i].groupd),
      e: Number(db_res[i].groupe),
    }
    totalgroupByPeriodQuater.push(dataGroupByPeriod);
    for (let j = 0; j < yearSortEsm.length; j++) {
      let datePeriod = db_res[i].max_transact_date;
      if (yearSortEsm[j].period == datePeriod.getFullYear()) {
        let dataEsmByPeriodMonthly = {
          date: db_res[i].period,
          from0: Number(db_res[i].from0_esm_by_period_hammer_price) / (Number(db_res[i].from0_esm_by_period_lot) - Number(db_res[i].from0_esm_by_period_wd)),
          from100: Number(db_res[i].from100_esm_by_period_hammer_price) / (Number(db_res[i].from100_esm_by_period_lot) - Number(db_res[i].from100_esm_by_period_wd)),
          from1000: Number(db_res[i].from1000_esm_by_period_hammer_price) / (Number(db_res[i].from1000_esm_by_period_lot) - Number(db_res[i].from1000_esm_by_period_wd)),
          from5000: Number(db_res[i].from5000_esm_by_period_hammer_price) / (Number(db_res[i].from5000_esm_by_period_lot) - Number(db_res[i].from5000_esm_by_period_wd)),
          from10000: Number(db_res[i].from10000_esm_by_period_hammer_price) / (Number(db_res[i].from10000_esm_by_period_lot) - Number(db_res[i].from10000_esm_by_period_wd)),
          from30000: Number(db_res[i].from30000_esm_by_period_hammer_price) / (Number(db_res[i].from30000_esm_by_period_lot) - Number(db_res[i].from30000_esm_by_period_wd)),
          from50000: Number(db_res[i].from50000_esm_by_period_hammer_price) / (Number(db_res[i].from50000_esm_by_period_lot) - Number(db_res[i].from50000_esm_by_period_wd)),
        };
        dataEsmByPeriodQuater.push(dataEsmByPeriodMonthly)
      }
    }
  };

  // theo tháng
  db_res = await knex
    .select(knex.raw("MAX(`transact_date`) AS max_transact_date,\
                            CONCAT(YEAR(transact_date), '.', MONTH(transact_date)) AS period,\
                            sum(case when artist_kor in ('김창열', '이우환', '박서보', '정상화', '하종현', '윤형근', '정창섭', '김기린', '권영우', '서세옥', '곽인식' ) and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupa,\
                            sum(case when artist_kor in ('이강소', '이건용', '김구림', '김태호', '이배', '남춘모', '전광영', '이승조', '서승원', '윤명 로', '안영일', '최명영', '오수환', '심문섭', '이동엽') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupb,\
                            sum(case when artist_kor in ('김환기', '유영국', '이성자', '이중섭', '박수근', '천경자', '이대원', '도상봉', '오지호', '권옥연', '박고석', '장욱진', '남관', '이응노', '백남준', '황염수', '김종학', '임직순', '김형근', '류경채', '김흥수', '최영림', '권진규', '이인성', '윤중식', '전혁림', '변종하', '이만익', '변시지', '문신', '황용엽') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupc,\
                            sum(case when artist_kor in ('오치균', '이왈종', '최영욱', '윤병락', '김강용', '고영훈', '최울가', '황재형', '강요배', '강익중', '권순철', '이숙자', '오윤', '손상기', '최욱경', '황영성', '임옥상', '배병우', '노은님', '오세열', '김홍주', '김병종', '안창홍', '신학철', '강형구', '이동기', '김동유', '이정웅', '사석원') and (bid_class <> 'w/d' or bid_class is null) then hammer_price  else 0 end)/sum(hammer_price)*100 as groupd,\
                            sum(case when artist_kor in ('우국원', '문형태', '김선우','하태임', '정영주', '도성욱', '장마리아', '콰야', '진영', '청신', '콰야', '정해윤', '권기수', '최소영', '마리킴', '안성하') and (bid_class <> 'w/d' or bid_class is null)then hammer_price  else 0 end)/sum(hammer_price)*100 as groupe,\
                            COUNT(CASE WHEN (estimate_min >= 0 AND estimate_min < 1000000) THEN hammer_price ELSE NULL END) AS from0_esm_by_period_hammer_price,\
                            COUNT(CASE WHEN (estimate_min >= 0 AND estimate_min < 1000000) THEN lot ELSE NULL  END) AS from0_esm_by_period_lot,\
                            COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 0 AND estimate_min < 1000000 THEN lot ELSE NULL END) AS from0_esm_by_period_wd,\
                            COUNT(CASE WHEN (estimate_min >= 1000000 AND estimate_min < 10000000) THEN hammer_price ELSE NULL END) AS from100_esm_by_period_hammer_price,\
                            COUNT(CASE WHEN (estimate_min >= 1000000 AND estimate_min < 10000000) THEN lot ELSE NULL END) AS from100_esm_by_period_lot,\
                            COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D')  AND estimate_min >= 1000000 AND estimate_min < 10000000 THEN lot ELSE NULL END) AS from100_esm_by_period_wd,\
                            COUNT(CASE WHEN (estimate_min >= 10000000  AND estimate_min < 50000000) THEN hammer_price  ELSE NULL END) AS from1000_esm_by_period_hammer_price,\
                            COUNT(CASE WHEN (estimate_min >= 10000000  AND estimate_min < 50000000) THEN lot ELSE NULL END) AS from1000_esm_by_period_lot,\
                            COUNT(CASE WHEN  (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 10000000 AND estimate_min < 50000000  THEN lot ELSE NULL END) AS from1000_esm_by_period_wd,\
                            COUNT(CASE WHEN (estimate_min >= 50000000 AND estimate_min < 100000000) THEN hammer_price ELSE NULL END) AS from5000_esm_by_period_hammer_price,\
                            COUNT(CASE  WHEN (estimate_min >= 50000000 AND estimate_min < 100000000) THEN lot ELSE NULL END) AS from5000_esm_by_period_lot,\
                            COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D')  AND estimate_min >= 50000000 AND estimate_min < 100000000 THEN lot ELSE NULL END) AS from5000_esm_by_period_wd,\
                            COUNT(CASE  WHEN (estimate_min >= 100000000 AND estimate_min < 300000000) THEN hammer_price  ELSE NULL END) AS from10000_esm_by_period_hammer_price,\
                            COUNT(CASE WHEN  (estimate_min >= 100000000 AND estimate_min < 300000000) THEN  lot ELSE NULL END) AS from10000_esm_by_period_lot,\
                            COUNT(CASE  WHEN  (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 100000000 AND estimate_min < 300000000 THEN  lot ELSE NULL END) AS from10000_esm_by_period_wd,\
                            COUNT(CASE WHEN (estimate_min >= 300000000  AND estimate_min < 500000000) THEN hammer_price ELSE NULL END) AS from30000_esm_by_period_hammer_price,\
                            COUNT(CASE WHEN (estimate_min >= 300000000 AND estimate_min < 500000000) THEN lot  ELSE NULL END) AS from30000_esm_by_period_lot,\
                            COUNT(CASE WHEN (bid_class = 'w/d' OR bid_class = 'W/D') AND estimate_min >= 300000000 AND estimate_min < 500000000 THEN lot  ELSE NULL END) AS from30000_esm_by_period_wd,\
                            COUNT(CASE WHEN (estimate_min >= 500000000) THEN hammer_price ELSE NULL END) AS from50000_esm_by_period_hammer_price,\
                            COUNT(CASE WHEN (estimate_min >= 500000000) THEN lot   ELSE NULL END) AS from50000_esm_by_period_lot,\
                            COUNT(CASE  WHEN  (bid_class = 'w/d' OR bid_class = 'W/D')   AND estimate_min >= 500000000 THEN lot ELSE NULL END) AS from50000_esm_by_period_wd,\
                            SUM(CASE  WHEN on_off = 'online' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS online1,\
                            SUM(CASE  WHEN on_off = 'offline' THEN hammer_price  ELSE 0 END) / SUM(hammer_price) * 100 AS offline1,\
                            SUM(CASE WHEN (hammer_price >= 0 AND hammer_price < 1000000) THEN  hammer_price  ELSE 0 END) AS from0_bid_by_period,\
                            SUM(CASE  WHEN (hammer_price >= 1000000 AND hammer_price < 10000000) THEN hammer_price ELSE 0 END) AS from100_bid_by_period,\
                            SUM(CASE  WHEN (hammer_price >= 10000000 AND hammer_price < 50000000) THEN hammer_price  ELSE 0 END) AS from1000_bid_by_period,\
                            SUM(CASE  WHEN (hammer_price >= 50000000 AND hammer_price < 100000000) THEN hammer_price ELSE 0 END) AS from5000_bid_by_period,\
                            SUM(CASE WHEN (hammer_price >= 100000000  AND hammer_price < 300000000) THEN  hammer_price ELSE 0  END) AS from10000_bid_by_period,\
                            SUM(CASE  WHEN  (hammer_price >= 300000000  AND hammer_price < 500000000)  THEN  hammer_price ELSE 0 END) AS from30000_bid_by_period,\
                            SUM(CASE WHEN (hammer_price >= 500000000) THEN hammer_price ELSE 0 END) AS from50000_bid_by_period,\
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
    .where(where_fn)
    .whereRaw(query.where)
    .groupBy("period")
    .orderBy("max_transact_date");

  let dataEsmByPeriodMonthly = [];
  let totalOnOffMonthly = [];
  let totalResultByPeriodMonthly = [];
  let totalBidByPeriodMonthly = [];
  let totalgroupByPeriodMonthly = [];
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
      date: db_res[i].period,
      notsold: db_res[i].notsold / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      above: db_res[i].above / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      below: db_res[i].below / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
      within: db_res[i].within / (Number(db_res[i].notsold) + Number(db_res[i].sold)) * 100,
    }
    totalResultByPeriodMonthly.push(dataResultByPeriod);
    let dataBidByPeriod = {
      date: db_res[i].period,
      from0: db_res[i].from0_bid_by_period,
      from100: db_res[i].from100_bid_by_period,
      from1000: db_res[i].from1000_bid_by_period,
      from5000: db_res[i].from5000_bid_by_period,
      from10000: db_res[i].from10000_bid_by_period,
      from30000: db_res[i].from30000_bid_by_period,
      from50000: db_res[i].from50000_bid_by_period,
    };
    totalBidByPeriodMonthly.push(dataBidByPeriod);
    let dataOnoff = {
      date: db_res[i].period,
      online: db_res[i].online1,
      offline: db_res[i].offline1
    };
    totalOnOffMonthly.push(dataOnoff);

    let dataGroupByPeriod = {
      date: db_res[i].period,
      a: Number(db_res[i].groupa),
      b: Number(db_res[i].groupb),
      c: Number(db_res[i].groupc),
      d: Number(db_res[i].groupd),
      e: Number(db_res[i].groupe),
    }
    totalgroupByPeriodMonthly.push(dataGroupByPeriod);
    for (let j = 0; j < yearSortEsm.length; j++) {
      let datePeriod = db_res[i].max_transact_date;
      let dateYearSort = yearSortEsm[j].max_transact_date
      if (dateYearSort.getFullYear() == datePeriod.getFullYear()) {
        let dataEsmByPeriodMonth = {
          date: db_res[i].period,
          from0: Number(db_res[i].from0_esm_by_period_hammer_price) / (Number(db_res[i].from0_esm_by_period_lot) - Number(db_res[i].from0_esm_by_period_wd)),
          from100: Number(db_res[i].from100_esm_by_period_hammer_price) / (Number(db_res[i].from100_esm_by_period_lot) - Number(db_res[i].from100_esm_by_period_wd)),
          from1000: Number(db_res[i].from1000_esm_by_period_hammer_price) / (Number(db_res[i].from1000_esm_by_period_lot) - Number(db_res[i].from1000_esm_by_period_wd)),
          from5000: Number(db_res[i].from5000_esm_by_period_hammer_price) / (Number(db_res[i].from5000_esm_by_period_lot) - Number(db_res[i].from5000_esm_by_period_wd)),
          from10000: Number(db_res[i].from10000_esm_by_period_hammer_price) / (Number(db_res[i].from10000_esm_by_period_lot) - Number(db_res[i].from10000_esm_by_period_wd)),
          from30000: Number(db_res[i].from30000_esm_by_period_hammer_price) / (Number(db_res[i].from30000_esm_by_period_lot) - Number(db_res[i].from30000_esm_by_period_wd)),
          from50000: Number(db_res[i].from50000_esm_by_period_hammer_price) / (Number(db_res[i].from50000_esm_by_period_lot) - Number(db_res[i].from50000_esm_by_period_wd)),
        };
        dataEsmByPeriodMonthly.push(dataEsmByPeriodMonth)
      }
    }
  }



  //  OccupyByPeriod
  db_res = await knex
    .select(knex.raw(`max(transact_date) as max_transact_date,\
                          company as auction,\
                          sum(hammer_price) as bid,\
                          year(transact_date) as period`))
    .from("crawling")
    .where(where_fn)
    .whereRaw(query.where)
    .where("location", "=", "Korea")
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
    .where(where_fn)
    .whereRaw(query.where)
    .where("location", "=", "Korea")
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
    .where(where_fn)
    .whereRaw(query.where)
    .where("location", "=", "Korea")
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
    .where(where_fn)
    .whereRaw(query.where)
    .where("location", "=", "Korea")
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
  // Lam lai

  //total_Bid
  db_res2 = await knex
    .select(
      knex.raw(`SUM(CASE WHEN hammer_price < estimate_min and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS below,
      SUM(CASE WHEN hammer_price > estimate_max and hammer_price is not null and hammer_price != 0 and estimate_min is not null and estimate_min != 0 and estimate_max is not null and estimate_max != 0 and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS above,
      SUM(CASE WHEN ((hammer_price <= estimate_max AND estimate_max IS NOT NULL) AND (hammer_price >= estimate_min AND estimate_min IS NOT NULL) OR (estimate_min IS NULL) OR (estimate_max IS NULL)) AND (bid_class != 'w/d' OR bid_class IS NULL) AND hammer_price IS NOT NULL and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS within,
      SUM(CASE WHEN (hammer_price IS NULL OR hammer_price = 0) and (bid_class <> 'w/d' or bid_class is null) THEN 1 ELSE 0 END) AS notsold,
      SUM(CASE WHEN hammer_price IS NULL OR hammer_price = 0 THEN 0 ELSE 1 END) AS sold,
      SUM(CASE WHEN bid_class = 'w/d' THEN 1 ELSE 0 END) AS with_draw`)
    )
    .count("*", { as: "total_cnt" })
    .from("crawling")
    .where(where_fn)
    .whereRaw(query.where);
  const total_Bid = {
    below: Number(db_res2[0].below) / (Number(db_res2[0].sold) + Number(db_res2[0].notsold)) * 100,
    within: Number(db_res2[0].within) / (Number(db_res2[0].sold) + Number(db_res2[0].notsold)) * 100,
    above: Number(db_res2[0].above) / (Number(db_res2[0].sold) + Number(db_res2[0].notsold)) * 100,
    notsold: Number(db_res2[0].notsold) / (Number(db_res2[0].sold) + Number(db_res2[0].notsold)) * 100,
    win_rate: Number(db_res2[0].sold) / (Number(db_res2[0].sold) + Number(db_res2[0].notsold)) * 100,
  };

  // Lot by winBid
  price_list = [50000, 30000, 10000, 5000, 1000, 100, 0];
  db_res2 = await knex
    .select(knex.raw("CONCAT(YEAR(transact_date),'.',MONTH(transact_date)) AS date,\
        SUM(CASE WHEN (hammer_price >= 0 AND hammer_price < 1000000) THEN 1 ELSE 0 END) AS from0_volume,\
        SUM(CASE WHEN (hammer_price >= 1000000 AND hammer_price < 10000000) THEN 1 ELSE 0 END) AS from100_volume,\
        SUM(CASE WHEN (hammer_price >= 10000000 AND hammer_price < 50000000) THEN 1 ELSE 0 END) AS from1000_volume,\
        SUM(CASE WHEN (hammer_price >= 50000000 AND hammer_price < 100000000) THEN 1 ELSE 0 END) AS from5000_volume,\
        SUM(CASE WHEN (hammer_price >= 100000000 AND hammer_price < 300000000) THEN 1 ELSE 0 END) AS from10000_volume,\
        SUM(CASE WHEN (hammer_price >= 300000000 AND hammer_price < 500000000) THEN 1 ELSE 0 END) AS from30000_volume,\
        SUM(CASE WHEN (hammer_price >= 500000000) THEN 1 ELSE 0 END) AS from50000_volume,\
        SUM(CASE WHEN (hammer_price >= 0 AND hammer_price < 1000000) THEN hammer_price ELSE 0 END) AS from0_value,\
        SUM(CASE WHEN (hammer_price >= 1000000 AND hammer_price < 10000000) THEN hammer_price ELSE 0 END) AS from100_value,\
        SUM(CASE WHEN (hammer_price >= 10000000 AND hammer_price < 50000000) THEN hammer_price ELSE 0 END) AS from1000_value,\
        SUM(CASE WHEN (hammer_price >= 50000000 AND hammer_price < 100000000) THEN hammer_price ELSE 0 END) AS from5000_value,\
        SUM(CASE WHEN (hammer_price >= 100000000 AND hammer_price < 300000000) THEN hammer_price ELSE 0 END) AS from10000_value,\
        SUM(CASE WHEN (hammer_price >= 300000000 AND hammer_price < 500000000) THEN hammer_price ELSE 0 END) AS from30000_value,\
        SUM(CASE WHEN (hammer_price >= 500000000) THEN hammer_price ELSE 0 END) AS from50000_value,\
        COUNT(`hammer_price`) AS `total_cnt`"))
    .from("crawling")
    .where(where_fn)
    .whereRaw(query.where)
    .groupBy("date");

  lotByWinbid = {};
  priceByWinbid = {};
  for (var j = price_list.length - 1; j >= 0; j--) {
    price_from = price_list[j];
    priceByWinbid[`from${price_from}`] = db_res2.reduce((preVal, currentVal) => {
      return preVal + parseFloat(currentVal[[`from${price_from}_value`]])
    }, 0);
    lotByWinbid[`from${price_from}`] = db_res2.reduce((preVal, currentVal) => {
      return preVal + parseFloat(currentVal[[`from${price_from}_volume`]])
    }, 0);
  }
  // auctionOccupy
  let auctionOccupy = [];
  db_res2 = await knex
    .select(knex.raw("case when company is null then 'total' else company end as source1, sum(hammer_price) as totalbid"))
    .from("crawling")
    .where(where_fn)
    .whereRaw(query.where)
    .where("location", "=", "Korea")
    .groupBy(knex.raw("source1"))
    .orderBy("totalbid", "desc")

  let sumAuctionOccupy = db_res2.reduce((total, curent) => curent.totalbid == null ? total + 0 : total + parseFloat(curent.totalbid), 0)
  for (var i = 0; i < db_res2.length; i++) {
    temp = db_res2[i];
    let totalbid
    if (temp.source1 == null) {
      totalbid = temp.totalbid;
      continue;
    } else {
      auctionOccupy.push({
        auction: temp.source1,
        occupy: temp.totalbid ? temp.totalbid : 0,
      });
    }
  }

  for (var i = 0; i < auctionOccupy.length; i++) {
    auctionOccupy[i].occupy = (auctionOccupy[i].occupy / sumAuctionOccupy) * 100;
  }
  let resultAuctionOccupy = [];
  if (auctionOccupy.length > 5) {
    const [a, b, c, d, e, ...rest] = auctionOccupy;
    const f = rest.reduce((total, current) => total + current.occupy, 0);
    resultAuctionOccupy = [a, b, c, d, e, { auction: "Etc", occupy: f }];
  } else {
    resultAuctionOccupy = auctionOccupy;
  };
  //Top 10
  db_res2 = await knex
    .select(knex.raw("artist_kor AS artist,\
    SUM(CASE WHEN hammer_price IS NOT NULL OR hammer_price != 0 THEN hammer_price ELSE NULL END) AS bid,\
    COUNT(case when (hammer_price is not null or hammer_price != 0) and (bid_class <> 'w/d' or bid_class is null ) then lot else null end) AS hammer"))
    .from("crawling")
    .whereRaw(`artist_kor is not null`)
    .whereRaw(`artist_kor != '작자미상'`)
    .whereRaw(query.where)
    .where(where_fn)
    .groupBy("artist_kor")
    .orderBy("bid", "desc")


  for (var i = 0; i < db_res2.length; i++) {
    db_res2[i].bid = Number(db_res2[i].bid);
    db_res2[i].hammer = Number(db_res2[i].hammer);
  }
  let resultTop10Bid = db_res2.sort((a, b) => b.bid - a.bid).slice(0, 10);
  let resultTop10Hm = db_res2.sort((a, b) => b.hammer - a.hammer).slice(0, 10);
  let top10 = {
    bid: resultTop10Bid,
    hammer: resultTop10Hm,
  };

  // Nationlity
  const shareOfNationalityByCountries = await knex
    .select(
      knex.raw(
        "sum(if(lot is null, 0 ,1)) - SUM(if(bid_class = 'w/d', 1, 0)) as totalLot ,\
           sum(if(hammer_price is null or bid_class = 'w/d', 0, hammer_price)) as totalHammerPrice,\
          artist.nationality1"
      ),
    )
    .from("crawling")
    .leftJoin('artist', 'artist.id', '=', 'crawling.artist_id')
    .where(where_fn)
    .whereRaw(query.where)
    .where(knex.raw(`hammer_price is not null and hammer_price != 0`))
    .groupBy("artist.nationality1");

  const shareOfLocation = await knex
    .select(
      knex.raw(
        "sum(if(lot is null, 0 ,1)) - SUM(if(bid_class = 'w/d', 1, 0)) as totalLot,\
          sum(if(hammer_price is null or bid_class = 'w/d', 0, hammer_price)) as totalHammerPrice,\
          crawling.location"
      ),
    )
    .from("crawling")
    .leftJoin('artist', 'artist.id', '=', 'crawling.artist_id')
    .where(where_fn)
    .whereRaw(query.where)
    .where(knex.raw(`hammer_price is not null and hammer_price != 0`))
    .groupBy("crawling.location");

  const hammerPriceSorting = shareOfLocation.sort((a, b) => {
    return b.totalHammerPrice - a.totalHammerPrice
  })

  const lotSorting = shareOfLocation.sort((a, b) => {
    return b.totalLot - a.totalLot
  })

  const top5Lot = lotSorting.slice(0, 5) ?? []
  const top5HammerPrice = hammerPriceSorting.slice(0, 5) ?? [];

  top5HammerPrice.push({
    location: "etc",
    totalHammerPrice: hammerPriceSorting.slice(5, hammerPriceSorting.length).reduce((preVal, currentVal) => {
      return preVal + parseFloat(currentVal.totalHammerPrice)
    }, 0).toString()
  })
  top5Lot.push({
    location: "etc",
    totalLot: lotSorting.slice(5, lotSorting.length).reduce((preVal, currentVal) => {
      return preVal + parseFloat(currentVal.totalLot)
    }, 0).toString()
  })

  northAmerica = shareOfNationalityByCountries.filter((element) => {
    if (NORTH_AMERICA.includes(element.nationality1)) {
      return element
    }
  })

  southAmerica = shareOfNationalityByCountries.filter((element) => {
    if (SOUTH_AMERICA.includes(element.nationality1)) {
      return element
    }
  })

  europe = shareOfNationalityByCountries.filter((element) => {
    if (EUROPE.includes(element.nationality1)) {
      return element
    }
  })

  africa = shareOfNationalityByCountries.filter((element) => {
    if (AFRICA.includes(element.nationality1)) {
      return element
    }
  })

  northeastAsia = shareOfNationalityByCountries.filter((element) => {
    if (NORTHEAST_ASIA.includes(element.nationality1)) {
      return element
    }
  })

  southeastAsia = shareOfNationalityByCountries.filter((element) => {
    if (SOUTHEAST_ASIA.includes(element.nationality1)) {
      return element
    }
  })

  centralWesternAsia = shareOfNationalityByCountries.filter((element) => {
    if (CENTRAL_WESTERN_ASIA.includes(element.nationality1)) {
      return element
    }
  })

  oceania = shareOfNationalityByCountries.filter((element) => {
    if (OCEANIA.includes(element.nationality1)) {
      return element
    }
  });
  lotByPeriod = {
    yearly: dataLotByPeriodYear.sort((a, b) => a.date - b.date),
    half: dataLotByPeriodHalf.sort((a, b) => a.date - b.date),
    quarter: dataLotByPeriodQuater.sort((a, b) => a.date - b.date),
    monthly: dataLotByPeriodMonthly.sort((a, b) => a.date - b.date)
  }
  resultByPeriod = {
    yearly: totalResultByPeriodYear.sort((a, b) => a.date - b.date),
    half: totalResultByPeriodHalf.sort((a, b) => a.date - b.date),
    quarter: totalResultByPeriodQuater.sort((a, b) => a.date - b.date),
    monthly: totalResultByPeriodMonthly.sort((a, b) => a.date - b.date)
  }
  bidByPeriod = {
    yearly: totalBidByPeriodYear.sort((a, b) => a.date - b.date),
    half: totalBidByPeriodHalf.sort((a, b) => a.date - b.date),
    quarter: totalBidByPeriodQuater.sort((a, b) => a.date - b.date),
    monthly: totalBidByPeriodMonthly.sort((a, b) => a.date - b.date)
  }
  onOff = {
    yearly: totalOnOffYear.sort((a, b) => a.date - b.date),
    half: totalOnOffHalf.sort((a, b) => a.date - b.date),
    quarter: totalOnOffQuater.sort((a, b) => a.date - b.date),
    monthly: totalOnOffMonthly.sort((a, b) => a.date - b.date)
  }
  esmByPeriod = {
    yearly: dataEsmByPeriodYear.sort((a, b) => a.date - b.date),
    half: dataEsmByPeriodHalf.sort((a, b) => a.date - b.date),
    quarter: dataEsmByPeriodQuater.sort((a, b) => a.date - b.date),
    monthly: dataEsmByPeriodMonthly.sort((a, b) => a.date - b.date),
  }
  groupByPeriod = {
    yearly: totalgroupByPeriodYear.sort((a, b) => a.date - b.date),
    half: totalgroupByPeriodHalf.sort((a, b) => a.date - b.date),
    quarter: totalgroupByPeriodQuater.sort((a, b) => a.date - b.date),
    monthly: totalgroupByPeriodMonthly.sort((a, b) => a.date - b.date)
  }


  res.send({
    result: true,
    msg: "데이터 로드 성공",
    summary: summary,
    resp: {
      lotByPeriod: lotByPeriod,
      resultByPeriod: resultByPeriod,
      bidByPeriod: bidByPeriod,
      onoffByPeriod: onOff,
      esmByPeriod: esmByPeriod,
      occupyByPeriod: occupyByPeriod,
      groupByPeriod: groupByPeriod,
      totalBid: total_Bid,
      top10: top10,
      lotByWinbid: lotByWinbid,
      priceByWinbid: priceByWinbid,
      auctionOccupy: resultAuctionOccupy,
      shareOfNationalityByContinents: {
        northAmerica: {
          totalHammerPrice: northAmerica.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalHammerPrice)
          }, 0),
          totalLot: northAmerica.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalLot)
          }, 0),
        },
        southAmerica: {
          totalHammerPrice: southAmerica.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalHammerPrice)
          }, 0),
          totalLot: southAmerica.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalLot)
          }, 0),
        },
        europe: {
          totalHammerPrice: europe.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalHammerPrice)
          }, 0),
          totalLot: europe.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalLot)
          }, 0),
        },
        africa: {
          totalHammerPrice: africa.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalHammerPrice)
          }, 0),
          totalLot: africa.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalLot)
          }, 0),
        },
        northeastAsia: {
          totalHammerPrice: northeastAsia.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalHammerPrice)
          }, 0),
          totalLot: northeastAsia.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalLot)
          }, 0),
        },
        southeastAsia: {
          totalHammerPrice: southeastAsia.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalHammerPrice)
          }, 0),
          totalLot: southeastAsia.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalLot)
          }, 0),
        },
        centralWesternAsia: {
          totalHammerPrice: centralWesternAsia.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalHammerPrice)
          }, 0),
          totalLot: centralWesternAsia.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalLot)
          }, 0),
        },
        oceania: {
          totalHammerPrice: oceania.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalHammerPrice)
          }, 0),
          totalLot: oceania.reduce((preVal, currentVal) => {
            return preVal + parseFloat(currentVal.totalLot)
          }, 0),
        }
      },
      shareOfNationalityByCountries: {
        american: {
          totalHammerPrice: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalHammerPrice", 'American'),
          totalLot: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalLot", 'American')
        },
        british: {
          totalHammerPrice: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalHammerPrice", 'British'),
          totalLot: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalLot", 'British')
        },
        french: {
          totalHammerPrice: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalHammerPrice", 'French'),
          totalLot: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalLot", 'French')
        },
        german: {
          totalHammerPrice: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalHammerPrice", 'German'),
          totalLot: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalLot", 'German')
        },
        spanish: {
          totalHammerPrice: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalHammerPrice", 'Spanish'),
          totalLot: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalLot", 'Spanish')
        },
        italian: {
          totalHammerPrice: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalHammerPrice", 'Italian'),
          totalLot: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalLot", 'Italian')
        },
        chinese: {
          totalHammerPrice: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalHammerPrice", 'Chinese'),
          totalLot: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalLot", 'Chinese')
        },
        japanese: {
          totalHammerPrice: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalHammerPrice", 'Japanese'),
          totalLot: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalLot", 'Japanese')
        },
        korean: {
          totalHammerPrice: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalHammerPrice", 'Korean'),
          totalLot: calculateSumOfNationalityProperty(shareOfNationalityByCountries, "totalLot", 'Korean')
        },
        other: {
          totalHammerPrice: shareOfNationalityByCountries.reduce((preVal, currentVal) => {
            if (!topNationality.includes(currentVal.nationality1)) {
              return preVal + parseFloat(currentVal.totalHammerPrice)
            } else {
              return preVal + 0
            }
          }, 0),
          totalLot: shareOfNationalityByCountries.reduce((preVal, currentVal) => {
            if (!topNationality.includes(currentVal.nationality1)) {
              return preVal + parseFloat(currentVal.totalLot)
            } else {
              return preVal + 0
            }
          }, 0)
        }

      },
      artMarketShare: {
        top5Lot: top5Lot,
        top5HammerPrice: top5HammerPrice
      }
    }
  });


}
function calculateSumOfNationalityProperty(inputArray, propertyName, nationality) {
  return inputArray.reduce((preVal, currentVal) => {
    if (currentVal.nationality1 == nationality) {
      return preVal + parseFloat(currentVal[propertyName])
    } else {
      return preVal + 0
    }
  }, 0)
}

module.exports = { newMain };
