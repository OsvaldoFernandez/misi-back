'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'Chromosomes',
        'timeFrom',
        {
          type: Sequelize.DATE,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'Chromosomes',
        'timeTo',
        {
          type: Sequelize.DATE,
          allowNull: true
        }
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Chromosomes', 'timeFrom'),
      queryInterface.removeColumn('Chromosomes', 'timeTo')
    ]);
  }
};
