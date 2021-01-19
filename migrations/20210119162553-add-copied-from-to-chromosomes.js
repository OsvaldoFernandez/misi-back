'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'Chromosomes',
        'copiedFrom',
        {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Chromosomes', 'copiedFrom')
    ]);
  }
};
