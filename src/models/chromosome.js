'use strict';

const palettesParser = require('../interactors/palettesParser');

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
    },
    colors: DataTypes.ARRAY(DataTypes.STRING),
    styling: DataTypes.JSONB
  }, {});
  Chromosome.associate = function(models) {
    Chromosome.belongsTo(models.Project, {foreignKey: 'projectId', as: 'project'});
  };

  Chromosome.prototype.offlineAptitude = function () {
    return this.getProject().then((project) => {
      let score = 100;

      for (let i = 0; i < this.colors.length; i++) {
        const color_1 = this.colors[i];
        const color_1_idle = project.baseColors[i];

        for (let j = i + 1; j < this.colors.length; j++) {
          const color_2 = this.colors[j];
          const color_2_idle = project.baseColors[j];

          if (palettesParser.lumDistance(color_1_idle, color_2_idle) > 27) {
            if (palettesParser.lumDistance(color_1, color_2) < 27) {
              score = 0
            }
          }
        }
      }
      return score;
    });
  };

  Chromosome.prototype.toGenes = function () {
    const result = {};
    this.elements.forEach((element, index) => { result[`perm_${index}`] = element; });
    this.colors.forEach((color, index) => {
      const hsl = palettesParser.hexToHSL(color);
      result[`color_${index}_h`] = hsl.h;
      result[`color_${index}_s`] = hsl.s;
      result[`color_${index}_l`] = hsl.l;
    });
    Object.keys(this.styling).forEach((styleKey) => {
      result[`styling_${styleKey}`] = this.styling[styleKey];
    });
    return result;
  };

  Chromosome.prototype.onlineAptitude = function () {
    return this.getProject().then((project) => {
      const kpis = project.kpis;
      return project.references().then((references) => {
        const best = references.best;
        const worst = references.worst;
        const sessionsScr = (this.results.sessionsPerUser - worst.sessions) / (best.sessions - worst.sessions) * kpis.sessions * 100;
        const bounceRateScr = (this.results.bounceRate - worst.bounceRate) / (best.bounceRate - worst.bounceRate) * kpis.bounceRate * 100;
        const secondsScr = (this.results.avgSessionDuration - worst.seconds) / (best.seconds - worst.seconds) * kpis.seconds * 100;
        const convRateScr = (this.results.conversionRate - worst.convRate) / (best.convRate - worst.convRate) * kpis.convRate * 100;
        return sessionsScr + bounceRateScr + secondsScr + convRateScr;
      })
    })
  };

  Chromosome.prototype.distance = function () {
    return this.getProject().then((project) => {
      return palettesParser.getNearestInPalette(project.baseColors, this.colors).totalDistance;
    });
  };

  return Chromosome;
};
