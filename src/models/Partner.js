// eslint-disable-next-line no-unused-vars
const { Stadium } = require('./Stadium')
// eslint-disable-next-line no-unused-vars
const { Theatre } = require('./Theatre')
// eslint-disable-next-line no-unused-vars
const { User } = require('./User')

module.exports = (sequelize, DataTypes) => {
  const partner = sequelize.define('Partner', {
    idPartner: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    // idUser: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: 'Users',
    //     key: 'idUser',
    //   },
    //   onUpdate: 'CASCADE',
    //   onDelete: 'SET NULL',
    //   allowNull:true

    // },
    orgaName: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    orgaDesc: {
      type: DataTypes.STRING,
      allowNull: false
    },
    orgaType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    orgaAddress: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        partner.belongsTo(models.User, { foreignKey: 'idUser', as: 'User', constraints: false })
        console.log('Partner: user, cinema stadium theatre other!')
        partner.hasOne(models.Stadium)
        partner.hasOne(models.Cinema)
        partner.hasOne(models.Theatre)
        partner.hasOne(models.Other)
      }
    }
  })

  // partner.associate = (models) => {

  // };
  return partner
}
