module.exports = {
  db: {
    // database: 'tiki',
    // user: 'admintiki@tiki',
    // password: 'TIKITA3NAtest12.',
    // dialect: 'mysql',
    // host: 'tiki.mysql.database.azure.com',
    // port: 3306
    database: 'db_auth',
    user: 'root',
    password: 'root',
    dialect: 'mysql',
    host: 'localhost',
    port: 3308
  },

  MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
  EXCHANGE_NAME: 'PLASTI_ONLINE',
  AUTH_BINDING_KEY: 'AUTH_SERVICE',
  CATEGORY_EVENT_BINDING_KEY: 'CATEGORY_EVENT_SERVICE',
  PAYMENT_BINDING_KEY: 'PAYMENT_SERVICE',
  STATISTIC_BINDING_KEY: 'STATISTIC_SERVICE'
}
