'use strict';

const palettesParser = require('../interactors/palettesParser');

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

  Palette.prototype.offlineAptitude = function (project) {
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

  Palette.prototype.prune = function () {
    if (_.uniq(this.colors).length === this.colors.length) {
      return;
    } else {
      Project.find(this.projectId).then((project) => {

        const baseIndex = _.indexOf(project.baseColors, this.baseColor);

        for (var i = 0; i < this.colors.length; i++) {
          if (i !== baseIndex && (this.colors.filter((color) => color === this.colors[i]).length > 1)) {
            console.log(this.colors[i]);
            const newColors = this.colors;
            newColors[i] = project.baseColors[i];
            this.colors = newColors;
            this.save();
          }
        }
      });
    }
  }

  Palette.prototype.distance = function () {
    return this.getProject().then((project) => {
      return palettesParser.getNearestInPalette(project.baseColors, this.colors).totalDistance;
    });
  };

  return Palette;
};
