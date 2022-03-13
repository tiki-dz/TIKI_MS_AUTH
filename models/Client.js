const {User} = require("./User")

module.exports = (sequelize, DataTypes) =>{
  const client=sequelize.define('Client', {
    idClient: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
       primaryKey: true
      },
    idUser: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'idUser',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull:true

    },
  })
  // client.associate = (models) => {
  //   client.belongsTo(models.Users, {foreignKey: 'idUser', as: 'User',constraints: false});
  //   console.log('Client belongs to User!');
  // };
  return client;
}