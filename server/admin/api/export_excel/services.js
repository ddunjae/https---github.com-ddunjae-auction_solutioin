const moment = require('moment')
const Response = require("../../../utils/Response") 
const db = require('../../../config/connectDB') ;
const LOGGER = require('../../../utils/logger') 
const  snakeToCamel  = require("../../../utils/objStyleConverter") ;
const axios = require("axios") ;


// const readXlsxFile = require('read-excel-file/node')
class ExportExcel {
    static async getAllLogExcel(data) {
        try {
            let { querySearch, page, size} = data
            page = page || 1
            size = size || 10
            const connection = db('excel_history');
            let queryDb = connection.where({is_deleted : false})
            if(querySearch) {
                queryDb.where(build =>
                    build.where('excel_history.*', 'like', `%${querySearch.trim()}%`)
                );
            }
            const totalElement = await (queryDb.clone().count('excel_history.id').first())
            if (Math.ceil(totalElement / size) < page) {
                return Response.SUCCESS("ok", []);
            }
            const results = await queryDb.select("excel_history.*").orderBy('excel_history.created_at', 'desc').limit(size).offset((page - 1) * size);
           
            const resultsCamel = results.map(item => snakeToCamel(item));
            return Response.SUCCESS("ok", Response.PAGEABLE(resultsCamel, totalElement.count, page, size));
        } catch (error) {
            LOGGER.APP.error(error.stack)
            return Response.ERROR(500, error.message, "Sv_500")
        }
    }

    static async getLogExcel(param) {
        try {
            const connection = db('excel_history as eh');
            let queryDb = connection.where({ is_deleted: false }) ;
            const results = await queryDb.select("*").where({id : Number(param.id)});
            const resultsCamel = results.map(item => snakeToCamel(item));
            return Response.SUCCESS('ok', resultsCamel);
        } catch (error) {
            LOGGER.APP.error(error.stack)
            return Response.ERROR(500, error.message, "Sv_500")
        }
    }

    static async deleteLogExcel(data) {
        try {
            const connection = db('excel_history as eh')
            const { paramId } = data;

            const logExcel = await connection.where({ id: paramId, is_deleted: false })
            if (!logExcel) {
                return Response.WARN(404, 'Log Excel found!', "Le_001")
            }
            await connection.where({ id: paramId }).update({
                is_deleted: true
            })
            return Response.SUCCESS('Delete logExcel successfully !')
        } catch (error) {
            LOGGER.APP.error(error.stack)
            return Response.ERROR(500, error.message, "Sv_500")
        }
    }

    static async importExcelByThriftApi(data) {
        try {
            const {googleDocURL} = data
            const connection = db('crawling')
            const resp = await axios.get(googleDocURL);
             if (resp.status == 200 ) {
                resp.data
             } else {
                []
             };
            let tutorials = [];
            resp.data.forEach( (row) => {
                //company
                if ( row.company === '' || row.company === null) {
                    row.company = null
                } else {
                    row.company = `${row.company}`
                }
                //auction_name
                if ( row.auction_name === '' || row.auction_name === null) {
                    row.auction_name = null
                } else {
                    row.auction_name = `${row.auction_name}`
                }
                //on_off
                if ( row.on_off === '' || row.on_off === null) {
                    row.on_off = null
                } else {
                    row.on_off = `${row.on_off}`
                }
                //location
                if ( row.location === '' || row.location === null) {
                    row.location = null
                } else {
                    row.location = `${row.location}`
                }
                //transact_date
                if ( row.transact_date === '' || row.transact_date === null) {
                    row.transact_date = null
                } else {
                    row.transact_date = `${row.transact_date}`
                }
                //lot
                if ( row.lot === '' || row.lot === null) {
                    row.lot = 0
                } else {
                    row.lot = row.lot.replace(',','.');
                    row.lot = parseFloat(row.lot)
                }
                //img
                if ( row.img === '' || row.img === null) {
                    row.img = null
                } else {
                    row.img = `${row.img}`
                }
                //artist_id
                if ( row.artist_id === '' || row.artist_id === null) {
                    row.artist_id = 0
                } else {
                    row.artist_id = row.artist_id.replace(',','.')
                    row.artist_id = parseFloat(row.artist_id)
                }
                // artist_kor
                if ( row.artist_kor === '' || row.artist_kor === null) {
                    row.artist_kor = null
                } else {
                    row.artist_kor = `${row.artist_kor}`
                }
                // artist_eng
                if ( row.artist_eng === '' || row.artist_eng === null) {
                    row.artist_eng = null
                } else {
                    row.artist_eng = `${row.artist_eng}`
                }
                // artist_birth
                if ( row.artist_birth === '' || row.artist_birth === null) {
                    row.artist_birth = null
                } else {
                    row.artist_birth = row.artist_birth.replace(',','.')
                    row.artist_birth = parseFloat(row.artist_birth)
                }
                // artist_death
                if ( row.artist_death === '' || row.artist_death === null) {
                    row.artist_death = null
                } else {
                    row.artist_death = row.artist_death.replace(',','.')
                    row.artist_death = parseFloat(row.artist_death)
                }
                //title_kor
                if ( row.title_kor === '' || row.title_kor === null) {
                    row.title_kor = null
                } else {
                    row.title_kor = `${row.title_kor}`
                }
                //title_eng
                if ( row.title_eng === '' || row.title_eng === null) {
                    row.title_eng = null
                } else {
                    row.title_eng = `${row.title_eng}`
                }
                //mfg_date
                if ( row.mfg_date === '' || row.mfg_date === null) {
                    row.mfg_date = null
                } else {
                    row.mfg_date = `${row.mfg_date}`
                }
                //height
                if ( row.height === '' || row.height === null) {
                    row.height = null
                } else {
                    row.height = row.height.replace(',','.')
                    row.height = parseFloat(row.height)
                }
                //width
                if ( row.width === '' || row.width === null) {
                    row.width = null
                } else {
                    row.width = row.width.replace(',','.')
                    row.width = parseFloat(row.width)
                }
                //depth
                if ( row.depth === '' || row.depth === null) {
                    row.depth = null
                } else {
                    row.depth = row.depth.replace(',','.')
                    row.depth = parseFloat(row.depth)
                }
                //size_table
                if (row.size_table === '' || row.size_table === null) {
                    row.size_table = null
                } else {
                    row.size_table = `${row.size_table}`
                }
                //material_kind
                if ( row.artist_eng === '' || row.artist_eng === null) {
                    row.artist_eng = null
                } else {
                    row.artist_eng = `${row.artist_eng}`
                }
                //material_kor
                if ( row.material_kor === '' || row.material_kor === null) {
                    row.material_kor = null
                } else {
                    row.material_kor = `${row.material_kor}`
                }
                //material_eng
                if ( row.material_eng === '' || row.material_eng === null) {
                    row.material_eng = null
                } else {
                    row.material_eng = `${row.material_eng}`
                }
                //signed
                if ( row.signed === '' || row.signed === null) {
                    row.signed = null
                } else {
                    row.signed = `${row.signed}`
                }
                //exhibited
                if ( row.exhibited === '' || row.exhibited === null) {
                    row.exhibited = null
                } else {
                    row.exhibited = `${row.exhibited}`
                }
                //provenance
                if ( row.provenance === '' || row.provenance === null) {
                    row.provenance = null
                } else {
                    row.provenance = `${row.provenance}`
                }
                //literature
                if ( row.literature === '' || row.literature === null) {
                    row.literature = null
                } else {
                    row.literature = `${row.literature}`
                }
                //catalogue
                if ( row.catalogue === '' || row.catalogue === null) {
                    row.catalogue = null
                } else {
                    row.catalogue = `${row.catalogue}`
                }
                //frame
                if ( row.frame === '' || row.frame === null) {
                    row.frame = null
                } else {
                    row.frame = `${row.frame}`
                }
                //certification
                if ( row.certification === '' || row.certification === null) {
                    row.certification = null
                } else {
                    row.certification = `${row.certification}`
                }
                //condition_report
                if ( row.condition_report === '' || row.condition_report === null) {
                    row.condition_report = null
                } else {
                    row.condition_report = `${row.condition_report}`
                }
                //description
                if ( row.description === '' || row.description === null) {
                    row.description = null
                } else {
                    row.description = `${row.description}`
                }
                //currency
                if ( row.currency === '' || row.currency === null) {
                    row.currency = null
                } else {
                    row.currency = `${row.currency}`
                }
                //bid_class
                if ( row.bid_class === '' || row.bid_class === null) {
                    row.bid_class = null
                } else {
                    row.bid_class = `${row.bid_class}`
                }
                //hammer_price
                if (row.hammer_price === '' || row.hammer_price === null) {
                    row.hammer_price = null
                } else {
                    row.hammer_price = row.hammer_price.replace(',','.')
                    row.hammer_price = parseFloat(row.hammer_price)
                }
                ////selling_price
                if (row.selling_price === '' || row.selling_price === null) {
                    row.selling_price = null
                } else {
                    row.selling_price = row.selling_price.replace(',','.')
                    row.selling_price = parseFloat(row.selling_price)
                }
                ////start_price
                if (row.start_price === '' || row.start_price === null) {
                    row.start_price = null
                } else {
                    row.start_price = row.start_price.replace(',','.')
                    row.start_price = parseFloat(row.start_price)
                }
                ////estimate_min
                if (row.estimate_min === '' || row.estimate_min === null) {
                    row.estimate_min = null
                } else {
                    row.estimate_min = row.estimate_min.replace(',','.')
                    row.estimate_min = parseFloat(row.estimate_min)
                }
                ////estimate_max
                if (row.estimate_max === '' || row.estimate_max === null) {
                    row.estimate_max = null
                } else {
                    row.estimate_max = row.estimate_max.replace(',','.')
                    row.estimate_max = parseFloat(row.estimate_max)
                }
                ////usd_hammer_price
                if (row.usd_hammer_price === '' || row.usd_hammer_price === null) {
                    row.usd_hammer_price = null
                } else {
                    row.usd_hammer_price = row.usd_hammer_price.replace(',','.')
                    row.usd_hammer_price = parseFloat(row.usd_hammer_price)
                }
                ////usd_selling_price
                if (row.usd_selling_price === '' || row.usd_selling_price === null) {
                    row.usd_selling_price = null
                } else {
                    row.usd_selling_price = row.usd_selling_price.replace(',','.')
                    row.usd_selling_price = parseFloat(row.usd_selling_price)
                }
                ////usd_start_price
                if (row.usd_start_price === '' || row.usd_start_price === null) {
                    row.usd_start_price = null
                } else {
                    row.usd_start_price = row.usd_start_price.replace(',','.')
                    row.usd_start_price = parseFloat(row.usd_start_price)
                }
                ////usd_estimate_min
                if (row.usd_estimate_min === '' || row.usd_estimate_min === null) {
                    row.usd_estimate_min = null
                } else {
                    row.usd_estimate_min = row.usd_estimate_min.replace(',','.')
                    row.usd_estimate_min = parseFloat(row.usd_estimate_min)
                }
                ////usd_estimate_max
                if (row.usd_estimate_max === '' || row.usd_estimate_max === null) {
                    row.usd_estimate_max = null
                } else {
                    row.usd_estimate_max = row.usd_estimate_max.replace(',','.')
                    row.usd_estimate_max = parseFloat(row.usd_estimate_max)
                }
                ////competition
                if (row.competition === '' || row.competition === null) {
                    row.competition = null
                } else {
                    row.competition = row.competition.replace(',','.')
                    row.competition = parseFloat(row.competition)
                }
                ////method
                if ( row.method === '' || row.method === null) {
                    row.method = null
                } else {
                    row.method = `${row.method}`
                }
                ////series
                if ( row.series === '' || row.series === null) {
                    row.series = null
                } else {
                    row.series = `${row.series}`
                }
                ////main_color
                if ( row.main_color === '' || row.main_color === null) {
                    row.main_color = null
                } else {
                    row.main_color = `${row.main_color}`
                }
                ////preference
                if ( row.preference === '' || row.preference === null) {
                    row.preference = null
                } else {
                    row.preference = `${row.preference}`
                }
                ////historical_category
                if ( row.historical_category === '' || row.historical_category === null) {
                    row.historical_category = null
                } else {
                    row.historical_category = `${row.historical_category}`
                }
                ////identical_records
                if ( row.identical_records === '' || row.identical_records === null) {
                    row.identical_records = null
                } else {
                    row.identical_records = `${row.identical_records}`
                }
      
      
                let tutorial = {
                  company: row.company,
                  auction_name: row.auction_name,
                  on_off: row.on_off,
                  location: row.location,
                  transact_date: row.transact_date,
                  lot: row.lot,
                  img: row.img,
                  artist_id: row.artist_id,
                  artist_kor: row.artist_kor,
                  artist_eng: row.artist_eng,
                  artist_birth: row.artist_birth,
                  artist_death: row.artist_death,
                  title_kor: row.title_kor,
                  title_eng: row.title_eng,
                  mfg_date: row.mfg_date,
                  height: row.height,
                  width: row.width,
                  depth: row.depth,
                  size_table: row.size_table,
                  material_kind: row.material_kind,
                  material_kor: row.material_kor,
                  material_eng: row.material_eng,
                  signed: row.signed,
                  exhibited: row.exhibited,
                  provenance: row.provenance,
                  literature: row.literature,
                  catalogue: row.catalogue,
                  frame: row.frame,
                  certification : row.certification,
                  condition_report: row.condition_report,
                  description: row.description,
                  currency: row.currency,
                  bid_class: row.bid_class,
                  hammer_price: row.hammer_price,
                  selling_price: row.selling_price,
                  start_price: row.start_price,
                  estimate_min: row.estimate_min,
                  estimate_max: row.estimate_max,
                  usd_hammer_price: row.usd_hammer_price,
                  usd_selling_price: row.usd_selling_price,
                  usd_start_price: row.usd_start_price,
                  usd_estimate_min: row.usd_estimate_min,
                  usd_estimate_max: row.usd_estimate_max,
                  competition: row.competition,
                  method: row.method,
                  series: row.series,
                  main_color: row.main_color,
                  preference: row.preference,
                  historical_category: row.historical_category,
                  identical_records: row.identical_records,
                }
                tutorials.push(tutorial)
               
              })
            const maxx = tutorials.length/100
            for(let j = 0; j <= maxx; j++){
                for(let i = 0; i < 100; i++ ){
                    if(i+100*j > tutorials.length){
                        break;
                    }
                    await connection.insert(tutorials[i+100*j])
                }
            }
            return Response.SUCCESS('200!')
        } catch (error) {
            LOGGER.APP.error(error.stack)
            return Response.ERROR(500, error.message, "Sv_500")
        }
    }
    // static async importFileToDb(exFile) {
    //     const connection = db('crawling')
    //     try {
    //       // let data = {abc : '68612,12'}
    //       // data.abc =  data.abc.replace(',','.')
    //       // data.abc = parseFloat(data.abc)
    //       // console.log(data);
    //       readXlsxFile(exFile).then((rows) => {
    //         rows.shift()
    //         rows.forEach(async (row) => {
    
    //           //company
    //           if (row[0] == null || row[0] == undefined || row[0] == '') {
    //             row[0] = ''
    //           }
    //           //auction_name
    //           if (row[1] == null || row[1] == undefined || row[1] == '') {
    //             row[1] = ''
    //           }
    //           //on_off
    //           if (row[2] == null || row[2] == undefined || row[2] == '') {
    //             row[2] = ''
    //           }
    //           //location
    //           if (row[3] == null || row[3] == undefined || row[3] == '') {
    //             row[3] = ''
    //           }
    //           //transact_date
    //           if (row[4] == null || row[4] == undefined || row[4] == '') {
    //             row[4] = ''
    //           }
    //           //lot
    //           if (row[5] == null || row[5] == undefined || row[5] == '') {
    //             row[5] = 0
    //           }
    //           //img
    //           if (row[6] == null || row[6] == undefined || row[6] == '') {
    //             row[6] = ''
    //           }
    //           //artist_id
    //           if (row[7] == null || row[7] == undefined || row[7] == '') {
    //             row[7] = 0
    //           }
    //           // artist_kor
    //           if (row[8] == null || row[8] == undefined || row[8] == '') {
    //             row[8] = ''
    //           }
    //           // artist_eng
    //           if (row[9] == null || row[9] == undefined || row[9] == '') {
    //             row[9] = ''
    //           }
    //           // artist_birth
    //           if (row[10] == null || row[10] == undefined || row[10] == '') {
    //             row[10] = 0
    //           }
    //           // artist_death
    //           if (row[11] == null || row[11] == undefined || row[11] == '') {
    //             row[11] = 0
    //           }
    //           //title_kor
    //           if (row[12] == null || row[12] == undefined || row[12] == '') {
    //             row[12] = ''
    //           }
    //           //title_eng
    //           if (row[13] == null || row[13] == undefined || row[13] == '') {
    //             row[13] = ''
    //           }
    //           //mfg_date
    //           if (row[14] == null || row[14] == undefined || row[14] == '') {
    //             row[14] = 0
    //           }
    //           //height
    //           if (row[15] == null || row[15] == undefined || row[15] == '') {
    //             row[15] = 0
    //           }
    //           //width
    //           if (row[16] == null || row[16] == undefined || row[16] == '') {
    //             row[16] = 0
    //           }
    //           //depth
    //           if (row[17] == null || row[17] == undefined || row[17] == '') {
    //             row[17] = 0
    //           }
    //           //size_table
    //           if (row[18] == null || row[18] == undefined || row[18] == '') {
    //             row[18] = 0
    //           }
    //           //material_kind
    //           if (row[19] == null || row[19] == undefined || row[19] == '') {
    //             row[19] = 0
    //           }
    //           //material_kor
    //           if (row[20] == null || row[20] == undefined || row[20] == '') {
    //             row[20] = ''
    //           }
    //           //material_eng
    //           if (row[21] == null || row[21] == undefined || row[21] == '') {
    //             row[21] = ''
    //           }
    //           //signed
    //           if (row[22] == null || row[22] == undefined || row[22] == '') {
    //             row[22] = ''
    //           }
    //           //exhibited
    //           if (row[23] == null || row[23] == undefined || row[23] == '') {
    //             row[23] = ''
    //           }
    //           //provenance
    //           if (row[24] == null || row[24] == undefined || row[24] == '') {
    //             row[24] = ''
    //           }
    //           //literature
    //           if (row[25] == null || row[25] == undefined || row[25] == '') {
    //             row[25] = ''
    //           }
    //           //catalogue
    //           if (row[26] == null || row[26] == undefined || row[26] == '') {
    //             row[26] = ''
    //           }
    //           //frame
    //           if (row[27] == null || row[27] == undefined || row[27] == '') {
    //             row[27] = ''
    //           }
    //           //certification
    //           if (row[28] == null || row[28] == undefined || row[28] == '') {
    //             row[28] = ''
    //           }
    //           //condition_report
    //           if (row[29] == null || row[29] == undefined || row[29] == '') {
    //             row[29] = ''
    //           }
    //           //description
    //           if (row[30] == null || row[30] == undefined || row[30] == '') {
    //             row[30] = ''
    //           }
    //           //currency
    //           if (row[31] == null || row[31] == undefined || row[31] == '') {
    //             row[31] = ''
    //           }
    //           //bid_class
    //           if (row[32] == null || row[32] == undefined || row[32] == '') {
    //             row[32] = ''
    //           }
    //           //hammer_price
    //           if (row[33] == null || row[33] == undefined || row[33] == '') {
    //             row[33] = 0
    //           }
    //           ////selling_price
    //           if (row[34] == null || row[34] == undefined || row[34] == '') {
    //             row[34] = 0
    //           }
    //           ////start_price
    //           if (row[35] == null || row[35] == undefined || row[35] == '') {
    //             row[35] = 0
    //           }
    //           ////estimate_min
    //           if (row[36] == null || row[36] == undefined || row[36] == '') {
    //             row[36] = 0
    //           }
    //           ////estimate_max
    //           if (row[37] == null || row[37] == undefined || row[37] == '') {
    //             row[37] = 0
    //           }
    //           ////usd_hammer_price
    //           if (row[38] == null || row[38] == undefined || row[38] == '') {
    //             row[38] = 0
    //           }
    //           ////usd_selling_price
    //           if (row[39] == null || row[39] == undefined || row[39] == '') {
    //             row[39] = 0
    //           }
    //           ////usd_start_price
    //           if (row[40] == null || row[40] == undefined || row[40] == '') {
    //             row[40] = 0
    //           }
    //           ////usd_estimate_min
    //           if (row[41] == null || row[41] == undefined || row[41] == '') {
    //             row[41] = 0
    //           }
    //           ////usd_estimate_max
    //           if (row[42] == null || row[42] == undefined || row[42] == '') {
    //             row[42] = 0
    //           }
    //           ////competition
    //           if (row[43] == null || row[43] == undefined || row[43] == '') {
    //             row[43] = 0
    //           }
    //           ////method
    //           if (row[44] == null || row[44] == undefined || row[44] == '') {
    //             row[44] = ''
    //           }
    //           ////series
    //           if (row[45] == null || row[45] == undefined || row[45] == '') {
    //             row[45] = ''
    //           }
    //           ////main_color
    //           if (row[46] == null || row[46] == undefined || row[46] == '') {
    //             row[46] = ''
    //           }
    //           ////preference
    //           if (row[47] == null || row[47] == undefined || row[47] == '') {
    //             row[47] = ''
    //           }
    //           ////historical_category
    //           if (row[48] == null || row[48] == undefined || row[48] == '') {
    //             row[48] = ''
    //           }
    //           ////identical_records
    //           if (row[49] == null || row[49] == undefined || row[49] == '') {
    //             row[49] = ''
    //           }
    
    
    //           let tutorial = {
    //             company: row[0],
    //             auction_name: row[1],
    //             on_off: row[2],
    //             location: row[3],
    //             transact_date: row[4],
    //             lot: row[5],
    //             img: row[6],
    //             artist_id: row[7],
    //             artist_kor: row[8],
    //             artist_eng: row[9],
    //             artist_birth: row[10],
    //             artist_death: row[11],
    //             title_kor: row[12],
    //             title_eng: row[13],
    //             mfg_date: row[14],
    //             height: row[15],
    //             width: row[16],
    //             depth: row[17],
    //             size_table: row[18],
    //             material_kind: row[19],
    //             material_kor: row[20],
    //             material_eng: row[21],
    //             signed: row[22],
    //             exhibited: row[23],
    //             provenance: row[24],
    //             literature: row[25],
    //             catalogue: row[26],
    //             catalogue: row[27],
    //             frame: row[28],
    //             condition_report: row[29],
    //             description: row[30],
    //             currency: row[31],
    //             bid_class: row[32],
    //             hammer_price: row[33],
    //             selling_price: row[34],
    //             start_price: row[35],
    //             estimate_min: row[36],
    //             estimate_max: row[37],
    //             usd_hammer_price: row[38],
    //             usd_selling_price: row[39],
    //             usd_start_price: row[40],
    //             usd_estimate_min: row[41],
    //             usd_estimate_max: row[42],
    //             competition: row[43],
    //             method: row[44],
    //             series: row[45],
    //             main_color: row[46],
    //             preference: row[47],
    //             historical_category: row[48],
    //             identical_records: row[49],
    //           }
    //           // console.log(tutorial);
    //           // await connection.insert(tutorial)
    //         })
    //       })
    //     } catch (error) {
    //       LOGGER.APP.error(error.stack)
    //       return Response.ERROR(500, error.message, "Sv_500")
    //     } 
    //   }
    
}

module.exports =  ExportExcel
