
const { Sequelize } = require('sequelize');

  const sequelize = new Sequelize("tiki", "admintiki@tiki", "TIKITA3NAtest12.", {
    dialect: "mysql",
    host: "http://tiki.mysql.database.azure.com"
});
  try {
    await sequelize.authenticate();
    console.log('Sequelize a connecté à la base de données MySQL!');
  } catch (error) { 
    console.error('Impossible de se connecter, erreur suivante :', error);
  }