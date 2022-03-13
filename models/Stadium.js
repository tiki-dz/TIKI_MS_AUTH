const {Partner} = require("./Partner")

module.exports = (sequelize, DataTypes) =>{
 const Stadium= sequelize.define('Stadium', {
    idStadium: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
     primaryKey: true
    },
    idPatner: {
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
  // Stadium.associate = (models) => {
  //   Stadium.belongsTo(models.Partners)
  //       console.log('Stadium has one Partner!');
  // }; 

  return Stadium;
}