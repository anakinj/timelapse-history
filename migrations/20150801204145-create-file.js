'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    queryInterface.createTable('timelapse_file', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tag: {
        allowNull: false,
        type: Sequelize.STRING
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      created: {
        allowNull: false,
        type: Sequelize.INTEGER
      }
    }).then(function (){
      return queryInterface.addIndex('timelapse_file', ['tag', 'name']);
    });
  },
  down: function(queryInterface, Sequelize) {
    queryInterface.removeIndex('timelapse_file', ['tag', 'name']);
    returnqueryInterface.dropTable('timelapse_file');
  }
};
