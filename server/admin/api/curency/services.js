const db = require('../../../config/connectDB') 
const LOGGER = require('../../../utils/logger') 
const Response = require('../../../utils/Response') 
const  snakeToCamel  = require('../../../utils/objStyleConverter') 
require('dotenv').config()

class Currency {
  static async createCurrency(data) {
    const {
      date,
      krw,
      gbp,
      eur,
      cnh,
      hkd,
      sgd,
      chf
    } = data;
    const connection = db('to_usd')
    try {
      let dataCurrency = {date,krw,gbp,eur,cnh,hkd,sgd,chf}
      await connection.insert(dataCurrency)
      return Response.SUCCESS('Create Currency Successfully !', dataCurrency)
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }
  static async getAllCurrency(data) {
    try {
      let { page, size, querySearch } = data;
      page = page || 1;
      size = size || 20;
      const connection = db('to_usd');
      let queryDb = connection.where({ is_deleted: false })
      if (querySearch) {
        queryDb.where(build =>
          build.where('to_usd.date', 'like', `%${querySearch.trim()}%`)
            .orWhere('to_usd.date', 'like', `%${querySearch.trim()}%`))
      };
      const totalElement = await (queryDb.clone().count('to_usd.id as count').first());
      if (Math.ceil(totalElement / size) < page) {
        return Response.SUCCESS("ok", []);
      }
      const results = await queryDb.select("*").orderBy('to_usd.created_at', 'desc').limit(size).offset((page - 1) * size);
      const resultsCamel = results.map(item => snakeToCamel(item));
      return Response.SUCCESS('ok!', Response.PAGEABLE(resultsCamel, totalElement.count, page, size));

    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }
  static async getDetailCurrency(data) {
    const connection = db('to_usd')
    try {
      let dataCurrency = await connection.select('*').where({is_deleted : false}).orderBy('to_usd.date', 'desc').first();
      if (!dataCurrency) {
      return Response.WARN(404, 'CurendataCurrency not found', 'cr_001')
      }
      const dataCurrencyCamel = snakeToCamel(dataCurrency)
      return Response.SUCCESS('get Detail CurendataCurrency successfully!',dataCurrencyCamel);
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

}

module.exports =  Currency
