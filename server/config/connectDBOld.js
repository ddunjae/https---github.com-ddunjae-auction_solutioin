

require('dotenv').config()

const DB_CONFIG = {
  client: 'mysql2',
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMAS,
    timezone: "utc",
    typeCast: (field, next) => {
      if (field.type == 'TINY' && field.length == 1) {
        return (field.string() == '1'); // 1 = true, 0 = false
      }
      // if (field.type == 'DECIMAL'){
      //   var value = field.string();
      //   return (value === null) ? null : Number(value);
      // }
      return next();
    },
    // supportBigNumbers:true,
    // bigNumberStrings:true
    decimalNumbers: true
  },
  pool: {
    min: 10,
    max: 150,
    // afterCreate: (conn, done) => {
    //   conn.query('SET time_zone = "utc"', (err) => {
    //     done(err, conn)
    //   })
    // }
  },
}
const knex = require('knex')(DB_CONFIG)



function initialize() {
}
initialize()
module.exports = knex
