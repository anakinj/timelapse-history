var nconf = require('nconf');

function getConfig () {
  nconf.file('options','config/config.json');
  var options = {}
  
  options.files = nconf.get('files');

  return options
}

module.exports = getConfig ();
