
module.exports = (sequelize, DataTypes) =>{
const Cinema=sequelize.define('Cinema', {
    idCinema: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
     primaryKey: true
    },
    idPartner: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  })

  Cinema.associate = (models) => {
    Cinema.belongsTo(models.Partner, {foreignKey: 'idPartner', as: 'Partner'});
    console.log('Cinema belongs to partner!');
  }; 
  
}
