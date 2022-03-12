module.exports = (sequelize, DataTypes) =>
  sequelize.define('Cinema', {
    idPartner: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  })
