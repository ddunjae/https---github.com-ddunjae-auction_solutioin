const { USER_ROLE } = require('../../utils/strVar');

const currencyModel = (knex) => {
  return knex.schema.hasTable('to_usd').then(function (exists) {
    if (!exists) {
      return knex.schema.createTable('to_usd', function (property) {
        property.increments('id').unsigned().primary()
        property.datetime('date').notNullable()
        property.float('krw',15,6).notNullable()
        property.float('gbp',15,6).notNullable()
        property.float('eur',15,6).notNullable()
        property.float('cnh',15,6).notNullable()
        property.float('hkd',15,6).notNullable()
        property.float('sgd',15,6).notNullable()
        property.float('chf',15,6).notNullable()
        property.boolean('is_deleted').defaultTo(false)
        property.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
        property.datetime('updated_at')
      })
    }
  })
}

module.exports = {
    currencyModel
}
