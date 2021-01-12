'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'Chromosomes',
        'styling',
        {
          type: Sequelize.JSONB,
          allowNull: true
        }
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Chromosomes', 'styling')
    ]);
  }
};
