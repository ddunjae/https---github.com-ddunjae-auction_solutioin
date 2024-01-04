const { USER_ROLE } = require('../../utils/strVar');

const authorModel = (knex) => {
  return knex.schema.hasTable('artist').then(function (exists) {
    if (!exists) {
      return knex.schema.createTable('artist', function (property) {
        property.increments('id').unsigned().primary()
        property.string('name_kr', 255)
        property.string('name_en', 255)
        property.string('name_cn', 255)
        property.string('born',255)
        property.string('dead',255)
        property.string('generation',255) //
        property.string('art_movmnt',255) //
        property.string('consonant',255)
        property.string('nationality1',255)
        property.string('nationality2',255)
        property.text('alias_kr')
        property.text('alias_en')
        property.text('external_link')
        property.text('reference')
        property.text('exhibition')
        property.text('education')
        property.text('description')
        property.text('memo')
        property.boolean('is_deleted').defaultTo(false)
        property.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
        property.datetime('updated_at')
      })
    }
  })
}

module.exports = {
  authorModel
}
