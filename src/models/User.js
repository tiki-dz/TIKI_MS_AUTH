// eslint-disable-next-line no-unused-vars

// eslint-disable-next-line no-unused-vars
const { Client } = require('./Client')

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('User', {
    idUser: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    // TODO badalha l integer ala jal id ta3 city
    city: {
      type: DataTypes.STRING(45)
    },
    phoneNumber: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    notificationToken: {
      type: DataTypes.TEXT
    },
    profilePicture: {
      type: DataTypes.TEXT()
      // validate: {
      //   isUrl: true
      // }
    },
    sexe: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        user.belongsTo(models.Account)
        user.hasOne(models.Administrator)
        user.hasOne(models.Client)
        user.hasOne(models.Partner)
        user.hasMany(models.Notification)
        console.log('Account has one User!')
      }
    }
  })
  return user
}
