const {Partner} = require("./Partner")

module.exports = (sequelize, DataTypes) =>{
  const Theatre= sequelize.define('Theatre', {
    idTheatre: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
     primaryKey: true
    },
    idPartner: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  })
  Theatre.associate = (models) => {
    Theatre.belongsTo(models.Partner, {foreignKey: 'idPartner', as: 'Partner'});
    console.log('Stadium belongs to partner!');
  };
  return Theatre;
}