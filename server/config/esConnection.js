'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./environment');
var Promise = require('bluebird');
var es = Promise.promisifyAll(require('elasticsearch'));

var esConfig = config.elasticSearch;
var client = new es.Client({
  host: esConfig.host,
  log: esConfig.loglevel
});

module.exports = client;
