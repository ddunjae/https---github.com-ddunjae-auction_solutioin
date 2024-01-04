const { USER_ROLE } = require('../../utils/strVar');

const autionSolutionModel = (knex) => {
  return knex.schema.hasTable('crawling').then(function (exists) {
    if (!exists) {
      return knex.schema.createTable('crawling', function (property) {
        property.increments('id').unsigned().primary()
        //Sale info
        property.datetime('transact_date').notNullable() // ngày giao dịch
        property.string('company', 255).notNullable() // công ty đấu giá
        property.string('auction_name', 255) // tên đấu giá
        property.string('on_off', 255) // on off
        property.string('location', 255) // khu vực
        // artist info
        property.integer('artist_id', 10) // id tác giả
        property.string('artist_kor', 255) // tên tác giả kr
        property.string('artist_eng', 255) // tên tác giả en
        property.integer('artist_birth', 4) // năm sinh tác giả 
        property.integer('artist_death', 4) // năm mất tác giả 
        //Work info
        property.string('lot', 255) // Lot_no
        property.text('img') // Ảnh tối đa 5
        property.string('title_kor', 255) // Tiêu đề tác phẩm kr
        property.string('title_eng', 255) // Tiêu đề tác phẩm en
        property.string('mfg_date',255) // Năm sáng tác
        property.decimal('height', 30,7) // Cao
        property.decimal('width', 30,7) // rộng
        property.decimal('depth', 30,7) // sâu
        property.string('material_kind', 255) // Phân loại chất liệu
        property.text('material_kor') // Tên chất liệu kr
        property.text('material_eng')// Tên chất liệu en
        property.integer('size_table',25) // Số hiệu
        // More info
        property.text('signed') // Đã ký
        property.text('exhibited') // trưng bay
        property.text('provenance') // Nguồn gốc
        property.text('literature') // văn học
        property.text('catalogue') // Mục lục
        property.text('frame') // Khung
        property.text('certification') // chứng nhận
        property.text('condition_report') // báo cáo điều kiện
        property.text('description') // mô tả
        // Number
        property.string('currency', 255).notNullable() // Loại tiền
        property.float('start_price', 30,7) 
        property.float('hammer_price', 30,7) 
        property.float('selling_price', 30,7) 
        property.float('estimate_min', 30,7) 
        property.float('estimate_max', 30,7) 
        property.float('usd_start_price', 30,7) 
        property.float('usd_hammer_price', 30,7) 
        property.float('usd_selling_price', 30,7) 
        property.float('usd_estimate_min', 30,7) 
        property.float('usd_estimate_max', 30,7) 
        property.float('competition', 30,7) // Tỉ lệ cạnh tranh
        property.string('bid_class', 255)
        // Index
        property.string('method', 255)// Kỹ thuật sử dụng
        property.string('series', 255) // Seri
        property.string('main_color', 255) // Màu chủ đạo
        property.string('preference', 255) // Mức độ yêu thích
        property.string('identical_records', 255) // tác phẩm đồng nhất
        property.string('historical_category', 255)
        property.string('source', 255)
        property.boolean('is_deleted').defaultTo(false)
        property.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
        property.datetime('updated_at')
      })
    }
  })
}

module.exports = {
  autionSolutionModel
}
