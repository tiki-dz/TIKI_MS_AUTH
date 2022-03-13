module.exports = (sequelize, DataTypes) =>{
  const Cinema=sequelize.define('Cinema', {
    idCinema: {
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
    }
  })

  // Cinema.associate = (models) => {
  //   Cinema.belongsTo(models.Partners, {foreignKey: 'idPartner', as: 'Partner',constraints: false});
  //   console.log('Cinema belongs to partner!');
  // }; 
  return Cinema;
}
