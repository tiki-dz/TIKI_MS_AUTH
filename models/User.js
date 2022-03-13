const {Account} = require("./Account")
const {Administrator} = require("./Administrator")
const {Client} = require("./Client")

module.exports = (sequelize, DataTypes) =>{
  const user= sequelize.define('User', {
    idUser: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
       primaryKey: true
    },
    email:{
      type: DataTypes.STRING(30),
      references: {
        model: 'Accounts',
        key: 'email',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull:true
    },
    firstName: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    city: {
        type: DataTypes.STRING(45)
      },
    phoneNumber: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      validate :{
            len: [10, 10]  
      }
    },
    notificationToken: {
        type: DataTypes.STRING(45),    
      },
    profilePicture: {
        type: DataTypes.STRING(45),
        validate:{
            isUrl: true, 
        }
      },
    sexe: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
   
  })
  // user.associate = (models) => {
  //   models.User.belongsTo(models.Account);
  //   console.log('Account has one User!');
  // }; 

 
  return user
}