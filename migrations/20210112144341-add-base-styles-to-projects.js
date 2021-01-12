'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'Projects',
        'baseStyles',
        {
          type: Sequelize.JSONB,
          allowNull: true
        }
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Projects', 'baseStyles')
    ]);
  }
};
