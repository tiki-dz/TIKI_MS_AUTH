module.exports = (sequelize, DataTypes) =>
  sequelize.define('Administrator', {
    idUser: {
      type: DataTypes.STRING,
      allowNull: false
    },
  })
