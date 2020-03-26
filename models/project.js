'use strict';
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name: DataTypes.STRING
  }, {});
  Project.associate = function(models) {
    Project.hasMany(models.Palette, {as: 'palettes'})
  };
  return Project;
};
