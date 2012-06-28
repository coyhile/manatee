var bunyan = require('bunyan');
var optimist = require('optimist');
var fs = require('fs');
var SnapShotter = require('./lib/snapShotter');


///--- Mainline

var ARGV = optimist.options({
  'd': {
    alias: 'debug',
    describe: 'debug level'
  },
  'f': {
    alias: 'file',
    demand: true,
    describe: 'configuration file'
  }
}).argv;

var CFG;

var LOG = bunyan.createLogger({
  level: ARGV.d ? (ARGV.d > 1 ? 'trace' : 'debug') : 'info',
  name: 'sitter',
  serializers: {
    err: bunyan.stdSerializers.err
  },
  src: ARGV.d ? true : false,
});

function readConfig() {
  if (!CFG) {
    CFG = JSON.parse(fs.readFileSync(ARGV.f, 'utf8'));
    LOG.info({config: CFG, file: ARGV.f}, 'Configuration loaded');
  }

  return (CFG);
}

var cfg = readConfig();
cfg.log = LOG;

var snapShotter = new SnapShotter(cfg);

snapShotter.on('err', function(err) {
  LOG.fatal('got error from snapshotter', err);
  process.exit(1);
});

process.on('uncaughtException', function (err) {
  LOG.fatal({err: err}, 'uncaughtException (exiting error code 1)');
  process.exit(1);
});

snapShotter.start(function() {
  LOG.info('started snapshotter');
});