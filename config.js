'use strict';
var env = process.env.NODE_ENV || "development";

function getConfig() {
  var config = require(__dirname + '/config/app.json')[env] || {};

  config.db = require(__dirname + '/config/config.json')[env];

  return config;
}

module.exports = getConfig();
