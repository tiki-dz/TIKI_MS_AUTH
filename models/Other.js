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
      references: {
        model: 'Partners',
        key: 'idPartner',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  })
  // other.associate = (models) => {
  //   other.belongsTo(models.Partners, {foreignKey: 'idPartner', as: 'Partner',constraints: false});
  //   console.log('other belongs to partner!');
  // }; 

  return other;
}