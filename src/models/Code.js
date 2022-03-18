module.exports = (sequelize, DataTypes) => {
  const code = sequelize.define(
    'Code',
    {
      code: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },

    {
      classMethods: {
        associate: function (models) {
          code.belongsTo(models.Account, {
            foreignKey: 'email',
            as: 'Account'
          })
        }
      }
    }
  )
  // acc.hasOne(Model.User);

  // aclc.prototype.comparePassword = function (password) {
  //   return bcrypt.compare(password, this.password)
  // }
  return code
}
