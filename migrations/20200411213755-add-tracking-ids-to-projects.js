'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'Projects',
        'baseColors',
        {
          type: Sequelize.ARRAY(Sequelize.STRING)
        }
      ),
      queryInterface.addColumn(
        'Projects',
        'trackingIds',
        {
          type: Sequelize.ARRAY(Sequelize.STRING)
        }
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Projects', 'baseColors'),
      queryInterface.removeColumn('Projects', 'trackingIds')
    ]);
  }
};
