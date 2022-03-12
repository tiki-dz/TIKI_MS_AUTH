const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))

function hashPassword (user, options) {
  const SALT_FACTOR = 8

  if (!user.changed('password')) {
    return
  }

  return bcrypt
    .genSaltAsync(SALT_FACTOR)
    .then(salt => bcrypt.hashAsync(user.password, salt, null))
    .then(hash => {
      user.setDataValue('password', hash)
    })
}

module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
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
  }, {
    hooks: {
      beforeUpdate: hashPassword
    }
  })

  Compte.prototype.comparePassword = function (password) {
    return bcrypt.compareAsync(password, this.password)
  }

  return Account
}
