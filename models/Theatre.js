const {Partner} = require("./Partner")

module.exports = (sequelize, DataTypes) =>{
  const Theatre= sequelize.define('Theatre', {
    idTheatre: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
     primaryKey: true
    },
    // idPartner: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: 'Partners',
    //     key: 'idPartner',
    //   },
    //   onUpdate: 'CASCADE',
    //   onDelete: 'SET NULL',

    //   allowNull: true
    // },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  },{
    classMethods:{
      associate:function(models){
        Theatre.belongsTo(models.Partner)
        console.log('Theatre has one Partner!');
    }
  }
})
  // Theatre.associate = (models) => {
  //  
  // }; 

  return Theatre;
}