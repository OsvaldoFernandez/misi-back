'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'Chromosomes',
        'colors',
        {
          type: Sequelize.ARRAY(Sequelize.STRING),
          allowNull: true
        }
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Chromosomes', 'colors')
    ]);
  }
};
