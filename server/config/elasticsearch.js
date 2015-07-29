'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var Thing = require('../api/thing/thing.model');
var es = require('elasticsearch');
var esConfig = require('./environment').elasticSearch;
var async = require('async');

var client = new es.Client({
  host: esConfig.host,
  log: esConfig.loglevel
});

function HandleError(err) {
  if (err) {
    console.log(err);
    throw err;
  }
}

async.series([
  // delete index
  function (cb) {
    client.indices.exists({
      index: esConfig.index
    }, function (err, exists) {
      HandleError(err);
      if (exists) {
        client.indices.delete({
          index: esConfig.index
        }, function(err, res) {
          cb(err);
        })
      } else {
        cb(err);
      }
    });
  },

  // create index
  function (cb) {
    client.indices.create({
      method: 'PUT',
      index: esConfig.index,
      body: {
        settings :  esConfig['ikAugAnalyzer']
      }
    }, cb);
  },

  // create mapping
  function (cb) {
    client.indices.putMapping({
      index: esConfig.index,
      type: esConfig.type,
      body: esConfig.mapping
    }, cb);
  }
], function (err, results) {
  HandleError(err);
  console.log('finish init elastic search index and mapping');
});




