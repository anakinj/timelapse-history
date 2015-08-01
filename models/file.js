'use strict';
module.exports = function(sequelize, DataTypes) {
  var File = sequelize.define('File', {
    tag: DataTypes.STRING,
    name: DataTypes.STRING,
    created: DataTypes.INTEGER,
  }, {
    timestamps: false,
    tableName: 'file',
    indexes: [{
      unique: true,
      fields: ['tag', 'name']
    }],
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  }).schema('timelapse', {
    schemaDelimiter: '_'
  });
  return File;
};
