var express = require('express');
var conf = require('../config');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var viewModel = { title: 'History', tags: []};
  for (var property in conf.files) {
    viewModel.tags.push(property);
  }
  res.render('index', viewModel);
});

module.exports = router;
