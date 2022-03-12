module.exports = (sequelize, DataTypes) =>
  sequelize.define('Client', {
    idUser: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  })
