var file = require('./file')
var orm = require('orm');

function setup(db) {
  file(orm, db);
}

var database;

module.exports = function(cb) {
  if (database) {
    cb(database);
    return;
  }
  orm.connect('sqlite://' + __dirname + '/../data/files.db?debug=true',
    function(err, instance) {
      if (err) return cb(err);

      setup(instance);

      instance.sync(function() {
        database = instance;
        cb(instance);
      });
    });
};
