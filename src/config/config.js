module.exports = {
  db: {
    database: 'tiki',
    user: 'admintiki@tiki',
    password: 'TIKITA3NAtest12.',
    dialect: 'mysql',
    host: 'tiki.mysql.database.azure.com',
    port: 3306
  },
  MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
  EXCHANGE_NAME: 'PLASTI_ONLINE',
  AUTH_BINDING_KEY: 'AUTH_SERVICE',
  CATEGORY_EVENT_BINDING_KEY: 'CATEGORY_EVENT_SERVICE'
}
