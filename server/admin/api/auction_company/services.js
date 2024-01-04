const db = require('../../../config/connectDB') 
const LOGGER = require('../../../utils/logger') 
const Response = require('../../../utils/Response') 
const snakeToCamel  = require('../../../utils/objStyleConverter') 
require('dotenv').config()

class AuctionCompany {
  static async createAuctionCompany(data) {
    const {
      company,
      onlineFeerate,
      offlineFeerate,
      overseas,
    } = data;
    const connection = db('auction_company')
    try {
      let dataConpmany = {
        company,
        online_feerate : onlineFeerate,
        offline_feerate : offlineFeerate,
        overseas
      }
      let checkDataCompany = await connection.select('*').where({company : company}).orderBy('auction_company.created_at','desc').first();
      if (checkDataCompany) {
      return Response.WARN(404,'Name Company already exits, try again!' , "acc_001")
      }
      await connection.insert(dataConpmany)
      return Response.SUCCESS('Create Author Successfully !', dataConpmany)

    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }
  static async getAllConpmany(data) {
    try {
      let { page, size, querySearch } = data;
      page = page || 1;
      size = size || 20;
      const connection = db('auction_company');
      let queryDb = connection.where({ is_deleted: false })
      if (querySearch) {
        queryDb.where(build =>
          build.where('auction_company.company', 'like', `%${querySearch.trim()}%`)
            .orWhere('auction_company.overseas', 'like', `%${querySearch.trim()}%`))
      };
      const totalElement = await (queryDb.clone().count('auction_company.id as count').first());
      if (Math.ceil(totalElement / size) < page) {
        return Response.SUCCESS("ok", []);
      }
      const results = await queryDb.select("*").orderBy('auction_company.created_at', 'desc').limit(size).offset((page - 1) * size);
      const resultsCamel = results.map(item => snakeToCamel(item));
      return Response.SUCCESS('ok!', Response.PAGEABLE(resultsCamel, totalElement.count, page, size));

    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }
  static async getDetailCompany(data) {
    const connection = db('artist')
    try {
      let {id} = data;
      let dataAuthor = await connection.select('*').where({is_deleted : false, id : id});
      if (!dataAuthor) {
      return Response.WARN(404, 'Author not found', 'acc_002')
      }
      console.log(dataAuthor);
      const dataAuthorCamel = snakeToCamel(dataAuthor)
      return Response.SUCCESS('get Detail author successfully!',dataAuthorCamel);
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

}

module.exports =  AuctionCompany
