/* eslint-disable node/handle-callback-err */
const bcrypt = require('bcrypt')
// eslint-disable-next-line no-unused-vars
const { Model } = require('sequelize')

function hashPassword (account, options) {
  const saltRounds = 8

  return bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(account.password, salt, function (err, hash) {
      account.setDataValue('password', hash)
    })
  })
}

module.exports = (sequelize, DataTypes) => {
  const acc = sequelize.define(
    'Account',
    {
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
      state: {
        type: DataTypes.INTEGER
      }
    },

    {
      hooks: {
        beforeUpdate: hashPassword
      },

      classMethods: {
        associate: function (models) {
          acc.hasOne(models.User)
          console.log('Account has one User!')
        }
      }
    }
  )
  // acc.hasOne(Model.User);

  // aclc.prototype.comparePassword = function (password) {
  //   return bcrypt.compare(password, this.password)
  // }
  return acc
}
