const {Stadium} = require("./Stadium")
const {Theatre} = require("./Theatre")
const {User} = require("./User")

module.exports = (sequelize, DataTypes) =>{
  const partner=sequelize.define('Partner', {
    idPatner: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
     primaryKey: true
    },
    idUser: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orgaName:{
      type: DataTypes.STRING(45),
      allowNull: false
    },
    orgaDesc:{
      type: DataTypes.STRING,
      allowNull: false
    },
    orgaType:{
      type: DataTypes.STRING,
      allowNull: false
    },
    orgaAddress:{
      type: DataTypes.STRING,
      allowNull: false
    }
  })

  partner.associate = (models) => {
    partner.belongsTo(models.User, {foreignKey: 'idUser', as: 'User'});
    console.log('Partner: user, cinema stadium theatre other!');
    partner.hasOne(models.Stadium)
   partner.hasOne(models.Cinema)
  partner.hasOne(models.Theatre)
  partner.hasOne(models.Other)
  }; 
  return partner;
}