const {Partner} = require("./Partner")

module.exports = (sequelize, DataTypes) =>{
 const Stadium= sequelize.define('Stadium', {
    idStadium: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
     primaryKey: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  })
  Stadium.associate = (models) => {
    Stadium.belongsTo(models.Partner, {foreignKey: 'idPartner', as: 'Partner'});
    console.log('Stadium belongs to partner!');
  }; 
  return Stadium;
}