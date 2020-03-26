'use strict';
module.exports = (sequelize, DataTypes) => {
  const Chromosome = sequelize.define('Chromosome', {
    trackingId: DataTypes.STRING,
    elements: DataTypes.JSONB
  }, {});
  Chromosome.associate = function(models) {
    Chromosome.hasOne(models.Palette, {as: 'palette'})
  };
  return Chromosome;
};