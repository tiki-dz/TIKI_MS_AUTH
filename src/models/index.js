const { Sequelize } = require('sequelize')
const config = require('../config/config')
const fs = require('fs')
const path = require('path')

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  {
    dialect: config.db.dialect,
    host: config.db.host,
    port: config.db.port,
    logging: true
  }
)
try {
  sequelize.authenticate()
  console.log('Sequelize a connecté à la base de données MySQL!')
} catch (error) {
  console.error('Impossible de se connecter, erreur :', error)
}

const db = {}
// dl=['Account','Administrator','Cinema','Client','Other','Partner','Stadium','Theatre','User']
// var pa=require(path.join(__dirname, 'Account.js'))(sequelize, Sequelize.DataTypes)
// db[pa.name]=pa
// pa=require(path.join(__dirname, 'User.js'))(sequelize, Sequelize.DataTypes)
// db[pa.name]=pa
fs.readdirSync(__dirname)
  .filter((file) => file !== 'index.js')
  .forEach((file) => {
    console.log(file)
    const x = path.join(__dirname, file)

    const model = require(x)(sequelize, Sequelize.DataTypes)
    console.log(model)
    db[model.name] = model
  })
const CLASSMETHODS = 'classMethods'
const ASSOCIATE = 'associate'
Object.keys(db).forEach(function (modelName) {
  if (CLASSMETHODS in db[modelName].options) {
    if (ASSOCIATE in db[modelName].options[CLASSMETHODS]) {
      db[modelName].options.classMethods.associate(db)
    }
  }
})

// Associations
db.sequelize = sequelize
db.Sequelize = Sequelize
module.exports = db

//
// const {Administrator} = require('../models/Administrator')
// const {User} = require('../models/User')
// const {Client} = require('../models/Client')
// const {Cinema} = require('../models/Cinema')
// const {Theatre} = require('../models/Theatre')
// const {Partner} = require('../models/Partner')
// const {Stadium} = require('../models/Stadium')
// const {Account} = require('../models/Account')
//  Admin.belongsTo(User)
//  console.log('Associate admin!')

//  Client.belongsTo(User)
//  console.log('Client belongs to user!')

//  Cinema.belongsTo(Partner)
//  console.log('Cinema belongs to partner!')

//  Partner.belongsTo(User, {foreignKey: 'idUser', as: 'User',constraints: false})

//  Stadium.belongsTo(Partner)
//  console.log('Stadium belongs to partner!')

//  Theatre.belongsTo(Partner)
//  console.log('Stadium belongs to partner!')
// console.log('tables created')
