'use strict';

module.exports = (sequelize, DataTypes) => {
  const Chromosome = sequelize.define('Chromosome', {
    trackingId: DataTypes.STRING,
    elements: DataTypes.JSONB,
    timeFrom: DataTypes.DATE,
    timeTo: DataTypes.DATE,
    results: DataTypes.JSONB,
    timesRequested: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0'
    },
    generation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0'
    }
  }, {});
  Chromosome.associate = function(models) {
    Chromosome.hasOne(models.Palette, {as: 'palette', foreignKey: 'chromosomeId'});
    Chromosome.belongsTo(models.Project, {foreignKey: 'projectId', as: 'project'});
  };

  Chromosome.prototype.offlineAptitude = function () {
    return this.palette.offlineAptitude();
  };

  return Chromosome;
};
