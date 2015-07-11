var express = require('express');
var nconf = require('../config');
var path = require('path');
var mime = require('mime');
var util = require('util');

var logger = require('../log');
var router = express.Router();
var fileRepo = require("../models/file_repository");

var testRepo = fileRepo({ files: nconf.files});

router.get('/:tag/:timestamp', function(req, res, next) {
  logger.info(util.format("History call with '%s' for '%s'", req.params.tag, req.params.timestamp));
  testRepo.getFileByTimestamp(req.params.tag, req.params.timestamp, function(err, file) {
    if(!file) {
      res.sendStatus(404);
    } else {
      logger.info(util.format("With stamp '%s' we got '%s'", req.params.timestamp, file));
      res.sendFile(file);
    }
  });
});

module.exports = router;