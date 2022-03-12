module.exports = (sequelize, DataTypes) =>
  sequelize.define('Stadium', {
    idPartner: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  })
