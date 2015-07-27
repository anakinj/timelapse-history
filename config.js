var nconf = require('nconf');

function getConfig() {
  nconf.file('options', 'config/config.json');

  return {
    files: nconf.get('files') || {},
    misc: nconf.get('misc') || {}
  };
}

module.exports = getConfig();
