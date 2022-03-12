module.exports = (sequelize, DataTypes) =>
  sequelize.define('Other', {
    idPartner: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  })
