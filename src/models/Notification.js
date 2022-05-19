module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
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
    classMethods: {
      associate: function (models) {
        Notification.belongsTo(models.User)
      }
    }
  })

  // Cinema.associate = (models) => {

  // };
  return Notification
}
