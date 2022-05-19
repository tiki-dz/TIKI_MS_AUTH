// eslint-disable-next-line no-unused-vars
const { User } = require('./User')

module.exports = (sequelize, DataTypes) => {
  const faq = sequelize.define(
    'Faq',
    {
      idFaq: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      Question: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      Reponse: {
        type: DataTypes.TEXT,
        allowNull: false
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
          faq.belongsTo(models.FaqCategorie)
        }
      }
    }
  )
  // client.associate = (models) => {

  // };
  return faq
}
