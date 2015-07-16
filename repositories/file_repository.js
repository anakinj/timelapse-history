module.exports = function (options) {
  var fs = require('fs');
  var path = require('path')
  var logger = require('../log');
  var util = require('util');
  var sqlite3 = require('sqlite3').verbose();

  this.fileCount = 0;
  self = this;

  logger.info(util.format("Initializing FileRepository"));

  this.db = new sqlite3.Database('data/files.db');
  
  this.db.serialize(function() {
    function populate(tag, fullPath) {
      var walk = require('walk');

      if(fullPath.indexOf('/') !== 0) {
        fullPath = path.join(__dirname, "..", fullPath)
      }

      logger.info(util.format("Populating SQLite database from dir '%s' as tag '%s'", fullPath, tag));

      var walker = walk.walk(fullPath, { followLinks: false })

      walker.on("errors", function(root, nodeStatsArray, next) {
        nodeStatsArray.forEach(function (n) {
          logger.error(n.name + ", " + n.error.message || (n.error.code + ": " + n.error.path));
        });

        next();
      });

      walker.on("file", function (root, fileStat, next) {
        if(path.extname(fileStat.name) !== '.jpg') {
          next();
          return;
        }

        var mtime = Math.floor(fileStat.ctime.getTime() / 1000);
        var fullPath = path.join(root, fileStat.name);

        if(self.fileCount % 10 === 0) {
          logger.info(util.format("Populate. File '%s'. Tag %s. Count %d. mtime: %d", fileStat.name, tag, self.fileCount, mtime));
        }

        self.db.get("SELECT * FROM files WHERE path = ?", fullPath, function(err, row) {
          if(err){
            throw err;
          }

          if(!row) {
            var stmt = self.db.prepare('INSERT INTO files VALUES (?, ?, ?)');
            stmt.run(tag, mtime, fullPath);
            self.fileCount++;
          }

          next();
        });
      });
    }

    self.db.run("CREATE TABLE IF NOT EXISTS files (tag TEXT, mtime int, path TEXT UNIQUE)");
    self.db.run("CREATE INDEX IF NOT EXISTS files_mtime ON files (mtime)");

    for (var property in options.files) {
      var filePath = options.files[property];
      populate(property, filePath);
    }
  });

  this.getFileByTimestamp =  function (tag, time, callback) {
    var stmt = this.db.prepare('SELECT path FROM files WHERE tag = ? AND mtime <= ? ORDER BY mtime DESC LIMIT 1');
    stmt.get(tag, time, function(err, row) {
      if(err) {
        callback(err, null);
        return;
      }

      callback(null, row ? row.path : null);

    });
  }

  return this;
};
