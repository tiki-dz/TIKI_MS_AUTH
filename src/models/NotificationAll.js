module.exports = (sequelize, DataTypes) => {
  const NotificationAll = sequelize.define('NotificationAll', {
    idNotication: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    body: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
  })

  // Cinema.associate = (models) => {

  // };
  return NotificationAll
}
