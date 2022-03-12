module.exports = (sequelize, DataTypes) =>
  sequelize.define('Theatre', {
    idPartner: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  })
