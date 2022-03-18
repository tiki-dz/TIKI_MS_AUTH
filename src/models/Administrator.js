// eslint-disable-next-line no-unused-vars
const User = require('../models/User')

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    'Administrator',
    {
      // idUser:{
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: 'Users',
      //     key: 'idUser',
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'SET NULL',
      //   allowNull:true
      // },
      idAdministrator: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      role: {
        type: DataTypes.STRING(13),
        allowNull: false
      }
    },
    {
      classMethods: {
        associate: function (models) {
          Admin.belongsTo(models.User, {
            foreignKey: 'idUser',
            as: 'User',
            constraints: false
          })
          console.log('Admin belongs to User!')
        }
      }
    }
  )

  return Admin
}
