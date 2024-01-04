const knex = require("../config/connectDB");

async function main(req, res, next) {
  input_word = req.query.artist;
  db_res = await knex
    .select("artist_kor")
    .from("old_crawling")
    .whereRaw(
      "replace(concat_ws(' ',artist_kor,artist_eng),' ','') like '%" +
        input_word +
        "%'"
    )
    .andWhereRaw("artist_kor not like '%,%'")
    .andWhereRaw("artist_kor not like '%외%'")
    .andWhereRaw("artist_kor not like '%/%'")
    .andWhereRaw("artist_kor not like '%(%'")
    .groupBy("artist_kor");

  let resp = [];
  for (var i = 0; i < db_res.length; i++) {
    resp.push(db_res[i].artist_kor);
  }
  res.send({
    result: true,
    msg: "데이터 로드 성공",
    resp: resp,
  });
}
module.exports = { main };
