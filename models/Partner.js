module.exports = (sequelize, DataTypes) =>
  sequelize.define('Partner', {
    idUser: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orgaName:{
      type: DataTypes.STRING,
      allowNull: false
    },
    orgaDesc:{
      type: DataTypes.STRING,
      allowNull: false
    },
    orgaType:{
      type: DataTypes.STRING,
      allowNull: false
    },
    orgaAddress:{
      type: DataTypes.STRING,
      allowNull: false
    }
  })
