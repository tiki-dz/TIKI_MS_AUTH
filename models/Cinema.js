module.exports = (sequelize, DataTypes) =>{
  const Cinema=sequelize.define('Cinema', {
    idCinema: {
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
    // }
  },{
    classMethods:{
      associate:function(models){
        Cinema.belongsTo(models.Partner, {foreignKey: 'idPartner', as: 'Partner',constraints: false});
        console.log('Cinema belongs to partner!');
    }
  }
})

  // Cinema.associate = (models) => {
  
  // }; 
  return Cinema;
}
