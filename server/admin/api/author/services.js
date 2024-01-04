const db = require('../../../config/connectDB') 
const LOGGER = require('../../../utils/logger') 
const Response = require('../../../utils/Response') 
const  snakeToCamel  = require('../../../utils/objStyleConverter') 
const moment = require('moment') 
const knex = require('../../../config/connectDB')
const exportSimpleExcel = require('../../../utils/excelUtils')
require('dotenv').config()
const Hangul = require('hangul-js');
class Author {
  static async createAuthor(data) {
    const {
      nameKr,
      nameEn,
      nameCn,
      born,
      dead,
      aliasKr,
      aliasEn,
      externalLink,
      reference,
      exhibition,
      education,
      description,
      memo,
      generation,
      artMovmnt,
      nationality1,
      nationality2
    } = data;
    const connection = db('artist')
    try {
      let dataAuthor = {
        name_kr : nameKr, 
        name_en : nameEn,
        name_cn : nameCn,
        born ,
        dead,
        alias_kr : aliasKr,
        alias_en : aliasEn,
        external_link : externalLink,
        reference,
        exhibition,
        education,
        description,
        memo,
        generation,
        art_movmnt: artMovmnt,
        nationality1,
        nationality2
      }
      await connection.insert(dataAuthor)
      return Response.SUCCESS('Create Author Successfully !', dataAuthor)

    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }
  static async editAuthor(data) {
    const {
      id,
      nameKr,
      nameEn,
      nameCn,
      born,
      dead,
      // aliasKr,
      // aliasEn,
      externalLink,
      reference,
      exhibition,
      education,
      description,
      memo,
      generation,
      artMovmnt,
      nationality1,
      nationality2
    } = data;
    const connection = db('artist')
    try {
      const author = await connection.where({is_deleted : false, id : id}).orderBy('created_at','desc').first()
      if(!author) {
      return Response.ERROR(404,`Author not found at id : ${id}`, "au_002")
      }
      let dataAuthor = {
        name_kr : nameKr, 
        name_en : nameEn,
        name_cn : nameCn,
        born ,
        dead,
        // alias_kr : aliasKr,
        // alias_en : aliasEn,
        external_link : externalLink,
        reference,
        exhibition,
        education,
        description,
        memo,
        generation,
        art_movmnt: artMovmnt,
        nationality1,
        nationality2,
        updated_at : moment(new Date()).format().replace('T', ' ').substring(0, 19)
      }
      await connection.update(dataAuthor).where({is_deleted : false, id : id})
      return Response.SUCCESS('Edit Author Successfully !', dataAuthor)
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }
  static async getAllAuthor(data) {
    try {
      let { page, size, querySearch, queryCharacter = [] } = data;
      page = page || 1;
      size = size || 20;
      const connection = db('artist');
      let queryDb = connection.where({is_deleted : false })
      if (querySearch) {
        queryDb.where(build =>
          build.where('artist.name_kr','like',`%${querySearch.trim()}%`)
            .orWhere('artist.name_en', 'like', `%${querySearch.trim()}%`)
            .orWhere('artist.name_cn', 'like', `%${querySearch.trim()}%`)
            )
      };
      const totalElement = await (queryDb.clone().count('artist.id as count').first());
      if (Math.ceil(totalElement / size) < page) {
        return Response.SUCCESS("ok", []);
      }
      let results = await queryDb.select("*").orderBy('artist.id', 'desc')

      if (queryCharacter.length < 1) {
        let [limitStart, limitEnd] = [(page - 1) * size, page * size];
            limitStart = limitStart > 0 ? (limitStart < results.length ? limitStart : results.length) : 0;
            limitEnd = limitEnd > 0 ? (limitEnd < results.length ? limitEnd : results.length) : 0;
            results = results.slice(limitStart, limitEnd);
        const resultsCamel = results.map(item => snakeToCamel(item));
        return Response.SUCCESS('ok!', Response.PAGEABLE(resultsCamel, totalElement.count, page, size));
      }

      let resultConsonant = []
      const characterMap = {};

      queryCharacter.forEach((element)=>{
        characterMap[element] = element
      })

      for(let i = 0 ; i < results.length ; i ++) {
        results[i].consonant = results[i].name_kr == null ? '' : Hangul.disassemble(results[i].name_kr)[0]
          if (characterMap[results[i].consonant]) {
            resultConsonant.push(results[i])
          }
      }

       let [limitStart, limitEnd] = [(page - 1) * size, page * size];
            limitStart = limitStart > 0 ? (limitStart < resultConsonant.length ? limitStart : resultConsonant.length) : 0;
            limitEnd = limitEnd > 0 ? (limitEnd < resultConsonant.length ? limitEnd : resultConsonant.length) : 0;
        let resultConsonant1 = resultConsonant.slice(limitStart, limitEnd);
            
      const resultsCamel = resultConsonant1.map(item => snakeToCamel(item));
      return Response.SUCCESS('ok!', Response.PAGEABLE(resultsCamel, resultConsonant.length, page, size));
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }

  static async getAllUpdateAuthor(data) {
    const trx = await db.transaction();
    try {
      let queryDb = await trx('artist').where({is_deleted : false })
      let tutorials = []
      queryDb.forEach(row => {
        if (row.name_kr == null || row.name_kr == '' || typeof row.name_kr == "undefined") {
          row.name_kr = ''
        } else {
          row.name_kr = Hangul.disassemble(row.name_kr)[0]
        }
        let tutorial = {
          id : row.id,
          name_kr : row.name_kr
        } 
        tutorials.push(tutorial)
      });
      for(let item of tutorials) {
        console.log('item', item);
        await trx('artist').update({consonant : item?.name_kr}).where({id : item?.id})
      }
      await trx.commit()
      return Response.SUCCESS('ok!', tutorials);
    } catch (error) {
      await trx.rollback()
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    } finally {
      await trx.commit()
    }
  }
  static async getDetailAuthor(data) {
    const connection = db('artist')
    try {
      let {id} = data;
      let dataAuthor = await connection.select('*').where({is_deleted : false, id : id}).first();
      if (!dataAuthor) {
      return Response.WARN(404, 'Author not found', 'au_001')
      }
      const dataAuthorCamel = snakeToCamel(dataAuthor)
      return Response.SUCCESS('get Detail author successfully!',dataAuthorCamel);
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }
  static async deleteAuthor(data) {
    try {
      const connection = db('artist')
      const { id } = data;

      const Author = await connection.where({ id: id, is_deleted: false }).first()
      if (!Author) {
        return Response.WARN(404, 'Artist not found!', "auc_002")
      }
      await connection.where({ id: id }).update({
        is_deleted: true
      })
      return Response.SUCCESS('Delete Artist Solution successfully !')
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }
  static async exportExcelAuthor(data) {
    try {
      const connection = db('artist')
      let { records = [] } = data
      if (records.length < 1) {
        return Response.WARN(404, 'No record selected', 'au_003')
      }

      let count = 1
      const results = await connection
        .select('*')
        .clone()
        .where({ is_deleted: false })
        .whereIn('artist.id', records)
        .orderBy('artist.id', 'desc')
      if (!results) {
        return Response.WARN(404, 'Data Auction not found', 'au_004')
      }
      const titles = [
        '#',
        'ID',
        'Name Kr',
        'Name En',
        'Name Cn',
        'Born',
        'Dead',
        'Generation',
        'Art Movmnt',
        'Alias Kr',
        'Alias En',
        'External link',
        'Reference',
        'Exhibition',
        'Education',
        'Description',
        'Memo'
      ]
      const dataExport = results.map((e) => [
        count++,
        e.id,
        e.name_kr,
        e.name_en,
        e.name_cn,
        e.born,
        e.dead,
        e.generation,
        e.art_movmnt,
        e.alias_kr,
        e.alias_en,
        e.external_link,
        e.reference,
        e.exhibition,
        e.education,
        e.description,
        e.memo
      ])
      const dataSave = {
        fileName: 'List_of_Author',
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
  static async getListAuthor(data) {
    try {
      const {querySearch} =data
      const connection = db('artist')
      const Author = await connection.where({is_deleted: false }).orderBy('artist.id','desc')
      if (!Author) {
        return Response.WARN(404, 'Artist not found!', "auc_002")
      }

      if (querySearch) {
        Author.where(build =>
          build.where('artist.name_kr', 'like', `%${querySearch.trim()}%`)
            .orWhere('artist.name_en', 'like', `%${querySearch.trim()}%`))
      };
      const resultsCamel = Author.map(item => snakeToCamel(item));
      return Response.SUCCESS('200, ok!', resultsCamel)
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "Sv_500")
    }
  }
}


module.exports =  Author
