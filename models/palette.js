'use strict';
module.exports = (sequelize, DataTypes) => {
  const Palette = sequelize.define('Palette', {
    baseColor: DataTypes.STRING,
    colors: DataTypes.ARRAY(DataTypes.STRING),
    chromosomeId: DataTypes.INTEGER,
    projectId: DataTypes.INTEGER
  }, {});
  Palette.associate = function(models) {
    Palette.belongsTo(models.Project, {foreignKey: 'projectId', as: 'project'});
    Palette.belongsTo(models.Chromosome, {foreignKey: 'chromosomeId', as: 'chromosome'});
  };
  return Palette;
};
