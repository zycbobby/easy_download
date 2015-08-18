'use strict';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var Promise = require('bluebird');
var co = require('co');
var es = Promise.promisifyAll(require('elasticsearch'));
var config = require('../config/environment');
var esConfig = config.elasticSearch;

var client = new es.Client({
  host: esConfig.host,
  log: esConfig.loglevel
});


/**
 * create percolator from a query
 * @param query
 */
function* createPercolator(q) {
  return new Promise(function(resolve, reject){
    client.create({
      index: 'mongoindex',
      type:'.percolator',
      id: '' + q._id,
      body: {
        query: {
          match: { title: q.parsedTerm }
        }
      }
    }, function(err, response){
      if(err) {reject(err)}
      resolve(response);
    });
  });
}

module.exports = {
  createPercolator: createPercolator
}

