'use strict';
const _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name: DataTypes.STRING,
    elements: DataTypes.JSONB,
    baseColors: DataTypes.ARRAY(DataTypes.STRING),
    trackingIds: DataTypes.ARRAY(DataTypes.STRING),
    baseStyles: DataTypes.JSONB
  }, {});
  Project.associate = function(models) {
    Project.hasMany(models.Palette, {as: 'palettes', foreignKey: 'projectId'});
    Project.hasMany(models.Chromosome, {as: 'chromosomes', foreignKey: 'projectId'});
  };

  Project.prototype.currentGeneration = function () {
    return _.maxBy(this.chromosomes, 'generation').generation;
  };

  // TODO: Sacar de params
  Project.prototype.kpis = {
    sessions: 0,
    bounceRate: 30,
    seconds: 0,
    convRate: 70
  };

  Project.prototype.expectedKpis = {
    sessions: 1.2,
    bounceRate: 0.65,
    seconds: 30,
    convRate: 0.1
  };

  Project.prototype.references = function () {
    return this.getChromosomes().then((chromosomes) => {
      const firstChromos = chromosomes.filter((chr) => chr.generation === 0);
      return {
        best: this.expectedKpis,
        worst: {
          sessions: _.minBy(firstChromos, 'results.sessionsPerUser').results.sessionsPerUser,
          bounceRate: _.maxBy(firstChromos, 'results.bounceRate').results.bounceRate,
          seconds: _.minBy(firstChromos, 'results.avgSessionDuration').results.avgSessionDuration,
          convRate: _.minBy(firstChromos, 'results.conversionRate').results.conversionRate
        }
      };
    });
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
