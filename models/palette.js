'use strict';

const palettesParser = require('../interactors/palettesParser');
const _ = require('lodash');

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
    return (500 - _.sum(this.colors.map((color, i) => palettesParser.distance(color, project.baseColors[i]))));
  };

  return Palette;
};
