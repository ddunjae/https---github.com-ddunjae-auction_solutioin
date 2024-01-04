const db = require('../../../config/connectDB')
const LOGGER = require('../../../utils/logger')
const snakeToCamel = require('../../../utils/objStyleConverter')
const Response = require('../../../utils/Response')
const { AUCTION_RESULTS, POPUP_POSITION, SELL_OR_NOT } = require('../../../utils/strVar')
const formatExcelTimeKr = require('../../../utils/dateUtils')
const exportSimpleExcel = require('../../../utils/excelUtils')
const moment = require('moment')
require('dotenv').config()
class AuctionSolution {
  static async createAution(data) {
    const trx = await db.transaction()
    try {
      const {
        transactDate,
        company,
        auctionName,
        onOff,
        location,
        artistId,
        artistKor,
        artistEng,
        artistBirth,
        artistDeath,
        lot,
        img,
        titleKor,
        titleEng,
        mfgDate,
        height,
        width,
        depth,
        materialKind,
        materialKor,
        materialEng,
        sizeTable,
        signed,
        exhibited,
        provenance,
        literature,
        catalogue,
        frame,
        certification,
        conditionReport,
        description,
        currency,
        startPrice,
        hammerPrice,
        sellingPrice,
        estimateMin,
        estimateMax,
        usdStartPrice,
        usdHammerPrice,
        usdSellingPrice,
        usdEstimateMin,
        usdEstimateMax,
        competition,
        bidClass,
        method,
        series,
        mainColor,
        preference,
        identicalRecords
      } = data;
      const imageArtist = img ? JSON.stringify(img) : '[]';
      // const dataIdenticalRecords = identicalRecords ? JSON.stringify(identicalRecords) : '[]';
      let dataAuction = {
        transact_date: transactDate,
        company,
        auction_name: auctionName,
        on_off: onOff,
        location,
        artist_id: artistId,
        artist_kor: artistKor,
        artist_eng: artistEng,
        artist_birth: artistBirth,
        artist_death: artistDeath,
        lot,
        img: imageArtist,
        title_kor: titleKor,
        title_eng: titleEng,
        mfg_date: mfgDate,
        height,
        width,
        depth,
        material_kind: materialKind,
        material_kor: materialKor,
        material_eng: materialEng,
        size_table: sizeTable,
        signed,
        exhibited,
        provenance,
        literature,
        catalogue,
        frame,
        certification,
        condition_report: conditionReport,
        description,
        currency,
        start_price: startPrice,
        hammer_price: hammerPrice,
        selling_price: sellingPrice,
        estimate_min: estimateMin,
        estimate_max: estimateMax,
        usd_start_price: usdStartPrice,
        usd_hammer_price: usdHammerPrice,
        usd_selling_price: usdSellingPrice,
        usd_estimate_min: usdEstimateMin,
        usd_estimate_max: usdEstimateMax,
        competition,
        bid_class: bidClass,
        method,
        series,
        main_color: mainColor,
        preference,
        identical_records: identicalRecords
      }
      await trx('crawling').insert(dataAuction)
      // if (dataAuction.artist_id === null ) {
      //   let dataArtist = 
      //   await trx('artist').insert(dataAuction)
      // }
      await trx.commit();
      return Response.SUCCESS('Insert Auction Successfully', dataAuction)
    } catch (error) {
      await trx.rollback()
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    } finally {
      await trx.commit();
    }
  }

  static async updateAuction(data) {
    const connection = await db.transaction()
    try {
      const {
        id,
        transactDate,
        company,
        auctionName,
        onOff,
        location,
        artistId,
        artistKor,
        artistEng,
        artistBirth,
        artistDeath,
        lot,
        img,
        titleKor,
        titleEng,
        mfgDate,
        height,
        width,
        depth,
        materialKind,
        materialKor,
        materialEng,
        sizeTable,
        signed,
        exhibited,
        provenance,
        literature,
        catalogue,
        frame,
        certification,
        conditionReport,
        description,
        currency,
        startPrice,
        hammerPrice,
        sellingPrice,
        estimateMin,
        estimateMax,
        usdStartPrice,
        usdHammerPrice,
        usdSellingPrice,
        usdEstimateMin,
        usdEstimateMax,
        competition,
        bidClass,
        method,
        series,
        mainColor,
        preference,
        identicalRecords,
        historicalCategory

      } = data;
   
      const auction = await connection('crawling').select('*').where({ is_deleted: false, id: id }).orderBy('crawling.created_at', 'desc').first()
      if (!auction) {
        return Response.WARN(404, 'Auction Solution not found', 'auc_001')
      }

      // if (artistId == null && artistKor !== null) {
      //   let insertAritst = await connection('artist')
      // }
      const imageArtist = img ? JSON.stringify(img) : '[]';
      const dataIdenticalRecords = identicalRecords ? JSON.stringify(identicalRecords) : '[]';
      let dataAuction = {
        id : id,
        transact_date: transactDate,
        company,
        auction_name: auctionName,
        on_off: onOff,
        location,
        artist_id: artistId,
        artist_kor: artistKor,
        artist_eng: artistEng,
        artist_birth: artistBirth,
        artist_death: artistDeath,
        lot,
        img: imageArtist,
        title_kor: titleKor,
        title_eng: titleEng,
        mfg_date: mfgDate,
        height,
        width,
        depth,
        material_kind: materialKind,
        material_kor: materialKor,
        material_eng: materialEng,
        size_table: sizeTable,
        signed,
        exhibited,
        provenance,
        literature,
        catalogue,
        frame,
        certification,
        condition_report: conditionReport,
        description,
        currency,
        start_price: startPrice,
        hammer_price: hammerPrice,
        selling_price: sellingPrice,
        estimate_min: estimateMin,
        estimate_max: estimateMax,
        usd_start_price: usdStartPrice,
        usd_hammer_price: usdHammerPrice,
        usd_selling_price: usdSellingPrice,
        usd_estimate_min: usdEstimateMin,
        usd_estimate_max: usdEstimateMax,
        competition,
        bid_class: bidClass,
        method,
        series,
        main_color: mainColor,
        preference,
        identical_records: dataIdenticalRecords,
        historical_category : historicalCategory,
        identical_records : identicalRecords,
        updated_at: moment(new Date()).format().replace('T', ' ').substring(0, 19)
      }

      // if(identicalRecords){
      //   dataAuction.identical_records = JSON.stringify(identicalRecords)
      // }
    
      await connection('crawling').update(dataAuction).where({ is_deleted: false, id: id })
      await connection.commit();
      return Response.SUCCESS('Edit Auction Successfully', dataAuction)
    } catch (error) {
      await connection.rollback()
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static async updateMultiRow(data) {
    try {
      const connection = db('crawling');
      const { crawLing = [] } = data
      if (crawLing.length < 1) {
        return Response.WARN(404, 'No Auction, dont update!', "auc_004")
      }
      
      crawLing.forEach(async (row) => {
        let result = {
          id: row.id,
          company: row.company,//
          // auction_name: row.auctionName,
          // on_off: row.onOff,
          // location: row.location,
          transact_date: row.transactDate,//
          // lot: row.lot,
          artist_id: row.artistId,
          artist_kor: row.artistKor,
          artist_eng: row.artistEng,
          artist_birth: row.artistBirth,//
          artist_death: row.artistDeath,//
          title_kor: row.titleKor,
          title_eng: row.titleEng,
          mfg_date: row.mfgDate,//
          height: row.height,//
          width: row.width,//
          depth: row.depth,//
          size_table: row.sizeTable,//
          material_kind: row.materialKind,
          material_kor: row.materialKor,//
          material_eng: row.materialEng,//
          // signed: row.signed,
          // exhibited: row.exhibited,
          // provenance: row.provenance,
          // literature: row.literature,
          // catalogue: row.catalogue,
          // frame: row.frame,
          // certification: row.certification,
          // condition_report: row.conditionReport,
          // description: row.description,
          // currency: row.currency,
          // bid_class: row.bidClass,
          hammer_price: row.hammerPrice,
          // selling_price: row.sellingPrice,
          // start_price: row.startPrice,
          estimate_min: row.estimateMin,
          estimate_max: row.estimateMax,
          // usd_hammer_price: row.usd_hammerPrice,
          // usd_selling_price: row.usdSllingPrice,
          // usd_start_price: row.usdStartPrice,
          // usd_estimate_min: row.usdEstimateMin,
          // usd_estimate_max: row.usdEstimateMax,
          // competition: row.competition,
          method: row.method,
          series: row.series,
          main_color: row.mainColor,
          preference: row.preference,
          // historical_category: row.historicalCategory,
          identical_records: row.identicalRecords,
        }
        await connection.update(result).where({ id: result.id, is_deleted: false })
      })
      return Response.SUCCESS('Update All Successfully', crawLing)
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static async updateDataMainPage(data) {
    const connection = await db.transaction()
    try {
      const {
        id,
        transactDate,
        company,
        auctionName,
        onOff,
        location,
        artistId,
        artistKor,
        artistEng,
        artistBirth,
        artistDeath,
        lot,
        titleKor,
        titleEng,
        mfgDate,
        height,
        width,
        depth,
        materialKind,
        materialKor,
        materialEng,
        sizeTable,
        signed,
        exhibited,
        provenance,
        literature,
        catalogue,
        frame,
        certification,
        conditionReport,
        description,
        currency,
        startPrice,
        hammerPrice,
        sellingPrice,
        estimateMin,
        estimateMax,
        usdStartPrice,
        usdHammerPrice,
        usdSellingPrice,
        usdEstimateMin,
        usdEstimateMax,
        competition,
        bidClass,
        method,
        series,
        mainColor,
        preference,
        identicalRecords,
        historicalCategory

      } = data;
      
      const auction = await connection('crawling').select('*').where({ is_deleted: false, id: id }).orderBy('crawling.created_at', 'desc').first()
      if (!auction) {
        return Response.WARN(404, 'Auction Solution not found', 'auc_001')
      }
      let dataAuction = {
        id : id,
        transact_date: transactDate,
        company,
        auction_name: auctionName,
        on_off: onOff,
        location,
        artist_id: artistId,
        artist_kor: artistKor,
        artist_eng: artistEng,
        artist_birth: artistBirth,
        artist_death: artistDeath,
        lot,
        title_kor: titleKor,
        title_eng: titleEng,
        mfg_date: mfgDate,
        height,
        width,
        depth,
        material_kind: materialKind,
        material_kor: materialKor,
        material_eng: materialEng,
        size_table: sizeTable,
        signed,
        exhibited,
        provenance,
        literature,
        catalogue,
        frame,
        certification,
        condition_report: conditionReport,
        description,
        currency,
        start_price: startPrice,
        hammer_price: hammerPrice,
        selling_price: sellingPrice,
        estimate_min: estimateMin,
        estimate_max: estimateMax,
        usd_start_price: usdStartPrice,
        usd_hammer_price: usdHammerPrice,
        usd_selling_price: usdSellingPrice,
        usd_estimate_min: usdEstimateMin,
        usd_estimate_max: usdEstimateMax,
        competition,
        bid_class: bidClass,
        method,
        series,
        main_color: mainColor,
        preference,
        historical_category : historicalCategory,
        identical_records : identicalRecords,
        updated_at: moment(new Date()).format().replace('T', ' ').substring(0, 19)
      }
      // if(identicalRecords){
      //   dataAuction.identical_records = JSON.stringify(identicalRecords)
      // }
      await connection('crawling').update(dataAuction).where({ is_deleted: false, id: id })
      await connection.commit();
      return Response.SUCCESS('Edit Auction Successfully', dataAuction)
    } catch (error) {
      await connection.rollback()
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static async deleteAuction(data) {
    try {
      const connection = db('crawling')
      const { id } = data;

      const auction = await connection.where({ id: id, is_deleted: false }).first()
      if (!auction) {
        return Response.WARN(404, 'Auction Solution not found!', "auc_002")
      }
      await connection.where({ id: id }).update({
        is_deleted: true
      })
      return Response.SUCCESS('Delete Auction Solution successfully !')
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static async getAllAuction(data) {
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
        querySearch,
        mainColorSearch,
        method = [],
        series = [],
        preference = [],
        order,
        field
      } = data;
      page = page || 1;
      size = size || 20;
      order = order || "desc"
      const connection = db('crawling');
      let queryDb = connection.where({ is_deleted: false })
      if(mainColorSearch){
        mainColor.push(...mainColorSearch.split(","))
      }
      // Auction Name
      if (auctionName) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `)
            .orWhereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `))
      }
      // size Table
      if (sizeTable.length !== 0) {
        queryDb.where(build =>
          build.whereBetween(`crawling.size_table`, [sizeTable[0] === "" ? 0 : sizeTable[0], sizeTable[1] === "" ? 9999 : sizeTable[1]]))
      }
      //Sell or not
      if (sellOrNot.length !== 0) {
        if (sellOrNot.length === 1) {
          if (sellOrNot.includes(SELL_OR_NOT.SOLD)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price != 0`).andWhereRaw(`crawling.bid_class != 'w/d'`))
          }
          if (sellOrNot.includes(SELL_OR_NOT.NOTSOLD)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price = 0`).andWhereRaw(`crawling.bid_class != 'w/d'`))
          }
          if (sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.bid_class = 'w/d'`))
          }
        } else if (sellOrNot.length === 2) {
          if (sellOrNot.includes(SELL_OR_NOT.SOLD) && sellOrNot.includes(SELL_OR_NOT.NOTSOLD)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.bid_class != 'w/d'`)
            )
          } else if (sellOrNot.includes(SELL_OR_NOT.SOLD) && sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price != 0`).orWhereRaw(`crawling.bid_class  =  'w/d'`)
            )
          } else if (sellOrNot.includes(SELL_OR_NOT.NOTSOLD) && sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price = 0`).orWhereRaw(`crawling.bid_class  =  'w/d'`)
            )
          }
        }
      }
      //Price
      if (pricetp) {
        if (price.length !== 0) {
          queryDb.where(build =>
            build.whereNotNull(`crawling.${pricetp}`)
              .andWhereBetween(`crawling.${pricetp}`, [price[0] === "" ? 0 : price[0], price[1] === "" ? 99999999999999 : price[1]]))
        }
      }
      //Author
      if (querySearch) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.artist_kor) like '%${querySearch.trim().toLowerCase()}%'`)
            .orWhereRaw(`LOWER(crawling.artist_eng) like '%${querySearch.trim().toLowerCase()}%'`)
            .orWhereRaw(`crawling.identical_records = '${Number(querySearch)}'`)
          // .orWhereRaw(`LOWER(crawling.title_kor) like '%${querySearch.trim().toLowerCase()}%'`)
          // .orWhereRaw(`LOWER(crawling.title_eng) like '%${querySearch.trim().toLowerCase()}%'`)
        )
      };
      // material Kind
      if (material.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.material_kind', material))
      }
      if (materialSearch) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.material_kor) like '%${materialSearch.trim().toLowerCase()}%'`)
            .orWhereRaw(`LOWER(crawling.material_eng)  like '%${materialSearch.trim().toLowerCase()}%'`))
      };
      // /transactDate
      if (transactDate.length !== 0) {
        queryDb.where(build =>
          build.whereBetween(`crawling.transact_date`, [transactDate[0] === "" ? moment(new Date('0000-01-01')).format('YYYY-MM-DD[T]HH:mm:ss[Z]') : moment(transactDate[0]).format('YYYY-MM-DD[T]HH:mm:ss[Z]'), transactDate[1] == "" ? moment(new Date('9999-01-01')).format('YYYY-MM-DD[T]HH:mm:ss[Z]') : moment(transactDate[1]).format('YYYY-MM-DD[T]HH:mm:ss[Z]')]))
      }
      // mfgDate
      if (mfgDate.length !== 0) {
        queryDb.where(build =>
          build.whereBetween('crawling.mfg_date', [mfgDate[0] === "" ? "0000" : mfgDate[0], mfgDate[1] === "" ? "9999" : mfgDate[1]]))
      }
      // Title
      if (title) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.title_kor) like '%${title.trim().toLowerCase()}%' `)
            .orWhereRaw(`LOWER(crawling.title_eng) like '%${title.trim().toLowerCase()}%' `))
      }
      // Heght
      if (height.length !== 0) {
        queryDb.where(build =>
          build.whereBetween('crawling.height', [height[0] == "" ? 0 : height[0], height[1] == "" ? 99999999 : height[1]]))
      }
      // Width
      if (width.length !== 0) {
        queryDb.where(build =>
          build.whereBetween('crawling.width', [width[0] == "" ? 0 : width[0], width[1] == "" ? 99999999 : width[1]]))
      }
      // Company
      if (company.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.company', company))
      }
      // location
      if (location.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.location', location))
      }
      // bid Class
      if (bidClass.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.bid_class', bidClass))
      }
      // on Off
      if (onOff) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.on_off) = '${onOff.trim().toLowerCase()}'`))
      }

      // certification
      if (certification == "0") {
        queryDb.where(build =>
          build.where(`crawling.certification`, '=', ''))
      } else if (certification == "1") {
        queryDb.where(build =>
          build.where(`crawling.certification`, '!=', ''))
      }
      //Main color
      if (mainColor.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.main_color', mainColor))
      }
      //Method
      if (method.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.method', method))
      }
      //Series
      if (series.length !== 0) { 
        queryDb.where(build =>
          build.whereIn('crawling.series', series))
      }
      //preference
      if (preference.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.preference', preference))
      }
      const totalElement = await (queryDb.clone().count('crawling.id as count').first());
      if (Math.ceil(totalElement / size) < page) {
        return Response.SUCCESS("ok", []);
      }
      let results
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
        results = await queryDb.select().orderBy(`${field}`, `${order}`).limit(size).offset((page - 1) * size);
      } else if (field == 'artist_kor') {
        results = await queryDb.select()
          .orderBy(db.raw("(case when artist_kor is null or artist_kor = '' then artist_eng\
        when artist_eng is null or artist_eng = '' then artist_kor\
        else concat_ws('-', artist_kor, artist_eng) end )\
        COLLATE utf8mb4_unicode_520_ci"), `${order}`).limit(size).offset((page - 1) * size);
      } else if (field == 'title_kor') {
        results = await queryDb.select()
          .orderBy(db.raw("(case when title_kor is null or title_kor = '' then title_eng\
        when title_eng is null or title_eng = '' then title_kor\
        else concat_ws('-', title_kor, title_eng) end )\
        COLLATE utf8mb4_unicode_520_ci"), `${order}`).limit(size).offset((page - 1) * size);
      } else if (field == 'material_kor') {

        results = await queryDb.select()
          .orderBy(db.raw("(case when material_kor is null or material_kor = '' then material_eng\
        when material_eng is null or material_eng = '' then material_kor\
        else concat_ws('-', material_kor, material_eng) end )\
        COLLATE utf8mb4_unicode_520_ci"), `${order}`).limit(size).offset((page - 1) * size);
      } else if (field == 'company') {
        results = await queryDb.select().orderBy(db.raw("" +
          field +
          " COLLATE utf8mb4_unicode_520_ci"), `${order}`).limit(size).offset((page - 1) * size);
      } else {
        results = await queryDb.select().orderBy('id', 'desc').limit(size).offset((page - 1) * size);
      
      }
      const resultsCamel = results.map(item => snakeToCamel(item));
      return Response.SUCCESS('ok!', Response.PAGEABLE(resultsCamel, totalElement.count, page, size));
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }
  
  static async getDetailAuction(data) {
    const connection = db('crawling')
    try {
      let { id } = data;
      let dataAuction = await connection.select('*').where({ is_deleted: false, id: id }).first();
      if (!dataAuction) {
        return Response.WARN(404, 'Data Auction not found', 'auc_003')
      }
      const dataAuctionCamel = snakeToCamel(dataAuction)
      return Response.SUCCESS('get Detail auction successfully!', dataAuctionCamel);
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static async exportExcel(data) {
    const connection = db('crawling')
    const connection2 = db('to_usd')
    try {
      let { records = [] } = data
      if (records.length < 1) {
        return Response.WARN(404, 'No record selected', 'auc_004')
      }
      let dataCurrency = await connection2.select('*').clone().where({ is_deleted: false }).orderBy('to_usd.date', 'desc').first();
      if (!dataCurrency) {
        return Response.WARN(404, 'CurendataCurrency not found', 'auc_005')
      }
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
      const titles = [
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
        e.start_price,
        e.hammer_price,
        e.selling_price,
        e.estimate_min,
        e.estimate_max,
        e.usd_start_price = this.#caculteAuction({ currency: this.#getCurrency(e.currency, dataCurrency), startPrice: e.start_price, hammerPrice: e.hammer_price, sellingPrice: e.selling_price, estimateMin: e.estimate_min, estimateMax: e.estimate_max }).usdStartPrice,
        e.usd_hammer_price = this.#caculteAuction({ currency: this.#getCurrency(e.currency, dataCurrency), startPrice: e.start_price, hammerPrice: e.hammer_price, sellingPrice: e.selling_price, estimateMin: e.estimate_min, estimateMax: e.estimate_max }).usdHammerPrice,
        e.usd_selling_price = this.#caculteAuction({ currency: this.#getCurrency(e.currency, dataCurrency), startPrice: e.start_price, hammerPrice: e.hammer_price, sellingPrice: e.selling_price, estimateMin: e.estimate_min, estimateMax: e.estimate_max }).usdSellingPrice,
        e.usd_estimate_min = this.#caculteAuction({ currency: this.#getCurrency(e.currency, dataCurrency), startPrice: e.start_price, hammerPrice: e.hammer_price, sellingPrice: e.selling_price, estimateMin: e.estimate_min, estimateMax: e.estimate_max }).usdEstimateMin,
        e.usd_estimate_max = this.#caculteAuction({ currency: this.#getCurrency(e.currency, dataCurrency), startPrice: e.start_price, hammerPrice: e.hammer_price, sellingPrice: e.selling_price, estimateMin: e.estimate_min, estimateMax: e.estimate_max }).usdEstimateMax,
        e.competiton = this.#caculteAuction({ currency: this.#getCurrency(e.currency, dataCurrency), startPrice: e.start_price, hammerPrice: e.hammer_price, sellingPrice: e.selling_price, estimateMin: e.estimate_min, estimateMax: e.estimate_max }).competition,
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
        colsTitle: titles,
      }
      let download = exportSimpleExcel(dataSave);
      return download
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static #getCurrency(currency, dataCurrency) {
    let currentMoney = 0
    if (currency !== null) {
      if (currency.toLowerCase() == 'krw') {
        currentMoney = dataCurrency.krw
      } else if (currency.toLowerCase() == 'gbp') {
        currentMoney = dataCurrency.gbp
      } else if (currency.toLowerCase() == 'eur') {
        currentMoney = dataCurrency.eur
      } else if (currency.toLowerCase() == 'cnh') {
        currentMoney = dataCurrency.cnh
      } else if (currency.toLowerCase() == 'hkd') {
        currentMoney = dataCurrency.hkd
      } else if (currency.toLowerCase() == 'sgd') {
        currentMoney = dataCurrency.sgd
      } else if (currency.toLowerCase() == 'chf') {
        currentMoney = dataCurrency.chf
      }
    } else {
      currentMoney = dataCurrency.krw
    }
    return currentMoney
  }

  static async caculateBeforeCreateAndUpdate(data) {
    try {
      const result = this.#caculteAuction(data)
      return Response.SUCCESS('ok !', result)
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static #caculteAuction(data) {
    try {
      const {
        currency, // Đơn vị tiền
        startPrice, // Tiền bắt đầu
        hammerPrice, //Giá chốt
        sellingPrice, // Giá bán
        estimateMin, // Ước tính thấp nhất
        estimateMax, // Ước tính cao nhất
      } = data
      let result = {}
      // Tỉ giá
      if (currency) {
        result.exchangeRate = 1 / Number(currency)
      }
      // Ước tính thấp nhất
      if (Number(estimateMin) !== 0 || Number(estimateMin) !== null || Number(estimateMin) !== undefined) {
        if (Number(result.exchangeRate) !== 0) {
          result.usdEstimateMin = Number(estimateMin) / Number(result.exchangeRate)
        }
      }
      // Ước tính cao nhất
      if (Number(estimateMax) !== 0 || Number(estimateMax) !== null || Number(estimateMax) !== undefined) {
        if (Number(result.exchangeRate) !== 0) {
          result.usdEstimateMax = Number(estimateMax) / Number(result.exchangeRate)
        }
      }
      //Giá bắt đầu usd
      if (Number(startPrice) !== 0 || Number(startPrice) !== null || Number(startPrice) !== undefined) {
        result.usdStartPrice = Number(startPrice) / Number(result.exchangeRate)
      }
      // Giá chốt
      if (Number(hammerPrice) !== 0 || Number(hammerPrice) !== null || Number(hammerPrice) !== undefined) {
        result.usdHammerPrice = Number(hammerPrice) / Number(result.exchangeRate)
      }
      // Giá bán 
      if (Number(sellingPrice) !== 0 || Number(sellingPrice) !== null || Number(sellingPrice) !== undefined) {
        result.usdSellingPrice = Number(sellingPrice) / Number(result.exchangeRate)
      }
      this.#resultAution(hammerPrice, estimateMin, estimateMax, result)
      this.#resultCompetition(hammerPrice, startPrice, result)
      return result
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static #resultAution(hammerPrice, estimateMin, estimateMax, result) {
    try {
      if (!hammerPrice) {
        result.bidClass = AUCTION_RESULTS.UNSOLD
      } else if (hammerPrice && estimateMin && estimateMin > hammerPrice) {
        result.bidClass = AUCTION_RESULTS.BELOW
      } else if (hammerPrice && estimateMax && estimateMax < hammerPrice) {
        result.bidClass = AUCTION_RESULTS.ABOVE
      } else if ((hammerPrice && hammerPrice >= estimateMin && hammerPrice <= estimateMax) || (hammerPrice && !estimateMin) || (hammerPrice && !estimateMax)  ){
        result.bidClass = AUCTION_RESULTS.WITHIN
      }
      return result
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static #resultCompetition(hammerPrice, startPrice, result) {
    try {
      if (!hammerPrice) {
        result.competition = null
      }
      if (!startPrice) {
        result.competition = 0
      }
      if (startPrice === 0) {
        result.competition = Number(hammerPrice) / 50000
      } else if (startPrice !== 0) {
        result.competition = Number(hammerPrice) / Number(startPrice) - 1
      }
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static async exportExcelAfterSearch(data) {
    try {
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
        querySearch,
        order,
        field
      } = data;
      order = order || "desc"
      const connection = db('crawling');
      let queryDb = connection.where({ is_deleted: false })
      const connection2 = db('to_usd')
      let dataCurrency = await connection2.select('*').clone().where({ is_deleted: false }).orderBy('to_usd.date', 'desc').first();
      if (!dataCurrency) {
        return Response.WARN(404, 'CurendataCurrency not found', 'auc_005')
      }
      // Auction Name
      if (auctionName) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `)
            .orWhereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `))
      }
      // size Table
      if (sizeTable.length !== 0) {
        queryDb.where(build =>
          build.whereBetween(`crawling.size_table`, [sizeTable[0] === "" ? 0 : sizeTable[0], sizeTable[1] === "" ? 9999 : sizeTable[1]]))
      }
      //Sell or not
      if (sellOrNot.length !== 0) {
        if (sellOrNot.length === 1) {
          if (sellOrNot.includes(SELL_OR_NOT.SOLD)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price != 0`).andWhereRaw(`crawling.bid_class != 'w/d'`))
          }
          if (sellOrNot.includes(SELL_OR_NOT.NOTSOLD)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price = 0`).andWhereRaw(`crawling.bid_class != 'w/d'`))
          }
          if (sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.bid_class = 'w/d'`))
          }
        } else if (sellOrNot.length === 2) {
          if (sellOrNot.includes(SELL_OR_NOT.SOLD) && sellOrNot.includes(SELL_OR_NOT.NOTSOLD)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.bid_class != 'w/d'`)
            )
          } else if (sellOrNot.includes(SELL_OR_NOT.SOLD) && sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price != 0`).orWhereRaw(`crawling.bid_class  =  'w/d'`)
            )
          } else if (sellOrNot.includes(SELL_OR_NOT.NOTSOLD) && sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price = 0`).orWhereRaw(`crawling.bid_class  =  'w/d'`)
            )
          }
        }

      }
      //Price
      if (pricetp) {
        if (price.length !== 0) {
          queryDb.where(build =>
            build.whereNotNull(`crawling.${pricetp}`)
              .andWhereBetween(`crawling.${pricetp}`, [price[0] === "" ? 0 : price[0], price[1] === "" ? 99999999999999 : price[1]]))
        }
      }
      //Author
      if (querySearch) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.artist_kor) like '%${querySearch.trim().toLowerCase()}%'`)
            .orWhereRaw(`LOWER(crawling.artist_eng) like '%${querySearch.trim().toLowerCase()}%'`)
            .orWhereRaw(`LOWER(crawling.id) = '${Number(querySearch)}'`)
        )
      };
      // material Kind
      if (material.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.material_kind', material))
      }
      if (materialSearch) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.material_kor) like '%${materialSearch.trim().toLowerCase()}%'`)
            .orWhereRaw(`LOWER(crawling.material_eng)  like '%${materialSearch.trim().toLowerCase()}%'`))
      };
      // /transactDate
      if (transactDate.length !== 0) {
        queryDb.where(build =>
          build.whereBetween(`crawling.transact_date`, [transactDate[0] === "" ? moment(new Date('0000-01-01')).format('YYYY-MM-DD[T]HH:mm:ss[Z]') : moment(transactDate[0]).format('YYYY-MM-DD[T]HH:mm:ss[Z]'), transactDate[1] == "" ? moment(new Date('9999-01-01')).format('YYYY-MM-DD[T]HH:mm:ss[Z]') : moment(transactDate[1]).format('YYYY-MM-DD[T]HH:mm:ss[Z]')]))
      }
      // mfgDate
      if (mfgDate.length !== 0) {
        queryDb.where(build =>
          build.whereBetween('crawling.mfg_date', [mfgDate[0] === "" ? "0000" : mfgDate[0], mfgDate[1] === "" ? "9999" : mfgDate[1]]))
      }
      // Title
      if (title) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.title_kor) like '%${title.trim().toLowerCase()}%' `)
            .orWhereRaw(`LOWER(crawling.title_eng) like '%${title.trim().toLowerCase()}%' `))
      }
      // Heght
      if (height.length !== 0) {
        queryDb.where(build =>
          build.whereBetween('crawling.height', [height[0] == "" ? 0 : height[0], height[1] == "" ? 99999999 : height[1]]))
      }
      // Width
      if (width.length !== 0) {
        queryDb.where(build =>
          build.whereBetween('crawling.width', [width[0] == "" ? 0 : width[0], width[1] == "" ? 99999999 : width[1]]))
      }
      // Company
      if (company.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.company', company))
      }
      // location
      if (location.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.location', location))
      }
      // bid Class
      if (bidClass.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.bid_class', bidClass))
      }
      // on Off
      if (onOff) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.on_off) = '${onOff.trim().toLowerCase()}'`))
      }

      // certification
      if (certification == "0") {
        queryDb.where(build =>
          build.where(`crawling.certification`, '=', ''))
      } else if (certification == "1") {
        queryDb.where(build =>
          build.where(`crawling.certification`, '!=', ''))
      }

      let results
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
        results = await queryDb.select().orderBy(`${field}`, `${order}`).limit(10000);
      } else if (field == 'artist_kor') {
        results = await queryDb.select()
          .orderBy(db.raw("(case when artist_kor is null or artist_kor = '' then artist_eng\
        when artist_eng is null or artist_eng = '' then artist_kor\
        else concat_ws('-', artist_kor, artist_eng) end )\
        COLLATE utf8mb4_unicode_520_ci"), `${order}`).limit(10000);
      } else if (field == 'title_kor') {
        results = await queryDb.select()
          .orderBy(db.raw("(case when title_kor is null or title_kor = '' then title_eng\
        when title_eng is null or title_eng = '' then title_kor\
        else concat_ws('-', title_kor, title_eng) end )\
        COLLATE utf8mb4_unicode_520_ci"), `${order}`).limit(10000);
      } else if (field == 'material_kor') {
        results = await queryDb.select()
          .orderBy(db.raw("(case when material_kor is null or material_kor = '' then material_eng\
        when material_eng is null or material_eng = '' then material_kor\
        else concat_ws('-', material_kor, material_eng) end )\
        COLLATE utf8mb4_unicode_520_ci"), `${order}`).limit(10000);
      } else if (field == 'company') {
        results = await queryDb.select().orderBy(db.raw("" +
          field +
          " COLLATE utf8mb4_unicode_520_ci"), `${order}`).limit(10000);
      } else {
        results = await queryDb.select().orderBy('id', 'desc').limit(10000);
      }
      
      const titles = [
        '#',
        'ID',
        'Transact Date',
        'Company',
        'onOff',
        'Artist Kor',
        'Lot.No',
        'Title Kor',
        'Title Eng',
        'MfgDate',
        'Image Url',
        'Height',
        'Width',
        'Depth',
        'Material Kind',
        'MaterialKor',
        'MaterialEng',
        'Size Table',
        'Start Price',
        'Hammer Price',
        'Estimate Min',
        'Estimate Max',
        'Bid Class',
        'Description'
      ]

      let count = 1
      const dataExport = results.map((e) => [
        count++,
        e.id, //
        e.transact_date,//
        e.company,//
        e.on_off,//
        e.artist_kor,//
        e.lot,//
        e.title_kor,//
        e.title_eng,//
        e.mfg_date,//
        e.img,//
        e.height,//
        e.width,//
        e.depth,//
        e.material_kind,//
        e.material_kor,//
        e.material_eng,//
        e.size_table,//
        e.start_price,//
        e.hammer_price,//
        e.estimate_min,//
        e.estimate_max,//
        e.bid_class,
        e.description
      ])
      const dataSave = {
        fileName: 'List_of_Auction',
        data: dataExport,
        colsTitle: titles,
      }
      
      let download = exportSimpleExcel(dataSave);
      return download
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static async getDataAfterFilter(data) {
    try {
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
        // mainColor = [],
        querySearch,
        // mainColorSearch,
        method = [],
        // series = [],
        // preference = []
      } = data;
      const connection = db('crawling');
      let queryDb = connection.where({ is_deleted: false })
      // if(mainColorSearch){
      //   mainColor.push(...mainColorSearch.split(","))
      // };
      // Auction Name
      if (auctionName) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `)
            .orWhereRaw(`LOWER(crawling.auction_name) like '%${auctionName.trim().toLowerCase()}%' `))
      };
      // size Table
      if (sizeTable.length !== 0) {
        queryDb.where(build =>
          build.whereBetween(`crawling.size_table`, [sizeTable[0] === "" ? 0 : sizeTable[0], sizeTable[1] === "" ? 9999 : sizeTable[1]]))
      };
      //Sell or not
      if (sellOrNot.length !== 0) {
        if (sellOrNot.length === 1) {
          if (sellOrNot.includes(SELL_OR_NOT.SOLD)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price != 0`).andWhereRaw(`crawling.bid_class != 'w/d'`))
          }
          if (sellOrNot.includes(SELL_OR_NOT.NOTSOLD)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price = 0`).andWhereRaw(`crawling.bid_class != 'w/d'`))
          }
          if (sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.bid_class = 'w/d'`))
          }
        } else if (sellOrNot.length === 2) {
          if (sellOrNot.includes(SELL_OR_NOT.SOLD) && sellOrNot.includes(SELL_OR_NOT.NOTSOLD)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.bid_class != 'w/d'`)
            )
          } else if (sellOrNot.includes(SELL_OR_NOT.SOLD) && sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price != 0`).orWhereRaw(`crawling.bid_class  =  'w/d'`)
            )
          } else if (sellOrNot.includes(SELL_OR_NOT.NOTSOLD) && sellOrNot.includes(SELL_OR_NOT.WITHDRAW)) {
            queryDb.where(build =>
              build.whereRaw(`crawling.hammer_price = 0`).orWhereRaw(`crawling.bid_class  =  'w/d'`)
            )
          }
        }
      };
      //Price
      if (pricetp) {
        if (price.length !== 0) {
          queryDb.where(build =>
            build.whereNotNull(`crawling.${pricetp}`)
              .andWhereBetween(`crawling.${pricetp}`, [price[0] === "" ? 0 : price[0], price[1] === "" ? 99999999999999 : price[1]]))
        }
      };
      //Author
      if (querySearch) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.artist_kor) like '%${querySearch.trim().toLowerCase()}%'`)
            .orWhereRaw(`LOWER(crawling.artist_eng) like '%${querySearch.trim().toLowerCase()}%'`)
            .orWhereRaw(`crawling.identical_records = '${Number(querySearch)}'`)
          // .orWhereRaw(`LOWER(crawling.title_kor) like '%${querySearch.trim().toLowerCase()}%'`)
          // .orWhereRaw(`LOWER(crawling.title_eng) like '%${querySearch.trim().toLowerCase()}%'`)
        )
      };
      // material Kind
      if (material.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.material_kind', material))
      };
      if (materialSearch) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.material_kor) like '%${materialSearch.trim().toLowerCase()}%'`)
            .orWhereRaw(`LOWER(crawling.material_eng)  like '%${materialSearch.trim().toLowerCase()}%'`))
      };
      // /transactDate
      if (transactDate.length !== 0) {
        queryDb.where(build =>
          build.whereBetween(`crawling.transact_date`, [transactDate[0] === "" ? moment(new Date('0000-01-01')).format('YYYY-MM-DD[T]HH:mm:ss[Z]') : moment(transactDate[0]).format('YYYY-MM-DD[T]HH:mm:ss[Z]'), transactDate[1] == "" ? moment(new Date('9999-01-01')).format('YYYY-MM-DD[T]HH:mm:ss[Z]') : moment(transactDate[1]).format('YYYY-MM-DD[T]HH:mm:ss[Z]')]))
      };
      // mfgDate
      if (mfgDate.length !== 0) {
        queryDb.where(build =>
          build.whereBetween('crawling.mfg_date', [mfgDate[0] === "" ? "0000" : mfgDate[0], mfgDate[1] === "" ? "9999" : mfgDate[1]]))
      };
      // Title
      if (title) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.title_kor) like '%${title.trim().toLowerCase()}%' `)
            .orWhereRaw(`LOWER(crawling.title_eng) like '%${title.trim().toLowerCase()}%' `))
      };
      // Heght
      if (height.length !== 0) {
        queryDb.where(build =>
          build.whereBetween('crawling.height', [height[0] == "" ? 0 : height[0], height[1] == "" ? 99999999 : height[1]]))
      };
      // Width
      if (width.length !== 0) {
        queryDb.where(build =>
          build.whereBetween('crawling.width', [width[0] == "" ? 0 : width[0], width[1] == "" ? 99999999 : width[1]]))
      };
      // Company
      if (company.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.company', company))
      };
      // location
      if (location.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.location', location))
      };
      // bid Class
      if (bidClass.length !== 0) {
        queryDb.where(build =>
          build.whereIn('crawling.bid_class', bidClass))
      };
      // on Off
      if (onOff) {
        queryDb.where(build =>
          build.whereRaw(`LOWER(crawling.on_off) = '${onOff.trim().toLowerCase()}'`))
      };

      // certification
      if (certification == "0") {
        queryDb.where(build =>
          build.where(`crawling.certification`, '=', ''))
      } else if (certification == "1") {
        queryDb.where(build =>
          build.where(`crawling.certification`, '!=', ''))
      };
      //Main color
      // if (mainColor.length !== 0) {
      //   queryDb.where(build =>
      //     build.whereIn('crawling.main_color', mainColor))
      // };
      //Method
      // if (method.length !== 0) {
      //   queryDb.where(build =>
      //     build.whereIn('crawling.method', method))
      // };
      // //Series
      // if (series.length !== 0) { 
      //   queryDb.where(build =>
      //     build.whereIn('crawling.series', series))
      // };
      // //preference
      // if (preference.length !== 0) {
      //   queryDb.where(build =>
      //     build.whereIn('crawling.preference', preference))
      // };
      let results = await queryDb.select();
      const mainColorMap = {};
      const preferenceMap = {};
      const seriesMap = {};
      let mainColorResult = [];
      let preferenceResult = [];
      let seriesResult = [];

    results.forEach((e)=>{
      if(!mainColorMap[e.main_color] && e.main_color != null && e.main_color != ''){
        mainColorMap[e.main_color] = e.main_color;
        mainColorResult.push(e.main_color)
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
    return Response.SUCCESS('ok', {main_color : mainColorResult,preference : preferenceResult, series : seriesResult})
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
    
  } 
}
module.exports = AuctionSolution
