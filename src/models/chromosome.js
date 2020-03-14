var sequelize = require('../database');
const Sequelize = require('sequelize');

const Chromosome = sequelize.define('chromosome', {
  // attributes
  tracking_id: {
    type: Sequelize.STRING
  },
  elements: {
    type: Sequelize.JSONB
  }
}, {
  // options
});

module.exports = Chromosome;
