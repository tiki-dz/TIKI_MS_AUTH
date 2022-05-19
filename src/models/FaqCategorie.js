// eslint-disable-next-line no-unused-vars
const { User } = require('./User')

module.exports = (sequelize, DataTypes) => {
  const faqCategorie = sequelize.define(
    'FaqCategorie',
    {
      idFaqCategorie: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nom: {
        type: DataTypes.STRING(45),
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
          faqCategorie.hasMany(models.Faq)
        }
      }
    }
  )
  // client.associate = (models) => {

  // };
  return faqCategorie
}
