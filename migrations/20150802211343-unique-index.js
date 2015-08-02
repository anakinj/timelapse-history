'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.removeIndex('timelapse_file', ['tag', 'name']).then(function() {
      return queryInterface.addIndex('timelapse_file', ['tag', 'name'], {
        indicesType: 'UNIQUE'
      });
    });
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeIndex('timelapse_file', ['tag', 'name']).then(function() {
      return queryInterface.addIndex('timelapse_file', ['tag', 'name']);
    });
  }
};
