var file = require('./file');
var orm = require('orm');
var conf = require('../config');

function setup(db) {
  file(orm, db);
}

var database;

module.exports = function(cb) {
  if (database) {
    cb(database);
    return;
  }
  orm.settings.set('connection.debug', conf.misc.debug_sql || false);

  orm.connect('sqlite://' + __dirname + '/../data/files.db',
    function(err, instance) {
      if (err) {
       throw err;
      }

      setup(instance);

      instance.sync(function() {
        database = instance;
        cb(instance);
      });
    });
};
