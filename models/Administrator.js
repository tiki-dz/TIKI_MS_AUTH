const User= require("../models/User")

module.exports = (sequelize, DataTypes) =>{
  const Admin=sequelize.define('Administrator', {
    idUser:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idAdministrator: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
     primaryKey: true
    },
    role: {
      type: DataTypes.STRING(13),
      allowNull: false
    },
  })
  // Admin.belongsTo(User,{
  //   foreignKey: {
  //     name:'idUser',
  //     allowNull: false
  //   }
  // })
   
  Admin.associate = (models) => {
    Admin.belongsTo(models.User, {foreignKey: 'idUser', as: 'User'});
    console.log('Associate admin!');
  }; 
  
  return Admin
}
