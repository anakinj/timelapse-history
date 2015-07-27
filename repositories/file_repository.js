module.exports = function(options) {
  var path = require('path');
  var logger = require('../log');
  var db = require('../models/db');
  var util = require('util');
  var walk = require('walk');
  var orm = require('orm');
  var watch = require('watch');

  this.addedCount = 0;
  var self = this;

  function addFile(tag, filePath, ctime) {
    logger.info(util.format("Adding file: %s\tTag: %s\tCreated: %d\tCount: %d", filePath, tag, ctime, self.addedCount));

    db(function(instance) {
      instance.models.file.exists({
        path: filePath
      }, function(err, exists) {
        if (err) {
          throw err;
        }
        if (!exists) {
          instance.models.file.create([{
            tag: tag,
            path: filePath,
            created: ctime
          }], function(err, file) {
            if (err) throw err;
            self.addedCount++;
          });
        }
      });
    });
  }

  function removeFile(tag, filePath) {
    logger.info(util.format("Removing file: %s\tTag: %s", filePath, tag));

    db(function(instance) {
      instance.models.file.find({
        path: filePath,
        tag: tag
      }).remove();
    });
  }

  function rootPath(pathToRoot) {
    if (pathToRoot.indexOf('/') !== 0) {
      return path.join(__dirname, "..", pathToRoot);
    }
    return pathToRoot;
  }

  function populate(tag, fullPath) {
    fullPath = rootPath(fullPath);

    logger.info(util.format("Populating SQLite database from dir '%s' as tag '%s'", fullPath, tag));

    var walker = walk.walk(fullPath, {
      followLinks: false
    });

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

      addFile(tag, fullPath, fileStat.ctime);

      next();
    });
  }

  function startMonitor(tag, tagPath) {
    tagPath = rootPath(tagPath);

    logger.info(util.format("Starting to watch folder '%s' with tag '%s'", tagPath, tag));

    watch.createMonitor(tagPath, function(monitor) {
      monitor.on('created', function(f, stat) {
        addFile(tag, f, stat.ctime);
      });
      monitor.on('removed', function(f, stat) {
        removeFile(tag, f);
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
  };

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
  };

  this.getMetaData = function(cb) {
    db(function(instance) {
      instance.driver.execQuery("SELECT MAX(created) as maxCreated, MIN(created) as minCreated, COUNT(*) as count FROM file",
        function(err, data) {
          if (err) {
            throw err;
          }
          cb(data[0]);
        });
    });
  };

  return this;
};
