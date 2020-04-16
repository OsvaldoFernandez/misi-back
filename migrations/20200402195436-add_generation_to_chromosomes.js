'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'Chromosomes',
        'generation',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        }
      ),
      queryInterface.addColumn(
        'Chromosomes',
        'timesRequested',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Chromosomes', 'generation'),
      queryInterface.removeColumn('Chromosomes', 'times_requested')
    ]);
  }
};
