var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var expressWinston = require('express-winston');
var logger = require('./log');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var winston = require("winston");

var stylus = require('stylus');
var nib = require('nib');

var routes = require('./routes/index');
var history = require('./routes/history');

var app = express();

app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
  colorStatus: true, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
  ignoreRoute: function(req, res) {
      return false;
    } // optional: allows to skip some log messages based on request and/or response
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use(stylus.middleware({
  src: __dirname + '/public',
  compile: function(str, path) {
    return stylus(str)
      .set('filename', path)
      .use(nib());
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/components', express.static(__dirname + '/bower_components'));

app.use('/', routes);
app.use('/history', history);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}

module.exports = app;
