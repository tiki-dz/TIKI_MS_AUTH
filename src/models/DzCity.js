module.exports = (sequelize, DataTypes) => {
  const city = sequelize.define(
    'DzCity',
    {
      idCity: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: false
      }
    },
    {
      classMethods: {
        associate: function (models) {
        }
      }
    })

  return city
}
