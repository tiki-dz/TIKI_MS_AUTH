// eslint-disable-next-line no-unused-vars
const { Administrator } = require('./Administrator')
// eslint-disable-next-line no-unused-vars
const { Client } = require('./Client')

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('UserPartnerInvalid', {
    email: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(45)
    },
    phoneNumber: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
      validate: {
        len: [10, 10]
      }
    },
    notificationToken: {
      type: DataTypes.STRING(45)
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
    },
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
      }
    }
  })
  return user
}
