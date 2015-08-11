var express = require('express');
var conf = require('../config');

var router = express.Router();

var fileRepo = require("../repositories/file_repository");
var repo = fileRepo({
  files: conf.files
});

/* GET home page. */
router.get('/', function(req, res, next) {
  repo.getMetaData(function(metadata) {

    var minDate = new Date(metadata.minCreated*1000);
    var maxDate = new Date(metadata.maxCreated*1000);
    var maxTime = maxDate.getHours() * 60 * 60 + maxDate.getMinutes() * 60 + maxDate.getSeconds();

    maxDate.setHours(0);
    maxDate.setMinutes(0);
    maxDate.setSeconds(0);

    minDate.setHours(0);
    minDate.setMinutes(0);
    minDate.setSeconds(0);

    var viewModel = {
      title: 'History',
      tags: [],
      minDate: minDate.getTime() / 1000 / 60 / 60 / 24,
      maxDate: maxDate.getTime() / 1000 / 60 / 60 / 24,
      currentTime: maxTime,
      currentDate: maxDate.getTime() / 1000 / 60 / 60 / 24
    };

    for (var property in conf.files) {
      viewModel.tags.push(property);
    }
    res.render('index', viewModel);
  });
});

module.exports = router;
