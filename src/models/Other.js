// const {Partner} = require("./Partner")

module.exports = (sequelize, DataTypes) =>{
  const other= sequelize.define('Other', {
    idOther: {
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
        other.belongsTo(models.Partner, {foreignKey: 'idPartner', as: 'Partner',constraints: false});
        console.log('other belongs to partner!');
    }
  }
})
  // other.associate = (models) => {
 
  // }; 

  return other;
}