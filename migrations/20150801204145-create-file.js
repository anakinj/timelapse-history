'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    queryInterface.createTable('file', {
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
      return queryInterface.addIndex('file', ['tag', 'name']);
    });
  },
  down: function(queryInterface, Sequelize) {
    queryInterface.removeIndex('file', ['tag', 'name']);
    returnqueryInterface.dropTable('file');
  }
};
