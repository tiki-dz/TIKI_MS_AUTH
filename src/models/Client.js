// eslint-disable-next-line no-unused-vars
const { User } = require('./User')

module.exports = (sequelize, DataTypes) => {
  const client = sequelize.define(
    'Client',
    {
      idClient: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
      // idUser: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: 'Users',
      //     key: 'idUser',
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'SET NULL',
      //   allowNull:true

      // },
    },
    {
      classMethods: {
        associate: function (models) {
          client.belongsTo(models.User)
          console.log('Client belongs to User!')
        }
      }
    }
  )
  // client.associate = (models) => {

  // };
  return client
}
