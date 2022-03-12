const {Partner} = require("./Partner")

module.exports = (sequelize, DataTypes) =>{
  const other= sequelize.define('Other', {
    idOther: {
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
  other.associate = (models) => {
    other.belongsTo(models.Partner, {foreignKey: 'idPartner', as: 'Partner'});
    console.log('other belongs to partner!');
  }; 

  return other;
}