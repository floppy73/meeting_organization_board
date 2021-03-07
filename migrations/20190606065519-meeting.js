'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('meetings', 'isPrivate', {
      type: Sequelize.BOOLEAN,
      allowNull: true
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('meetings', 'isPrivate')
  }
};
