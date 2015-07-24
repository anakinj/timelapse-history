module.exports = function(options) {
  var path = require('path')
  var logger = require('../log');
  var db = require('../models/db');
  var util = require('util');
  var walk = require('walk');
  var orm = require('orm');
  var watch = require('watch');

  this.fileCount = 0;
  self = this;

  function addFile(tag, fullPath, ctime) {
    db(function(instance) {
      instance.models.file.exists({
        path: fullPath
      }, function(err, exists) {
        if (err) {
          throw err;
        }
        if (!exists) {
          instance.models.file.create([{
            tag: tag,
            path: fullPath,
            created: ctime
          }], function(err, file) {
            if (err) throw err;
            self.fileCount++;
          });
        }
      });
    });
  }

  function populate(tag, fullPath) {

    if (fullPath.indexOf('/') !== 0) {
      fullPath = path.join(__dirname, "..", fullPath)
    }

    logger.info(util.format("Populating SQLite database from dir '%s' as tag '%s'", fullPath, tag));

    var walker = walk.walk(fullPath, {
      followLinks: false
    })

    walker.on("errors", function(root, nodeStatsArray, next) {
      nodeStatsArray.forEach(function(n) {
        logger.error(n.name + ", " + n.error.message || (n.error.code + ": " + n.error.path));
      });
      next();
    });

    walker.on("file", function(root, fileStat, next) {
      if (path.extname(fileStat.name) !== '.jpg') {
        next();
        return;
      }

      var fullPath = path.join(root, fileStat.name);

      logger.info(util.format("File: %s\ttag: %s\tcount: %d\tcreated: %d", fileStat.name, tag, self.fileCount, fileStat.ctime));

      addFile(tag, fullPath, fileStat.ctime);

      next();
    });
  }

  function startMonitor(tag, root) {
    watch.createMonitor(root, function(monitor) {
      monitor.on('created', function(f, stat) {
        addFile(tag, path.join(__dirname, f), stat.ctime);
      });
    });
  }

  this.updateDatabase = function() {
    for (var property in options.files) {
      populate(property, options.files[property]);
    }
  };

  this.watchFolders = function() {
    for (var property in options.files) {
      startMonitor(property, options.files[property]);
    }
  }

  this.getFileByTimestamp = function(tag, time, callback) {
    db(function(instance) {
      instance.models.file.find({
        tag: tag,
        created: orm.lte(new Date(time * 1000))
      }, ['created', 'Z'], 1, function(err, rows) {
        if (err) throw err;
        callback(null, rows.length >= 1 ? rows[0].path : null);
      });
    });
  }

  return this;
};
