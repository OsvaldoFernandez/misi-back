'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Chromosomes', // name of Source model
      'projectId', // name of the key we're adding
      {
        type: Sequelize.INTEGER, // MAKE SURE THE TYPE MATCHES WITH THE TARGET MODEL!
        references: {
          model: 'Projects', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Chromosomes', // name of Source model
      'projectId' // key we want to remove
    );
  }
};
