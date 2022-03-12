const {User} = require("./User")

module.exports = (sequelize, DataTypes) =>{
  const client=sequelize.define('Client', {
    idClient: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
       primaryKey: true
      },
    idUser: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  })
  client.associate = (models) => {
    client.belongsTo(models.User, {foreignKey: 'idUser', as: 'User'});
    console.log('Client belongs to user!');
  }; 
  return client;
}