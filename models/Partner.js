const {Stadium} = require("./Stadium")
const {Theatre} = require("./Theatre")
const {User} = require("./User")

module.exports = (sequelize, DataTypes) =>{
  const partner=sequelize.define('Partner', {
    idPartner: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
     primaryKey: true
    },
    idUser: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'idUser',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull:true

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

  // partner.associate = (models) => {
  //   partner.belongsTo(models.Users, {foreignKey: 'idUser', as: 'User',constraints: false});
  //   console.log('Partner: user, cinema stadium theatre other!');
  //   partner.hasOne(models.Stadia)
  //  partner.hasOne(models.Cinemas)
  // partner.hasOne(models.Theatres)
  // partner.hasOne(models.Others)
  // }; 
  return partner;
}