'use strict';
const _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name: DataTypes.STRING,
    elements: DataTypes.JSONB,
    baseColors: DataTypes.ARRAY(DataTypes.STRING),
    trackingIds: DataTypes.ARRAY(DataTypes.STRING)
  }, {});
  Project.associate = function(models) {
    Project.hasMany(models.Palette, {as: 'palettes', foreignKey: 'projectId'});
    Project.hasMany(models.Chromosome, {as: 'chromosomes', foreignKey: 'projectId'});
  };

  Project.prototype.currentGeneration = function () {
    return _.maxBy(this.chromosomes, 'generation').generation;
  };

  Project.prototype.freeTrackingIds = async function () {
    const chromos = (await this.reload()).chromosomes;
    return this.trackingIds.filter((trackingId) =>
      chromos.filter((chromosome) =>
        chromosome.generation === this.currentGeneration() && chromosome.trackingId === trackingId
      ).length === 0
    );
  };

  return Project;
};
