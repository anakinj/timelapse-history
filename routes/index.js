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
    var viewModel = {
      title: 'History',
      tags: [],
      minDate: Math.round(Date.parse(metadata.minCreated) / 1000),
      maxDate: Math.round(new Date().getTime() / 1000)
    };
    for (var property in conf.files) {
      viewModel.tags.push(property);
    }
    res.render('index', viewModel);
  });
});

module.exports = router;
