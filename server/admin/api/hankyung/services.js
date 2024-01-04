const db = require("../../../config/connectDB") ;
const Response = require("../../../utils/Response") ;
const LOGGER = require("../../../utils/logger") ;
const  provideDate  = require("../../../utils/dateCalculation");

class SolutionServices {
  static async getYoY() {
    try {
      const { current_start, current_end, previous_start, previous_end } =
        provideDate();
      const connection = db("crawling");
      const queryDb = connection
        .whereBetween("transact_date", [previous_start, current_end])
        .where("bid_class", "!=", "w/d");
      const totalResult = await queryDb.clone().count("id as count").first();
      if (totalResult.count === 0) {
        return Response.WARN(404, "data not found!", "404");
      }
      const result = await queryDb.select(
        db.raw(
          `sum(case when transact_date between '${previous_start}' and '${previous_end}' then hammer_price else 0 end) as previous_price`
        ),
        db.raw(
          `sum(case when transact_date between '${current_start}' and '${current_end}' then hammer_price else 0 end) as current_price`
        )
      );
      result[0].yoy =
        ((result[0].current_price - result[0].previous_price) /
          result[0].previous_price) *
        100;
      result[0].current_start = current_start;
      result[0].current_end = current_end;
      result[0].previous_start = previous_start;
      result[0].previous_end = previous_end;
      return Response.SUCCESS_SERVICE(
        "successfully!",
        `${current_start} ~ ${current_end}`,
        result[0]
      );
    } catch (error) {
      LOGGER.APP.error(error.stack);
      return Response.ERROR(500, error.message, "sv_500");
    }
  }
  static async getHammerRate() {
    try {
      const { current_start, current_end } = provideDate();
      const connection = db("crawling");
      const queryDb = connection
        .whereBetween("transact_date", [current_start, current_end])
        .where("bid_class", "!=", "w/d");
      const totalResult = await queryDb.clone().count("id as count").first();
      if (totalResult.count === 0) {
        return Response.WARN(404, "data not found!", "404");
      }
      const result = await queryDb
        .count("id as entries")
        .count("hammer_price as winning_bid");
      result[0].hammer_rate = (result[0].winning_bid / result[0].entries) * 100;
      return Response.SUCCESS_SERVICE(
        "successfully!",
        `${current_start} ~ ${current_end}`,
        result[0]
      );
    } catch (error) {
      LOGGER.APP.error(error.stack);
      return Response.ERROR(500, error.message, "sv_500");
    }
  }
  static async getMonthlyResult() {
    try {
      const { current_start, current_end } = provideDate();
      const connection = db("crawling");
      const queryDb = connection
        .whereBetween("transact_date", [current_start, current_end])
        .where("bid_class", "!=", "w/d");
      const totalResult = await queryDb.clone().count("id as count").first();
      if (totalResult.count === 0) {
        return Response.WARN(404, "data not found!", "404");
      }
      const result = await queryDb
        .select(db.raw("mid(transact_date, 1, 7) as date"))
        .count("id as entries")
        .count("hammer_price as winning_bid")
        .sum("hammer_price as hammer_price")
        .groupBy("date")
        .orderBy("date");

      return Response.SUCCESS_SERVICE(
        "successfully!",
        `${current_start} ~ ${current_end}`,
        result
      );
    } catch (error) {
      LOGGER.APP.error(error.stack);
      return Response.ERROR(500, error.message, "sv_500");
    }
  }
  static async getTopLot() {
    try {
      const { current_start, current_end } = provideDate();
      const connection = db("crawling");
      const queryDb = connection
        .whereBetween("transact_date", [current_start, current_end])
        .where("bid_class", "!=", "w/d");
      const totalResult = await queryDb.clone().count("id as count").first();
      if (totalResult.count === 0) {
        return Response.WARN(404, "data not found!", "404");
      }
      const result = await queryDb
        .select(
          "artist_kor as artist",
          "img",
          "title_kor",
          "title_eng",
          "hammer_price",
          "company",
          "material_kor",
          "material_eng",
          db.raw("mid(mfg_date, 1, 4) as mfg_date"),
          db.raw("concat_ws(' X ', height, width, depth) size"),
          db.raw("mid(transact_date, 1, 11) as date")
        )
        .orderBy("hammer_price", "desc")
        .first();
      if (result.title_kor != null) {
        result.title = result.title_kor;
      } else {
        result.title = result.title_eng;
      }
      if (result.material_kor != null) {
        result.material = result.material_kor;
      } else {
        result.material = result.material_eng;
      }
      if (result.size != null) {
        result.size = result.size + " cm";
      }
      delete result.title_kor;
      delete result.title_eng;
      delete result.material_kor;
      delete result.material_eng;
      return Response.SUCCESS_SERVICE(
        "successfully!",
        `${current_start} ~ ${current_end}`,
        result
      );
    } catch (error) {
      LOGGER.APP.error(error.stack);
      return Response.ERROR(500, error.message, "sv_500");
    }
  }
  static async getTopArtist() {
    try {
      const { current_start, current_end } = provideDate();
      const connection = db("crawling");
      const queryDb = connection
        .whereBetween("transact_date", [current_start, current_end])
        .where("bid_class", "!=", "w/d")
        .whereNotNull("artist_kor");
      const totalResult = await queryDb.clone().count("id as count").first();
      if (totalResult.count === 0) {
        return Response.WARN(404, "data not found!", "404");
      }
      const result = await queryDb
        .select("artist_kor as artist", "artist_birth", "artist_death", "img")
        .count("id as entries")
        .sum("hammer_price as hammer_price")
        .count("hammer_price as winning_bid")
        .groupBy("artist_kor")
        .orderBy(db.raw("sum(hammer_price)"), "desc")
        .limit(1);
      result[0].artist_date = !result[0].artist_birth
        ? null
        : !result[0].artist_death
        ? `b.${result[0].artist_birth}`
        : `${result[0].artist_birth} - ${result[0].artist_death}`;
      delete result[0].artist_birth;
      delete result[0].artist_death;
      return Response.SUCCESS_SERVICE(
        "successfully!",
        `${current_start} ~ ${current_end}`,
        result[0]
      );
    } catch (error) {
      LOGGER.APP.error(error.stack);
      return Response.ERROR(500, error.message, "sv_500");
    }
  }
  static async getRank(data) {
    try {
      let { kind, company } = data;
      const { current_start, current_end } = provideDate();
      const connection = db("crawling");
      const queryDb = connection
        .whereBetween("transact_date", [current_start, current_end])
        .where("bid_class", "!=", "w/d")
        .whereNotNull("artist_kor");
      if (company) {
        queryDb.where("company", "=", company);
      }
      const totalResult = await queryDb.clone().count("id as count").first();
      if (totalResult.count === 0) {
        return Response.WARN(404, "data not found!", "404");
      }
      const result = await queryDb
        .select(
          "artist_kor as artist",
          db.raw("count(hammer_price)/count(id)*100 as hammer_rate")
        )
        .count("id as entries")
        .sum("hammer_price as hammer_price")
        .max("hammer_price as max_price")
        .groupBy("artist_kor")
        .orderBy(kind, "desc")
        .limit(50);
      let rank = 1;
      for (let i of result) {
        i.rank = rank;
        rank += 1;
      }
      return Response.SUCCESS_SERVICE(
        "successfully!",
        `${current_start} ~ ${current_end}`,
        result
      );
    } catch (error) {
      LOGGER.APP.error(error.stack);
      return Response.ERROR(500, error.message, "sv_500");
    }
  }
  static async getResultCategory() {
    try {
      const { current_start, current_end } = provideDate();
      const connection = db("crawling");
      const queryDb = connection
        .whereBetween("transact_date", [current_start, current_end])
        .where("bid_class", "!=", "w/d");
      const totalResult = await queryDb.clone().count("id as count").first();
      if (totalResult.count === 0) {
        return Response.WARN(404, "data not found!", "404");
      }
      const temp = await queryDb
        .select("bid_class")
        .count("id as count")
        .groupBy("bid_class");
      let result = {};
      for (let i of temp) {
        result[
          `${i.bid_class == null ? "not_sold" : i.bid_class.toLowerCase()}`
        ] = i.count;
        result[
          `${i.bid_class == null ? "not_sold" : i.bid_class.toLowerCase()}_rate`
        ] = (i.count / totalResult.count) * 100;
      }
      result.winning_bid = totalResult.count - result.not_sold;
      result.hammer_rate = (result.winning_bid / totalResult.count) * 100;

      return Response.SUCCESS_SERVICE(
        "successfully!",
        `${current_start} ~ ${current_end}`,
        result
      );
    } catch (error) {
      LOGGER.APP.error(error.stack);
      return Response.ERROR(500, error.message, "sv_500");
    }
  }
  static async getPriceSection(data) {
    try {
      let { kind = "hammer_price" } = data;
      const { current_start, current_end } = provideDate();
      const connection = db("crawling");
      const queryDb = connection
        .whereBetween("transact_date", [current_start, current_end])
        .where("bid_class", "!=", "w/d");
      const totalResult = await queryDb.clone().count("id as count").first();
      if (totalResult.count === 0) {
        return Response.WARN(404, "data not found!", "404");
      }
      if (kind != "hammer_price") {
        kind = 1;
      }
      const result = await queryDb.select(
        db.raw(
          `sum(case when hammer_price < 1000000 then ${kind} else 0 end) as below1M`
        ),
        db.raw(
          `sum(case when hammer_price >= 1000000 and hammer_price < 10000000 then ${kind} else 0 end) as below10M`
        ),
        db.raw(
          `sum(case when hammer_price >= 10000000 and hammer_price < 100000000  then ${kind} else 0 end) as below100M`
        ),
        db.raw(
          `sum(case when hammer_price >= 100000000 and hammer_price < 500000000 then ${kind} else 0 end) as below500M`
        ),
        db.raw(
          `sum(case when hammer_price >= 500000000 then ${kind} else 0 end) as above500M`
        )
      );
      return Response.SUCCESS_SERVICE(
        "successfully!",
        `${current_start} ~ ${current_end}`,
        result
      );
    } catch (error) {
      LOGGER.APP.error(error.stack);
      return Response.ERROR(500, error.message, "sv_500");
    }
  }
  static async getOnOffSection(data) {
    try {
      let { kind = "hammer_price" } = data;
      const { current_start, current_end } = provideDate();
      const connection = db("crawling");
      const queryDb = connection
        .whereBetween("transact_date", [current_start, current_end])
        .where("bid_class", "!=", "w/d");
      const totalResult = await queryDb.clone().count("id as count").first();
      if (totalResult.count === 0) {
        return Response.WARN(404, "data not found!", "404");
      }
      if (kind != "hammer_price") {
        kind = 1;
      }
      const result = await queryDb.select(
        db.raw(`sum(case when on_off = 1 then ${kind} else 0 end) as online`),
        db.raw(`sum(case when on_off != 1 then ${kind} else 0 end) as offline`)
      );
      return Response.SUCCESS_SERVICE(
        "successfully!",
        `${current_start} ~ ${current_end}`,
        result
      );
    } catch (error) {
      LOGGER.APP.error(error.stack);
      return Response.ERROR(500, error.message, "sv_500");
    }
  }
  static async getOccupyAuction() {
    try {
      const { current_start, current_end } = provideDate();
      const connection = db("crawling");
      const queryDb = connection
        .whereBetween("transact_date", [current_start, current_end])
        .where("bid_class", "!=", "w/d");
      const totalResult = await queryDb
        .clone()
        .count("id as count")
        .sum("hammer_price as total_price")
        .first();
      if (totalResult.count === 0) {
        return Response.WARN(404, "data not found!", "404");
      }
      const result = await queryDb
        .select("company")
        .sum("hammer_price as hammer_price")
        .groupBy("company");
      for (let company of result) {
        company.occupy = (company.hammer_price / totalResult.total_price) * 100;
      }
      return Response.SUCCESS_SERVICE(
        "successfully!",
        `${current_start} ~ ${current_end}`,
        result
      );
    } catch (error) {
      LOGGER.APP.error(error.stack);
      return Response.ERROR(500, error.message, "sv_500");
    }
  }
}
module.exports =  SolutionServices;
