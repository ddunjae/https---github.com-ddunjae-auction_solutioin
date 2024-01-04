const { USER_ROLE } = require('../../utils/strVar');

const auctionCompanyrModel = (knex) => {
  return knex.schema.hasTable('auction_company').then(function (exists) {
    if (!exists) {
      return knex.schema.createTable('auction_company', function (property) {
        property.increments('id').unsigned().primary()
        property.string('company', 255).notNullable()
        property.float('online_feerate',15,0)
        property.float('offline_feerate',15,0)
        property.boolean('overseas').defaultTo(false)
        property.boolean('is_deleted').defaultTo(false)
        property.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
        property.datetime('updated_at')
      })
    }
  })
}

module.exports = {
    auctionCompanyrModel
}
