const { Sequelize } = require('sequelize');
const config = require('../config/config');
const fs = require('fs')
const path = require('path');
const Administrator = require('./Administrator');

  const sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
    dialect: config.db.dialect,
    host: config.db.host,
    port:config.db.port
});
try {
     sequelize.authenticate();
    console.log('Sequelize a connecté à la base de données MySQL!');
  } catch (error) { 
    console.error('Impossible de se connecter, erreur :', error);
  }
// Associations
  
db={}
dl=["Account","Administrator","Cinema","Client","Other","Partner","Stadium","Theatre","User"]
fs.readdirSync(__dirname)
.filter((file) =>
  file !== 'index.js'
).forEach((file) => {
  console.log(file)
  var x=path.join(__dirname, file)

  const model = require(x)(sequelize, Sequelize.DataTypes)
  console.log(model)
  db[model.name] = model
})
db.sequelize=sequelize;
db.Sequelize=Sequelize;
module.exports=db;