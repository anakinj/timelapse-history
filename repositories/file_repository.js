module.exports = function(options) {
  var path = require('path');
  var logger = require('../log');
  var models = require('../models');
  var util = require('util');
  var walk = require('walk');
  var watch = require('watch');

  this.addedCount = 0;
  var self = this;

  function addFile(tag, fileName, ctime) {
    logger.info(util.format("Adding file: %s\tTag: %s\tCreated: %d\tCount: %d", fileName, tag, ctime, self.addedCount));

    models.File.count({
        where: {
          name: fileName
        }
      })
      .then(function(count) {
        if (!count) {
          models.File.create({
            tag: tag,
            name: fileName,
            created: Math.round(ctime.getTime() / 1000)
          }).then(function(file, created) {
            self.addedCount++;
          });
        }
      });
  }

  function removeFile(tag, fileName) {
    logger.info(util.format("Removing file: %s\tTag: %s", fileName, tag));
  }

  function rootPath(pathToRoot) {
    if (pathToRoot.indexOf('/') !== 0) {
      return path.join(__dirname, "..", pathToRoot);
    }
    return pathToRoot;
  }

  function populate(tag, folderPath) {
    var fullPath = rootPath(folderPath);

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

      addFile(tag, fileStat.name, fileStat.ctime);

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

  function getFullPath(tag, name) {
    return path.join(options.files[tag], name);
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
    models.File.findOne({
      where: {
        tag: tag,
        created: {
          $lte: parseInt(time, 10)
        }
      },
      order: [
        ['created', 'DESC']
      ]
    }).then(function(file) {
      callback(file ? getFullPath(file.tag, file.name) : null);
    });
  };

  this.getMetaData = function(cb) {
    models.sequelize.query(
      'SELECT MAX(created) as maxCreated, MIN(created) as minCreated, COUNT(*) as count FROM ' + models.File.getTableName(), {
        type: models.sequelize.QueryTypes.SELECT
      }).then(function(rows) {
      cb(rows[0]);
    });
  };

  return this;
};
