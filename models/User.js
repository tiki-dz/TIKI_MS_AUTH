module.exports = (sequelize, DataTypes) =>
  sequelize.define('User', {
    Account_email: {
        type: DataTypes.STRING(30),
        allowNull: false
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
        validate: {
            len: [10, 10]
          }
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
